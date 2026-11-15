/**
 * The migration's progress, one row for each merged pull request, recomputed from git so that
 * anyone with a clone can check it.
 *
 *   node site/scripts/migration-history.mjs verify   # recompute every row and compare (CI runs this)
 *   node site/scripts/migration-history.mjs record   # add rows for merges that have none yet
 *
 * Each row counts, at that pull request's merge commit on master:
 * - Manual pages: the pages in man/ (total) and those with a skeleton in docs/man/ (sharded).
 * - Guides and contributor docs: the units listed in site/data/migration-units.csv (total), those
 *   whose path exists (sharded), and those whose review pull request has merged by then (reviewed).
 * - Errata: the rows in docs/appendix/errata.csv, and how many correct errors in the original text.
 *
 * verify also checks each unit's review claim: the review pull request merged, it changed files
 * under the unit's path, and errata.csv records corrections it made there.
 *
 * The agent's token, cost and time figures (site/data/migration.json) come from its own usage
 * report and can't be recomputed from the repository, so they aren't part of this history.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv } from './errata.mjs';

// The repository holding the working directory: the script runs from its root, the site build from
// site/, and a bundled copy can't use its own location.
const repo = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
export const HISTORY = 'site/data/migration-history.json';
export const UNITS = 'site/data/migration-units.csv';
export const MAN_PAGE = /^[^/]+\.[1-9][a-z]*$/;

const git = (...args) =>
  execFileSync('git', args, { cwd: repo, encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'pipe'] });

/** Rows of a CSV with a header line, as objects. */
const table = (text) => {
  const [header, ...rows] = parseCsv(text).filter((r) => r.length > 1 || r[0]);
  return rows.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])));
};

export function readUnits(text = readFileSync(join(repo, UNITS), 'utf8')) {
  return table(text).map((u) => ({ ...u, reviewed_pr: u.reviewed_pr ? Number(u.reviewed_pr) : null }));
}

/** The pull requests merged into HEAD's first-parent history, oldest first. */
export function merges(ref = 'HEAD') {
  return git('log', '--first-parent', '--reverse', '--format=%H%x09%cI%x09%s', ref)
    .split('\n')
    .map((line) => line.split('\t'))
    .map(([commit, date, subject]) => ({ commit, date, pr: Number(/^Merge pull request #(\d+) /.exec(subject ?? '')?.[1]) }))
    .filter((m) => m.pr);
}

/** Whether a unit's path exists in a list of files: the file itself, or a directory holding files. */
export const present = (files, path) => files.some((f) => f === path || f.startsWith(`${path}/`));

/**
 * The counts for one commit, from its files, its errata.csv, and which pull requests have merged
 * by then (`mergedPrs`).
 */
export function counts({ files, errata, units, mergedPrs }) {
  const top = (dir) => files.filter((f) => f.startsWith(`${dir}/`) && MAN_PAGE.test(f.slice(dir.length + 1)));
  const track = (name) => {
    const us = units.filter((u) => u.track === name);
    return {
      total: us.length,
      sharded: us.filter((u) => present(files, u.path)).length,
      reviewed: us.filter((u) => u.reviewed_pr && mergedPrs.has(u.reviewed_pr) && present(files, u.path)).length,
    };
  };
  const man = new Set(top('man').map((f) => f.slice(4)));
  const rows = errata ? table(errata) : [];
  return {
    guides: track('Guides'),
    man: {
      total: man.size,
      sharded: top('docs/man').filter((f) => man.has(f.slice(9))).length,
      reviewed: track('Manual pages').reviewed,
    },
    contributor: track('Contributor and install docs'),
    errata: { rows: rows.length, originalErrors: rows.filter((r) => r.category === 'original-error').length },
  };
}

const show = (commit, path) => {
  try {
    return git('show', `${commit}:${path}`);
  } catch {
    return null;
  }
};

/** The row for one merge, given every merge before it. */
export function rowAt(merge, earlier, units) {
  const files = git('ls-tree', '-r', '--name-only', merge.commit).split('\n').filter(Boolean);
  const mergedPrs = new Set([...earlier, merge].map((m) => m.pr));
  return { pr: merge.pr, merge: merge.commit.slice(0, 12), mergedAt: merge.date, ...counts({ files, errata: show(merge.commit, 'docs/appendix/errata.csv'), units, mergedPrs }) };
}

/** Problems with the units' review claims, checked against the review pull requests' merges. */
export function checkUnits(units, history) {
  const problems = [];
  const byPr = new Map(history.map((m) => [m.pr, m]));
  for (const u of units.filter((x) => x.reviewed_pr)) {
    const m = byPr.get(u.reviewed_pr);
    if (!m) continue; // not merged yet: it counts as reviewed once it is
    const at = `${UNITS}: ${u.unit}, reviewed in #${u.reviewed_pr}`;
    const changed = git('diff', '--name-only', `${m.commit}^1`, m.commit).split('\n');
    if (!present(changed, u.path)) problems.push(`${at}: that pull request changed nothing under ${u.path}`);
    // errata.csv came in with #6, and its rows for earlier pull requests were added then, so the
    // rows are read from HEAD. The errata check already requires each row's commit to be in history.
    const rows = table(readFileSync(join(repo, 'docs/appendix/errata.csv'), 'utf8'));
    if (!rows.some((r) => r.pr === String(u.reviewed_pr) && present([r.where.replace(/\/$/, '')], u.path)))
      problems.push(`${at}: errata.csv has no row from that pull request under ${u.path}`);
  }
  return problems;
}

/** The counts for the working tree's tracked files, as the front page shows them. */
export function current(units = readUnits()) {
  const files = git('ls-files').split('\n').filter(Boolean);
  const errata = readFileSync(join(repo, 'docs/appendix/errata.csv'), 'utf8');
  return counts({ files, errata, units, mergedPrs: new Set(merges().map((m) => m.pr)) });
}

/** The stored history rows. */
export function readHistory() {
  return JSON.parse(readFileSync(join(repo, HISTORY), 'utf8')).rows;
}

const fields = (r) => JSON.stringify({ ...r, mergedAt: undefined });

function main(cmd) {
  const units = readUnits();
  const history = merges();
  let stored = [];
  try {
    stored = JSON.parse(readFileSync(join(repo, HISTORY), 'utf8')).rows;
  } catch {}
  const computed = history.map((m, i) => rowAt(m, history.slice(0, i), units));

  if (cmd === 'record') {
    const have = new Set(stored.map((r) => r.pr));
    const added = computed.filter((r) => !have.has(r.pr));
    const rows = [...stored, ...added].sort((a, b) => a.pr - b.pr);
    const about = `One row for each merged pull request, counted at its merge commit. Recompute and check every row with: node site/scripts/migration-history.mjs verify`;
    writeFileSync(join(repo, HISTORY), `${JSON.stringify({ about, rows }, null, 1)}\n`);
    console.log(`migration history: ${added.length} row(s) added, ${rows.length} in all`);
    return 0;
  }

  if (cmd === 'verify') {
    const problems = checkUnits(units, history);
    const byPr = new Map(computed.map((r) => [r.pr, r]));
    let matching = 0;
    for (const r of stored) {
      const c = byPr.get(r.pr);
      if (!c) problems.push(`${HISTORY}: #${r.pr} isn't a merge in this history`);
      else if (fields(r) !== fields(c)) problems.push(`${HISTORY}: #${r.pr} says ${fields(r)}\n  git says ${fields(c)}`);
      else matching++;
    }
    // Every merge needs a row, except the newest ones: a pull request can't record its own merge.
    const have = new Set(stored.map((r) => r.pr));
    const last = Math.max(0, ...stored.map((r) => r.pr));
    for (const m of history) if (!have.has(m.pr) && m.pr < last) problems.push(`${HISTORY}: no row for #${m.pr}`);
    const pending = history.filter((m) => m.pr > last).map((m) => `#${m.pr}`);
    for (const p of problems) console.error(p);
    console.log(
      `migration history: ${matching} of ${stored.length} row(s) match git` +
        (pending.length ? `; not yet recorded: ${pending.join(', ')}` : '') +
        (problems.length ? `; ${problems.length} problem(s)` : ''),
    );
    return problems.length ? 1 : 0;
  }

  console.error('usage: migration-history.mjs verify|record');
  return 2;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exit(main(process.argv[2]));
