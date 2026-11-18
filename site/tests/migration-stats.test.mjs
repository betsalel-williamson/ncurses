import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { daily, timeline, transcriptFiles } from '../scripts/migration-stats.mjs';

test('transcriptFiles adds each subagent transcript after the main one', () => {
  const dir = mkdtempSync(join(tmpdir(), 'stats-'));
  try {
    const main = join(dir, 's.jsonl');
    writeFileSync(main, '');
    assert.deepEqual(transcriptFiles(main), [main]);
    mkdirSync(join(dir, 's', 'subagents'), { recursive: true });
    for (const f of ['agent-b.jsonl', 'agent-a.jsonl', 'agent-a.meta.json']) writeFileSync(join(dir, 's', 'subagents', f), '');
    assert.deepEqual(transcriptFiles(main), [main, join(dir, 's', 'subagents', 'agent-a.jsonl'), join(dir, 's', 'subagents', 'agent-b.jsonl')]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a subagent's events count as agent time while the main thread waits, and overlap counts once", () => {
  const ev = (t) => JSON.stringify({ type: 'assistant', timestamp: `2026-11-18T16:${t}Z` });
  const main = [ev('00:00'), ev('20:00')]; // a 20-minute wait: no agent time on its own
  const sub = [ev('01:00'), ev('05:00'), ev('09:00'), ev('13:00'), ev('17:00')];
  assert.equal(daily(timeline(main))[0].agentSeconds, 0);
  // 0:00, 1:00, 5:00, … 17:00, 20:00: every gap is 5 minutes or less.
  assert.equal(daily(timeline([...main, ...sub]))[0].agentSeconds, 20 * 60);
  assert.equal(daily(timeline([...main, ...sub, ...sub]))[0].agentSeconds, 20 * 60);
});
