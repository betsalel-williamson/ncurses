/**
 * The errata list, docs/appendix/errata.csv: parse it, check it, and render it as the
 * appendix's tables. `node site/scripts/errata.mjs` checks the file and exits 1 on a problem.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const COLUMNS = ['category', 'where', 'anchor', 'was', 'now', 'source', 'pr', 'commit'];
export const CATEGORIES = {
  'original-error': 'Errors corrected in the original text',
  'edition-error': 'Errors this edition introduced, then fixed',
  formatting: 'Formatting',
  structure: 'Structure',
  addition: 'New material',
  open: 'Found, not yet fixed',
};

/** RFC 4180 CSV: quoted fields may hold commas, quotes ("") and newlines. */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') (field += '"'), i++;
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') row.push(field), (field = '');
    else if (c === '\n') row.push(field), rows.push(row), (row = []), (field = '');
    else if (c !== '\r') field += c;
  }
  if (field || row.length) row.push(field), rows.push(row);
  return rows;
}

export function readErrata(repo) {
  const [header, ...rows] = parseCsv(readFileSync(join(repo, 'docs/appendix/errata.csv'), 'utf8'));
  return { header, rows: rows.map((r, i) => ({ line: i + 2, ...Object.fromEntries(header.map((h, j) => [h, r[j] ?? ''])), cells: r.length })) };
}

/** Problems with the list: shape, categories, files, and commits (which must be in HEAD's history). */
export function checkErrata(repo) {
  const { header, rows } = readErrata(repo);
  const problems = [];
  if (header.join() !== COLUMNS.join()) problems.push(`header must be ${COLUMNS.join(',')}`);
  for (const r of rows) {
    const at = `docs/appendix/errata.csv:${r.line}`;
    if (r.cells !== COLUMNS.length) problems.push(`${at}: ${r.cells} fields, want ${COLUMNS.length}`);
    if (!CATEGORIES[r.category]) problems.push(`${at}: unknown category "${r.category}"`);
    if (!r.where || !existsSync(join(repo, r.where))) problems.push(`${at}: "${r.where}" is not a file in the repository`);
    if (!r.now) problems.push(`${at}: "now" is empty`);
    if (r.category === 'open') {
      if (r.pr || r.commit) problems.push(`${at}: an open row has no pr or commit yet`);
      continue;
    }
    if (!/^[1-9]\d*$/.test(r.pr)) problems.push(`${at}: pr must be a pull request number`);
    if (!/^[0-9a-f]{40}$/.test(r.commit)) problems.push(`${at}: commit must be a full 40-character SHA`);
    else {
      try {
        execFileSync('git', ['merge-base', '--is-ancestor', r.commit, 'HEAD'], { cwd: repo, stdio: 'ignore' });
      } catch {
        problems.push(`${at}: commit ${r.commit} is not in this branch's history`);
      }
    }
  }
  return problems;
}

const cell = (s) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ');

/** The appendix tables, one per category, linking each file, pull request and commit. */
export function renderErrata(repo, { base, repoSlug, routeOf }) {
  const { rows } = readErrata(repo);
  const gh = `https://github.com/${repoSlug}`;
  const where = (r) => {
    const frag = r.anchor ? `#${r.anchor}` : '';
    let route = null;
    if (r.where.endsWith('/')) route = routeOf(`${r.where}index.md`);
    else if (r.where.endsWith('.md')) route = routeOf(r.where);
    else {
      const man = /^man\/(.+)\.([1-9][a-z]*)$/i.exec(r.where);
      if (man) route = `${base}/man/${man[2].toLowerCase()}/${man[1]}/`;
    }
    const label = `\`${r.where}\``;
    return route ? `[${label}](${route}${frag})` : `[${label}](${gh}/blob/master/${r.where})`;
  };
  let md = '';
  for (const [category, title] of Object.entries(CATEGORIES)) {
    const list = rows.filter((r) => r.category === category);
    if (!list.length) continue;
    const open = category === 'open';
    md += `\n## ${title}\n\n`;
    md += open ? '| Where | Error | Fix to propose upstream |\n| --- | --- | --- |\n' : '| Where | Was | Now | Source | Change |\n| --- | --- | --- | --- | --- |\n';
    for (const r of list) {
      if (open) md += `| ${where(r)} | ${cell(r.was)} | ${cell(r.now)} |\n`;
      else
        md += `| ${where(r)} | ${cell(r.was) || '—'} | ${cell(r.now)} | ${cell(r.source)} | [#${r.pr}](${gh}/pull/${r.pr}), [\`${r.commit.slice(0, 7)}\`](${gh}/commit/${r.commit}) |\n`;
    }
  }
  return md;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const repo = join(dirname(fileURLToPath(import.meta.url)), '../..');
  const problems = checkErrata(repo);
  for (const p of problems) console.log(p);
  if (problems.length) process.exit(1);
  console.log(`errata: ${readErrata(repo).rows.length} rows ok`);
}
