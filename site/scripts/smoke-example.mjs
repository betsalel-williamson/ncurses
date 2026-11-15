#!/usr/bin/env node
/**
 * Run one built example (public/examples/<id>.mjs) in Node on a fake 80x24 xterm, the way the
 * page runs it, and report whether it works: it must draw something, keep running until a key
 * comes, and exit with status 0 when it gets F1, pressed up to three times (every guide example
 * quits on F1). A program reading a line (getstr) ignores F1, so it gets Enter, then F1 again.
 * A program that turned on mouse tracking and is still running gets a left click on the word
 * Exit, found on a rough model of the 80x24 screen, so a menu that ends on a click ends.
 * Prints one JSON line: { status: "runs" | "crashed" | "no-quit" | "no-output", detail }.
 * Usage: node smoke-example.mjs <path to .mjs> [program arguments]
 */
import { pathToFileURL } from 'node:url';

const F1 = new TextEncoder().encode('\x1bOP');
const report = (status, detail = '') => {
  console.log(JSON.stringify({ status, detail }));
  process.exit(0);
};

// exit() ends the program by throwing ExitStatus out of the resumed stack; that's a normal end.
const isExit = (e) => e?.name === 'ExitStatus';
process.on('uncaughtException', (e) => isExit(e) || report('crashed', String(e?.message ?? e).slice(0, 200)));
process.on('unhandledRejection', (e) => isExit(e) || report('crashed', String(e?.message ?? e).slice(0, 200)));

let output = 0;
let mouse = '';
// A rough 80x24 screen: cursor moves, line feeds and text, enough to find a word on it.
const screen = Array.from({ length: 24 }, () => Array(80).fill(' '));
let row = 0;
let col = 0;
const draw = (text) => {
  const re = /\x1b\[([0-9;?]*)([@-~])|\x1b[()][0-9A-Za-z]|\x1b[=>78]|([\r\n\b])|([^\x1b\r\n\b])/g;
  for (const m of text.matchAll(re)) {
    if (m[2]) {
      const [a = 0, b = 0] = m[1].split(';').map((n) => parseInt(n, 10) || 0);
      if (m[2] === 'H') [row, col] = [Math.max(a, 1) - 1, Math.max(b, 1) - 1];
      else if (m[2] === 'J' && a === 2) screen.forEach((r) => r.fill(' '));
      else if (m[2] === 'C') col += a || 1;
      else if (m[2] === 'D') col -= a || 1;
      else if (m[2] === 'A') row -= a || 1;
      else if (m[2] === 'B') row += a || 1;
      else if (m[2] === 'G') col = Math.max(a, 1) - 1;
      else if (m[2] === 'd') row = Math.max(a, 1) - 1;
    } else if (m[3] === '\r') col = 0;
    else if (m[3] === '\n') row = Math.min(row + 1, 23);
    else if (m[3] === '\b') col = Math.max(col - 1, 0);
    else if (m[4] && row >= 0 && row < 24 && col >= 0 && col < 80) screen[row][col++] = m[4];
  }
};
let exited = null;
const { default: create } = await import(pathToFileURL(process.argv[2]).href);
setTimeout(() => report('no-quit', 'still running after the backstop'), 15000);
let pty;
create({
  arguments: process.argv.slice(3),
  preRun: [
    (m) => {
      Object.assign(m.ENV, { TERM: 'xterm-256color', ESCDELAY: '25' });
      pty = m.pty;
      pty.write = (bytes) => {
        output += bytes.length;
        draw(new TextDecoder().decode(bytes));
        // Remember the mouse mode the program turned on: 1006 is SGR reports, 1000 is X10.
        const m = /\x1b\[\?(1006;)?1000h/.exec(String.fromCharCode(...bytes));
        if (m) mouse = m[1] ? 'sgr' : 'x10';
      };
    },
  ],
  print: () => {},
  printErr: () => {},
  quit: (code, toThrow) => {
    exited = code;
    throw toThrow;
  },
  onExit: (code) => {
    exited = code;
  },
  onAbort: (what) => report('crashed', String(what).slice(0, 200)),
}).catch((e) => isExit(e) || report('crashed', String(e?.message ?? e).slice(0, 200)));

await new Promise((r) => setTimeout(r, 2000));
if (exited !== null) report('crashed', `exited (${exited}) before any key was pressed`);
if (!output) report('no-output', 'drew nothing in 2 s');
// Some programs wait for one key before their main loop (initialization.md shows the key it
// read, then waits again), so press F1 up to three times, a second apart.
for (let press = 0; press < 3 && exited === null; press++) {
  pty.push(F1);
  for (let i = 0; i < 10 && exited === null; i++) await new Promise((r) => setTimeout(r, 100));
}
for (let i = 0; i < 10 && exited === null; i++) await new Promise((r) => setTimeout(r, 100));
// getstr() and friends discard function keys until a line ends.
for (const keys of [new TextEncoder().encode('\r'), F1]) {
  if (exited !== null) break;
  pty.push(keys);
  for (let i = 0; i < 10 && exited === null; i++) await new Promise((r) => setTimeout(r, 100));
}
if (exited === null && mouse) {
  const y = screen.findIndex((r) => r.join('').includes('Exit'));
  if (y >= 0) {
    const x = screen[y].join('').indexOf('Exit');
    const click =
      mouse === 'sgr'
        ? `\x1b[<0;${x + 1};${y + 1}M\x1b[<0;${x + 1};${y + 1}m`
        : `\x1b[M ${String.fromCharCode(33 + x, 33 + y)}\x1b[M#${String.fromCharCode(33 + x, 33 + y)}`;
    pty.push(new TextEncoder().encode(click));
    for (let i = 0; i < 20 && exited === null; i++) await new Promise((r) => setTimeout(r, 100));
  }
}
const tried = `F1 three times, then Enter and F1${mouse ? ', then a click on Exit' : ''}`;
if (exited === null) report('no-quit', `still running after ${tried}`);
report(exited === 0 ? 'runs' : 'crashed', exited === 0 ? '' : `exited (${exited}) after F1`);
