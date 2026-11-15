/**
 * Refreshes the session block of site/data/migration.json, which the front page's Migration
 * progress section shows. Run it from the agent's environment, where its transcript is:
 *
 *   node site/scripts/migration-stats.mjs <transcript.jsonl> <usage.json>
 *
 * usage.json holds the session's token counts and cost, as the session API reports them:
 * { inputTokens, outputTokens, cacheReadTokens, cacheWriteTokens, costUsd }.
 *
 * - Agent working time adds up the gaps between consecutive transcript events of 5 minutes or
 *   less, so time spent waiting for CI or for the maintainer isn't counted.
 * - Maintainer time adds up the gaps of 15 minutes or less between the maintainer's own messages.
 *   It undercounts reading time between messages, and counts each burst from its first message.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const AGENT_GAP = 5 * 60;
export const MAINTAINER_GAP = 15 * 60;

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

/** The session block for a transcript (one JSON event per line) and its usage. */
export function sessionStats(lines, usage) {
  const all = [];
  const human = [];
  for (const line of lines) {
    let e;
    try {
      e = JSON.parse(line);
    } catch {
      continue;
    }
    if (!e.timestamp) continue;
    const t = Date.parse(e.timestamp) / 1000;
    all.push(t);
    if (fromMaintainer(e)) human.push(t);
  }
  all.sort((a, b) => a - b);
  human.sort((a, b) => a - b);
  const iso = (t) => new Date(t * 1000).toISOString().replace(/\.\d+Z$/, 'Z');
  return {
    asOf: iso(all.at(-1)),
    started: iso(all[0]),
    ...usage,
    agentActiveSeconds: activeSeconds(all, AGENT_GAP),
    maintainerSeconds: activeSeconds(human, MAINTAINER_GAP),
    maintainerMessages: human.length,
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [transcript, usageFile] = process.argv.slice(2);
  if (!transcript || !usageFile) {
    console.error('usage: node site/scripts/migration-stats.mjs <transcript.jsonl> <usage.json>');
    process.exit(2);
  }
  const file = new URL('../data/migration.json', import.meta.url);
  const data = JSON.parse(readFileSync(file, 'utf8'));
  const usage = JSON.parse(readFileSync(usageFile, 'utf8'));
  data.session = sessionStats(readFileSync(transcript, 'utf8').split('\n'), usage);
  writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
  console.log(data.session);
}
