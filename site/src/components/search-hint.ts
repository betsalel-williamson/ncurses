/**
 * The search field's rotating hint. While the search dialog is open and the field is empty, a
 * hint over the field cycles through things a reader might look up, until they tap the field or
 * type. The four period styles erase the old term and type the new one behind a blinking cursor,
 * each at its own pace (TYPE below); the cursor's shape and blink rate are set in CSS. Terminal
 * also sets --nc-search-hint-strike, so each typed character lights up in that color and fades.
 * Modern slides: the old term rises and fades while the new one rises in.
 *
 * The hint is an aria-hidden element, so screen readers hear the field's fixed label, never the
 * rotating text. With reduced motion the hint is one fixed example. The real placeholder stays
 * in the DOM, made transparent while the hint shows, for when this script doesn't run.
 */

interface Topic {
  term: string;
  /** A function with its own man page entry, written as a cross-reference in Manual page style. */
  fn?: boolean;
}

// Each name is a function in docs/man or a topic from the guides and the glossary.
const TOPICS: Topic[] = [
  { term: "initscr", fn: true },
  { term: "color pairs" },
  { term: "getch", fn: true },
  { term: "panels" },
  { term: "mvprintw", fn: true },
  { term: "line drawing" },
  { term: "newwin", fn: true },
  { term: "forms" },
  { term: "keypad", fn: true },
  { term: "menus" },
  { term: "init_pair", fn: true },
  { term: "terminfo" },
  { term: "mousemask", fn: true },
  { term: "SIGWINCH" },
  { term: "resizeterm", fn: true },
  { term: "cbreak", fn: true },
  { term: "wadd_wch", fn: true },
  { term: "curs_set", fn: true },
];
const STATIC_HINT = "e.g. initscr";
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

type Mode = "idle" | "running" | "settled" | "static";

class SearchHint {
  private form: HTMLElement;
  private input: HTMLInputElement;
  private hint: HTMLSpanElement;
  private slot: HTMLSpanElement;
  private cursor: HTMLSpanElement;
  private timer = 0;
  private mode: Mode = "idle";
  private first = 0;
  private step = 0;
  private current = "";

  constructor(form: HTMLElement, input: HTMLInputElement) {
    this.form = form;
    this.input = input;
    input.setAttribute("aria-label", LABEL);

    this.hint = document.createElement("span");
    this.hint.className = "nc-search-hint";
    this.hint.setAttribute("aria-hidden", "true");
    this.slot = document.createElement("span");
    this.slot.className = "nc-search-hint-slot";
    this.cursor = document.createElement("span");
    this.cursor.className = "nc-search-hint-cursor";
    this.hint.append(this.slot);
    form.append(this.hint);

    input.addEventListener("pointerdown", () => this.settle());
    input.addEventListener("input", () => {
      if (this.mode === "running") this.settle();
      this.sync();
    });
    // Pagefind's clear button empties the field without an input event.
    form.addEventListener("click", () =>
      requestAnimationFrame(() => this.sync()),
    );
  }

  /** Re-attach the hint if Pagefind re-renders the form. */
  ensureAttached(): void {
    if (!this.hint.isConnected) this.form.append(this.hint);
  }

  start(): void {
    this.stop();
    this.ensureAttached();
    this.place();
    this.form.classList.add("nc-search-hinting");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.mode = "static";
      this.show(STATIC_HINT);
    } else {
      this.mode = "running";
      this.first = Math.floor(Math.random() * TOPICS.length);
      this.step = 0;
      this.current = this.label(this.first);
      this.show(this.current);
      this.tick();
    }
    this.sync();
  }

  stop(): void {
    clearTimeout(this.timer);
    this.slot.getAnimations({ subtree: true }).forEach((a) => a.cancel());
    if (this.mode === "running") this.mode = "settled";
  }

  /** Line the hint up with the field's text box: after the icon, and clear of the clear button. */
  place(): void {
    const f = this.form.getBoundingClientRect();
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

  private settle(): void {
    if (this.mode !== "running") return;
    this.stop();
    this.show(this.current);
  }

  private sync(): void {
    this.hint.hidden = this.input.value.length > 0;
  }

  /** The current style's typing pace, or undefined for the styles that slide. */
  private typing(): Typing | undefined {
    return TYPE[document.documentElement.dataset.style ?? ""];
  }

  private label(i: number): string {
    const t = TOPICS[i % TOPICS.length];
    const manpage = document.documentElement.dataset.style === "manpage";
    return manpage && t.fn ? `${t.term}(3X)` : t.term;
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
    const next = (): void => {
      this.step += 1;
      // One pass through the list, then rest on the term that started it.
      if (this.step >= TOPICS.length) {
        this.mode = "settled";
        return;
      }
      this.tick();
    };
    const t = this.typing();
    if (t) this.type(t, next);
    else this.slide(next);
  }

  private nextLabel(): string {
    this.current = this.label(this.first + this.step + 1);
    return this.current;
  }

  private type(t: Typing, done: () => void): void {
    const w = this.slot.firstElementChild as HTMLSpanElement | null;
    if (!w) return;
    const old = w.textContent ?? "";
    w.append(this.cursor);
    this.cursor.classList.add("blinking");
    const strike = getComputedStyle(this.form)
      .getPropertyValue("--nc-search-hint-strike")
      .trim();
    const hint = getComputedStyle(this.hint).color;

    // The cursor blinks while it rests, during the hold and the blank, and stays lit while it moves.
    this.wait(t.hold, () => {
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

  private slide(done: () => void): void {
    this.wait(SLIDE_DWELL_MS, () => {
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
  if (!dialog || !root) return;
  let hint: SearchHint | null = null;

  const attach = (): SearchHint | null => {
    if (hint) {
      hint.ensureAttached();
      return hint;
    }
    const form = root.querySelector<HTMLElement>(".pagefind-ui__form");
    const input = root.querySelector<HTMLInputElement>(
      ".pagefind-ui__search-input",
    );
    if (!form || !input) return null;
    hint = new SearchHint(form, input);
    return hint;
  };

  const onOpenChange = (): void => {
    if (dialog.open) attach()?.start();
    else hint?.stop();
  };

  // Pagefind mounts its form when the browser is idle, which can be after the dialog opens.
  new MutationObserver(() => {
    const had = hint !== null;
    const h = attach();
    if (h && !had && dialog.open) h.start();
  }).observe(root, { childList: true, subtree: true });

  new MutationObserver(onOpenChange).observe(dialog, {
    attributes: true,
    attributeFilter: ["open"],
  });
  window.addEventListener("resize", () => {
    if (dialog.open) hint?.place();
  });
  document.addEventListener("visibilitychange", () => {
    if (!dialog.open || !hint) return;
    if (document.hidden) hint.stop();
  });
  // A reader who switches styles with the dialog open gets the new face and effect from the start.
  new MutationObserver(() => {
    if (dialog.open && hint) hint.start();
  }).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-style"],
  });
}

init();
