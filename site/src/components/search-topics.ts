/**
 * The terms the search field suggests: the rotating hint (search-hint.ts) and, on desktop, the
 * suggestion list in the empty pull-down (search-panel.ts).
 */

export interface Topic {
  term: string;
  /** Where the term lives on the site, shown under it in the suggestion list. */
  where: string;
  /** A function with its own man page entry, written as a cross-reference in Manual page style. */
  fn?: boolean;
}

// Each name is a function in docs/man or a topic from the guides and the glossary.
export const TOPICS: Topic[] = [
  { term: "initscr", where: "curs_initscr(3X)", fn: true },
  { term: "color pairs", where: "Attributes › Colors" },
  { term: "getch", where: "curs_getch(3X)", fn: true },
  { term: "panels", where: "Panels library" },
  { term: "mvprintw", where: "curs_printw(3X)", fn: true },
  { term: "line drawing", where: "Screen › Line-drawing characters" },
  { term: "newwin", where: "curs_window(3X)", fn: true },
  { term: "forms", where: "Forms library" },
  { term: "keypad", where: "curs_inopts(3X)", fn: true },
  { term: "menus", where: "Menus library" },
  { term: "init_pair", where: "curs_color(3X)", fn: true },
  { term: "terminfo", where: "terminfo glossary, curs_terminfo(3X)" },
  { term: "mousemask", where: "curs_mouse(3X)", fn: true },
  { term: "SIGWINCH", where: "Hints › Resizing the terminal" },
  { term: "resizeterm", where: "resizeterm(3X)", fn: true },
  { term: "cbreak", where: "curs_inopts(3X), cbreak mode glossary" },
  { term: "wadd_wch", where: "curs_add_wch(3X)", fn: true },
  { term: "curs_set", where: "curs_kernel(3X), Cursor visibility" },
];

/** The one example shown when the reader asks for reduced motion. */
export const STATIC_HINT = "e.g. initscr";

/** The topic at index i, wrapping around the list. */
export function topic(i: number): Topic {
  const n = TOPICS.length;
  return TOPICS[((i % n) + n) % n];
}

/** How the current style writes a topic: Manual page names a function as a cross-reference. */
export function topicLabel(i: number): string {
  const t = topic(i);
  return document.documentElement.dataset.style === "manpage" && t.fn
    ? `${t.term}(3X)`
    : t.term;
}

/** True from 50rem up, where search is the header field and its pull-down. */
export const desktop = (): boolean => matchMedia("(min-width: 50rem)").matches;

export const reducedMotion = (): boolean =>
  matchMedia("(prefers-reduced-motion: reduce)").matches;
