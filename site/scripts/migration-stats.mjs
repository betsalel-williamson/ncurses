/**
 * The agent session's figures on the front page (the session block of site/data/migration.json),
 * from two files kept in the repository, so anyone can recompute them:
 *
 * - site/data/session/usage.json: the token counts and cost, copied field for field from the
 *   session API's get_session response (external_metadata.usage), with when it was fetched.
 * - site/data/session/daily.csv: one line per UTC day of the session, totalled from the transcript:
 *   the day's first and last event, how many events, the agent's and the maintainer's active
 *   seconds, and the maintainer's messages. No message text, and a line a day rather than a line
 *   an event, so the file stays small.
 *
 *   node site/scripts/migration-stats.mjs verify                  # recompute; fail if migration.json differs (CI)
 *   node site/scripts/migration-stats.mjs session                 # write the session block from the two files
 *   node site/scripts/migration-stats.mjs usage <get_session.json> # refresh usage.json from a saved response
 *   node site/scripts/migration-stats.mjs daily <transcript.jsonl>    # refresh daily.csv (agent only)
 *   node site/scripts/migration-stats.mjs refresh <get_session.json> <transcript.jsonl> # all three at once
 *
 * The agent runs refresh as the last commit of each pull request, so every release carries the
 * figures up to it. Only the agent can run the last three, since the API response and the transcript are its own. The
 * tokens and cost can't be checked beyond the API's word; the time figures are the sums of the
 * daily lines, and each refresh is a commit, so the history of every figure is in git.
 *
 * - Agent working time adds up the gaps between consecutive events of 5 minutes or less, so time
 *   spent waiting for CI or for the maintainer isn't counted.
 * - Maintainer time adds up the gaps of 15 minutes or less between the maintainer's own messages.
 *   It undercounts reading time between messages, and counts each burst from its first message.
 * - A gap belongs to the UTC day of the event that ends it.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const AGENT_GAP = 5 * 60;
export const MAINTAINER_GAP = 15 * 60;
const repo = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
export const USAGE = 'site/data/session/usage.json';
export const DAILY = 'site/data/session/daily.csv';
const DATA = 'site/data/migration.json';

/** Seconds covered by the gaps between sorted times (in seconds) that are at most `gap` long. */
export function activeSeconds(times, gap) {
  let total = 0;
  for (let i = 1; i < times.length; i++) {
    const d = times[i] - times[i - 1];
    if (d <= gap) total += d;
  }
  return Math.round(total);
}

/** Whether a transcript event is a message the maintainer wrote (not a relay, a bot or a tool). */
export function fromMaintainer(event) {
  if (event.type !== 'user') return false;
  const c = event.message?.content;
  const text = typeof c === 'string' ? c : JSON.stringify(c ?? '');
  return /from=\\?"human\\?"/.test(text) && /trust=\\?"principal\\?"/.test(text);
}

/** The timeline of a transcript (one JSON event per line): each timed event's time and author. */
export function timeline(lines) {
  const events = [];
  for (const line of lines) {
    let e;
    try {
      e = JSON.parse(line);
    } catch {
      continue;
    }
    if (e.timestamp) events.push({ time: e.timestamp, actor: fromMaintainer(e) ? 'maintainer' : 'agent' });
  }
  return events.sort((a, b) => Date.parse(a.time) - Date.parse(b.time));
}

/** Seconds of each kind of gap, per UTC day of the event that ends it. */
function gapsByDay(times, gap, into, key) {
  for (let i = 1; i < times.length; i++) {
    const d = times[i] - times[i - 1];
    if (d <= gap) {
      const day = new Date(times[i] * 1000).toISOString().slice(0, 10);
      into.get(day)[key] += d;
    }
  }
}

/** The session's events (from timeline()) totalled by UTC day, oldest first. */
export function daily(events) {
  const secs = (e) => Date.parse(e.time) / 1000;
  const iso = (t) => new Date(t * 1000).toISOString().replace(/\.\d+Z$/, 'Z');
  const all = events.map(secs).sort((a, b) => a - b);
  const human = events.filter((e) => e.actor === 'maintainer').map(secs).sort((a, b) => a - b);
  const days = new Map();
  for (const t of all) {
    const date = iso(t).slice(0, 10);
    if (!days.has(date)) days.set(date, { date, first: iso(t), last: iso(t), events: 0, agentSeconds: 0, maintainerSeconds: 0, maintainerMessages: 0 });
    const d = days.get(date);
    d.last = iso(t);
    d.events++;
  }
  for (const t of human) days.get(iso(t).slice(0, 10)).maintainerMessages++;
  gapsByDay(all, AGENT_GAP, days, 'agentSeconds');
  gapsByDay(human, MAINTAINER_GAP, days, 'maintainerSeconds');
  return [...days.values()].map((d) => ({ ...d, agentSeconds: Math.round(d.agentSeconds), maintainerSeconds: Math.round(d.maintainerSeconds) }));
}

const COLUMNS = ['date', 'first', 'last', 'events', 'agentSeconds', 'maintainerSeconds', 'maintainerMessages'];
export const dailyCsv = (days) => `${COLUMNS.join(',')}\n${days.map((d) => COLUMNS.map((c) => d[c]).join(',')).join('\n')}\n`;
export const parseDaily = (text) =>
  text
    .trim()
    .split('\n')
    .slice(1)
    .map((l) => Object.fromEntries(l.split(',').map((v, i) => [COLUMNS[i], i < 3 ? v : Number(v)])));

/** The usage block from a get_session response. */
export function usageFrom(response, fetchedAt) {
  const s = response.ccr ?? response;
  const u = s.external_metadata?.usage;
  if (!u) throw new Error('no external_metadata.usage in the response');
  return {
    fetchedAt,
    inputTokens: u.input_tokens,
    outputTokens: u.output_tokens,
    cacheReadTokens: u.cache_read_tokens,
    cacheWriteTokens: u.cache_write_tokens,
    costUsd: Math.round(u.cost_usd * 100) / 100,
  };
}

/** The session block, from the daily lines and the usage block. */
export function sessionStats(days, usage) {
  const sum = (k) => days.reduce((n, d) => n + d[k], 0);
  const { fetchedAt, ...figures } = usage;
  return {
    asOf: days.at(-1).last,
    started: days[0].first,
    ...figures,
    agentActiveSeconds: sum('agentSeconds'),
    maintainerSeconds: sum('maintainerSeconds'),
    maintainerMessages: sum('maintainerMessages'),
  };
}

const read = (p) => readFileSync(join(repo, p), 'utf8');
const computed = () => sessionStats(parseDaily(read(DAILY)), JSON.parse(read(USAGE)));

function main([cmd, file, transcript]) {
  mkdirSync(join(repo, 'site/data/session'), { recursive: true });
  const data = JSON.parse(read(DATA));
  if (cmd === 'refresh' && file && transcript) {
    for (const step of [['usage', file], ['daily', transcript], ['session']]) {
      const status = main(step);
      if (status) return status;
    }
    return main(['verify']);
  }
  if (cmd === 'daily' && file) {
    const days = daily(timeline(readFileSync(file, 'utf8').split('\n')));
    writeFileSync(join(repo, DAILY), dailyCsv(days));
    console.log(`${DAILY}: ${days.length} days`);
  } else if (cmd === 'usage' && file) {
    const usage = usageFrom(JSON.parse(readFileSync(file, 'utf8')), new Date().toISOString().replace(/\.\d+Z$/, 'Z'));
    writeFileSync(join(repo, USAGE), `${JSON.stringify(usage, null, 2)}\n`);
    console.log(usage);
  } else if (cmd === 'session') {
    data.session = computed();
    writeFileSync(join(repo, DATA), `${JSON.stringify(data, null, 2)}\n`);
    console.log(data.session);
  } else if (cmd === 'verify') {
    const want = JSON.stringify(computed());
    if (JSON.stringify(data.session) !== want) {
      console.error(`${DATA}: the session block says ${JSON.stringify(data.session)}\n  ${USAGE} and ${DAILY} give ${want}`);
      return 1;
    }
    console.log(`session figures match ${USAGE} and ${DAILY}`);
  } else {
    console.error(
      'usage: migration-stats.mjs verify | session | usage <get_session.json> | daily <transcript.jsonl> | refresh <get_session.json> <transcript.jsonl>',
    );
    return 2;
  }
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exit(main(process.argv.slice(2)));
