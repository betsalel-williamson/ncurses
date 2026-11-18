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
 * and a table's format lines can name a two-letter font as f(BI), which pandoc reads only as
 * fBI (infocmp).
 */
export function forPandoc(text) {
  return resolveConditionals(text)
    .replace(/(^|[^\\])\\\n/g, '$1')
    .replace(/(^\.TS\n(?:.*;\n)?)([\s\S]*?\.\n)/gm, (m, head, format) => head + format.replace(/f\((..)\)/g, 'f$1'));
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
