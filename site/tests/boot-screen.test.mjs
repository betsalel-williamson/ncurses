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

test('with a byte count the bar never runs ahead of the download, and fills when both are done', () => {
  // Half the bytes in, past the planned end: the bar shows half.
  assert.equal(barFill(FIRST_MS * 2, FIRST_MS, 0.5), 0.5);
  // All the bytes in early: the bar still follows the boot's own pace.
  assert.equal(barFill(FIRST_MS * 0.75, FIRST_MS, 1), 0.5);
  assert.equal(barFill(FIRST_MS, FIRST_MS, 1), 1);
});

test('occasions fall on their local dates', async () => {
  const { occasionsOn, hanukkahNight, kwanzaaDay } = await import('../src/components/boot-screen.js');
  const on = (y, m, d) => occasionsOn(new Date(y, m - 1, d));
  assert.deepEqual(on(2026, 11, 4), ['birthday']);
  assert.deepEqual(on(2026, 10, 12), ['indigenous']);
  assert.deepEqual(on(2026, 11, 26), ['thanksgiving']);
  assert.deepEqual(on(2026, 7, 4), ['independence']);
  assert.deepEqual(on(2026, 3, 3), []);
  // Hanukkah's first candle is lit on the eve of 25 Kislev.
  assert.equal(hanukkahNight(new Date(2025, 11, 14)), 1);
  assert.equal(hanukkahNight(new Date(2026, 11, 4)), 1);
  assert.equal(hanukkahNight(new Date(2026, 11, 11)), 8);
  assert.equal(hanukkahNight(new Date(2026, 11, 12)), 0);
  assert.deepEqual(on(2027, 12, 25), ['christmas', 'hanukkah']);
  assert.equal(kwanzaaDay(new Date(2026, 11, 26)), 1);
  assert.equal(kwanzaaDay(new Date(2027, 0, 1)), 7);
  assert.deepEqual(on(2027, 1, 1), ['newyear', 'kwanzaa']);
  // Lunar New Year as published, where the browser's calendar is a day off.
  assert.ok(on(2027, 2, 6).includes('lunarnewyear'));
  assert.ok(!on(2027, 2, 7).includes('lunarnewyear'));
});
