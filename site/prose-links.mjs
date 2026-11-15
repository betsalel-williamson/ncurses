// Links for the guides' prose, applied by scripts/sync.mjs as it copies each shard into the site.
// Inline code that names a curses library function, macro, variable, type or constant becomes a
// link to its man page, with the same hint on hover and focus as a name in a code listing
// (code-links.mjs, code-hints.js). The names and pages come from the index that sync.mjs builds
// from this tree's manual pages (.generated/symbols.json).
//
// How a name avoids the wrong page:
// - A function or function-like macro links only when written with its parentheses, `echo()`,
//   so the shell command `clear` or the word `box` stays plain. Variables, types and constants
//   (`stdscr`, `WINDOW`, `REQ_NEXT_FIELD`) link as written.
// - Only names in the index link: C library calls (`printf()`) and qualified names
//   (`curses.wrapper()`) stay plain.
// - A name that a listing on the same page defines (`destroy_win()`) stays plain: the page's own
//   definition wins, as it does inside the listing.
// - Inline code inside a link's text is left alone, so an author can always choose the target,
//   and so is inline code in a heading, whose text is already a link to itself.
// - On history pages the hint leaves out the declaration: the index holds this release's, and the
//   page may describe an older one.
import { definitions } from './code-defs.mjs';

const NAME = /^([A-Za-z_]\w*)(\(\))?$/;
const LANGS = new Set(['c', 'h', 'cpp']);
const FENCE = /^ {0,3}(`{3,}|~{3,})(.*)$/;
const attr = (v) => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** The link for one inline code span's text, or null to leave it plain. */
export function linkFor(value, { symbols, local = new Set(), historical = false, version }) {
  const m = NAME.exec(value);
  if (!m) return null;
  const [, name, parens] = m;
  if (!Object.hasOwn(symbols, name) || local.has(name)) return null;
  const sym = symbols[name];
  const callable = Boolean(sym.proto?.includes('('));
  if (callable !== Boolean(parens)) return null;
  const proto = historical ? undefined : sym.proto;
  return {
    href: sym.href,
    properties: {
      class: 'nc-sym',
      'data-summary': sym.summary,
      'data-page': sym.page,
      'data-proto': proto,
      'data-version': version ? `ncurses ${version}` : undefined,
      'aria-label': `${proto ?? name} ${sym.summary}, in ${sym.page}`,
    },
  };
}

const html = (link, code) => {
  const props = Object.entries(link.properties)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => ` ${k}="${attr(v)}"`)
    .join('');
  return `<a href="${attr(link.href)}"${props}><code>${code.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</code></a>`;
};

/** Inline code spans in one line of prose, each with whether it falls inside a link's text. */
function spans(line) {
  const out = [];
  let depth = 0;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '\\') i++;
    else if (c === '[') depth++;
    else if (c === ']') depth = Math.max(0, depth - 1);
    else if (c === '`') {
      const run = /^`+/.exec(line.slice(i))[0];
      const close = line.indexOf(run, i + run.length);
      if (close < 0) {
        i += run.length - 1;
        continue;
      }
      // A run of the same length ends the span only if no more backticks follow it.
      if (line[close + run.length] === '`') {
        i = close + run.length;
        continue;
      }
      out.push({ start: i, end: close + run.length, value: line.slice(i + run.length, close).trim(), inLink: depth > 0 });
      i = close + run.length - 1;
    }
  }
  return out;
}

/**
 * A shard's Markdown with its library names linked. Fenced code is left as it is, apart from
 * supplying the names its C listings define.
 */
export function linkProse(text, { symbols, historical = false, version }) {
  const lines = text.split('\n');
  // Fenced blocks: which lines are code, and what the C listings define.
  const inFence = new Array(lines.length).fill(false);
  const local = new Set();
  for (let i = 0; i < lines.length; i++) {
    const open = FENCE.exec(lines[i]);
    if (!open) continue;
    const lang = open[2].trim().split(/\s+/)[0];
    let j = i + 1;
    while (j < lines.length && !(lines[j].trim().startsWith(open[1][0].repeat(open[1].length)) && FENCE.test(lines[j]))) j++;
    for (let k = i; k <= Math.min(j, lines.length - 1); k++) inFence[k] = true;
    if (!lang || LANGS.has(lang)) for (const d of definitions(lines.slice(i + 1, j).join('\n'))) local.add(d.name);
    i = j;
  }
  const options = { symbols, local, historical, version };
  return lines
    .map((line, i) => {
      if (inFence[i] || /^ {0,3}#/.test(line)) return line;
      let out = line;
      for (const s of spans(line).reverse()) {
        if (s.inLink) continue;
        const link = linkFor(s.value, options);
        if (link) out = out.slice(0, s.start) + html(link, s.value) + out.slice(s.end);
      }
      return out;
    })
    .join('\n');
}
