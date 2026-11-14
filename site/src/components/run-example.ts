/**
 * Turns each `.run-example` placeholder into a "Run this example" button. A click loads the
 * example's WebAssembly build (public/examples/<id>.mjs, from scripts/build-examples.mjs) and
 * runs it in an xterm.js terminal: keys go to the program's stdin, its output to the screen.
 */
import { Terminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';

const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const COLS = 80;
const ROWS = 24;

type Pty = { write: (bytes: Uint8Array) => void; push: (bytes: Uint8Array) => void };

async function available(id: string): Promise<boolean> {
  try {
    return (await fetch(`${base}/examples/${id}.wasm`, { method: 'HEAD' })).ok;
  } catch {
    return false;
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

for (const box of document.querySelectorAll<HTMLElement>('.run-example')) {
  void available(box.dataset.example!).then((ok) => ok && setup(box));
}
