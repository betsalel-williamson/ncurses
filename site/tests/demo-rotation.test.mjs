// The home page terminal's demo rotation (src/components/demo-rotation.js), on a fake clock and a
// fake terminal that records what the rotation asks of it.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRotation } from '../src/components/demo-rotation.js';

/** A rotation over `names` with a manual clock; `log` records each launch and quit. */
function rig(names = ['firework', 'xmas', 'rain'], opts = {}) {
  let now = 0;
  let seq = 0;
  const timers = new Map();
  const log = [];
  const r = createRotation({
    names,
    dwell: 10_000,
    gap: 500,
    launch: (name) => log.push(`launch ${name}`),
    quit: () => log.push('quit'),
    setTimer: (fn, ms) => {
      timers.set(++seq, { fn, at: now + ms });
      return seq;
    },
    clearTimer: (id) => timers.delete(id),
    ...opts,
  });
  /** Moves the clock on by `ms`, firing each timer that falls due, in order. */
  const advance = (ms) => {
    const end = now + ms;
    for (;;) {
      const due = [...timers].filter(([, t]) => t.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
      if (!due) break;
      timers.delete(due[0]);
      now = due[1].at;
      due[1].fn();
    }
    now = end;
  };
  return { r, log, advance, pending: () => timers.size };
}

test('nothing runs until play()', () => {
  const { r, log, advance } = rig();
  advance(60_000);
  assert.deepEqual(log, []);
  assert.equal(r.state.mode, 'off');
});

test('each demo runs for the dwell, quits, and the next follows after the gap, in a loop', () => {
  const { r, log, advance } = rig(['a', 'b']);
  r.play();
  advance(0);
  assert.deepEqual(log, ['launch a']);
  r.started('a');
  advance(9_999);
  assert.deepEqual(log, ['launch a']);
  advance(1);
  assert.deepEqual(log, ['launch a', 'quit']);
  r.ended();
  advance(499);
  assert.equal(log.length, 2);
  advance(1);
  assert.deepEqual(log, ['launch a', 'quit', 'launch b']);
  r.started('b');
  advance(10_000);
  r.ended();
  advance(500);
  assert.deepEqual(log.slice(-2), ['quit', 'launch a']);
});

test('the dwell counts from when the program starts, not from the launch', () => {
  const { r, log, advance } = rig(['a']);
  r.play();
  advance(0);
  advance(4_000); // typing the command and loading the program
  r.started('a');
  advance(9_000);
  assert.ok(!log.includes('quit'));
  advance(1_000);
  assert.ok(log.includes('quit'));
});

test('stop() leaves the program running and starts nothing more', () => {
  const { r, log, advance, pending } = rig(['a', 'b']);
  r.play();
  advance(0);
  r.started('a');
  advance(3_000);
  r.stop();
  assert.equal(r.state.mode, 'manual');
  assert.equal(pending(), 0);
  advance(60_000);
  assert.deepEqual(log, ['launch a']);
  // The reader quits it and lands in the shell: nothing is launched.
  r.ended();
  advance(60_000);
  assert.deepEqual(log, ['launch a']);
  assert.equal(r.state.running, null);
});

test('stop() is for good: play() does not start the rotation again', () => {
  const { r, log, advance } = rig(['a', 'b']);
  r.play();
  advance(0);
  r.started('a');
  r.stop();
  r.ended(); // the reader quit it
  r.play();
  advance(60_000);
  assert.deepEqual(log, ['launch a']);
  assert.equal(r.state.mode, 'manual');
});

test('taken over before it starts (during the boot screen), the rotation never plays', () => {
  const { r, log, advance } = rig(['a', 'b']);
  r.stop();
  r.started('a'); // the first demo, launched behind the boot screen
  r.play();
  advance(60_000);
  assert.deepEqual(log, []);
  assert.equal(r.state.running, 'a');
});

test('play() with the first demo already running gives it the dwell, then moves on', () => {
  const { r, log, advance } = rig(['a', 'b']);
  r.started('a'); // launched behind the boot screen, not by the rotation
  advance(30_000);
  r.play();
  advance(9_999);
  assert.deepEqual(log, []);
  advance(1);
  assert.deepEqual(log, ['quit']);
  r.ended();
  advance(500);
  assert.deepEqual(log, ['quit', 'launch b']);
});

test('play() at an idle prompt launches the first demo at once', () => {
  const { r, log, advance } = rig(['a', 'b']);
  r.play();
  advance(0);
  assert.deepEqual(log, ['launch a']);
});

test('out of view, the running demo quits and no other starts until it is back', () => {
  const { r, log, advance } = rig(['a', 'b']);
  r.play();
  advance(0);
  r.started('a');
  advance(2_000);
  r.setVisible(false);
  assert.deepEqual(log, ['launch a', 'quit']);
  r.ended();
  advance(60_000);
  assert.deepEqual(log, ['launch a', 'quit']);
  r.setVisible(true);
  advance(0);
  assert.deepEqual(log, ['launch a', 'quit', 'launch b']);
});

test('a demo that starts while out of view is quit at once', () => {
  const { r, log, advance } = rig(['a', 'b']);
  r.play();
  advance(0);
  r.setVisible(false);
  r.started('a');
  assert.deepEqual(log, ['launch a', 'quit']);
});

test('out of view in manual mode, the reader keeps their program', () => {
  const { r, log, advance } = rig(['a']);
  r.play();
  advance(0);
  r.started('a');
  r.stop();
  r.setVisible(false);
  r.setVisible(true);
  advance(60_000);
  assert.deepEqual(log, ['launch a']);
});

test('quit is pressed once per program', () => {
  const { r, log, advance } = rig(['a', 'b']);
  r.play();
  advance(0);
  r.started('a');
  advance(10_000);
  r.setVisible(false);
  r.setVisible(true);
  advance(30_000);
  assert.equal(log.filter((l) => l === 'quit').length, 1);
});

test('a demo that fails to load is skipped, and the rotation gives up when none loads', () => {
  const { r, log, advance } = rig(['a', 'b']);
  r.play();
  advance(0);
  r.ended(); // a failed before it started
  advance(500);
  assert.equal(log.at(-1), 'launch b');
  r.ended(); // so did b
  advance(60_000);
  assert.deepEqual(log, ['launch a', 'launch b']);
  assert.equal(r.state.mode, 'off');
});

test('onChange reports the mode, the running program and the next one', () => {
  const states = [];
  const { r, advance } = rig(['a', 'b'], { onChange: (s) => states.push(s) });
  r.play();
  advance(0);
  r.started('a');
  assert.deepEqual(states.at(-1), { mode: 'auto', running: 'a', next: 'a' });
  advance(10_000);
  r.ended();
  assert.deepEqual(states.at(-1), { mode: 'auto', running: null, next: 'b' });
  r.stop();
  assert.equal(states.at(-1).mode, 'manual');
});

test('there must be something to rotate', () => {
  assert.throws(() => createRotation({ names: [], launch() {}, quit() {} }));
});
