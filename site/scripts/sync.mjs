#!/usr/bin/env node
/**
 * Generate the site's content from the sources:
 * - docs/client-library/** (GFM shards) -> src/content/docs/guides/** (title from the shard's `#` heading),
 *   and docs/contributor/{hackguide,install,ada,announce} -> src/content/docs/contributing/{hackguide,install,ada,announce}
 * - man/*.{3x,1,1m,5,7} plus terminfo.5 (built by man/MKterminfo.sh) -> src/content/docs/man/<section>/<name>.md,
 *   through `pandoc -f man`, with autoconf placeholders filled in and page references turned into links
 * - .generated/sidebar.json: the man page groups for the sidebar
 * - .generated/symbols.json: library names and constants with their man pages, for links in code
 *   listings and in the guides' inline code (prose-links.mjs)
 * - .generated/site.json: the release the man pages describe, for the hints on those links
 * - a Run placeholder after each complete program in a guide (examples.mjs)
 * - docs/glossary -> src/content/docs/glossary (one page per term)
 * - the errata tables in the appendix, from docs/appendix/errata.csv
 * Requires pandoc on PATH. Output is gitignored.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderErrata } from './errata.mjs';
import { findPrograms } from './examples.mjs';
import { linkProse } from '../prose-links.mjs';

const site = join(dirname(fileURLToPath(import.meta.url)), '..');
const repo = join(site, '..');
const content = join(site, 'src/content/docs');
const repoSlug = process.env.GITHUB_REPOSITORY || 'betsalel-williamson/ncurses';
const blob = (p) => `https://github.com/${repoSlug}/blob/master/${p}`;

// ---------- guides ----------
const GUIDES = [
  { src: 'docs/client-library/getting-started', route: 'guides/getting-started', indexLabel: 'Introduction' },
  { src: 'docs/client-library/windows', route: 'guides/windows', indexLabel: 'Introduction' },
  { src: 'docs/client-library/output', route: 'guides/output', indexLabel: 'Introduction' },
  { src: 'docs/client-library/input', route: 'guides/input', indexLabel: 'Introduction' },
  { src: 'docs/client-library/attributes', route: 'guides/attributes', indexLabel: 'Introduction' },
  { src: 'docs/client-library/keyboard', route: 'guides/keyboard', indexLabel: 'Introduction' },
  { src: 'docs/client-library/mouse', route: 'guides/mouse', indexLabel: 'Introduction' },
  { src: 'docs/client-library/screen', route: 'guides/screen', indexLabel: 'Introduction' },
  { src: 'docs/client-library/init-and-debugging', route: 'guides/init-and-debugging', indexLabel: 'Introduction' },
  { src: 'docs/client-library/hints', route: 'guides/hints', indexLabel: 'Introduction' },
  { src: 'docs/client-library/more', route: 'guides/more', indexLabel: 'Introduction' },
  { src: 'docs/client-library/forms', route: 'guides/forms', indexLabel: 'Introduction' },
  { src: 'docs/client-library/menus', route: 'guides/menus', indexLabel: 'Introduction' },
  { src: 'docs/client-library/panels', route: 'guides/panels', indexLabel: 'Introduction' },
  { src: 'docs/contributor/hackguide', route: 'contributing/hackguide', indexLabel: 'Introduction' },
  { src: 'docs/contributor/install', route: 'contributing/install', indexLabel: 'Introduction' },
  { src: 'docs/contributor/ada', route: 'contributing/ada', indexLabel: 'Introduction' },
  { src: 'docs/contributor/announce', route: 'contributing/announce', indexLabel: 'Introduction' },
  { src: 'docs/contributor/install/configure-options', route: 'contributing/configure-options', indexLabel: 'Introduction' },
  // A history page describes older releases, so a function's hint there leaves out this release's
  // declaration (prose-links.mjs).
  { src: 'docs/contributor/install/compatibility', route: 'contributing/compatibility', indexLabel: 'Introduction', historical: true },
  // A glossary is looked up, not read in order, so its terms are listed A to Z.
  { src: 'docs/glossary', route: 'glossary', indexLabel: 'Introduction', alphabetical: true },
  { src: 'docs/appendix', route: 'appendix', indexLabel: 'Errata' },
  // The landing page of each top-level area of the sidebar, as MDN has.
  { src: 'docs/areas/tutorials', route: 'learn', indexLabel: 'Overview' },
  { src: 'docs/areas/guides', route: 'topics', indexLabel: 'Overview' },
  { src: 'docs/areas/reference', route: 'reference', indexLabel: 'Overview' },
  { src: 'docs/areas/about', route: 'about', indexLabel: 'Overview' },
];
const base = `/${repoSlug.split('/')[1]}`;
for (const g of GUIDES) rmSync(join(content, g.route.split('/')[0]), { recursive: true, force: true });
// The site route of a shard, or null when it isn't in a guide.
const routeOf = (target) => {
  const g = GUIDES.find((x) => x.src === dirname(target));
  if (!g) return null;
  const name = basename(target, '.md');
  return `${base}/${g.route}/${name === 'index' ? '' : `${name}/`}`;
};
// Each guide page written, for the links added once the man pages' names are known.
const written = [];
for (const g of GUIDES) {
  const dir = join(repo, g.src);
  // Sidebar order follows the guide's index: the order its links list the shards.
  // When the index has a "## Guide" list, that list sets the order; links in the prose above it
  // (such as "packagers should read …") don't.
  const indexText = readFileSync(join(dir, 'index.md'), 'utf8');
  const guideList = indexText.split(/^## Guide$/m)[1] ?? indexText;
  const order = [...guideList.matchAll(/\]\(([^)#\s]+\.md)\)/g)].map((m) => m[1]);
  if (g.alphabetical) {
    const term = (f) => (/^# (.+)$/m.exec(readFileSync(join(dir, f), 'utf8'))?.[1] ?? f).toLowerCase();
    order.sort((x, y) => term(x).localeCompare(term(y), 'en'));
  }
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    let text = readFileSync(join(dir, file), 'utf8');
    const h1 = /^# (.+)\n+/.exec(text);
    const title = h1 ? h1[1] : file;
    if (h1) text = text.slice(h1[0].length);
    const isIndex = file === 'index.md';
    // Relative links: a shard in a guide becomes its site route; anything else in the repo
    // goes to GitHub.
    text = text.replace(/\]\(((?:\.\.?\/)*[^)/:#\s][^):#\s]*)(#[^)]*)?\)/g, (m, p, frag = '') => {
      const target = relative(repo, join(dir, p));
      if (target.startsWith('..')) return m;
      // A manual page source in man/ becomes its page on this site.
      // terminfo(5) is built from terminfo.head and the capability tables.
      const man = /^man\/([^/]+)\.(3x|1|1m|5|7)$/.exec(target === 'man/terminfo.head' ? 'man/terminfo.5' : target);
      if (man) return `](${base}/man/${man[2]}/${man[1]}/${frag})`;
      const route = target.endsWith('.md') ? routeOf(target) : null;
      return route ? `](${route}${frag})` : `](${blob(target)}${frag})`;
    });
    // The appendix's tables come from errata.csv.
    if (g.route === 'appendix' && isIndex) text += renderErrata(repo, { base, repoSlug, routeOf });
    // Runnable examples: a placeholder after each complete program, which becomes a Run button
    // or a "doesn't run yet" flag (build-examples.mjs, run-example.ts). From the end, so the
    // offsets stay good.
    for (const ex of findPrograms(text, `${g.src}/${file}`).reverse()) {
      const widget = `\n\n<div class="run-example" data-example="${ex.id}" data-title=${JSON.stringify(ex.title)}${ex.keys.length ? ` data-keys="${ex.keys.join(' ')}"` : ''}></div>`;
      text = text.slice(0, ex.end) + widget + text.slice(ex.end);
    }
    const out = join(content, g.route, file);
    mkdirSync(dirname(out), { recursive: true });
    const position = isIndex ? 0 : order.indexOf(file) + 1;
    const fm = `---\ntitle: ${JSON.stringify(title)}\nsidebar:\n  order: ${position}\n${isIndex ? `  label: ${g.indexLabel}\n` : ''}---\n\n`;
    writeFileSync(out, fm + text);
    written.push({ out, historical: Boolean(g.historical) });
  }
}

// ---------- man pages ----------
const dist = readFileSync(join(repo, 'dist.mk'), 'utf8');
const ver = (k) => new RegExp(`^${k}\\s*=\\s*(\\S+)`, 'm').exec(dist)[1];
const FILL = {
  NCURSES_MAJOR: ver('NCURSES_MAJOR'),
  NCURSES_MINOR: ver('NCURSES_MINOR'),
  NCURSES_PATCH: ver('NCURSES_PATCH'),
  TERMINFO: '/usr/share/terminfo',
  TERMINFO_DIRS: '/usr/share/terminfo',
  DATADIR: '/usr/share',
  NCURSES_OSPEED: 'short',
};
const fill = (t) => t.replace(/@([A-Z_]+)@/g, (m, k) => FILL[k] ?? k.toLowerCase());

/**
 * Replace each \\fP ("previous font") with the font it returns to. pandoc's man reader tracks
 * the previous font wrongly, so \\fB…\\fP and \\fI…\\fP left bold running on, and the pages
 * showed stray ** around page references and after italic words. Fonts reset at each
 * paragraph or section macro, as in the man macros.
 */
const PARAGRAPH = /^\.(SH|SS|PP|LP|P|TP|IP|HP|bP|TH)\b/;
function resolvePreviousFont(text) {
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
 * Rewrite troff that means the same but that pandoc's man reader can't parse: a line ending in
 * a backslash continues on the next line (it stopped pandoc inside a table in curs_terminfo),
 * and a table's format lines can name a two-letter font as f(BI), which pandoc reads only as
 * fBI (infocmp).
 */
function forPandoc(text) {
  return text
    .replace(/(^|[^\\])\\\n/g, '$1')
    .replace(/(^\.TS\n(?:.*;\n)?)([\s\S]*?\.\n)/gm, (m, head, format) => head + format.replace(/f\((..)\)/g, 'f$1'));
}

const manDir = join(repo, 'man');
const tmp = join(site, '.generated');
mkdirSync(tmp, { recursive: true });
const sources = readdirSync(manDir)
  .filter((f) => /\.(3x|1|1m|5|7)$/.test(f))
  .map((f) => ({ file: f, text: readFileSync(join(manDir, f), 'utf8') }));
const terminfo = execFileSync(
  'sh',
  ['MKterminfo.sh', 'terminfo.head', '../include/Caps', '../include/Caps-ncurses', 'terminfo.tail'],
  { cwd: manDir, encoding: 'utf8', maxBuffer: 64 << 20 },
);
sources.push({ file: 'terminfo.5', text: terminfo });

const pages = sources.map(({ file, text }) => {
  const dot = file.lastIndexOf('.');
  const name = file.slice(0, dot);
  const section = file.slice(dot + 1);
  let md;
  let failed = false;
  try {
    md = execFileSync('pandoc', ['-f', 'man', '-t', 'gfm', '--wrap=none', '--lua-filter', join(site, 'scripts/man-inlines.lua')], {
      input: resolvePreviousFont(forPandoc(fill(text))),
      encoding: 'utf8',
      maxBuffer: 64 << 20,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  } catch {
    failed = true;
    // A fence longer than any run of backticks in the page (troff quotes with ``).
    const fence = '`'.repeat(Math.max(3, ...[...text.matchAll(/`+/g)].map((m) => m[0].length + 1)));
    md = `${fence}\n${fill(text)}\n${fence}\n`;
  }
  // NAME lists the names this page documents: "**addch**, **waddch** - add a character".
  const nameBlock = /^# NAME\n+([\s\S]*?)\n\n/m.exec(md);
  const nameLine = nameBlock ? nameBlock[1].replace(/\s+/g, ' ') : '';
  const [names = '', summary = ''] = nameLine.split(/\s+[-–—]\s+/);
  const aliases = names
    .replace(/[*\\]/g, '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return { file, name, section, md, aliases, summary: summary.replace(/[*\\]/g, '').trim(), failed };
});

/**
 * pandoc writes troff's example blocks as indented code, with no language, so they show
 * uncolored. On the library pages (3X), an indented block that reads as C, the SYNOPSIS and
 * the examples, becomes a fenced c block: colored like the guides' listings, with its curses
 * calls linked (code-links.mjs). A block holding Markdown (a list item's continued paragraph)
 * or nothing C-like stays as it is.
 */
function tagCode(md) {
  const lines = md.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; ) {
    const starts = /^ {4}\S/.test(lines[i]) && (i === 0 || lines[i - 1].trim() === '');
    if (!starts) {
      out.push(lines[i++]);
      continue;
    }
    let j = i;
    // The block runs on through blank lines that another indented line follows.
    while (j < lines.length && (/^ {4}/.test(lines[j]) || (lines[j].trim() === '' && /^ {4}\S/.test(lines[j + 1] ?? '')))) j++;
    const block = lines.slice(i, j);
    const text = block.join('\n');
    const isC = /;\s*$|^\s*#\s*include\b|^\s*(?:\/\*|\{|\})/m.test(text) && !/\*\*[^*\s][^*\n]*[^*\s]\*\*|\]\(/.test(text);
    if (isC) out.push('```c', ...block.map((l) => l.slice(4)), '```');
    else out.push(...block);
    i = j;
  }
  return out.join('\n');
}

const route = (p) => `man/${p.section}/${p.name}`;
const byName = new Map();
for (const p of pages) {
  for (const n of [p.name, ...p.aliases]) {
    const key = `${n}(${p.section})`.toLowerCase();
    if (!byName.has(key)) byName.set(key, p);
  }
}

rmSync(join(content, 'man'), { recursive: true, force: true });
for (const p of pages) {
  let md = p.md.replace(/^(#+) /gm, '#$1 '); // NAME, SYNOPSIS... become level-2 sections
  if (p.section === '3x') md = tagCode(md);
  // Page references: **addch**(3X) or addch(3X) -> a link to that page.
  md = md.replace(/(\*\*|\*)?([A-Za-z_][\w.+-]*)\1?\\?\(([1-9][A-Za-z]*)\)/g, (m, em = '', n, sec) => {
    const hit = byName.get(`${n}(${sec})`.toLowerCase());
    if (!hit || hit === p) return m;
    return `[${em}${n}${em}(${sec})](${base}/${route(hit)}/)`;
  });
  const title = `${p.name}(${p.section})`;
  const description = p.summary || title;
  const note = p.failed
    ? `:::caution\npandoc could not read this page, so it is shown as troff source. See [man/${p.file}](${blob('man/' + p.file)}).\n:::\n\n`
    : '';
  const fm = `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(description)}\n---\n\n`;
  const out = join(content, route(p) + '.md');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, fm + note + md);
}

const GROUPS = [
  { label: 'Library functions (3X)', test: (s) => s === '3x' },
  { label: 'Programs (1, 1M)', test: (s) => s === '1' || s === '1m' },
  { label: 'File formats and conventions (5, 7)', test: (s) => s === '5' || s === '7' },
];
const sidebar = GROUPS.map((g) => ({
  label: g.label,
  collapsed: true,
  items: pages
    .filter((p) => g.test(p.section))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((p) => ({ label: `${p.name}(${p.section})`, link: `/${route(p)}/` })),
}));
writeFileSync(join(tmp, 'sidebar.json'), JSON.stringify(sidebar, null, 2));
// .generated/symbols.json: each library name (3X) -> its man page, for links in code listings
// (code-links.mjs). A name documented on more than one page keeps the first, as byName does.
const symbols = {};
for (const p of pages) {
  if (p.section !== '3x') continue;
  const protos = prototypes(p.md);
  for (const n of [p.name, ...p.aliases]) {
    if (/^[A-Za-z_]\w*$/.test(n) && !(n in symbols)) {
      symbols[n] = { href: `${base}/${route(p)}/`, page: `${p.name}(3X)`, summary: p.summary };
      if (protos.has(n)) symbols[n].proto = protos.get(n);
    }
  }
}
// Named constants (REQ_NEXT_FIELD, O_AUTOSKIP, KEY_UP, A_BOLD, ACS_HLINE, E_BAD_ARGUMENT …) have
// no NAME line of their own; the pages define them in tables or in a list of terms, each with a
// one-line meaning, which becomes the constant's hint.
for (const p of pages) {
  if (p.section !== '3x') continue;
  for (const [n, meaning] of constants(p.md)) {
    if (!(n in symbols)) symbols[n] = { href: `${base}/${route(p)}/`, page: `${p.name}(3X)`, summary: meaning, constant: true };
  }
}
// Some pages name only themselves on the NAME line (panel(3X)) or leave functions off it
// (form_field_buffer(3X) lists field_buffer but declares more), so a name declared in a page's
// SYNOPSIS joins too, after every NAME line has had its turn.
for (const p of pages) {
  if (p.section !== '3x') continue;
  for (const [n, proto] of prototypes(p.md)) {
    // A typedef's or struct member's name (MEVENT's id, x, bstate) isn't a library name.
    if (n in symbols || /^(typedef|struct)\b/.test(proto)) continue;
    const entry = { href: `${base}/${route(p)}/`, page: `${p.name}(3X)`, summary: p.summary };
    // A bare constant, like ACS_HLINE in a list of names, has no declaration worth showing.
    if (proto.includes('(')) entry.proto = proto;
    else if (!/^[A-Z][A-Z0-9_]*$/.test(n)) continue;
    symbols[n] = entry;
  }
}
// The form, menu and panel libraries' types (FIELD, FORM, MENU, ITEM, PANEL, FIELDTYPE) have no
// typedef in any SYNOPSIS. Each links to the page of the function that creates one: new_field()
// returns a FIELD *, so FIELD goes to form_field_new(3X).
for (const p of pages) {
  if (p.section !== '3x') continue;
  for (const [n, proto] of prototypes(p.md)) {
    const type = /^([A-Z][A-Z0-9_]*)\s*\*\s*new_?\w*\(/.exec(proto)?.[1];
    if (type && !(type in symbols) && /^new/.test(n) && !n.endsWith('_sp')) {
      symbols[type] = { href: `${base}/${route(p)}/`, page: `${p.name}(3X)`, summary: `The type that ${n}() creates` };
    }
  }
}

/**
 * The declarations in a page's SYNOPSIS, by name: "int wrefresh(WINDOW *win);" for wrefresh,
 * one line each, so a code hint can show what a function takes and returns.
 */
/**
 * The named constants a page defines, by name, each with its meaning: from a table whose first
 * column is the constant ("| REQ_NEXT_FIELD | Move to the next field. |"), or from a term on a
 * line of its own with the meaning on the next ("O_AUTOSKIP" then "Skip to the next field when
 * this one fills."). A table row with an empty meaning shares the row above's, as KEY_UP shares
 * "Arrow keys" with KEY_DOWN.
 */
function constants(md) {
  const CONSTANT = /^(?:REQ|O|KEY|A|WA|ACS|WACS|E|COLOR|BUTTON[1-5])_[A-Z0-9_]+$/;
  const plain = (s) => s.replace(/<[^>]+>/g, '').replace(/[*\\]/g, '').replace(/\s+/g, ' ').trim();
  const found = new Map();
  const lines = md.split('\n').map((l) => l.replace(/^>\s?/, ''));
  let last = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('|')) {
      const cells = line.split('|').slice(1, -1).map(plain);
      if (CONSTANT.test(cells[0] ?? '')) {
        const meaning = cells.slice(1).reverse().find((c) => c && !/^[\\-]$|^\S$/.test(c)) ?? '';
        last = meaning || last;
        if (last && !found.has(cells[0])) found.set(cells[0], last);
      } else last = null;
      continue;
    }
    last = null;
    const term = plain(line);
    const next = plain(lines[i + 1] ?? '');
    if (CONSTANT.test(term) && next && !CONSTANT.test(next) && !found.has(term)) {
      found.set(term, next.split(/(?<=\.)\s/)[0]);
    }
  }
  return found;
}

function prototypes(md) {
  const synopsis = /^# SYNOPSIS\n([\s\S]*?)(?=^# )/m.exec(md)?.[1] ?? '';
  const code = synopsis
    .split('\n')
    .filter((l) => /^ {4}/.test(l))
    .map((l) => l.slice(4))
    .join('\n')
    // An elided body stays visible as an ellipsis: "typedef /* . . . */ WINDOW;" shows as
    // "typedef … WINDOW;", and a struct's members fold to "{ … }" so its name is the one declared.
    .replace(/\/\*\s*(?:\.\s*)+\*\//g, '…')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*#.*$/gm, '')
    .replace(/\{[^{}]*\}/g, '{ … }');
  const found = new Map();
  for (const statement of code.split(';')) {
    const decl = statement.replace(/\s+/g, ' ').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').trim();
    // The declared name: the one before the parameter list, or the last word of a variable.
    const name = /([A-Za-z_]\w*)\s*\(/.exec(decl)?.[1] ?? /([A-Za-z_]\w*)(?:\s*\[[^\]]*\])?$/.exec(decl)?.[1];
    if (name && !found.has(name)) found.set(name, `${decl};`);
  }
  return found;
}
// Each link goes to the part of its page that documents the name: a heading that names it
// ("### initscr", "### ERR, OK"), else the section where the page first describes it.
const byPage = new Map(pages.map((p) => [`${base}/${route(p)}/`, p]));
for (const [n, sym] of Object.entries(symbols)) {
  const p = byPage.get(sym.href);
  const anchor = p && anchorFor(p.md, n);
  if (anchor) sym.href += `#${anchor}`;
}

/**
 * The id of the heading in a man page's Markdown that documents a name, as Starlight makes it
 * (github-slugger: lower case, punctuation dropped, spaces to hyphens, a repeat numbered). A
 * heading whose words include the name wins; otherwise the section where the name first appears
 * after the SYNOPSIS. A page often describes a family by one member (wgetch for getch, mvwgetch
 * and mvgetch), so the family's w-form counts too, after the name itself.
 */
function anchorFor(md, name) {
  const w = name.replace(/^(?:mvw|mv|w)?/, 'w');
  const names = [...new Set([name, w])].map((n) => new RegExp(`(^|[^\\w])${n}([^\\w]|$)`));
  const seen = new Map();
  let current = null;
  let past = false;
  let headed = null;
  let found = null;
  for (const line of md.split('\n')) {
    // pandoc writes a man page's .SH as # and .SS as ##; the site shows them one level down.
    const h = /^(#{1,2}) (.+)$/.exec(line);
    if (h) {
      const text = h[2].replace(/[*`\\]/g, '').trim();
      let slug = text.toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/ /g, '-');
      const count = seen.get(slug) ?? 0;
      seen.set(slug, count + 1);
      if (count) slug += `-${count}`;
      current = slug;
      if (h[1] === '#') past = !/^(NAME|SYNOPSIS)$/.test(text);
      if (past && text.split(/[^\w]+/).includes(name)) return slug;
      if (past && !headed && text.split(/[^\w]+/).includes(w)) headed = slug;
      continue;
    }
    if (!past) continue;
    const plainLine = line.replace(/^>\s?/, '');
    // The first section that mentions the name or its family, whichever comes first.
    if (!found && names.some((re) => re.test(plainLine))) found = current;
  }
  return headed ?? found;
}
writeFileSync(join(tmp, 'symbols.json'), JSON.stringify(symbols, null, 2));
// .generated/site.json: the release the index describes, for the hints in code listings
// (code-links.mjs).
const version = `${FILL.NCURSES_MAJOR}.${FILL.NCURSES_MINOR}`;
writeFileSync(join(tmp, 'site.json'), JSON.stringify({ version }, null, 2));
// Library names in the guides' inline code link to their man pages, now that the index is known.
for (const { out, historical } of written) {
  const page = readFileSync(out, 'utf8');
  const end = page.indexOf('\n---\n', 4) + 5;
  writeFileSync(out, page.slice(0, end) + linkProse(page.slice(end), { symbols, historical, version }));
}
const failed = pages.filter((p) => p.failed).map((p) => p.file);
console.log(`synced ${pages.length} man pages${failed.length ? ` (${failed.join(', ')} shown as source)` : ''}`);
