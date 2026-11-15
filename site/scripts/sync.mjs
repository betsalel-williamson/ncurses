#!/usr/bin/env node
/**
 * Generate the site's content from the sources:
 * - docs/client-library/** (GFM shards) -> src/content/docs/guides/** (title from the shard's `#` heading),
 *   and docs/contributor/{hackguide,install} -> src/content/docs/contributing/{hackguide,install}
 * - man/*.{3x,1,1m,5,7} plus terminfo.5 (built by man/MKterminfo.sh) -> src/content/docs/man/<section>/<name>.md,
 *   through `pandoc -f man`, with autoconf placeholders filled in and page references turned into links
 * - .generated/sidebar.json: the man page groups for the sidebar
 * - .generated/symbols.json: library names and their man pages, for links in code listings
 * - a Run placeholder after each complete program in a guide (examples.mjs)
 * - the errata tables in the appendix, from docs/appendix/errata.csv
 * Requires pandoc on PATH. Output is gitignored.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderErrata } from './errata.mjs';
import { findPrograms } from './examples.mjs';

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
  { src: 'docs/contributor/install/configure-options', route: 'contributing/configure-options', indexLabel: 'Overview' },
  { src: 'docs/contributor/install/compatibility', route: 'contributing/compatibility', indexLabel: 'Overview' },
  { src: 'docs/appendix', route: 'appendix', indexLabel: 'Errata' },
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
for (const g of GUIDES) {
  const dir = join(repo, g.src);
  // Sidebar order follows the guide's index: the order its links list the shards.
  const order = [...readFileSync(join(dir, 'index.md'), 'utf8').matchAll(/\]\(([^)#\s]+\.md)\)/g)].map((m) => m[1]);
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
      const route = target.endsWith('.md') ? routeOf(target) : null;
      return route ? `](${route}${frag})` : `](${blob(target)}${frag})`;
    });
    // The appendix's tables come from errata.csv.
    if (g.route === 'appendix' && isIndex) text += renderErrata(repo, { base, repoSlug, routeOf });
    // Runnable examples: a placeholder after each complete program, which becomes a Run button
    // or a "doesn't run yet" flag (build-examples.mjs, run-example.ts). From the end, so the
    // offsets stay good.
    for (const ex of findPrograms(text, `${g.src}/${file}`).reverse()) {
      const widget = `\n\n<div class="run-example" data-example="${ex.id}" data-title=${JSON.stringify(ex.title)}></div>`;
      text = text.slice(0, ex.end) + widget + text.slice(ex.end);
    }
    const out = join(content, g.route, file);
    mkdirSync(dirname(out), { recursive: true });
    const position = isIndex ? 0 : order.indexOf(file) + 1;
    const fm = `---\ntitle: ${JSON.stringify(title)}\nsidebar:\n  order: ${position}\n${isIndex ? `  label: ${g.indexLabel}\n` : ''}---\n\n`;
    writeFileSync(out, fm + text);
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

/**
 * The declarations in a page's SYNOPSIS, by name: "int wrefresh(WINDOW *win);" for wrefresh,
 * one line each, so a code hint can show what a function takes and returns.
 */
function prototypes(md) {
  const synopsis = /^# SYNOPSIS\n([\s\S]*?)(?=^# )/m.exec(md)?.[1] ?? '';
  const code = synopsis
    .split('\n')
    .filter((l) => /^ {4}/.test(l))
    .map((l) => l.slice(4))
    .join('\n')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*#.*$/gm, '');
  const found = new Map();
  for (const statement of code.split(';')) {
    const decl = statement.replace(/\s+/g, ' ').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').trim();
    // The declared name: the one before the parameter list, or the last word of a variable.
    const name = /([A-Za-z_]\w*)\s*\(/.exec(decl)?.[1] ?? /([A-Za-z_]\w*)(?:\s*\[[^\]]*\])?$/.exec(decl)?.[1];
    if (name && !found.has(name)) found.set(name, `${decl};`);
  }
  return found;
}
writeFileSync(join(tmp, 'symbols.json'), JSON.stringify(symbols, null, 2));
const failed = pages.filter((p) => p.failed).map((p) => p.file);
console.log(`synced ${pages.length} man pages${failed.length ? ` (${failed.join(', ')} shown as source)` : ''}`);
