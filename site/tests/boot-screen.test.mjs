// How long the runnable examples' boot screen plays and how full its bar is (boot-screen.js), on
// timings chosen for each case.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AGAIN_MS, FIRST_MS, barFill, bootLength } from '../src/components/boot-screen.js';

test('a first run gets the long boot, later runs the short one, reduced motion none', () => {
  assert.equal(bootLength(false, false), FIRST_MS);
  assert.equal(bootLength(true, false), AGAIN_MS);
  assert.equal(bootLength(false, true), 0);
  assert.equal(bootLength(true, true), 0);
});

test('the short boot is still long enough to see', () => {
  assert.ok(AGAIN_MS >= 1000);
  assert.ok(FIRST_MS >= 4000);
});

test('the bar starts half way through, reaches 92% at the planned end, and never fills by itself', () => {
  assert.equal(barFill(FIRST_MS / 2, FIRST_MS), 0);
  assert.ok(Math.abs(barFill(FIRST_MS, FIRST_MS) - 0.92) < 1e-9);
  assert.ok(barFill(FIRST_MS * 0.75, FIRST_MS) > 0.4);
  const late = barFill(FIRST_MS + 60000, FIRST_MS);
  assert.ok(late > 0.97 && late < 1);
});
