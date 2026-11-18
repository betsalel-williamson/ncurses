#!/usr/bin/env node
/**
 * Checks for the manual pages' troff, kept apart from the review of what the pages say. The
 * review of content (claims checked against the library, errata, which pages are reviewed) works
 * the same for every kind of document; this script is the part that only troff needs.
 *
 *   node site/scripts/man-check.mjs lint            # fail on any message the baseline doesn't have
 *   node site/scripts/man-check.mjs baseline        # rewrite the baseline from today's messages
 *   node site/scripts/man-check.mjs diff <base>     # the rendered text of each changed page, as a word diff
 *
 * lint runs three tools on every page, after the same placeholder filling the site does:
 * - mandoc -T lint -W style: man macro misuse and style.
 * - groff -t -man -ww -z: what groff itself warns about while formatting, tables included.
 * - pandoc --verbose: what pandoc's man reader skipped while making the site's page. A skipped
 *   table or string is text missing from the site, which the other two can't see.
 * The messages each page has today are in site/data/man-lint-baseline.json, without their line
 * numbers, so an edit that moves lines doesn't trip it. lint fails on a message a page didn't
 * have, or has more often. It also fails when a message went away and the baseline still has
 * it, so the pull request that fixes it lowers the baseline and the fix can't quietly come undone.
 *
 * diff renders each page that changed since <base> to Markdown, before and after, the way the
 * site does (man-render.mjs), and prints a word diff for each section that changed, naming the
 * shard that holds the section. Reviewers read that; edits still go into the troff shards.
 * With GITHUB_STEP_SUMMARY set it writes there too.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fill, forPandoc, manSources, resolvePreviousFont, toMarkdown } from './man-render.mjs';

const site = join(dirname(fileURLToPath(import.meta.url)), '..');
const repo = join(site, '..');
export const BASELINE = 'site/data/man-lint-baseline.json';

/** A tool's message without its file and line, so that it still matches after an edit moves it. */
export function normalize(tool, line) {
  let m = line;
  if (tool === 'mandoc') m = m.replace(/^mandoc: [^:]*:\d+:\d+: /, '');
  if (tool === 'groff') m = m.replace(/^[^:\s]*:[^:]*:\d+: /, '').replace(/^<standard input>:\d+: /, '').replace(/ on page \d+/, '');
  if (tool === 'pandoc') m = m.replace(/^\[INFO\] /, '').replace(/ at line \d+ column \d+$/, '');
  return `${tool}: ${m}`;
}

/** Messages from pandoc that say nothing about the page: its own progress notes. */
const quiet = (line) => /^\[INFO\] (Running filter|Completed running filter|Loaded)/.test(line);

/** Each tool's messages for one page's source, as { message: count }. */
export function lintPage(text) {
  const src = fill(text);
  const counts = {};
  const add = (tool, out) => {
    for (const line of out.split('\n').filter(Boolean)) {
      if (tool === 'pandoc' && quiet(line)) continue;
      const k = normalize(tool, line);
      counts[k] = (counts[k] ?? 0) + 1;
    }
  };
  const run = (cmd, args, input) => {
    const r = spawnSync(cmd, args, { input, encoding: 'utf8', maxBuffer: 64 << 20 });
    if (r.error) throw new Error(`${cmd}: ${r.error.message}; install it (CI installs mandoc and groff-base)`);
    return r;
  };
  const m = run('mandoc', ['-T', 'lint', '-W', 'style'], src);
  add('mandoc', m.stdout + m.stderr);
  add('groff', run('groff', ['-t', '-man', '-ww', '-z'], src).stderr);
  add('pandoc', run('pandoc', ['-f', 'man', '-t', 'gfm', '--verbose'], resolvePreviousFont(forPandoc(src))).stderr);
  return counts;
}

/** Compare one page's messages with its baseline: what's new or more frequent, and what went away. */
export function compare(now, before = {}) {
  const added = [];
  const gone = [];
  for (const [k, n] of Object.entries(now)) if (n > (before[k] ?? 0)) added.push(`${k} (${before[k] ?? 0} → ${n})`);
  for (const [k, n] of Object.entries(before)) if ((now[k] ?? 0) < n) gone.push(`${k} (${n} → ${now[k] ?? 0})`);
  return { added, gone };
}

/**
 * Markdown split at its section (#) and subsection (##) headings: [{ heading, section, text }].
 * heading names both ("DESCRIPTION › Keypad Mode"); section is the troff .SH it sits under,
 * which names its shard. The text before the first heading has heading and section ''.
 */
export function sections(md) {
  const out = [{ heading: '', section: '', text: '' }];
  let section = '';
  for (const line of md.split('\n')) {
    const h = /^(#{1,2}) (.+)$/.exec(line);
    if (h && h[1] === '#') section = h[2].trim();
    if (h) out.push({ heading: h[1] === '#' ? section : `${section} › ${h[2].trim()}`, section, text: '' });
    else out[out.length - 1].text += `${line}\n`;
  }
  return out;
}

/** The shard of a page that holds a section: docs/man/<name>/NN-<slug>.<ext>, matched by its slug. */
export function shardFor(shards, heading) {
  const slug = heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return shards.find((s) => s.replace(/^.*\/\d+-/, '').replace(/\.[^.]+$/, '') === slug);
}

/** The word diff of two texts, as git shows it: [-removed-]{+added+}. '' when they're the same. */
function wordDiff(a, b) {
  const dir = mkdtempSync(join(tmpdir(), 'man-diff-'));
  try {
    writeFileSync(join(dir, 'a'), a);
    writeFileSync(join(dir, 'b'), b);
    const r = spawnSync('git', ['diff', '--no-index', '--word-diff=plain', '--unified=1', 'a', 'b'], { cwd: dir, encoding: 'utf8' });
    return r.stdout.split('\n').slice(4).filter((l) => !l.startsWith('@@')).join('\n').trim();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** The pages at a commit, rendered: Map(file -> markdown), from a copy of its man/ and include/. */
function renderAt(ref, files) {
  const dir = mkdtempSync(join(tmpdir(), 'man-at-'));
  try {
    execFileSync('sh', ['-c', `git -C "$0" archive "$1" man include | tar -x -C "$2"`, repo, ref, dir]);
    const out = new Map();
    for (const { file, text } of manSources(join(dir, 'man')))
      if (files.has(file)) {
        try {
          out.set(file, toMarkdown(text));
        } catch {
          out.set(file, '(pandoc failed on this page)\n');
        }
      }
    return out;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** The pages a change touches: man/<file> itself, or a shard under docs/man/<name>/. terminfo.5 is built from man/terminfo.* and include/Caps*. */
export function changedPages(paths, pageFiles) {
  const pages = new Set();
  for (const p of paths) {
    let m;
    if ((m = /^man\/([^/]+)$/.exec(p)) && pageFiles.includes(m[1])) pages.add(m[1]);
    else if (/^man\/terminfo\.|^include\/Caps/.test(p)) pages.add('terminfo.5');
    else if ((m = /^docs\/man\/([^/.]+)(?:\/|\.)/.exec(p))) for (const f of pageFiles) if (f.replace(/\.[^.]+$/, '') === m[1]) pages.add(f);
  }
  return pages;
}

function diff(base) {
  const files = manSources().map((s) => s.file);
  const changed = execFileSync('git', ['diff', '--name-only', base, 'HEAD'], { cwd: repo, encoding: 'utf8' }).split('\n').filter(Boolean);
  const pages = changedPages(changed, files);
  const lines = ['## Rendered changes to the manual pages', ''];
  if (!pages.size) lines.push('No manual page changed.');
  else {
    lines.push('Each page as the site renders it, before and after, as a word diff: `[-removed-]` and `{+added+}`. Edit the troff shard named in each heading, not this text.', '');
    const before = renderAt(base, pages);
    const after = renderAt('HEAD', pages);
    const shardFiles = execFileSync('git', ['ls-files', 'docs/man'], { cwd: repo, encoding: 'utf8' }).split('\n');
    for (const file of [...pages].sort()) {
      const name = file.replace(/\.[^.]+$/, '');
      const shards = shardFiles.filter((f) => f.startsWith(`docs/man/${name}/`));
      const a = sections(before.get(file) ?? '');
      const b = sections(after.get(file) ?? '');
      const headings = [...new Map([...a, ...b].map((s) => [s.heading, s.section])).entries()];
      const parts = [];
      for (const [h, section] of headings) {
        const d = wordDiff(a.find((s) => s.heading === h)?.text ?? '', b.find((s) => s.heading === h)?.text ?? '');
        if (!d) continue;
        const shard = shardFor(shards, section);
        parts.push(`#### ${h || '(before the first heading)'}${shard ? ` · \`${shard}\`` : ''}`, '', '```diff', d.replace(/```/g, '``​`'), '```', '');
      }
      lines.push(`### ${file}`, '', ...(parts.length ? parts : ['The source changed, but not the rendered text.', '']));
    }
  }
  const text = lines.join('\n');
  console.log(text);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${text}\n`);
}

function main(cmd, arg) {
  if (cmd === 'diff') {
    if (!arg) return console.error('usage: man-check.mjs diff <base>'), 2;
    diff(arg);
    return 0;
  }
  const all = Object.fromEntries(manSources().map(({ file, text }) => [file, lintPage(text)]));
  if (cmd === 'baseline') {
    const about = 'Messages each manual page has today from mandoc, groff and pandoc, without line numbers. man-check.mjs lint fails on any that are new. Rewrite with: node site/scripts/man-check.mjs baseline';
    const pages = Object.fromEntries(Object.entries(all).filter(([, c]) => Object.keys(c).length).sort(([a], [b]) => a.localeCompare(b)));
    writeFileSync(join(repo, BASELINE), `${JSON.stringify({ about, pages }, null, 1)}\n`);
    const total = Object.values(pages).reduce((n, c) => n + Object.values(c).reduce((a, b) => a + b, 0), 0);
    console.log(`man lint baseline: ${total} message(s) on ${Object.keys(pages).length} page(s)`);
    return 0;
  }
  if (cmd === 'lint') {
    const base = existsSync(join(repo, BASELINE)) ? JSON.parse(readFileSync(join(repo, BASELINE), 'utf8')).pages : {};
    let added = 0;
    let gone = 0;
    for (const [file, counts] of Object.entries(all)) {
      const c = compare(counts, base[file]);
      for (const a of c.added) console.error(`man/${file}: new: ${a}`);
      for (const g of c.gone) console.error(`man/${file}: fixed: ${g}`);
      added += c.added.length;
      gone += c.gone.length;
    }
    console.log(`man lint: ${Object.keys(all).length} pages, ${added} new message(s), ${gone} fixed`);
    if (gone) console.error('Fixed messages are still in the baseline: run `node site/scripts/man-check.mjs baseline` and commit it.');
    return added || gone ? 1 : 0;
  }
  console.error('usage: man-check.mjs lint|baseline|diff <base>');
  return 2;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exit(main(process.argv[2], process.argv[3]));
