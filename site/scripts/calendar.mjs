/**
 * The dates the boot screen's easter eggs fall on (site/data/calendar.json), one entry per date,
 * each with its source, so a reader can check every one:
 *
 * - Hanukkah's first candle: Hebcal's calendar API, "Chanukah: 1 Candle".
 * - Lunar New Year: the Hong Kong Observatory's Gregorian-Lunar conversion tables, the
 *   "1st Lunar Month" line.
 * - The December solstice: the US Naval Observatory's seasons API, to the minute in UT.
 * - The US federal holidays: the dates 5 U.S.C. 6103(a) sets, by its rules (the third Monday in
 *   January, and so on). Each is the holiday itself, not the day it is observed when it falls on
 *   a weekend.
 * - Kwanzaa (December 26 to January 1), Christmas and ncurses's birthday (4 November 1993, the
 *   1.8.1 release in NEWS) are fixed dates.
 *
 *   node site/scripts/calendar.mjs fetch 2025 2036   # fetch the sources and write calendar.json
 *
 * Fetching needs the network, so CI doesn't: the file is committed, and boot-screen.js reads it.
 * Years past the file get no festival or holiday at all, rather than a guessed date. Extend the
 * range before it runs out.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const FILE = fileURLToPath(new URL('../data/calendar.json', import.meta.url));
export const SOURCES = {
  hebcal: 'https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&i=off&year=',
  hko: 'https://www.hko.gov.hk/en/gts/time/calendar/text/files/T<year>e.txt',
  usno: 'https://aa.usno.navy.mil/api/seasons?year=',
  usc: 'https://www.law.cornell.edu/uscode/text/5/6103',
};

const pad = (n) => String(n).padStart(2, '0');
const iso = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
/** The nth weekday (0 = Sunday) of a month (1-12), or the last when n is -1, as a day of the month. */
export function nthWeekday(year, month, weekday, n) {
  if (n < 0) {
    const last = new Date(Date.UTC(year, month, 0));
    return last.getUTCDate() - ((last.getUTCDay() - weekday + 7) % 7);
  }
  const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  return 1 + ((weekday - first + 7) % 7) + (n - 1) * 7;
}

/** The federal holidays of a year, by 5 U.S.C. 6103(a). */
export function federal(y) {
  return [
    ['newyear', iso(y, 1, 1)],
    ['mlk', iso(y, 1, nthWeekday(y, 1, 1, 3))],
    ['washington', iso(y, 2, nthWeekday(y, 2, 1, 3))],
    ['memorial', iso(y, 5, nthWeekday(y, 5, 1, -1))],
    ['juneteenth', iso(y, 6, 19)],
    ['independence', iso(y, 7, 4)],
    ['labor', iso(y, 9, nthWeekday(y, 9, 1, 1))],
    ['indigenous', iso(y, 10, nthWeekday(y, 10, 1, 2))],
    ['veterans', iso(y, 11, 11)],
    ['thanksgiving', iso(y, 11, nthWeekday(y, 11, 4, 4))],
    ['christmas', iso(y, 12, 25)],
  ].map(([occasion, date]) => ({ occasion, date, source: 'usc' }));
}

async function get(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} for ${url}`);
  return res.text();
}

async function year(y) {
  const hebcal = JSON.parse(await get(SOURCES.hebcal + y)).items.find((i) => /^Chanukah: 1 Candle/.test(i.title));
  const hko = (await get(SOURCES.hko.replace('<year>', y))).split('\n').find((l) => /1st Lunar Month/.test(l));
  const usno = JSON.parse(await get(SOURCES.usno + y)).data.find((d) => d.phenom === 'Solstice' && d.month === 12);
  if (!hebcal || !hko || !usno) throw new Error(`${y}: a source had no date`);
  const [hy, hm, hd] = hko.trim().split(/\s+/)[0].split('/').map(Number);
  return [
    ...federal(y),
    { occasion: 'birthday', date: iso(y, 11, 4), source: 'fixed' },
    { occasion: 'hanukkah', date: hebcal.date, source: 'hebcal' },
    { occasion: 'lunarnewyear', date: iso(hy, hm, hd), source: 'hko' },
    { occasion: 'solstice', date: iso(y, 12, usno.day), time: `${usno.time}Z`, source: 'usno' },
    { occasion: 'kwanzaa', date: iso(y, 12, 26), source: 'fixed' },
  ].sort((a, b) => a.date.localeCompare(b.date) || a.occasion.localeCompare(b.occasion));
}

async function main([cmd, from, to]) {
  if (cmd !== 'fetch' || !from || !to) {
    console.error('usage: calendar.mjs fetch <first year> <last year>');
    return 2;
  }
  const dates = [];
  for (let y = Number(from); y <= Number(to); y++) dates.push(...(await year(y)));
  const data = {
    about: 'The dates the boot screen easter eggs fall on, each with its source. Written by site/scripts/calendar.mjs.',
    sources: SOURCES,
    years: [Number(from), Number(to)],
    dates,
  };
  writeFileSync(FILE, `${JSON.stringify(data, null, 1)}\n`);
  console.log(`${FILE}: ${dates.length} dates, ${from}–${to}`);
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exitCode = await main(process.argv.slice(2));
