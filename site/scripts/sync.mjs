#!/usr/bin/env node
/**
 * Generate the site's content from the sources:
 * - docs/client-library/** (GFM shards) -> src/content/docs/guides/** (title from the shard's `#` heading)
 * - man/*.{3x,1,1m,5,7} plus terminfo.5 (built by man/MKterminfo.sh) -> src/content/docs/man/<section>/<name>.md,
 *   through `pandoc -f man`, with autoconf placeholders filled in and page references turned into links
 * - .generated/sidebar.json: the man page groups for the sidebar
 * Requires pandoc on PATH. Output is gitignored.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = join(dirname(fileURLToPath(import.meta.url)), '..');
const repo = join(site, '..');
const content = join(site, 'src/content/docs');
const repoSlug = process.env.GITHUB_REPOSITORY || 'betsalel-williamson/ncurses';
const blob = (p) => `https://github.com/${repoSlug}/blob/master/${p}`;

// ---------- guides ----------
const GUIDES = [{ src: 'docs/client-library/forms', route: 'guides/forms' }];
rmSync(join(content, 'guides'), { recursive: true, force: true });
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
    // Relative .md links become site routes; links out of docs/ go to GitHub.
    text = text.replace(/\]\(([^)#\s]+\.md)(#[^)]*)?\)/g, (_, p, frag = '') => {
      const name = basename(p, '.md');
      const route = name === 'index' ? '' : `${name}/`;
      return `](${isIndex ? '' : '../'}${route}${frag})`;
    });
    text = text.replace(/\]\(((?:\.\.\/)+[^)#\s]+)(#[^)]*)?\)/g, (m, p, frag = '') => {
      const target = relative(repo, join(dir, p));
      return target.startsWith('docs/') ? m : `](${blob(target)}${frag})`;
    });
    const out = join(content, g.route, file);
    mkdirSync(dirname(out), { recursive: true });
    const position = isIndex ? 0 : order.indexOf(file) + 1;
    const fm = `---\ntitle: ${JSON.stringify(title)}\nsidebar:\n  order: ${position}\n${isIndex ? '  label: Introduction\n' : ''}---\n\n`;
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
    md = execFileSync('pandoc', ['-f', 'man', '-t', 'gfm', '--wrap=none'], {
      input: fill(text),
      encoding: 'utf8',
      maxBuffer: 64 << 20,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  } catch {
    failed = true;
    md = '```\n' + fill(text) + '\n```\n';
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

const route = (p) => `man/${p.section}/${p.name}`;
const byName = new Map();
for (const p of pages) {
  for (const n of [p.name, ...p.aliases]) {
    const key = `${n}(${p.section})`.toLowerCase();
    if (!byName.has(key)) byName.set(key, p);
  }
}

rmSync(join(content, 'man'), { recursive: true, force: true });
const base = `/${repoSlug.split('/')[1]}`;
for (const p of pages) {
  let md = p.md.replace(/^(#+) /gm, '#$1 '); // NAME, SYNOPSIS... become level-2 sections
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
const failed = pages.filter((p) => p.failed).map((p) => p.file);
console.log(`synced ${pages.length} man pages${failed.length ? ` (${failed.join(', ')} shown as source)` : ''}`);
