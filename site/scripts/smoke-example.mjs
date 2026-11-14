#!/usr/bin/env node
/**
 * Run one built example (public/examples/<id>.mjs) in Node on a fake 80x24 xterm, the way the
 * page runs it, and report whether it works: it must draw something, keep running until a key
 * comes, and exit with status 0 when it gets F1 (every guide example quits on F1).
 * Prints one JSON line: { status: "runs" | "crashed" | "no-quit" | "no-output", detail }.
 * Usage: node smoke-example.mjs <path to .mjs>
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
let exited = null;
const { default: create } = await import(pathToFileURL(process.argv[2]).href);
setTimeout(() => report('no-quit', 'still running 4 s after F1'), 6000);
let pty;
create({
  preRun: [
    (m) => {
      Object.assign(m.ENV, { TERM: 'xterm-256color', LINES: '24', COLUMNS: '80', ESCDELAY: '25' });
      pty = m.pty;
      pty.write = (bytes) => (output += bytes.length);
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
pty.push(F1);
for (let i = 0; i < 40 && exited === null; i++) await new Promise((r) => setTimeout(r, 100));
if (exited === null) report('no-quit', 'still running 4 s after F1');
report(exited === 0 ? 'runs' : 'crashed', exited === 0 ? '' : `exited (${exited}) after F1`);
