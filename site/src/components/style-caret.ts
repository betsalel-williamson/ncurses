/**
 * The search field's caret, in the reader's style: an underline in Text mode, an amber block in
 * Terminal, a thin bar in Workstation and Manual page. Modern keeps the browser's own caret.
 * styles.css sets the shape, color and blink rate per style (--nc-caret-*); this script picks how
 * to draw it and marks the input with data-nc-caret:
 *
 * - native: the browser supports caret-shape (Chrome and Edge 144 and later). CSS does the rest,
 *   and the browser keeps owning selection, IME and scrolling. This script only pauses the blink
 *   while keys arrive.
 * - drawn: desktop Firefox and Safari, in Text mode and Terminal. The real caret turns
 *   transparent and an aria-hidden span is drawn at the insertion point, measured from the text
 *   before it. It hides for a selection range and during IME composition, when the real caret
 *   comes back.
 * - tint: no caret-shape on a touch screen, or a bar style. The native bar in the style's color.
 *   iOS draws its loupe, selection handles and trackpad caret from the real caret, so it stays.
 * - system: Modern, and forced colors.
 *
 * The real caret is never removed, only made transparent, so assistive technology that follows
 * the insertion point still finds it.
 */

type Mode = "native" | "drawn" | "tint" | "system";
type Shape = "underline" | "block" | "bar" | "";

const TYPING_MS = 500;

export class StyleCaret {
  private input: HTMLInputElement;
  private host: HTMLElement;
  private el: HTMLSpanElement;
  private mirror: HTMLSpanElement;
  private composing = false;
  private typingTimer = 0;
  private frame = 0;
  /** The character the caret covers when the field is empty: the hint's first letter. */
  under: () => string = () => "";

  constructor(input: HTMLInputElement, host: HTMLElement) {
    this.input = input;
    this.host = host;
    this.el = document.createElement("span");
    this.el.className = "nc-caret";
    this.el.setAttribute("aria-hidden", "true");
    this.el.hidden = true;
    this.mirror = document.createElement("span");
    this.mirror.className = "nc-caret-mirror";
    this.mirror.setAttribute("aria-hidden", "true");
    host.append(this.el, this.mirror);

    const later = (): void => this.schedule();
    for (const e of [
      "focus",
      "blur",
      "input",
      "select",
      "scroll",
      "keyup",
      "pointerup",
    ]) {
      input.addEventListener(e, later);
    }
    input.addEventListener("keydown", () => {
      this.typing();
      later();
    });
    input.addEventListener("compositionstart", () => {
      this.composing = true;
      input.classList.add("nc-caret-ime");
      this.update();
    });
    input.addEventListener("compositionend", () => {
      this.composing = false;
      input.classList.remove("nc-caret-ime");
      later();
    });
    document.addEventListener("selectionchange", () => {
      if (document.activeElement === input) later();
    });
    addEventListener("resize", later);
    document.fonts?.addEventListener?.("loadingdone", later);
    new MutationObserver(later).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-style"],
    });
    this.update();
  }

  /** Re-attach the caret if Pagefind re-renders the form. */
  ensureAttached(): void {
    if (!this.el.isConnected) this.host.append(this.el, this.mirror);
  }

  schedule(): void {
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => this.update());
  }

  private shape(): Shape {
    return getComputedStyle(this.input)
      .getPropertyValue("--nc-caret-drawn")
      .trim() as Shape;
  }

  private mode(): Mode {
    const style = document.documentElement.dataset.style ?? "modern";
    if (style === "modern" || matchMedia("(forced-colors: active)").matches)
      return "system";
    if (CSS.supports("caret-shape", "block")) return "native";
    const shape = this.shape();
    if (
      (shape === "underline" || shape === "block") &&
      matchMedia("(hover: hover) and (pointer: fine)").matches
    )
      return "drawn";
    return "tint";
  }

  /** The caret stays lit while keys arrive and blinks again once they stop, as a native one does. */
  private typing(): void {
    this.input.classList.add("nc-caret-typing");
    this.el.classList.remove("nc-caret-blink");
    clearTimeout(this.typingTimer);
    this.typingTimer = window.setTimeout(() => {
      this.input.classList.remove("nc-caret-typing");
      this.schedule();
    }, TYPING_MS);
  }

  private measure(text: string, cs: CSSStyleDeclaration): number {
    const m = this.mirror;
    m.style.fontFamily = cs.fontFamily;
    m.style.fontSize = cs.fontSize;
    m.style.fontWeight = cs.fontWeight;
    m.style.letterSpacing = cs.letterSpacing;
    m.textContent = text;
    return m.getBoundingClientRect().width;
  }

  update(): void {
    const input = this.input;
    const el = this.el;
    const mode = this.mode();
    input.dataset.ncCaret = mode;
    const focused = document.activeElement === input;
    if (
      mode !== "drawn" ||
      !focused ||
      this.composing ||
      input.classList.contains("nc-hint-owns-caret") ||
      input.selectionStart !== input.selectionEnd
    ) {
      el.hidden = true;
      return;
    }
    const shape = this.shape();
    const cs = getComputedStyle(input);
    const pos = input.selectionStart ?? input.value.length;
    const before = input.value.slice(0, pos);
    const ch = input.value.charAt(pos) || (input.value ? "" : this.under());
    const fs = parseFloat(cs.fontSize);
    const i = input.getBoundingClientRect();
    const h = this.host.getBoundingClientRect();
    const padL = parseFloat(cs.paddingLeft);
    const padR = parseFloat(cs.paddingRight);
    const start = i.left - h.left + input.clientLeft + padL;
    const end = i.left - h.left + input.clientLeft + input.clientWidth - padR;
    const left = start + this.measure(before, cs) - input.scrollLeft;
    // Off the visible text box for a frame, while the field scrolls: hide rather than draw over
    // the icon or the edge.
    if (left < start - 1 || left > end + 2) {
      el.hidden = true;
      return;
    }
    const width = ch
      ? this.measure(ch, cs)
      : (shape === "block" ? 0.55 : 0.5) * fs;
    const typing = input.classList.contains("nc-caret-typing");
    el.className = `nc-caret nc-caret-${shape}${typing ? "" : " nc-caret-blink"}`;
    Object.assign(el.style, {
      left: `${left}px`,
      top: `${i.top - h.top + input.clientTop + input.clientHeight / 2 - 0.6 * fs}px`,
      width: `${width}px`,
      fontFamily: cs.fontFamily,
      fontSize: cs.fontSize,
    });
    el.textContent = shape === "block" ? ch : "";
    el.hidden = false;
  }
}
