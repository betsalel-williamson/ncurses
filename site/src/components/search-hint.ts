/**
 * The search field's rotating hint, in two places.
 *
 * - The search field (Pagefind's input, in Starlight's search dialog). While the field is empty,
 *   a hint over it cycles through things a reader might look up, until they tap the field or
 *   type. On phones, where the dialog fills the screen, it runs one pass through the list. On
 *   desktop the dialog is the header field's pull-down (search-panel.ts), so the hint there rests
 *   on the term the header showed: the reader has just clicked or pressed a key, and the
 *   suggestion list below takes over.
 * - The header field on desktop (Starlight's search button, drawn as a text field). It changes
 *   term in one short burst after the page loads, finished within five seconds, then rests.
 *   Pointing at it runs another burst. It shows the reader's query instead while the pull-down
 *   is closed with text in it.
 *
 * The four period styles erase the old term and type the new one behind a blinking cursor, each
 * at its own pace (TYPE below); the cursor's shape and blink rate are set in CSS. Terminal also
 * sets --nc-search-hint-strike, so each typed character lights up in that color and fades.
 * Modern slides: the old term rises and fades while the new one rises in.
 *
 * One cursor at a time: while the hint types behind its own cursor, the field's caret is made
 * transparent (nc-hint-owns-caret). Once the hint rests, the caret (style-caret.ts) takes over.
 *
 * The hint is an aria-hidden element, so screen readers hear the field's fixed label, never the
 * rotating text. With reduced motion the hint is one fixed example. The real placeholder stays
 * in the DOM, made transparent while the hint shows, for when this script doesn't run.
 */
import { StyleCaret } from "./style-caret";
import {
  STATIC_HINT,
  TOPICS,
  desktop,
  reducedMotion,
  topicLabel,
} from "./search-topics";

const LABEL = "Search the docs";

interface Typing {
  /** Milliseconds per typed character. */
  type: number;
  /** How long a finished term holds. */
  hold: number;
  /** Milliseconds per erased character. */
  erase: number;
  /** The pause between the last erase and the first typed character. */
  blank: number;
}

const TYPE: Record<string, Typing> = {
  textmode: { type: 60, hold: 1800, erase: 28, blank: 250 },
  workstation: { type: 55, hold: 2000, erase: 30, blank: 250 },
  manpage: { type: 70, hold: 2400, erase: 35, blank: 300 },
  terminal: { type: 65, hold: 1800, erase: 28, blank: 250 },
};
const SLIDE_DWELL_MS = 2600;
const SLIDE_MS = 240;
const STRIKE_MS = 650;
/** The header's burst: it starts this long after the page loads... */
const BURST_DELAY_MS = 1200;
/** ...and every change finishes within this long of the first one starting. */
const BURST_BUDGET_MS = 5000;

type Mode = "idle" | "running" | "settled" | "static" | "query";

class SearchHint {
  private host: HTMLElement;
  private input: HTMLInputElement | null;
  private hint: HTMLSpanElement;
  private slot: HTMLSpanElement;
  private cursor: HTMLSpanElement;
  private timer = 0;
  private mode: Mode = "idle";
  private burstStart = 0;
  private changes = 0;
  /** Where the current pass started, to stop after one pass through the list. */
  private startIndex = 0;
  /** The index in TOPICS of the term showing, or being typed. */
  index = 0;
  private current = "";
  caret: StyleCaret | null = null;

  /**
   * host: the element the hint sits in. With an input, the hint lies over the input's text box;
   * without one (the header button), CSS places it as a flex item after the icon.
   */
  constructor(host: HTMLElement, input: HTMLInputElement | null) {
    this.host = host;
    this.input = input;

    this.hint = document.createElement("span");
    this.hint.className = "nc-search-hint";
    if (!input) this.hint.classList.add("nc-search-hint--header");
    this.hint.setAttribute("aria-hidden", "true");
    this.slot = document.createElement("span");
    this.slot.className = "nc-search-hint-slot";
    this.cursor = document.createElement("span");
    this.cursor.className = "nc-search-hint-cursor";
    this.hint.append(this.slot);
    this.attachHint();

    if (!input) return;
    input.setAttribute("aria-label", LABEL);
    input.addEventListener("pointerdown", () => this.settle());
    input.addEventListener("input", () => {
      if (this.mode === "running") this.settle();
      this.sync();
    });
    // Pagefind's clear button empties the field without an input event.
    host.addEventListener("click", () =>
      requestAnimationFrame(() => this.sync()),
    );
  }

  /** Re-attach the hint if Pagefind re-renders the form. */
  ensureAttached(): void {
    if (!this.hint.isConnected) this.attachHint();
    this.caret?.ensureAttached();
  }

  /** In the header button, the hint goes before the shortcut, where the label was. */
  private attachHint(): void {
    const kbd = this.input ? null : this.host.querySelector(":scope > kbd");
    if (kbd) kbd.before(this.hint);
    else this.host.append(this.hint);
  }

  /** The hint's first character, for a block caret that sits on it. */
  firstChar(): string {
    return this.hint.hidden ? "" : (this.slot.textContent ?? "").charAt(0);
  }

  /** A full pass through the list from a random term: the dialog on phones. */
  start(): void {
    if (!this.begin()) return;
    this.startIndex = this.index;
    this.mode = "running";
    this.tick();
    this.sync();
  }

  /** Rest on one term, with no motion: the pull-down on desktop. */
  startSettled(index: number): void {
    this.stop();
    this.ensureAttached();
    this.place();
    this.host.classList.add("nc-search-hinting");
    if (reducedMotion()) {
      this.mode = "static";
      this.show(STATIC_HINT);
    } else {
      this.mode = "settled";
      this.index = index;
      this.current = topicLabel(index);
      this.show(this.current);
    }
    this.sync();
  }

  /** The header's burst after page load: from a random term, after a short delay. */
  startBurst(): void {
    if (!this.begin()) return;
    this.burst(BURST_DELAY_MS);
  }

  /** Another burst, when the reader points at the resting header field. */
  rerun(): void {
    if (this.mode !== "settled" || reducedMotion()) return;
    this.burst(300);
  }

  /** The header shows the reader's query, still, while the pull-down is closed. */
  showQuery(query: string): void {
    this.stop();
    if (query) {
      this.mode = "query";
      this.hint.classList.add("nc-search-hint--query");
      this.show(query);
    } else if (this.mode === "query") {
      this.hint.classList.remove("nc-search-hint--query");
      this.mode = reducedMotion() ? "static" : "settled";
      this.show(this.mode === "static" ? STATIC_HINT : this.current);
    }
  }

  /** Show the term again in the current style's form, as Manual page writes functions. */
  restyle(): void {
    if (this.mode !== "settled") return;
    this.current = topicLabel(this.index);
    this.show(this.current);
  }

  stop(): void {
    clearTimeout(this.timer);
    this.slot.getAnimations({ subtree: true }).forEach((a) => a.cancel());
    if (this.mode === "running") this.mode = "settled";
    this.own();
  }

  /** Stop a running hint where it stands, on a whole term. */
  settle(): void {
    if (this.mode !== "running") return;
    this.stop();
    this.show(this.current);
  }

  /** Line the hint up with the field's text box: after the icon, and clear of the clear button. */
  place(): void {
    if (!this.input) return;
    const f = this.host.getBoundingClientRect();
    const i = this.input.getBoundingClientRect();
    const cs = getComputedStyle(this.input);
    const left =
      i.left -
      f.left +
      parseFloat(cs.borderLeftWidth) +
      parseFloat(cs.paddingLeft);
    const right =
      i.right -
      f.left -
      parseFloat(cs.borderRightWidth) -
      parseFloat(cs.paddingRight);
    Object.assign(this.hint.style, {
      left: `${left}px`,
      top: `${i.top - f.top}px`,
      width: `${Math.max(0, right - left)}px`,
      height: `${i.height}px`,
      fontFamily: cs.fontFamily,
      fontSize: cs.fontSize,
    });
  }

  /** Set up a fresh start from a random term. False with reduced motion: the static hint shows. */
  private begin(): boolean {
    this.stop();
    this.ensureAttached();
    this.place();
    this.host.classList.add("nc-search-hinting");
    this.hint.classList.remove("nc-search-hint--query");
    if (reducedMotion()) {
      this.mode = "static";
      this.show(STATIC_HINT);
      this.sync();
      return false;
    }
    this.index = Math.floor(Math.random() * TOPICS.length);
    this.current = topicLabel(this.index);
    this.show(this.current);
    return true;
  }

  private burst(delay: number): void {
    this.stop();
    this.mode = "running";
    this.changes = 0;
    this.show(this.current);
    this.wait(delay, () => {
      this.burstStart = performance.now();
      this.burstStep();
    });
  }

  private burstStep(): void {
    const elapsed = performance.now() - this.burstStart;
    if (
      this.changes > 0 &&
      elapsed + this.estimate(this.current, topicLabel(this.index + 1)) >
        BURST_BUDGET_MS
    )
      return this.settle();
    this.changes += 1;
    this.change(true, () => {
      const hold = this.typing()?.hold ?? SLIDE_DWELL_MS;
      const now = performance.now() - this.burstStart;
      const next = this.estimate(this.current, topicLabel(this.index + 1));
      if (now + hold + next > BURST_BUDGET_MS) return this.settle();
      this.wait(hold, () => this.burstStep());
    });
  }

  /** How long changing from one term to the next takes in the current style. */
  private estimate(from: string, to: string): number {
    const t = this.typing();
    if (!t) return SLIDE_MS;
    return from.length * t.erase + t.blank + to.length * t.type;
  }

  /** One cursor at a time: hide the field's caret while the hint types behind its own. */
  private own(): void {
    if (!this.input) return;
    const owns =
      this.mode === "running" && !!this.typing() && !this.input.value;
    this.input.classList.toggle("nc-hint-owns-caret", owns);
    this.caret?.schedule();
  }

  private sync(): void {
    if (this.input) this.hint.hidden = this.input.value.length > 0;
    this.own();
  }

  /** The current style's typing pace, or undefined for the styles that slide. */
  private typing(): Typing | undefined {
    return TYPE[document.documentElement.dataset.style ?? ""];
  }

  private word(text: string): HTMLSpanElement {
    const w = document.createElement("span");
    w.className = "nc-search-hint-word";
    w.textContent = text;
    return w;
  }

  private show(text: string): HTMLSpanElement {
    const w = this.word(text);
    this.slot.replaceChildren(w);
    return w;
  }

  private wait(ms: number, fn: () => void): void {
    this.timer = window.setTimeout(() => {
      if (this.mode === "running") fn();
    }, ms);
  }

  private tick(): void {
    this.own();
    this.change(false, () => {
      // One pass through the list, then rest on the term that started it.
      if (this.index - this.startIndex >= TOPICS.length) {
        this.settle();
        return;
      }
      this.tick();
    });
  }

  /** Change to the next term. now: skip the hold on the current term first. */
  private change(now: boolean, done: () => void): void {
    const t = this.typing();
    if (t) this.type(t, now, done);
    else this.slide(now, done);
  }

  private nextLabel(): string {
    this.index += 1;
    this.current = topicLabel(this.index);
    return this.current;
  }

  private type(t: Typing, now: boolean, done: () => void): void {
    const w = this.slot.firstElementChild as HTMLSpanElement | null;
    if (!w) return;
    const old = w.textContent ?? "";
    w.append(this.cursor);
    this.cursor.classList.add("blinking");
    const strike = getComputedStyle(this.host)
      .getPropertyValue("--nc-search-hint-strike")
      .trim();
    const hint = getComputedStyle(this.hint).color;

    // The cursor blinks while it rests, during the hold and the blank, and stays lit while it moves.
    this.wait(now ? 0 : t.hold, () => {
      this.cursor.classList.remove("blinking");
      let n = old.length;
      const erase = (): void => {
        n -= 1;
        w.replaceChildren(old.slice(0, Math.max(n, 0)), this.cursor);
        if (n > 0) return this.wait(t.erase, erase);
        this.cursor.classList.add("blinking");
        this.wait(t.blank, () => {
          this.cursor.classList.remove("blinking");
          const text = this.nextLabel();
          let k = 0;
          const typeOne = (): void => {
            const ch = document.createElement("span");
            ch.textContent = text[k];
            this.cursor.before(ch);
            if (strike) {
              ch.animate(
                [
                  {
                    color: strike,
                    textShadow: `0 0 8px ${strike}, 0 0 2px ${strike}`,
                  },
                  { color: hint, textShadow: "0 0 0 transparent" },
                ],
                {
                  duration: STRIKE_MS,
                  easing: "cubic-bezier(.1,.6,.3,1)",
                },
              );
            }
            k += 1;
            if (k < text.length) return this.wait(t.type, typeOne);
            this.cursor.classList.add("blinking");
            done();
          };
          typeOne();
        });
      };
      erase();
    });
  }

  private slide(now: boolean, done: () => void): void {
    this.wait(now ? 0 : SLIDE_DWELL_MS, () => {
      const old = this.slot.firstElementChild as HTMLElement | null;
      const next = this.word(this.nextLabel());
      this.slot.append(next);
      const o: KeyframeAnimationOptions = {
        duration: SLIDE_MS,
        easing: "cubic-bezier(.2,.7,.3,1)",
        fill: "forwards",
      };
      old?.animate(
        [
          { transform: "none", opacity: 1 },
          { transform: "translateY(-0.35em)", opacity: 0 },
        ],
        o,
      );
      const a = next.animate(
        [
          { transform: "translateY(0.35em)", opacity: 0 },
          { transform: "none", opacity: 1 },
        ],
        o,
      );
      a.onfinish = () => {
        if (this.mode !== "running") return;
        old?.remove();
        done();
      };
    });
  }
}

function init(): void {
  const dialog =
    document.querySelector<HTMLDialogElement>("site-search dialog");
  const root = document.getElementById("starlight__search");
  const button = document.querySelector<HTMLButtonElement>(
    "site-search button[data-open-modal]",
  );
  if (!dialog || !root) return;
  let hint: SearchHint | null = null;
  let input: HTMLInputElement | null = null;

  // The header field, from 50rem up. It runs its burst once, the first time the page is wide
  // enough to show it.
  const header = button ? new SearchHint(button, null) : null;
  let headerStarted = false;
  const startHeader = (): void => {
    if (!header || headerStarted || !desktop()) return;
    headerStarted = true;
    header.startBurst();
    if (button) button.dataset.ncHintIndex = String(header.index);
  };
  startHeader();
  matchMedia("(min-width: 50rem)").addEventListener("change", startHeader);
  button?.addEventListener("pointerenter", () => {
    if (!dialog.open && !input?.value) header?.rerun();
  });

  const attach = (): SearchHint | null => {
    if (hint) {
      hint.ensureAttached();
      return hint;
    }
    const form = root.querySelector<HTMLElement>(".pagefind-ui__form");
    input = root.querySelector<HTMLInputElement>(".pagefind-ui__search-input");
    if (!form || !input) return null;
    const h = new SearchHint(form, input);
    h.caret = new StyleCaret(input, form);
    h.caret.under = () => h.firstChar();
    const field = input;
    // The header shows the query while the pull-down is closed, and the hint again once the
    // query is cleared (search-panel.ts clears it on a second Escape).
    field.addEventListener("input", () => {
      if (!dialog.open) header?.showQuery(field.value);
    });
    hint = h;
    return hint;
  };

  const open = (h: SearchHint): void => {
    if (desktop() && header) h.startSettled(header.index);
    else h.start();
  };

  const onOpenChange = (): void => {
    if (dialog.open) {
      header?.stop();
      const h = attach();
      if (h) open(h);
    } else {
      hint?.stop();
      header?.showQuery(input?.value ?? "");
    }
    if (button && header) button.dataset.ncHintIndex = String(header.index);
  };

  // Pagefind mounts its form when the browser is idle, which can be after the dialog opens.
  new MutationObserver(() => {
    const had = hint !== null;
    const h = attach();
    if (h && !had && dialog.open) open(h);
  }).observe(root, { childList: true, subtree: true });

  new MutationObserver(onOpenChange).observe(dialog, {
    attributes: true,
    attributeFilter: ["open"],
  });
  window.addEventListener("resize", () => {
    if (dialog.open) hint?.place();
  });
  // search-panel.ts moves the field onto the header on desktop, after the dialog opens.
  document.addEventListener("nc-search-geometry", () => {
    if (dialog.open) hint?.place();
  });
  // Nothing moves where nobody can see it, and a reader who comes back to the tab finds the
  // header at rest.
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) return;
    header?.settle();
    if (dialog.open) hint?.stop();
  });
  new MutationObserver(() => {
    if (document.documentElement.dataset.ncChrome === "hidden")
      header?.settle();
  }).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-nc-chrome"],
  });
  // A reader who switches styles with the dialog open gets the new face and effect from the start.
  new MutationObserver(() => {
    header?.restyle();
    if (dialog.open && hint) open(hint);
  }).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-style"],
  });
}

init();
