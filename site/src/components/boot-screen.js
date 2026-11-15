// The boot screen a runnable example's terminal plays while its WebAssembly build loads
// (run-example.ts): a CRT's power-on line, a short ncurses boot report naming the program, a
// progress bar and, on a long boot, a few dated lines of curses history. It is ANSI text written
// into the same xterm.js terminal, so it shifts no layout, and the terminal is reset before the
// program's first byte is shown.
//
// A reader's first run plays it slowly (FIRST_MS), as a bit of theatre; later runs play the same
// sequence faster (AGAIN_MS) but still slowly enough to see rather than flash. The program's output
// waits until the sequence has played, and a slow load keeps it going until the program is ready.
// With reduced motion there is one static line and no wait.

export const FIRST_MS = 4000;
export const AGAIN_MS = 1200;
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
const HISTORY = [
  '1980  curses is first published, in 4.0BSD',
  '1984  terminfo arrives with System V Release 2',
  '1986  System V Release 3 rewrites curses and adds tic',
  '      Pavel Curtis originates ncurses',
  '1993  ncurses 1.8.1 is released',
  'today Thomas E. Dickey maintains ncurses',
];

/** The fraction of the bar to fill at time t of a boot that lasts `length`, before the load ends. */
export function barFill(t, length) {
  const start = length / 2;
  if (t <= start) return 0;
  // Fills to 92% as the planned length runs out, then creeps on while a slow load continues.
  const planned = Math.min(1, (t - start) / (length - start)) * 0.92;
  const extra = t > length ? (1 - Math.exp(-(t - length) / 2000)) * 0.06 : 0;
  return planned + extra;
}

const lightBackground = (hex) => {
  const m = /^#([0-9a-f]{6})$/i.exec((hex ?? '').replace(/^#(\w)(\w)(\w)$/, '#$1$1$2$2$3$3'));
  if (!m) return false;
  const n = parseInt(m[1], 16);
  return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 > 128;
};

/**
 * Starts the boot screen in `term` for the program `name`. The result's release() ends it once
 * the sequence has played and resolves after resetting the terminal; stop() ends it at once.
 */
export function bootScreen(term, name, { reduced = matchMedia('(prefers-reduced-motion: reduce)').matches } = {}) {
  const length = bootLength(bootSeen(), reduced);
  const t0 = performance.now();
  const C = term.cols;
  const R = term.rows;
  const w = Math.min(C - 4, 64);
  const x = Math.floor((C - w) / 2) + 1;
  const at = (r, c = x) => `\x1b[${r};${c}H`;
  // On a light terminal (Workstation, Manual page) bright white would vanish: use the defaults.
  const light = lightBackground(term.options.theme?.background);
  const ok = light ? '34' : '32';
  const hot = light ? '1' : '1;97';
  const warm = light ? '0' : '97';
  let done = false;
  let timer = 0;
  let released = null;
  const out = (s) => {
    if (!done) term.write(s);
  };
  const stop = () => {
    done = true;
    clearInterval(timer);
  };
  const boot = {
    stop,
    get done() {
      return done;
    },
    /** Ends the boot after it has played, resets the terminal and resolves. Safe to call again. */
    release() {
      released ??= new Promise((resolve) => {
        const finish = () => {
          if (length) drawBar(1);
          stop();
          setTimeout(() => {
            term.reset();
            resolve();
          }, reduced ? 0 : 150);
        };
        setTimeout(finish, Math.max(0, t0 + length - performance.now()));
      });
      return released;
    },
  };

  out('\x1b[?25l\x1b[2J');
  if (!length) {
    out(`${at(2)}\x1b[2mLoading ${name}…\x1b[0m`);
    return boot;
  }
  markSeen();

  // The sequence, timed for the long boot and scaled for a shorter one.
  const k = length / FIRST_MS;
  const mid = Math.ceil(R / 2);
  const crt = (len, sgr) => {
    const s = Math.floor((C - len) / 2) + 1;
    out(`${at(mid, 1)}\x1b[2K${at(mid, s)}\x1b[${sgr}m${'━'.repeat(len)}\x1b[0m`);
  };
  const check = (row, label, value) => {
    const dots = Math.max(2, w - 16 - value.length);
    out(`${at(row)}\x1b[2m${label.padEnd(10)}\x1b[0m${value} \x1b[2m${'.'.repeat(dots)}\x1b[0m \x1b[1;${ok}mok\x1b[0m`);
  };
  const bw = w - 14;
  const drawBar = (p, spin = ' ') => {
    const n = Math.round(Math.min(1, p) * bw);
    out(`${at(9, x + 10)}[\x1b[1m${'█'.repeat(n)}\x1b[0;2m${'░'.repeat(bw - n)}\x1b[0m] ${spin}`);
  };
  const steps = [
    [0, () => crt(2, hot)],
    [150, () => crt(Math.round(C * 0.15), hot)],
    [300, () => crt(Math.round(C * 0.45), warm)],
    [450, () => crt(C, warm)],
    [650, () => crt(Math.round(C * 0.7), '2')],
    [800, () => {
      out(`${at(mid, 1)}\x1b[2K`);
      const left = ' ncurses 6.6 ';
      const right = `tty ${C}×${R} `;
      out(`${at(2)}\x1b[7m${left}${' '.repeat(Math.max(1, w - left.length - right.length))}${right}\x1b[0m`);
    }],
    [1100, () => check(4, 'terminfo', 'xterm-256color')],
    [1400, () => check(5, 'colors', '256 colors')],
    [1700, () => check(6, 'keys', 'ESCDELAY=25ms')],
    [2000, () => out(`${at(8)}\x1b[2m${'program'.padEnd(10)}\x1b[0m\x1b[1m${`${name}.wasm`.slice(0, w - 10)}\x1b[0m`)],
  ].map(([t, f]) => [t * k, f]);
  const historyRow = R >= 16 ? Math.min(12, R - 3) : 0;
  let next = 0;
  let frame = 0;
  let shown = -1;
  const tick = () => {
    const t = performance.now() - t0;
    while (next < steps.length && steps[next][0] <= t) steps[next++][1]();
    if (t < 2000 * k) return;
    drawBar(barFill(t, length), '|/-\\'[frame++ % 4]);
    // History only where there is time to read it: the long boot, or a slow load.
    if (historyRow && t >= 2300 && (length === FIRST_MS || t > length)) {
      const i = Math.floor((t - 2300) / 1200) % HISTORY.length;
      if (i !== shown) {
        shown = i;
        out(`${at(historyRow)}\x1b[2K${at(historyRow)}\x1b[2;3m${HISTORY[i].slice(0, w)}\x1b[0m`);
      }
    }
  };
  tick();
  timer = setInterval(tick, 50);
  return boot;
}
