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
 * verify also checks each unit's review claim: the pull request that brought the review into master
 * merged, and either it changed files under the unit's path and errata.csv records those changes, or
 * the review found nothing to change, and the unit's `evidence` path names the check output it added.
 * When a stack of pull requests reaches master through one merge, reviewed_pr is that merge's pull
 * request, and the errata rows keep the numbers of the pull requests in the stack.
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

/**
 * The problems with one unit's review claim, given the files its pull request's merge changed and
 * the errata rows. A review that changed the unit needs an errata row under the unit's path, either
 * from that pull request or one whose commit that merge brought in (`r.brought`): a stack of pull
 * requests reaches master through one merge, and its rows keep the numbers of the pull requests
 * that made the changes. A review that found nothing to change leaves the unit alone, and the
 * unit's `evidence` names the check output that merge added instead.
 */
export function unitProblems(unit, changed, rows) {
  const at = `${UNITS}: ${unit.unit}, reviewed in #${unit.reviewed_pr}`;
  if (!present(changed, unit.path)) {
    if (!unit.evidence) return [`${at}: that pull request changed nothing under ${unit.path}, and the unit names no evidence`];
    if (!present(changed, unit.evidence)) return [`${at}: that pull request changed nothing under ${unit.path} or its evidence ${unit.evidence}`];
    return [];
  }
  const under = (r) => present([r.where.replace(/\/$/, '')], unit.path);
  if (!rows.some((r) => under(r) && (r.pr === String(unit.reviewed_pr) || r.brought)))
    return [`${at}: errata.csv has no row under ${unit.path} from that pull request or brought in by its merge`];
  return [];
}

/** Problems with the units' review claims, checked against the review pull requests' merges. */
export function checkUnits(units, history) {
  const problems = [];
  const byPr = new Map(history.map((m) => [m.pr, m]));
  // errata.csv came in with #6, and its rows for earlier pull requests were added then, so the
  // rows are read from HEAD. The errata check already requires each row's commit to be in history.
  const rows = table(readFileSync(join(repo, 'docs/appendix/errata.csv'), 'utf8'));
  for (const u of units.filter((x) => x.reviewed_pr)) {
    const m = byPr.get(u.reviewed_pr);
    if (!m) continue; // not merged yet: it counts as reviewed once it is
    const changed = git('diff', '--name-only', `${m.commit}^1`, m.commit).split('\n');
    const brought = new Set(git('rev-list', `${m.commit}^1..${m.commit}`).split('\n'));
    problems.push(...unitProblems(u, changed, rows.map((r) => ({ ...r, brought: brought.has(r.commit) }))));
  }
  return problems;
}

/** The counts for the working tree's tracked files, as the front page shows them. */
export function current(units = readUnits()) {
  const files = git('ls-files').split('\n').filter(Boolean);
  const errata = readFileSync(join(repo, 'docs/appendix/errata.csv'), 'utf8');
  return counts({ files, errata, units, mergedPrs: new Set(merges().map((m) => m.pr)) });
}

/**
 * The same progress as current(), weighed by each file's size instead of counting documents:
 * `weigh(path)` gives a tracked file's weight, and each unit adds up the weights of its shards in
 * the working tree, so a long manual page weighs more than a short one. A unit that isn't sharded
 * yet has no shards to weigh and adds nothing; every unit is sharded today.
 */
export function weighedProgress(weigh, units = readUnits()) {
  const files = git('ls-files').split('\n').filter(Boolean);
  const mergedPrs = new Set(merges().map((m) => m.pr));
  const size = (path) => files.filter((f) => f === path || f.startsWith(`${path}/`)).reduce((n, f) => n + weigh(f), 0);
  const track = (us) => {
    const t = { total: 0, sharded: 0, reviewed: 0 };
    for (const u of us) {
      const w = size(u.path);
      t.total += w;
      if (w) t.sharded += w;
      if (w && u.reviewed_pr && mergedPrs.has(u.reviewed_pr)) t.reviewed += w;
    }
    return t;
  };
  // A manual page's shards are docs/man/<page> (its skeleton) and docs/man/<name>/ (its sections).
  const pages = files.filter((f) => f.startsWith('docs/man/') && MAN_PAGE.test(f.slice(9)));
  const reviewedMan = new Map(units.filter((u) => u.track === 'Manual pages').map((u) => [u.path, u]));
  // term.5 and term.7 share docs/man/term/, so each path counts once.
  const manShards = new Map();
  for (const p of pages) {
    const reviewed_pr = (reviewedMan.get(p) ?? reviewedMan.get(p.replace(/\.[^.]+$/, '')))?.reviewed_pr ?? null;
    for (const path of [p, p.replace(/\.[^.]+$/, '')]) if (!manShards.has(path)) manShards.set(path, { path, reviewed_pr });
  }
  const man = track([...manShards.values()]);
  return {
    guides: track(units.filter((u) => u.track === 'Guides')),
    man,
    contributor: track(units.filter((u) => u.track === 'Contributor and install docs')),
  };
}

/**
 * weighedProgress() in tokens, one result per tokenizer, from the files' token counts in
 * site/data/doc-sizes.json (`groups[].now.perFile`). A file it doesn't list weighs nothing.
 */
export function tokenProgress(sizes, units = readUnits()) {
  return Object.fromEntries(
    sizes.tokenizers.map(({ id }) => {
      const tokens = new Map(sizes.groups.flatMap((g) => g.now.perFile.path.map((p, i) => [p, g.now.perFile[id][i]])));
      return [id, weighedProgress((f) => tokens.get(f) ?? 0, units)];
    }),
  );
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
