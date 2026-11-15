// The arithmetic behind run-example.ts's terminal: the font size that fits a terminal's columns in
// the space a phone gives it, and the bytes a key on the Run row sends. Kept apart from the DOM so
// tests can run it (tests/terminal-fit.test.mjs).

/** The terminal's own size, and the largest it is drawn at. */
export const FULL_SIZE = 16;
/** Font sizes step by a quarter pixel, fine enough to use the width a phone has. */
export const STEP = 0.25;

/** Whether `cols` columns, each `cell` pixels wide at FULL_SIZE, are wider than `avail` pixels. */
export function overflows(avail, cols, cell) {
  return cols * cell > avail;
}

/**
 * The largest font size, in quarter pixels and at most FULL_SIZE, at which `cols` columns fit in
 * `avail` pixels, given the cell width `cell` measured at FULL_SIZE. A cell scales with the font,
 * so the width at size s is cols * cell * s / FULL_SIZE. There is no lower limit: on a narrow
 * phone the whole screen shows, small, rather than half of it.
 */
export function fitFontSize(avail, cols, cell) {
  if (!(avail > 0 && cols > 0 && cell > 0)) return FULL_SIZE;
  const exact = (avail * FULL_SIZE) / (cols * cell);
  return Math.max(STEP, Math.min(FULL_SIZE, Math.floor(exact / STEP) * STEP));
}

/**
 * Below this size a fitted screen is a map rather than readable text, so the Run row offers Fit
 * to width as a choice: off gives full size and a sideways scroll. Above it (80x24 or 100x30 in a
 * laptop's column) the terminal just fits, as it always has, and the choice stays out of the way.
 */
export const LEGIBLE = 9;

/** Whether fitting `cols` columns in `avail` pixels takes the text below LEGIBLE. */
export function offersFullSize(avail, cols, cell) {
  return overflows(avail, cols, cell) && fitFontSize(avail, cols, cell) < LEGIBLE;
}

/**
 * What a key on the Run row sends, as xterm.js sends it for a real key. The arrows depend on the
 * mode the program set: keypad(stdscr, TRUE) turns on application cursor keys (ESC O A), and
 * otherwise an arrow is ESC [ A.
 */
export function keySequence(key, applicationCursor = false) {
  const arrow = { Up: 'A', Down: 'B', Right: 'C', Left: 'D' }[key];
  if (arrow) return `\x1b${applicationCursor ? 'O' : '['}${arrow}`;
  return { F1: '\x1bOP', PageUp: '\x1b[5~', PageDown: '\x1b[6~' }[key] ?? '';
}
