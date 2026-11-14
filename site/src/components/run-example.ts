/**
 * Turns each `.run-example` placeholder into a "Run this example" button. A click loads the
 * example's WebAssembly build (public/examples/<id>.mjs, from scripts/build-examples.mjs) and
 * runs it in an xterm.js terminal: keys go to the program's stdin, its output to the screen.
 */
import { Terminal } from '@xterm/xterm';
import { WebglAddon } from '@xterm/addon-webgl';
import '@xterm/xterm/css/xterm.css';

const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const COLS = 80;
const ROWS = 24;

type Pty = { write: (bytes: Uint8Array) => void; push: (bytes: Uint8Array) => void };

/** One program's build result, from public/examples/status.json (build-examples.mjs). */
type Status = { id: string; status: string; detail?: string };

const REASONS: Record<string, string> = {
  'compile-error': "doesn't compile",
  'link-error': "doesn't link",
  crashed: 'stops with an error when run',
  'no-quit': "doesn't quit on F1",
  'no-output': 'draws nothing when run',
};

async function statuses(): Promise<Map<string, Status> | null> {
  try {
    const res = await fetch(`${base}/examples/status.json`);
    if (!res.ok) return null;
    return new Map((await res.json() as Status[]).map((s) => [s.id, s]));
  } catch {
    return null;
  }
}

/** A listing that can't run here yet says so, so a missing button isn't a mystery. */
function flag(box: HTMLElement, text: string, detail?: string) {
  box.innerHTML = '';
  const note = document.createElement('p');
  note.className = 'run-example-flag';
  note.textContent = text;
  box.append(note);
  if (detail) {
    const more = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = 'Build log';
    const log = document.createElement('pre');
    log.textContent = detail;
    more.append(summary, log);
    box.append(more);
  }
}

function setup(box: HTMLElement) {
  const id = box.dataset.example!;
  const title = box.dataset.title ?? id;
  box.innerHTML = '';
  const bar = document.createElement('div');
  bar.className = 'run-example-bar';
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = '▶ Run this example';
  const note = document.createElement('span');
  note.className = 'run-example-note';
  note.textContent = 'Runs the listing above, compiled to WebAssembly. Press F1 to quit.';
  bar.append(button, note);
  const screen = document.createElement('div');
  screen.className = 'run-example-screen not-content';
  screen.hidden = true;
  box.append(bar, screen);

  let term: Terminal | null = null;
  let running = false;
  button.addEventListener('click', async () => {
    if (running) return;
    running = true;
    button.disabled = true;
    screen.hidden = false;
    if (!term) {
      term = new Terminal({
        cols: COLS,
        rows: ROWS,
        cursorBlink: true,
        theme: { background: '#1e1e1e', black: '#1e1e1e' },
      });
      term.open(screen);
      // The default DOM renderer blinks a block cursor against the page background, not the
      // cell's own (white on blue in a form field showed as white on black). The WebGL renderer
      // draws the cell as ncurses left it; without WebGL the DOM renderer stays.
      try {
        const webgl = new WebglAddon();
        webgl.onContextLoss(() => webgl.dispose());
        term.loadAddon(webgl);
      } catch {
        // no WebGL: keep the DOM renderer
      }
    }
    term.reset();
    term.focus();
    const encoder = new TextEncoder();
    let pty: Pty | null = null;
    const input = term.onData((d) => pty?.push(encoder.encode(d)));
    const done = (message: string) => {
      input.dispose();
      term!.write(`\r\n\x1b[2m${message}\x1b[0m\r\n`);
      running = false;
      button.disabled = false;
      button.textContent = '↻ Run again';
    };
    try {
      const { default: create } = await import(/* @vite-ignore */ `${base}/examples/${id}.mjs`);
      await create({
        locateFile: (f: string) => `${base}/examples/${f}`,
        preRun: [
          (m: { ENV: Record<string, string>; pty: Pty }) => {
            m.ENV.TERM = 'xterm-256color';
            m.ENV.LINES = String(ROWS);
            m.ENV.COLUMNS = String(COLS);
            m.ENV.ESCDELAY = '25';
            pty = m.pty;
            pty.write = (bytes) => term!.write(bytes);
          },
        ],
        onExit: (code: number) => done(`${title} exited (${code}).`),
        onAbort: () => done(`${title} stopped with an error.`),
      });
    } catch (e) {
      done(`Could not start ${title}: ${(e as Error).message}`);
    }
  });
}

// exit() ends a program by throwing ExitStatus out of the resumed Asyncify stack; it is the
// normal end of a run, and onExit has already reported it.
window.addEventListener('error', (e) => {
  if ((e.error as { name?: string } | null)?.name === 'ExitStatus') e.preventDefault();
});

const boxes = document.querySelectorAll<HTMLElement>('.run-example');
if (boxes.length) {
  void statuses().then((all) => {
    for (const box of boxes) {
      const s = all?.get(box.dataset.example!);
      if (s?.status === 'runs') setup(box);
      else if (s) flag(box, `This program doesn't run in the browser yet: it ${REASONS[s.status] ?? s.status}.`, s.detail);
      else flag(box, 'This program has no browser build in this copy of the site.');
    }
  });
}
