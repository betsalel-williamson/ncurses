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

// Published dates the calendar code is checked against, 2025–2036.
// Hanukkah's first candle: Hebcal (hebcal.com/hebcal?v=1&cfg=json&year=<year>&maj=on, "Chanukah: 1 Candle").
const HEBCAL_FIRST_CANDLE = ['2025-12-14', '2026-12-04', '2027-12-24', '2028-12-12', '2029-12-01', '2030-12-20',
  '2031-12-09', '2032-11-27', '2033-12-16', '2034-12-06', '2035-12-25', '2036-12-13'];
// Lunar New Year: the Hong Kong Observatory's conversion tables (hko.gov.hk/en/gts/time/calendar/text/files/T<year>e.txt).
const HKO_LUNAR_NEW_YEAR = ['2025-01-29', '2026-02-17', '2027-02-06', '2028-01-26', '2029-02-13', '2030-02-03',
  '2031-01-23', '2032-02-11', '2033-01-31', '2034-02-19', '2035-02-08', '2036-01-28'];

test('festival dates match the published calendars, 2025–2036', async () => {
  const { occasionsOn, hanukkahNight } = await import('../src/components/boot-screen.js');
  const day = (iso, shift = 0) => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d + shift);
  };
  for (const iso of HEBCAL_FIRST_CANDLE) {
    assert.equal(hanukkahNight(day(iso)), 1, iso);
    assert.equal(hanukkahNight(day(iso, -1)), 0, iso);
    assert.equal(hanukkahNight(day(iso, 7)), 8, iso);
  }
  for (const iso of HKO_LUNAR_NEW_YEAR) {
    assert.ok(occasionsOn(day(iso)).includes('lunarnewyear'), iso);
    for (const shift of [-1, 1]) assert.ok(!occasionsOn(day(iso, shift)).includes('lunarnewyear'), `${iso} ${shift}`);
  }
});

test('the federal holidays follow 5 U.S.C. 6103 for a year', async () => {
  const { federal } = await import('../scripts/calendar.mjs');
  const on = Object.fromEntries(federal(2026).map((h) => [h.occasion, h.date]));
  assert.deepEqual(on, {
    newyear: '2026-01-01', mlk: '2026-01-19', washington: '2026-02-16', memorial: '2026-05-25',
    juneteenth: '2026-06-19', independence: '2026-07-04', labor: '2026-09-07', indigenous: '2026-10-12',
    veterans: '2026-11-11', thanksgiving: '2026-11-26', christmas: '2026-12-25',
  });
});

test('a solstice instant falls on the reader\'s own day', async () => {
  const { execFileSync } = await import('node:child_process');
  const day = (tz) =>
    execFileSync(process.execPath, ['--input-type=module', '-e', `
      const { occasionsOn } = await import(${JSON.stringify(new URL('../src/components/boot-screen.js', import.meta.url).href)});
      console.log([20, 21, 22].filter((d) => occasionsOn(new Date(2027, 11, d)).includes('solstice')).join());`],
    { env: { ...process.env, TZ: tz }, encoding: 'utf8' }).trim();
  // USNO: 2027-12-22 02:42 UT, which is still the 21st in Los Angeles.
  assert.equal(day('UTC'), '22');
  assert.equal(day('America/Los_Angeles'), '21');
});
