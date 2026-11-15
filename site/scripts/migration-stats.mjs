/**
 * The agent session's figures on the front page (the session block of site/data/migration.json),
 * from two files kept in the repository, so anyone can recompute them:
 *
 * - site/data/session/usage.json: the token counts and cost, copied field for field from the
 *   session API's get_session response (external_metadata.usage), with when it was fetched.
 * - site/data/session/timeline.csv: one line per transcript event, its time and whether the
 *   maintainer wrote it. No message text.
 *
 *   node site/scripts/migration-stats.mjs verify                  # recompute; fail if migration.json differs (CI)
 *   node site/scripts/migration-stats.mjs session                 # write the session block from the two files
 *   node site/scripts/migration-stats.mjs usage <get_session.json> # refresh usage.json from a saved response
 *   node site/scripts/migration-stats.mjs timeline <transcript.jsonl> # refresh timeline.csv (agent only)
 *
 * Only the agent can run the last two, since the API response and the transcript are its own. The
 * tokens and cost can't be checked beyond the API's word; the times can be recomputed from the
 * timeline, and each refresh is a commit, so the history of every figure is in git.
 *
 * - Agent working time adds up the gaps between consecutive events of 5 minutes or less, so time
 *   spent waiting for CI or for the maintainer isn't counted.
 * - Maintainer time adds up the gaps of 15 minutes or less between the maintainer's own messages.
 *   It undercounts reading time between messages, and counts each burst from its first message.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const AGENT_GAP = 5 * 60;
export const MAINTAINER_GAP = 15 * 60;
const repo = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
export const USAGE = 'site/data/session/usage.json';
export const TIMELINE = 'site/data/session/timeline.csv';
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

export const timelineCsv = (events) => `time,actor\n${events.map((e) => `${e.time},${e.actor}`).join('\n')}\n`;
export const parseTimeline = (text) =>
  text
    .trim()
    .split('\n')
    .slice(1)
    .map((l) => l.split(','))
    .map(([time, actor]) => ({ time, actor }));

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

/** The session block, from the timeline's events and the usage block. */
export function sessionStats(events, usage) {
  const secs = (e) => Date.parse(e.time) / 1000;
  const all = events.map(secs).sort((a, b) => a - b);
  const human = events.filter((e) => e.actor === 'maintainer').map(secs).sort((a, b) => a - b);
  const iso = (t) => new Date(t * 1000).toISOString().replace(/\.\d+Z$/, 'Z');
  const { fetchedAt, ...figures } = usage;
  return {
    asOf: iso(all.at(-1)),
    started: iso(all[0]),
    ...figures,
    agentActiveSeconds: activeSeconds(all, AGENT_GAP),
    maintainerSeconds: activeSeconds(human, MAINTAINER_GAP),
    maintainerMessages: human.length,
  };
}

const read = (p) => readFileSync(join(repo, p), 'utf8');
const computed = () => sessionStats(parseTimeline(read(TIMELINE)), JSON.parse(read(USAGE)));

function main([cmd, file]) {
  mkdirSync(join(repo, 'site/data/session'), { recursive: true });
  const data = JSON.parse(read(DATA));
  if (cmd === 'timeline' && file) {
    const events = timeline(readFileSync(file, 'utf8').split('\n'));
    writeFileSync(join(repo, TIMELINE), timelineCsv(events));
    console.log(`${TIMELINE}: ${events.length} events`);
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
      console.error(`${DATA}: the session block says ${JSON.stringify(data.session)}\n  ${USAGE} and ${TIMELINE} give ${want}`);
      return 1;
    }
    console.log(`session figures match ${USAGE} and ${TIMELINE}`);
  } else {
    console.error('usage: migration-stats.mjs verify | session | usage <get_session.json> | timeline <transcript.jsonl>');
    return 2;
  }
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exit(main(process.argv.slice(2)));
