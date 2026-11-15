/**
 * The search pull-down on desktop. From 50rem up, styles.css draws Starlight's search button as
 * a text field and its search dialog as a panel hanging under that field, with Pagefind's input
 * laid exactly over the button. This script supplies what CSS can't:
 *
 * - the button's position and inner layout, as --nc-sb-* custom properties on <html>, so the
 *   dialog's input lands on the button and its icon and text line up with the button's;
 * - while the field is empty, six suggested terms, starting from the one the header showed; a
 *   click fills the field and searches;
 * - a key legend, and in Text mode the window title on the frame (the match count);
 * - keys: Down from the field into the results (or suggestions), Up and Down between them, Up
 *   from the first back to the field; "/" opens search; Escape on the header field, once the
 *   pull-down has closed with text in it, clears the text.
 *
 * Below 50rem, Starlight's full-screen dialog is unchanged and the suggestions, the legend and
 * the title are hidden.
 */
import { TOPICS, desktop, topic, topicLabel } from "./search-topics";

const SUGGESTIONS = 6;

function init(): void {
  const button = document.querySelector<HTMLButtonElement>(
    "site-search button[data-open-modal]",
  );
  const dialog =
    document.querySelector<HTMLDialogElement>("site-search dialog");
  const root = document.getElementById("starlight__search");
  if (!button || !dialog || !root) return;
  const html = document.documentElement;
  const input = (): HTMLInputElement | null =>
    root.querySelector<HTMLInputElement>(".pagefind-ui__search-input");

  // ---------- geometry ----------
  const measure = (): void => {
    if (!desktop()) return;
    const b = button.getBoundingClientRect();
    if (!b.width) return;
    // Chrome auto-hide (chrome-autohide.ts) may have slid the header up; place the field where
    // the header comes back to.
    const header = button.closest<HTMLElement>("header");
    const shift = header
      ? new DOMMatrixReadOnly(getComputedStyle(header).transform).m42
      : 0;
    const icon = button.querySelector("svg")?.getBoundingClientRect();
    const text = button
      .querySelector(".nc-search-hint--header")
      ?.getBoundingClientRect();
    const px = (n: number): string => `${Math.round(n * 100) / 100}px`;
    const set = (name: string, value: string): void =>
      html.style.setProperty(`--nc-sb-${name}`, value);
    set("x", px(b.left));
    set("y", px(b.top - shift));
    set("w", px(b.width));
    set("h", px(b.height));
    if (icon) {
      set("icon-x", px(icon.left - b.left));
      set("icon-size", px(icon.width));
    }
    if (text) set("text-x", px(text.left - b.left));
    set("bl", getComputedStyle(button).borderLeftWidth);
    document.dispatchEvent(new Event("nc-search-geometry"));
  };
  measure();
  addEventListener("resize", measure);
  new ResizeObserver(measure).observe(button);
  document.fonts?.ready.then(measure);

  // ---------- suggestions and legend ----------
  const suggest = document.createElement("div");
  suggest.className = "nc-search-suggest";
  const head = document.createElement("p");
  head.className = "nc-search-suggest-head";
  head.textContent = "Suggestions";
  const list = document.createElement("ul");
  list.setAttribute("aria-label", "Suggested searches");
  suggest.append(head, list);

  const legend = document.createElement("p");
  legend.className = "nc-search-legend";
  legend.setAttribute("aria-hidden", "true");
  legend.innerHTML =
    '<span class="nc-search-legend-keys"><span><b>↑↓</b> Choose</span>' +
    "<span><b>Enter</b> Open</span><span><b>Esc</b> Close</span></span>" +
    '<span class="nc-search-legend-pager">Results (press <b>↑↓</b> to move, ' +
    "<b>RETURN</b> to open, <b>ESC</b> to quit)</span>";

  const renderSuggestions = (): void => {
    const start = Number(button.dataset.ncHintIndex ?? "0") || 0;
    list.replaceChildren(
      ...Array.from(
        { length: Math.min(SUGGESTIONS, TOPICS.length) },
        (_, k) => {
          const t = topic(start + k);
          const li = document.createElement("li");
          const b = document.createElement("button");
          b.type = "button";
          b.className = "nc-search-suggest-item";
          b.dataset.term = t.term;
          const name = document.createElement("span");
          name.className = "nc-search-suggest-term";
          name.textContent = topicLabel(start + k);
          const where = document.createElement("span");
          where.className = "nc-search-suggest-where";
          where.textContent = t.where;
          b.append(name, where);
          li.append(b);
          return li;
        },
      ),
    );
  };

  list.addEventListener("click", (e) => {
    const b = (e.target as Element).closest<HTMLButtonElement>(
      ".nc-search-suggest-item",
    );
    const field = input();
    if (!b || !field) return;
    field.value = b.dataset.term ?? "";
    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.focus();
    sync();
  });

  const ensureAttached = (): void => {
    if (!suggest.isConnected) root.append(suggest);
    if (!legend.isConnected) root.append(legend);
  };

  // ---------- state: empty field, frame title ----------
  const title = (): string => {
    if (!input()?.value) return "Suggestions";
    const msg =
      root.querySelector(".pagefind-ui__message")?.textContent?.trim() ?? "";
    const n = /^(\d+)\s+result/i.exec(msg)?.[1];
    if (n) return `${n} ${n === "1" ? "match" : "matches"}`;
    if (/^no results/i.test(msg)) return "No matches";
    return "Searching";
  };
  const sync = (): void => {
    ensureAttached();
    const empty = !input()?.value;
    root.toggleAttribute("data-nc-empty", empty);
    const t = `[ ${title()} ]`;
    if (root.dataset.ncTitle !== t) root.dataset.ncTitle = t;
  };
  new MutationObserver(sync).observe(root, {
    childList: true,
    subtree: true,
    characterData: true,
  });
  root.addEventListener("input", sync);
  // Pagefind's clear button empties the field without an input event.
  root.addEventListener("click", () => requestAnimationFrame(sync));

  new MutationObserver(() => {
    if (!dialog.open) return;
    measure();
    renderSuggestions();
    sync();
  }).observe(dialog, { attributes: true, attributeFilter: ["open"] });

  // ---------- keys ----------
  const visible = (el: HTMLElement): boolean => el.getClientRects().length > 0;
  const stops = (): HTMLElement[] => {
    const sel = input()?.value
      ? ".pagefind-ui__result-inner > .pagefind-ui__result-title .pagefind-ui__result-link, .pagefind-ui__button"
      : ".nc-search-suggest-item";
    return Array.from(root.querySelectorAll<HTMLElement>(sel)).filter(visible);
  };
  root.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const field = input();
    const all = stops();
    const target = e.target as HTMLElement;
    if (target === field) {
      if (e.key !== "ArrowDown" || !all.length) return;
      e.preventDefault();
      all[0].focus();
      return;
    }
    const i = all.indexOf(target);
    if (i < 0) return;
    e.preventDefault();
    if (e.key === "ArrowDown") all[Math.min(i + 1, all.length - 1)].focus();
    else (all[i - 1] ?? field)?.focus();
  });

  // "/" opens search, as on GitHub, unless the reader is typing somewhere.
  addEventListener("keydown", (e) => {
    if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey || dialog.open)
      return;
    const t = e.target as HTMLElement | null;
    if (
      t?.closest(
        "input, textarea, select, [contenteditable]:not([contenteditable='false'])",
      )
    )
      return;
    if (t?.closest(".xterm")) return;
    e.preventDefault();
    button.click();
  });

  // Escape closes the pull-down and keeps the text. The native dialog closes; Pagefind would
  // also empty the field, so on desktop its input never sees the key. A second Escape, on the
  // header field, clears the text.
  root.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape" && desktop()) e.stopPropagation();
    },
    true,
  );
  button.addEventListener("keydown", (e) => {
    const field = input();
    if (e.key !== "Escape" || !field?.value) return;
    e.preventDefault();
    field.value = "";
    field.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

init();
