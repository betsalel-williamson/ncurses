// The boot screen a runnable example's terminal plays while its WebAssembly build loads
// (run-example.ts, and the home page's terminal in home-terminal.ts): a CRT's power-on line, a
// short ncurses boot report naming the program, a progress bar and, on a long boot, a few dated
// lines of curses history. It is ANSI text written into the same xterm.js terminal, so it shifts
// no layout, and the terminal is reset before the program's first byte is shown.
//
// A reader's first run plays it slowly (FIRST_MS), as a bit of theatre; later runs play the same
// sequence faster (AGAIN_MS) but still slowly enough to see rather than flash. The program's output
// waits until the sequence has played, and a slow load keeps it going until the program is ready.
// With reduced motion the report is drawn at once, still, with every check ok; only the bar moves,
// with the download, and the program shows as soon as it is ready.
//
// Easter eggs, each of which slows the boot to EGG_MS so it can be seen:
// - Shift+Run boots verbosely, listing the terminfo capabilities ncurses reads.
// - One run in eight, the bar is a worm (after test/worm.c) that eats its track.
// - r during the boot starts rain (after test/rain.c); Esc shows what ESCDELAY waits for.
// - On the reader's local date: ncurses's birthday (4 November 1993), the US federal holidays on
//   the actual day, and the winter festivals (Hanukkah, Christmas, Kwanzaa, the solstice, Lunar
//   New Year), side by side or in turn when they fall together. With reduced motion each picture
//   is drawn still.

import calendar from '../../data/calendar.json' with { type: 'json' };

export const FIRST_MS = 4000;
export const AGAIN_MS = 1200;
/** The length of any boot that plays an easter egg, so the egg can be seen. */
export const EGG_MS = 5000;
const SEEN_KEY = 'nc-terminal-booted';
let seenThisPage = false;

/** How long the boot plays: the long version once per reader, then the short one. */
export function bootLength(seen, reduced) {
  if (reduced) return 0;
  return seen ? AGAIN_MS : FIRST_MS;
}

/** Whether this reader has seen the long boot, remembered in their browser when it can be. */
export function bootSeen() {
  try {
    return seenThisPage || localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return seenThisPage;
  }
}
function markSeen() {
  seenThisPage = true;
  try {
    localStorage.setItem(SEEN_KEY, '1');
  } catch {
    // no storage: the long boot plays once per page
  }
}

// Each line comes from the guides' history page (docs/client-library/getting-started/history.md)
// or NEWS, so a reader can check it.
/**
 * The fraction of the bar to fill at time t of a boot that lasts `length`. The bar runs from half
 * way through the boot to its end, and never ahead of the download: `loaded` is the fraction of
 * the program's bytes that have arrived, so on a slow link the bar moves with them instead of
 * racing ahead and waiting at the end. Without a byte count it eases toward 92% and creeps on.
 */
export function barFill(t, length, loaded = null) {
  const start = length / 2;
  const time = t <= start ? 0 : Math.min(1, (t - start) / (length - start));
  if (loaded !== null) return Math.min(time, Math.max(0, Math.min(1, loaded)));
  const extra = t > length ? (1 - Math.exp(-(t - length) / 2000)) * 0.06 : 0;
  return time * 0.92 + extra;
}

const HISTORY = [
  '1980  curses is first published, in 4.0BSD',
  '1984  terminfo arrives with System V Release 2',
  '1986  System V Release 3 rewrites curses and adds tic',
  '      Pavel Curtis originates ncurses',
  '1993  ncurses 1.8.1 is released',
  'today Thomas E. Dickey maintains ncurses',
];
const lightBackground = (hex) => {
  const m = /^#([0-9a-f]{6})$/i.exec((hex ?? '').replace(/^#(\w)(\w)(\w)$/, '#$1$1$2$2$3$3'));
  if (!m) return false;
  const n = parseInt(m[1], 16);
  return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 > 128;
};
const visible = (s) => s.replace(/\x1b\[[0-9;]*m/g, '').length;
const padTo = (s, n) => s + ' '.repeat(Math.max(0, n - visible(s)));

// ---- Dates. Every date comes from site/data/calendar.json, which names a source for each one
// (site/scripts/calendar.mjs). The reader's local date is looked up in it; a year past the file
// gets no occasion rather than a guessed one.
const local = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDays = (iso, n) => {
  const [y, m, d] = iso.split('-').map(Number);
  return local(new Date(y, m - 1, d + n));
};
/** For each local date, the occasions on it: one-day occasions as listed, and the runs that last. */
const ON = new Map();
const mark = (date, occasion, value = true) => {
  if (!ON.has(date)) ON.set(date, new Map());
  ON.get(date).set(occasion, value);
};
for (const { occasion, date, time } of calendar.dates) {
  if (occasion === 'hanukkah') for (let n = 1; n <= 8; n++) mark(addDays(date, n - 1), 'hanukkah', n);
  else if (occasion === 'kwanzaa') for (let n = 1; n <= 7; n++) mark(addDays(date, n - 1), 'kwanzaa', n);
  // The solstice is an instant in UT; the reader's day is the one it falls on where they are.
  else if (occasion === 'solstice') mark(local(new Date(`${date}T${time}`)), 'solstice');
  else mark(date, occasion);
  // The December season, around Christmas: the tree from the 20th, Christmas Eve on the 24th.
  if (occasion === 'christmas') {
    for (let n = -5; n <= 6; n++) if (n) mark(addDays(date, n), n === -1 ? 'christmaseve' : 'tree');
  }
}
/** The night of Hanukkah lit on this date's evening (1–8), or 0. Night 1 is Hebcal's first candle. */
export function hanukkahNight(date) {
  return ON.get(local(date))?.get('hanukkah') ?? 0;
}
/** The day of Kwanzaa (1–7, December 26 to January 1), or 0. */
export function kwanzaaDay(date) {
  return ON.get(local(date))?.get('kwanzaa') ?? 0;
}
const PRINCIPLES = [['Umoja', 'unity'], ['Kujichagulia', 'self-determination'], ['Ujima', 'collective work and responsibility'],
  ['Ujamaa', 'cooperative economics'], ['Nia', 'purpose'], ['Kuumba', 'creativity'], ['Imani', 'faith']];
const ZODIAC = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
const ORDER = ['newyear', 'mlk', 'washington', 'memorial', 'juneteenth', 'independence', 'labor', 'indigenous',
  'birthday', 'veterans', 'thanksgiving', 'christmaseve', 'christmas', 'tree', 'hanukkah', 'kwanzaa', 'solstice', 'lunarnewyear'];

/** Every occasion on a local date, in display order. Federal holidays fall on the actual day, not the observed one. */
export function occasionsOn(date) {
  const on = ON.get(local(date));
  return on ? ORDER.filter((o) => on.has(o)) : [];
}
/** The name the header carries for an occasion. */
function occasionName(key, date) {
  return {
    newyear: 'Happy New Year', mlk: 'Martin Luther King Jr. Day', washington: "Washington's Birthday",
    memorial: 'Memorial Day', juneteenth: 'Juneteenth', independence: 'Independence Day', labor: 'Labor Day',
    indigenous: "Indigenous Peoples' Day", birthday: 'happy birthday', veterans: 'Veterans Day',
    thanksgiving: 'Thanksgiving', christmaseve: 'Christmas Eve', christmas: 'Christmas Day', tree: "season's greetings",
    hanukkah: 'Hanukkah', kwanzaa: 'Kwanzaa', solstice: 'Winter solstice', lunarnewyear: 'Lunar New Year',
  }[key] ?? key;
}

// ---- Pictures. Each takes the frame number and returns its rows; frame 0 is its still. ----------
function palette(light) {
  return { white: light ? '30' : '97', yellow: light ? '33' : '93', flame: light ? '31' : '93', black: light ? '30' : '90',
    candle: light ? '34' : '36', stripeFg: light ? '37' : '97', stripeBg: light ? '47' : '107' };
}

/** Fireworks: bursts open in rings and fade. With `still`, three bursts held open. */
function fireworks(width, height, still) {
  const COLORS = ['31', '33', '35', '36', '32', '91', '93', '95'];
  const RINGS = ['*', '+', '*', '.', '.'];
  const bursts = still
    ? [{ x: Math.round(width * 0.22), y: 2, age: 2, c: '91' }, { x: Math.round(width * 0.55), y: Math.min(3, height - 2), age: 3, c: '93' }, { x: Math.round(width * 0.82), y: 1, age: 1, c: '36' }]
    : [];
  const draw = (grid, b, age) => {
    const pts = age === 0 ? [[0, 0]] : Array.from({ length: 8 }, (_, a) => [Math.round(Math.cos(a * Math.PI / 4) * age * 2), Math.round(Math.sin(a * Math.PI / 4) * age)]);
    for (const [dx, dy] of pts) {
      const gx = b.x + dx, gy = b.y + dy;
      if (gy >= 0 && gy < height && gx >= 0 && gx < width) grid[gy][gx] = `\x1b[${age > 2 ? '2;' : '1;'}${b.c}m${RINGS[age]}\x1b[0m`;
    }
  };
  return (frame) => {
    const grid = Array.from({ length: height }, () => Array(width).fill(' '));
    if (still) { for (const b of bursts) draw(grid, b, b.age); return grid.map((r) => r.join('')); }
    if (bursts.length < 3 && (frame % 7 === 0 || Math.random() < 0.08)) {
      bursts.push({ x: 4 + Math.floor(Math.random() * Math.max(1, width - 8)), y: 1 + Math.floor(Math.random() * Math.max(1, height - 2)), born: frame, c: COLORS[Math.floor(Math.random() * COLORS.length)] });
    }
    for (let i = bursts.length - 1; i >= 0; i--) {
      const age = (frame - bursts[i].born) >> 1;
      if (age >= RINGS.length || age < 0) bursts.splice(i, 1);
      else draw(grid, bursts[i], age);
    }
    return grid.map((r) => r.join(''));
  };
}

/** Thirteen stripes in seven rows of half blocks, with a blue field of stars. 26 wide. */
function flagRows(P) {
  const rows = [];
  for (let r = 0; r < 7; r++) {
    let s = '';
    for (let c = 0; c < 26; c++) {
      if (r < 4 && c < 11) {
        const star = r % 2 === 0 ? c % 2 === 1 : c % 2 === 0 && c > 0 && c < 10;
        s += `\x1b[1;97;44m${star ? '*' : ' '}`;
      } else {
        const top = 2 * r, bottom = 2 * r + 1;
        const fg = top % 2 === 0 ? '31' : P.stripeFg;
        const bg = bottom >= 13 ? '49' : bottom % 2 === 0 ? '41' : P.stripeBg;
        s += `\x1b[0;${fg};${bg}m▀`;
      }
    }
    rows.push(s + '\x1b[0m');
  }
  return rows;
}

/** A framed banner: plain and dignified, with an optional border color. */
function banner(title, sub, w, border = '1') {
  const inner = Math.min(w - 2, Math.max(title.length, sub.length) + 4);
  const pad = (s) => `  ${s.slice(0, inner - 4)}`.padEnd(inner);
  return [
    `\x1b[${border}m╔${'═'.repeat(inner)}╗\x1b[0m`,
    `\x1b[${border}m║\x1b[0;1m${pad(title)}\x1b[0;${border}m║\x1b[0m`,
    `\x1b[${border}m║\x1b[0;2m${pad(sub)}\x1b[0;${border}m║\x1b[0m`,
    `\x1b[${border}m╚${'═'.repeat(inner)}╝\x1b[0m`,
  ];
}

/** A flame that flickers by frame; frame 0 is a steady one. */
const flame = (frame, i, P) => {
  if (!frame) return `\x1b[1;${P.flame}m'\x1b[0m`;
  const f = (frame * 7 + i * 13 + (frame >> 1) * i) % 12;
  return `\x1b[1;${[P.flame, '33', '31'][f % 3]}m${["'", '`', '*', ','][f % 4]}\x1b[0m`;
};

/** A two-tier cake with five candles, for ncurses 1.8.1 (4 November 1993). 21 wide, 8 rows. */
function cakeRows(frame, P) {
  const flames = [0, 1, 2, 3, 4].map((i) => flame(frame, i, P)).join(' ');
  const candles = ['35', '36', '32', '34', '31'].map((c) => `\x1b[${c}m|\x1b[0m`).join(' ');
  const icing = Array.from({ length: 9 }, (_, i) => ((i + (frame >> 3)) % 2 ? '~' : '^')).join(' ');
  return [
    `      ${flames}`,
    `      ${candles}`,
    `  \x1b[35m╭───┴─┴─┴─┴─┴───╮\x1b[0m`,
    `  \x1b[35m│\x1b[0;1m  ncurses 6.6  \x1b[0;35m│\x1b[0m`,
    `\x1b[36m╭─┴───────────────┴─╮\x1b[0m`,
    `\x1b[36m│\x1b[0;${P.white}m ${icing} \x1b[0;36m│\x1b[0m`,
    `\x1b[36m│\x1b[0m   est. Nov 1993   \x1b[36m│\x1b[0m`,
    `\x1b[36m╰───────────────────╯\x1b[0m`,
  ];
}

/** A turkey whose tail feathers cycle through autumn colors. 22 wide, 6 rows. */
function turkeyRows(frame, P) {
  const ART = [
    "    \\  \\  |  /  /",
    " \\   \\  \\ | /  /   /",
    "  '-. '. \\|/ .' .-'",
    "  --  .-'''''-.  -- _",
    "     (  ' ' '  )---(o>",
    "      '-.___.-'     ')",
  ];
  const TAIL = ['31', '33', '91', P.yellow, '35'];
  const shift = frame >> 2;
  const colorOf = (r, c) => {
    if (r < 3 || (r === 3 && (c < 5 || (c > 15 && c < 19)))) return TAIL[(Math.floor(c / 3) + r + shift) % TAIL.length];
    if (r >= 4 && c >= 19) return ART[r][c] === '>' ? `1;${P.yellow}` : ART[r][c] === 'o' ? '1' : '31';
    if (r === 3 && c >= 19) return '31';
    return ART[r][c] === "'" && r === 4 ? '2;33' : '33';
  };
  return ART.map((line, r) => [...line].map((ch, c) => (ch === ' ' ? ' ' : `\x1b[${colorOf(r, c)}m${ch}\x1b[0m`)).join(''));
}

/** The December tree, after test/xmas.c; its ornaments change color. 5 wide, 4 rows. */
function treeRows(frame, P) {
  const c = ['31', '33', '35', '36'];
  const o = (i) => `\x1b[1;${c[((frame >> 2) + i) % 4]}mo\x1b[0;32m`;
  return [`  \x1b[1;${P.yellow}m*\x1b[0m  `, `\x1b[32m /${o(0)}\\ \x1b[0m`, `\x1b[32m/${o(1)}.${o(2)}\\\x1b[0m`, `\x1b[2m |_| \x1b[0m`];
}

/** A menorah: the raised shamash and, from the right, the night's candles are lit. 17 wide, 6 rows. */
function menorahRows(frame, night, P) {
  const POS = [0, 2, 4, 6, 10, 12, 14, 16];
  const lit = new Set(POS.slice(8 - night));
  const row = (f) => Array.from({ length: 17 }, (_, c) => f(c)).join('');
  const body = `\x1b[1;${P.white}m|\x1b[0m`, candle = `\x1b[${P.candle}m|\x1b[0m`;
  return [
    row((c) => (c === 8 ? flame(frame, 8, P) : ' ')),
    row((c) => (c === 8 ? body : lit.has(c) ? flame(frame, c, P) : ' ')),
    row((c) => (c === 8 ? body : POS.includes(c) ? candle : ' ')),
    `\x1b[33m╰─┴─┴─┴─┼─┴─┴─┴─╯\x1b[0m`,
    `\x1b[33m        │        \x1b[0m`,
    `\x1b[33m     ───┴───     \x1b[0m`,
  ];
}

/** A kinara: three red, one black and three green candles, lit in the order of the days. 15 wide, 5 rows. */
function kinaraRows(frame, day, P) {
  const COLORS = ['31', '31', '31', P.black, '32', '32', '32'];
  const ORDER = [3, 0, 6, 1, 5, 2, 4];
  const lit = new Set(ORDER.slice(0, day));
  const row = (f) => Array.from({ length: 15 }, (_, c) => (c % 2 && c < 14 ? f((c - 1) / 2) : ' ')).join('');
  return [
    row((i) => (lit.has(i) ? flame(frame, i, P) : ' ')),
    row((i) => `\x1b[${COLORS[i]}m█\x1b[0m`),
    row((i) => `\x1b[${COLORS[i]}m█\x1b[0m`),
    `\x1b[33m${Array.from({ length: 15 }, (_, c) => (c === 0 ? '╘' : c === 14 ? '╛' : c % 2 ? '╧' : '═')).join('')}\x1b[0m`,
    `\x1b[33m    ▀▀▀▀▀▀▀    \x1b[0m`,
  ];
}

/** A low sun on the horizon under a few stars, for the longest night. 21 wide, 4 rows. */
function solsticeRows(frame, P) {
  const star = (i) => (frame && ((frame >> 3) + i) % 3 === 0 ? '\x1b[2m.\x1b[0m' : `\x1b[${P.white}m*\x1b[0m`);
  return [
    `  ${star(0)}    \x1b[2m.\x1b[0m     ${star(1)}    \x1b[2m.\x1b[0m  `,
    `     \x1b[2m.\x1b[0m     ${star(2)}    ${star(3)}    `,
    `       \x1b[${P.yellow}m.-'''-.\x1b[0m       `,
    `\x1b[34m${'~'.repeat(21)}\x1b[0m`,
  ];
}

/** Two red lanterns with gold tassels. 16 wide, 5 rows. */
function lanternRows(frame, P) {
  const glow = (i) => (frame && ((frame >> 3) + i) % 2 ? '31' : '91');
  const two = (f) => `${f(0)}      ${f(1)}`;
  return [
    two(() => '\x1b[2m  │  \x1b[0m'),
    two(() => '\x1b[33m ╭┴╮ \x1b[0m'),
    two((i) => `\x1b[33m(\x1b[${glow(i)}m███\x1b[33m)\x1b[0m`),
    two(() => '\x1b[33m ╰┬╯ \x1b[0m'),
    two(() => `\x1b[${P.yellow}m  ¦  \x1b[0m`),
  ];
}

// ---- Scenes: a picture with a caption beside it (full) or a short label under it (compact). ---
/** Puts caption lines beside a picture, centered on its height. */
function beside(rows, width, lines) {
  const top = Math.max(0, Math.floor((rows.length - lines.length) / 2));
  return rows.map((r, i) => (lines[i - top] ? `${padTo(r, width)}   ${lines[i - top]}` : r));
}
const under = (rows, width, label) => [...rows, label.length < width ? ' '.repeat(Math.floor((width - label.length) / 2)) + label : label];

/** The parts of one occasion's scene: full and compact rows by frame, whether it moves, a one-line form. */
function sceneParts(key, { w, P, today, still }) {
  const y = today.getFullYear();
  const T = (s) => `\x1b[1m${s}\x1b[0m`, S = (s) => `\x1b[2m${s}\x1b[0m`;
  const name = occasionName(key, today);
  const pic = (rowsOf, width, caption, label, moves = true) => ({
    full: (f) => beside(rowsOf(f), width, caption),
    compact: (f) => under(rowsOf(f), width, label),
    moves,
  });
  const framed = (title, sub, border) => ({ full: () => banner(title, sub, w, border), compact: () => banner(title, sub, w, border), moves: false });
  let p;
  switch (key) {
    case 'newyear': {
      const big = fireworks(Math.min(w, 50), 7, still), small = fireworks(24, 6, still);
      const text = `Happy New Year ${y}`;
      p = { full: (f) => [...big(f), ' '.repeat(Math.max(0, Math.floor((Math.min(w, 50) - text.length) / 2))) + `\x1b[1;${P.yellow}m${text}\x1b[0m`],
        compact: (f) => under(small(f), 24, `New Year ${y}`), moves: true };
      break;
    }
    case 'independence': {
      const room = w - 29, fw = room >= 14 ? fireworks(room, 7, still) : null;
      p = { full: (f) => { const fr = fw ? fw(f) : []; return flagRows(P).map((r, i) => (fw ? `${r}   ${fr[i]}` : r)); },
        compact: () => under(flagRows(P), 26, 'Independence Day'), moves: !!fw };
      break;
    }
    case 'memorial': p = pic(() => flagRows(P), 26, [T('Memorial Day'), S('in remembrance')], 'Memorial Day', false); break;
    case 'veterans': p = pic(() => flagRows(P), 26, [T('Veterans Day'), S('honoring all who served')], 'Veterans Day', false); break;
    case 'birthday': p = pic((f) => cakeRows(f, P), 21, [T('happy birthday, ncurses'), S(`${y - 1993} years since 4 Nov 1993`)], `ncurses turns ${y - 1993}`); break;
    case 'thanksgiving': p = pic((f) => turkeyRows(f, P), 22, [T('Thanksgiving Day'), S('fourth Thursday of November')], 'Thanksgiving'); break;
    case 'tree': case 'christmaseve': case 'christmas': {
      const title = key === 'tree' ? [] : [T(name)];
      p = pic((f) => treeRows(f, P), 5, [...title, S("season's greetings, after test/xmas.c")], name);
      break;
    }
    case 'hanukkah': {
      const n = hanukkahNight(today);
      p = pic((f) => menorahRows(f, n, P), 17, [T('Hanukkah'), `night ${n} of 8`, S('candles lit at nightfall')], `Hanukkah · night ${n}`);
      break;
    }
    case 'kwanzaa': {
      const d = kwanzaaDay(today), [word, meaning] = PRINCIPLES[d - 1];
      p = pic((f) => kinaraRows(f, d, P), 15, [T(`Kwanzaa · day ${d}`), word, S(meaning)], `Kwanzaa · ${word}`);
      break;
    }
    case 'solstice': p = pic((f) => solsticeRows(f, P), 21, [T('Winter solstice'), S('the longest night of the year')], 'Winter solstice'); break;
    case 'lunarnewyear': p = pic((f) => lanternRows(f, P), 16, [T('Lunar New Year'), S(`Year of the ${ZODIAC[(((y - 2020) % 12) + 12) % 12]}`)], 'Lunar New Year'); break;
    case 'mlk': p = framed('Martin Luther King Jr. Day', 'third Monday of January · a day of service', '1'); break;
    case 'juneteenth': p = framed('Juneteenth National Independence Day', 'June 19, 1865 · Galveston, Texas', '1'); break;
    case 'washington': p = framed("Washington's Birthday", "third Monday of February · Presidents' Day", '34'); break;
    case 'labor': p = framed('Labor Day', 'for the achievements of American workers', '33'); break;
    case 'indigenous': p = framed("Indigenous Peoples' Day", 'honoring Native peoples and their histories', '36'); break;
    default: return null;
  }
  return { ...p, line: () => [`\x1b[1m· ${name} ·\x1b[0m`] };
}

/**
 * One scene for all of a date's occasions, fitted to w columns and `room` rows. One occasion
 * shows full, or compact, or as a line. Several stand side by side when their compact forms fit;
 * otherwise they take turns (ALTERNATE frames each), or with reduced motion the first stands alone.
 */
const ALTERNATE = 26;
function planScene(keys, ctx, room) {
  if (!keys.length || room < 1) return null;
  const { w, still } = ctx;
  const make = (rows, moves) => {
    const r0 = rows(0);
    return { rows: still ? () => r0 : rows, height: r0.length, width: Math.max(0, ...r0.map(visible)), still: still || !moves };
  };
  const fits = (rows) => { const r = rows(0); return r.length <= room && Math.max(0, ...r.map(visible)) <= w; };
  const parts = keys.map((k) => sceneParts(k, ctx)).filter(Boolean);
  const best = (p) => make([p.full, p.compact].find(fits) ?? p.line, p.moves);
  if (parts.length === 1) return best(parts[0]);
  const cs = parts.map((p) => make(p.compact, p.moves));
  if (cs.reduce((a, c) => a + c.width, 0) + 4 * (cs.length - 1) <= w && cs.every((c) => c.height <= room)) {
    const h = Math.max(...cs.map((c) => c.height));
    return make((f) => Array.from({ length: h }, (_, i) => cs.map((c, j) => {
      const r = c.rows(f)[i - (h - c.height)] ?? '';
      return j < cs.length - 1 ? padTo(r, c.width) : r;
    }).join('    ')), cs.some((c) => !c.still));
  }
  const joined = parts.map((p) => p.line()[0]).join('  ');
  if (room < 3 && visible(joined) <= w) return make(() => [joined], false);
  if (still) return best(parts[0]);
  const each = parts.map(best);
  const h = Math.max(...each.map((e) => e.height));
  return { height: h, width: w, still: false, rows: (f) => { const e = each[Math.floor(f / ALTERNATE) % each.length]; const r = e.rows(f); return Array.from({ length: h }, (_, i) => r[i] ?? ''); } };
}

// ---- The verbose report: every name is a real xterm-256color capability. ----------------------
const VERBOSE_CAPS = ['smcup', 'rmcup', 'cup', 'clear', 'el', 'ed', 'csr', 'civis', 'cnorm', 'setaf',
  'setab', 'op', 'sgr0', 'bold', 'rev', 'smul', 'acsc', 'smacs', 'rmacs', 'smkx', 'rmkx', 'kcuu1',
  'kcud1', 'kcub1', 'kcuf1', 'khome', 'kend', 'kf1', 'kmous', 'bce'];

// ---- The worm, after test/worm.c. It eats the track as it crawls. ------------------------------
function wormBar(n, bw, frame, color) {
  const body = (frame % 2 ? 'oOo' : 'OoO') + '@';
  const len = Math.min(n, body.length);
  return `${' '.repeat(n - len)}\x1b[1;${color}m${body.slice(body.length - len)}\x1b[0;2m${'░'.repeat(bw - n)}\x1b[0m`;
}

// ---- Rain, after test/rain.c. Drops fall behind the text rows (busy), land as . o O, then
// ripple out. Returns one animation step, called on each boot frame. ----------------------------
function rainEgg({ C, R, at, busy, color, write }) {
  const drops = [];
  const cell = (r, c, ch) => {
    if (r >= 1 && r <= R && c >= 1 && c <= C && !busy.has(r)) write(`${at(r, c)}\x1b[${color}m${ch}\x1b[0m`);
  };
  const RIPPLE = [
    (d) => cell(d.y, d.x, 'o'),
    (d) => cell(d.y, d.x, 'O'),
    (d) => { cell(d.y, d.x - 1, '('); cell(d.y, d.x, ' '); cell(d.y, d.x + 1, ')'); },
    (d) => { cell(d.y, d.x - 2, '('); cell(d.y, d.x - 1, ' '); cell(d.y, d.x + 1, ' '); cell(d.y, d.x + 2, ')'); },
    (d) => { for (let i = -2; i <= 2; i++) cell(d.y, d.x + i, ' '); },
  ];
  return () => {
    const free = [];
    for (let r = 3; r <= R - 1; r++) if (!busy.has(r)) free.push(r);
    if (free.length && drops.length < Math.ceil(C / 6) && Math.random() < 0.7) {
      drops.push({ x: 3 + Math.floor(Math.random() * (C - 4)), y: 0, land: free[Math.floor(Math.random() * free.length)], age: -1 });
    }
    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i];
      if (d.y < d.land) {
        cell(d.y, d.x, ' ');
        d.y++;
        cell(d.y, d.x, d.y < d.land ? "'" : '.');
      } else if (++d.age < RIPPLE.length) RIPPLE[d.age](d);
      else drops.splice(i, 1);
    }
  };
}

// ---- Escape. A lone ESC is what curses waits ESCDELAY for. --------------------------------------
function escapeLines(w) {
  const ask = 'ESC … waiting ESCDELAY=25ms: a key, or the start of a sequence?';
  return [ask.length <= w ? ask : 'ESC … ESCDELAY=25ms: a key, or a sequence?', 'ESC … 25ms passed and nothing followed: just a key.'];
}

export function bootScreen(
  term,
  name,
  {
    reduced = matchMedia('(prefers-reduced-motion: reduce)').matches,
    seen = bootSeen(),
    verbose = false,
    worm = Math.random() < 1 / 8,
    today = new Date(),
  } = {},
) {
  const occasions = occasionsOn(today);
  if (!reduced) markSeen();
  // An egg chosen at the start (verbose, worm, an occasion) slows the whole boot to EGG_MS. With
  // reduced motion there is no planned length: the program shows as soon as it is ready.
  let length = reduced ? 0 : verbose || worm || occasions.length ? EGG_MS : seen ? AGAIN_MS : FIRST_MS;
  const t0 = performance.now();
  const C = term.cols, R = term.rows;
  const w = Math.min(C - 4, 64);
  const x = Math.floor((C - w) / 2) + 1;
  const at = (r, c = x) => `\x1b[${r};${c}H`;
  const light = lightBackground(term.options.theme?.background);
  const P = palette(light);
  const ok = light ? '34' : '32';
  const hot = light ? '1' : '1;97';
  const warm = light ? '0' : '97';
  let done = false, timer = 0, released = null, rain = null;
  const out = (s) => { if (!done) term.write(s); };
  const stop = () => { done = true; clearInterval(timer); };
  const later = [];

  // The layout, planned from the size before the first frame. busy holds every row with text.
  const capCols = Math.max(1, Math.floor(w / 10));
  const capRows = verbose ? Math.max(0, Math.min(Math.ceil(VERBOSE_CAPS.length / capCols), R - 14)) : 0;
  const caps = VERBOSE_CAPS.slice(0, capRows * capCols);
  const row = { header: 2, terminfo: 4, colors: 5 + capRows, keys: 6 + capRows, program: 8 + capRows };
  row.bar = row.program + 1;
  row.history = R >= 16 && !reduced ? Math.min(row.bar + 3, R - 3) : 0;
  const sceneTop = row.bar + 2;
  const scene = planScene(occasions, { w, P, today, still: reduced }, R - sceneTop);
  const mid = Math.ceil(R / 2);
  const busy = new Set([mid, R, ...Object.values(row).filter(Boolean)]);
  for (let r = row.terminfo; r <= row.keys; r++) busy.add(r);
  for (let r = sceneTop; r < sceneTop + (scene?.height ?? 0); r++) busy.add(r);

  // As in barFill(): the bar's time runs from half way through the boot to its end, and the bar
  // never runs ahead of the download (`loaded`). A longer plan restarts the time from where it is,
  // so the bar slows down rather than jumping back. With reduced motion it follows the download.
  const k = length / FIRST_MS;
  let loaded = null;
  let from = { t: length / 2, q: 0 };
  const planned = (t) => (!length ? 1 : t <= from.t ? from.q : from.q + (1 - from.q) * Math.min(1, (t - from.t) / Math.max(1, length - from.t)));
  const fill = (t) => {
    const time = planned(t);
    if (loaded !== null) return Math.min(time, Math.max(0, Math.min(1, loaded)));
    const extra = t > length ? (1 - Math.exp(-(t - length) / 2000)) * 0.06 : 0;
    return time * 0.92 + extra;
  };
  /** Slows the boot to EGG_MS from its start, for an egg a key started. */
  const slow = () => {
    if (!length || done || length >= EGG_MS) return;
    const now = performance.now() - t0;
    from = now < from.t ? { t: from.t, q: 0 } : { t: now, q: planned(now) };
    length = EGG_MS;
  };

  const boot = {
    stop,
    get done() { return done; },
    get length() { return length; },
    /** The fraction of the program's bytes that have arrived, for the bar. */
    progress(fraction) { loaded = fraction; },
    release() {
      released ??= new Promise((resolve) => {
        const finish = () => {
          // The plan may have grown since: wait for the new end.
          const wait = t0 + length - performance.now();
          if (wait > 5) { setTimeout(finish, wait); return; }
          drawBar(1);
          stop();
          setTimeout(() => { term.reset(); resolve(); }, reduced ? 0 : 150);
        };
        finish();
      });
      return released;
    },
    /** A key typed during the boot. True when the boot keeps it; anything else goes to the program. */
    key(data) {
      if (done) return false;
      if (data === 'r' || data === 'R') {
        if (!reduced && !rain) { slow(); rain = rainEgg({ C, R, at, busy, color: light ? '34' : '36', write: out }); }
        return true;
      }
      if (data === '\x1b') {
        slow();
        const [ask, answer] = escapeLines(w);
        const line = (s) => out(`${at(R, 1)}\x1b[2K${at(R)}\x1b[2m${s.slice(0, w)}\x1b[0m`);
        line(ask);
        later.push([performance.now() - t0 + 700, () => line(answer)]);
        return true;
      }
      return false;
    },
  };

  const crt = (len, sgr) => {
    const s = Math.floor((C - len) / 2) + 1;
    out(`${at(mid, 1)}\x1b[2K${at(mid, s)}\x1b[${sgr}m${'━'.repeat(len)}\x1b[0m`);
  };
  const check = (r, label, value) => {
    const dots = Math.max(2, w - 16 - value.length);
    out(`${at(r)}\x1b[2m${label.padEnd(10)}\x1b[0m${value} \x1b[2m${'.'.repeat(dots)}\x1b[0m \x1b[1;${ok}mok\x1b[0m`);
  };
  const bw = w - 14;
  let frame = 0;
  const drawBar = (p, spin = ' ') => {
    const n = Math.round(Math.min(1, p) * bw);
    const inner = worm ? wormBar(n, bw, frame, ok) : `\x1b[1m${'█'.repeat(n)}\x1b[0;2m${'░'.repeat(bw - n)}\x1b[0m`;
    out(`${at(row.bar, x + 10)}[${inner}] ${spin}`);
  };
  const header = () => {
    const right = `tty ${C}×${R} `;
    let left = ' ncurses 6.6 ';
    const names = occasions.map((o) => occasionName(o, today));
    for (const extra of names.length ? [`· ${names.join(' · ')} `, `· ${names[0]} `] : []) {
      if (left.length + extra.length + right.length + 1 <= w) { left += extra; break; }
    }
    out(`${at(row.header)}\x1b[7m${left}${' '.repeat(Math.max(1, w - left.length - right.length))}${right}\x1b[0m`);
  };
  let sceneDrawn = false;
  const drawScene = () => {
    if (!scene || (scene.still && sceneDrawn)) return;
    scene.rows(frame).forEach((s, i) => out(`${at(sceneTop + i, 1)}\x1b[2K${at(sceneTop + i)}${s}`));
    sceneDrawn = true;
  };
  // The sequence, timed for the long boot and scaled; with reduced motion it is all there at once.
  const steps = [
    ...(reduced ? [] : [
      [0, () => crt(2, hot)],
      [150, () => crt(Math.round(C * 0.15), hot)],
      [300, () => crt(Math.round(C * 0.45), warm)],
      [450, () => crt(C, warm)],
      [650, () => crt(Math.round(C * 0.7), '2')],
    ]),
    [800, () => { out(`${at(mid, 1)}\x1b[2K`); header(); }],
    [1100, () => check(row.terminfo, 'terminfo', 'xterm-256color')],
    ...caps.map((cap, i) => [1150 + (500 * i) / caps.length, () => {
      out(`${at(row.terminfo + 1 + Math.floor(i / capCols), x + 2 + (i % capCols) * 10)}\x1b[1;${ok}m✓\x1b[0m ${cap}`);
    }]),
    [verbose ? 1700 : 1400, () => check(row.colors, 'colors', verbose ? 'colors#256 pairs#65536' : '256 colors')],
    [verbose ? 1850 : 1700, () => check(row.keys, 'keys', 'ESCDELAY=25ms')],
    [2000, () => out(`${at(row.program)}\x1b[2m${'program'.padEnd(10)}\x1b[0m\x1b[1m${`${name}.wasm`.slice(0, w - 10)}\x1b[0m`)],
  ].map(([t, f]) => [t * k, f]);
  let next = 0, shown = -1;
  const tick = () => {
    const t = performance.now() - t0;
    while (next < steps.length && steps[next][0] <= t) steps[next++][1]();
    for (let i = later.length - 1; i >= 0; i--) if (later[i][0] <= t) later.splice(i, 1)[0][1]();
    rain?.();
    frame++;
    if (t >= 800 * k) drawScene();
    if (t < 2000 * k) return;
    drawBar(fill(t), reduced ? ' ' : '|/-\\'[frame % 4]);
    if (!scene && row.history && t >= 2300 && (length >= FIRST_MS || t > length)) {
      const i = Math.floor((t - 2300) / 1200) % HISTORY.length;
      if (i !== shown) { shown = i; out(`${at(row.history)}\x1b[2K${at(row.history)}\x1b[2;3m${HISTORY[i].slice(0, w)}\x1b[0m`); }
    }
  };
  out('\x1b[?25l\x1b[2J');
  tick();
  timer = setInterval(tick, 50);
  return boot;
}
