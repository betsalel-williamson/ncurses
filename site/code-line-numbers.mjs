// Which listings get line numbers. Expressive Code's line-numbers plugin draws the gutter; this
// plugin, listed before it in ec.config.mjs, turns the gutter on for C listings long enough that
// a reader has to find a place in them: "the loop in board()", a line in a compiler error, a
// review comment. A one-line command or a prototype is read at a glance, and shell steps and
// program output are not programs a reader steps through, so they stay unnumbered.
// A fence can still say showLineNumbers or showLineNumbers=false, and startLineNumber=40 for an
// excerpt: the line-numbers plugin reads those after this one has run, so they win.

const LANGS = new Set(['c', 'h', 'cpp']);
/** The shortest listing that gets numbers. */
export const MIN_LINES = 6;

/** Whether a listing in `language` with `lines` lines gets a numbered gutter by default. */
export function wantsLineNumbers(language, lines) {
  return LANGS.has(language) && lines >= MIN_LINES;
}

export function codeLineNumbers() {
  return {
    name: 'ncurses-line-numbers',
    hooks: {
      preprocessMetadata({ codeBlock }) {
        codeBlock.props.showLineNumbers = wantsLineNumbers(codeBlock.language, codeBlock.getLines().length);
      },
    },
  };
}
