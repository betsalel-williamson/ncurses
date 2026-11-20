/**
 * The troff adapter for the manual pages: how a page's source becomes the text a reader sees.
 * sync.mjs renders the site's pages with it, and man-check.mjs lints the sources and diffs the
 * rendered text with it, so the review reads exactly what the site shows.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = join(dirname(fileURLToPath(import.meta.url)), '..');
const repo = join(site, '..');

const dist = readFileSync(join(repo, 'dist.mk'), 'utf8');
const ver = (k) => new RegExp(`^${k}\\s*=\\s*(\\S+)`, 'm').exec(dist)[1];
export const FILL = {
  NCURSES_MAJOR: ver('NCURSES_MAJOR'),
  NCURSES_MINOR: ver('NCURSES_MINOR'),
  NCURSES_PATCH: ver('NCURSES_PATCH'),
  TERMINFO: '/usr/share/terminfo',
  TERMINFO_DIRS: '/usr/share/terminfo',
  DATADIR: '/usr/share',
  NCURSES_OSPEED: 'short',
};
export const fill = (t) => t.replace(/@([A-Z_]+)@/g, (m, k) => FILL[k] ?? k.toLowerCase());

/**
 * Replace each \\fP ("previous font") with the font it returns to. pandoc's man reader tracks
 * the previous font wrongly, so \\fB…\\fP and \\fI…\\fP left bold running on, and the pages
 * showed stray ** around page references and after italic words. Fonts reset at each
 * paragraph or section macro, as in the man macros.
 */
const PARAGRAPH = /^\.(SH|SS|PP|LP|P|TP|IP|HP|bP|TH)\b/;
export function resolvePreviousFont(text) {
  let cur = 'R';
  let prev = 'R';
  return text
    .split('\n')
    .map((line) => {
      if (PARAGRAPH.test(line)) cur = prev = 'R';
      if (line.startsWith('.\\"')) return line;
      return line.replace(/\\f(\(..|\[[^\]]*\]|.)/g, (m, f) => {
        let font = f.replace(/^\(|^\[|\]$/g, '') || 'P';
        if (font === 'P') font = prev;
        prev = cur;
        cur = font;
        return font.length === 1 ? `\\f${font}` : `\\f[${font}]`;
      });
    })
    .join('\n');
}

/**
 * The value of a troff condition, as groff formatting for a terminal sees it: \n(.g (groff) and
 * n (nroff) are true, t (typesetter) is false. undefined for any other condition.
 */
function condition(c) {
  const neg = c.startsWith('!');
  const v = { '\\n(.g': true, n: true, t: false }[neg ? c.slice(1) : c];
  return v === undefined ? undefined : v !== neg;
}

/**
 * Take the branch of each .ie/.el and .if that groff takes, since pandoc's man reader skips
 * conditionals altogether. The pages define their quote strings (\*(`` and \*('') inside
 * ".ie \n(.g", so pandoc never saw them and dropped every quotation mark. A conditional on
 * anything else is left as it was.
 */
export function resolveConditionals(text) {
  const out = [];
  const blocks = []; // for each open \{ block: whether its lines are kept, and the .ie before it
  let lastIe;
  const keeping = () => blocks.every((b) => b.keep);
  for (const line of text.split('\n')) {
    const m = /^([.'])[ \t]*(ie|if|el)\b[ \t]*(.*)$/.exec(line);
    let taken;
    let rest;
    if (m && m[2] === 'el') {
      if (lastIe !== undefined) {
        taken = !lastIe;
        rest = m[3];
        lastIe = undefined;
      }
    } else if (m) {
      const c = /^(\S+)[ \t]*(.*)$/.exec(m[3]);
      const v = c && condition(c[1]);
      if (v !== undefined) {
        taken = v;
        rest = c[2];
        if (m[2] === 'ie') lastIe = v;
      } else if (m[2] === 'ie') lastIe = undefined;
    }
    if (taken === undefined) {
      if (/^[.'][ \t]*\\\}/.test(line) && blocks.length) lastIe = blocks.pop().ie;
      else if (keeping()) out.push(line);
      continue;
    }
    const open = /^\\\{\\?[ \t]*(.*)$/.exec(rest);
    if (open) {
      blocks.push({ keep: taken, ie: lastIe });
      if (open[1] && keeping()) out.push(open[1]);
    } else if (taken && keeping() && rest) out.push(rest);
  }
  return out.join('\n');
}

/**
 * Rewrite troff that means the same but that pandoc's man reader can't parse: conditionals
 * (resolveConditionals), a line ending in
 * a backslash continues on the next line (it stopped pandoc inside a table in curs_terminfo),
 * a table's format lines can name a two-letter font as f(BI), which pandoc reads only as
 * fBI (infocmp), tables pandoc drops whole (tablesForPandoc), and point-size changes (\\s-1),
 * which pandoc skips with a warning and which a web page sets in its own type.
 */
export function forPandoc(text) {
  return tablesForPandoc(expandStrings(resolveConditionals(text)))
    .replace(/(^|[^\\])\\\n/g, '$1')
    .replace(/(^\.TS\n(?:.*;\n)?)([\s\S]*?\.\n)/gm, (m, head, format) => head + format.replace(/f\((..)\)/g, 'f$1'))
    .replace(/(?<!\\)\\s(?:[-+]?\(\d\d|[-+]?\[\d+\]|[-+]\d|[1-3]?\d)/g, '');
}

/**
 * Replace each use of a string the page defines (\\*x, \\*(xx, \\*[name]) with its value, as
 * defined by the last .ds before it. pandoc expands strings in running text but not inside a
 * table, so curs_addch's table lost ACS_DEGREE's ' and ACS_BULLET's ~. A string the page
 * doesn't define is left for pandoc.
 */
export function expandStrings(text) {
  const defs = new Map();
  return text
    .split('\n')
    .map((line) => {
      const d = /^\.\s*ds\s+(\S+)\s?(.*)$/.exec(line);
      if (d) {
        defs.set(d[1], d[2].replace(/\\".*$/, '').replace(/^\s*"?/, '').trimEnd());
        return line;
      }
      if (line.startsWith('.\\"')) return line;
      return line.replace(/(?<!\\)\\\*(?:\[([^\]]+)\]|\((..)|(.))/g, (m, a, b, c) => defs.get(a ?? b ?? c) ?? m);
    })
    .join('\n');
}

/**
 * Rewrite the tables pandoc's man reader drops whole (it prints "TABLE" in their place) into
 * tables or blocks it reads:
 * - A header that spans columns (S), in one row or several (captoinfo, curs_attr, terminfo's
 *   colour table): pandoc reads one header row without spans, so the rows become one, each
 *   column's label followed by the upper rows' labels over it in parentheses ("Obsolete
 *   (termcap Code)"), and a spanned column of the last row gets an empty label.
 * - A header stacked over rows without spans (curs_add_wch, curs_addch: "Unicode" over
 *   "Default"): each column's labels become the lines of one cell, which man-inlines.lua writes
 *   with <br>, so the site shows the header on two lines as the printed page does.
 * - A table of one column with no tabs in it, used to keep preformatted lines together (term(5)'s
 *   hex dump): it becomes an example block (.EX/.EE), which pandoc shows as code.
 * Any other table is left as it was.
 */
export function tablesForPandoc(text) {
  return mergeContinuedTables(text).replace(/^\.TS\n([\s\S]*?)^\.TE$/gm, (whole, body) => {
    const lines = body.replace(/\n$/, '').split('\n');
    let i = 0;
    if (lines[0]?.trim().endsWith(';')) i = 1;
    const format = [];
    while (i < lines.length) {
      const l = lines[i++];
      format.push(l.replace(/\.\s*$/, ''));
      if (/\.\s*$/.test(l)) break;
    }
    const data = lines.slice(i);
    const specs = (f) => f.trim().split(/\s+/).filter(Boolean);
    if (format.length === 1 && specs(format[0]).length === 1 && data.every((l) => !l.includes('\t')))
      return `.EX\n${data.join('\n')}\n.EE`;
    const rule = data.findIndex((l) => /^[_=]$/.test(l.trim()));
    const spans = (r) => specs(format[r] ?? '').some((s) => /^[sS]/.test(s));
    // A rule between body rows groups them on the printed page; a markdown table has no such
    // line, and pandoc shows it as a row of its own, so the rows after the header drop it.
    const kept = rule < 0 ? data : [...data.slice(0, rule + 1), ...data.slice(rule + 1).filter((l) => !/^[_=]$/.test(l.trim()))];
    if (rule < 1 || rule >= format.length || (rule === 1 && !spans(0)))
      return kept.length === data.length ? whole : ['.TS', ...lines.slice(0, i), ...kept, '.TE'].join('\n');
    const cols = specs(format[format.length - 1]).length;
    // Each header row's label for every column.
    const labels = data.slice(0, rule).map((row, r) => {
      const cells = row.split('\t').map((c) => (c.trim() === '\\&' ? '' : c.trim()));
      const out = [];
      let k = 0;
      // A spanned column (S) shares the label before it; in the last header row it is left empty.
      const last = r === rule - 1;
      for (const s of specs(format[r]).slice(0, cols)) out.push(/^[sS]/.test(s) ? (last ? '' : out[out.length - 1] ?? '') : cells[k++] ?? '');
      return out;
    });
    // Without spans each upper label belongs to the one column under it, as one phrase read top
    // to bottom ("Unicode" over "Default"): the cell keeps its rows, as lines of one text block.
    // With spans an upper label groups the columns under it: "Obsolete (termcap Code)".
    const stacked = rule > 1 && !format.slice(0, rule).some((f) => specs(f).some((s) => /^[sS]/.test(s)));
    const header = Array.from({ length: cols }, (_, c) => {
      const own = labels[labels.length - 1][c] ?? '';
      // Every cell keeps all its rows, an empty one too, so each label sits on the bottom line.
      if (stacked) {
        const rows = labels.map((l) => l[c] ?? '');
        return `T{\n${rows.map((r) => r || '\\&').join('\n.br\n')}\nT}`;
      }
      const over = [...new Set(labels.slice(0, -1).map((l) => l[c]).filter(Boolean))].join(' ');
      return over ? `${own} (${over})`.trim() : own;
    });
    // The header row's format, with each span (S) made a plain column, since its label is now empty.
    const rows = [...format.slice(rule - 1, -1), format[format.length - 1]];
    rows[0] = specs(rows[0]).map((s) => (/^[sS]/.test(s) ? 'L' : s)).join(' ');
    rows[rows.length - 1] += '.';
    return ['.TS', ...lines.slice(0, lines[0]?.trim().endsWith(';') ? 1 : 0), ...rows, header.join('\t'), ...kept.slice(rule), '.TE'].join('\n');
  });
}

/**
 * Join a table to the one before it when the page ends one and starts the next on the following
 * line, with the same number of columns and no header of its own. MKterminfo.sh splits each
 * capability table of terminfo(5) into such pieces, which pandoc would show as separate tables,
 * each after the first with an empty header row and columns of its own widths.
 */
export function mergeContinuedTables(text) {
  const cols = (f) => f.trim().replace(/\.\s*$/, '').split(/\s+/).filter(Boolean).length;
  // A table's option line (ending in ;) and its format lines, up to the one ending in a period.
  const head = (lines) => {
    let i = lines[0]?.trim().endsWith(';') ? 1 : 0;
    while (i < lines.length && !/\.\s*$/.test(lines[i])) i++;
    return i + 1;
  };
  // The closing .TE is only looked ahead to, not taken, so that it can end the next match
  // too: a table split in three or more pieces has a break after each.
  return text.replace(/^\.TE\n\.TS\n([\s\S]*?)(?=^\.TE$)/gm, (whole, body, offset) => {
    const before = `\n${text.slice(0, offset)}`.lastIndexOf('\n.TS\n');
    const prior = text.slice(before + 4, offset).split('\n');
    const lines = body.replace(/\n$/, '').split('\n');
    const n = head(lines);
    const priorFormat = prior[head(prior) - 1] ?? '';
    const ownHeader = lines.slice(n, n + 3).some((l) => /^[_=]$/.test(l.trim()));
    if (before < 0 || ownHeader || cols(lines[n - 1]) !== cols(priorFormat)) return whole;
    return `${lines.slice(n).join('\n')}\n`;
  });
}

/** The manual page sources in man/, plus terminfo.5, which man/MKterminfo.sh builds, as {file, text}. */
export function manSources(manDir = join(repo, 'man')) {
  const sources = readdirSync(manDir)
    .filter((f) => /\.(3x|1|1m|5|7)$/.test(f))
    .map((f) => ({ file: f, text: readFileSync(join(manDir, f), 'utf8') }));
  const terminfo = execFileSync(
    'sh',
    ['MKterminfo.sh', 'terminfo.head', '../include/Caps', '../include/Caps-ncurses', 'terminfo.tail'],
    { cwd: manDir, encoding: 'utf8', maxBuffer: 64 << 20 },
  );
  sources.push({ file: 'terminfo.5', text: terminfo });
  return sources;
}

/** A page's source as GFM, the way the site shows it. Throws when pandoc fails. */
export function toMarkdown(text) {
  const out = execFileSync('pandoc', ['-f', 'man', '-t', 'gfm', '--wrap=none', '--lua-filter', join(site, 'scripts/man-inlines.lua')], {
    input: resolvePreviousFont(forPandoc(fill(text))),
    encoding: 'utf8',
    maxBuffer: 64 << 20,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  return out;
}
