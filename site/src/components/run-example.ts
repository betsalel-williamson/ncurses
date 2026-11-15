/**
 * Turns each `.run-example` placeholder into a "Run this example" button. A click loads the
 * example's WebAssembly build (public/examples/<id>.mjs, from scripts/build-examples.mjs) and
 * runs it in an xterm.js terminal: keys go to the program's stdin, its output to the screen.
 */
import { Terminal, type ITheme } from '@xterm/xterm';
import { WebglAddon } from '@xterm/addon-webgl';
import '@xterm/xterm/css/xterm.css';

const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const FONT_SIZE = 16;

// The terminal's colors follow the reader's style: styles.css defines --nc-term-* and the 16
// --nc-ansi-* colors for each style but Modern, which keeps xterm.js's own palette.
const ANSI = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'] as const;
const terminalTheme = (): ITheme => {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string) => css.getPropertyValue(name).trim() || undefined;
  const background = v('--nc-term-bg');
  if (!background) return { background: '#1e1e1e', black: '#1e1e1e' };
  const theme: Record<string, string | undefined> = {
    background,
    foreground: v('--nc-term-fg'),
    cursor: v('--nc-term-cursor'),
    cursorAccent: background,
  };
  ANSI.forEach((name, i) => {
    theme[name] = v(`--nc-ansi-${i}`);
    theme[`bright${name[0].toUpperCase()}${name.slice(1)}`] = v(`--nc-ansi-${i + 8}`);
  });
  return theme as ITheme;
};
// The cursor's default shape, until the program sets its own: the BIOS underline in Text mode
// (--nc-term-cursor-style in styles.css), a block elsewhere.
const cursorStyle = (): 'block' | 'underline' | 'bar' => {
  const v = getComputedStyle(document.documentElement).getPropertyValue('--nc-term-cursor-style').trim();
  return v === 'underline' || v === 'bar' ? v : 'block';
};
/** Terminal sizes a reader can pick, columns by rows. The first is the default. */
const SIZES: [number, number][] = [[80, 24], [100, 30], [60, 20]];

type Pty = {
  write: (bytes: Uint8Array) => void;
  push: (bytes: Uint8Array) => void;
  resize: (rows: number, cols: number) => void;
  rows: number;
  cols: number;
};

/** A second build of a listing with one of its own macros defined (build-examples.mjs). */
type Variant = { define: string; id: string };

/** One program's build result, from public/examples/status.json (build-examples.mjs). */
type Status = { id: string; status: string; detail?: string; variants?: Variant[]; args?: string[] };

const REASONS: Record<string, string> = {
  'compile-error': "doesn't compile",
  'link-error': "doesn't link",
  crashed: 'stops with an error when run',
  'no-quit': "doesn't quit on F1",
  'no-output': 'draws nothing when run',
  'needs-shell': 'starts a shell with system(), and a web page has no shell',
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

function setup(box: HTMLElement, variants: Variant[], args: string[]) {
  const id = box.dataset.example!;
  const title = box.dataset.title ?? id;
  box.innerHTML = '';
  const bar = document.createElement('div');
  bar.className = 'run-example-bar';
  const button = (text: string) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = text;
    return b;
  };
  const main = button('▶ Run this example');
  const extra = variants.map((v) => ({ v, b: button(`▶ Run with ${v.define} defined`) }));
  const sizeLabel = document.createElement('label');
  sizeLabel.className = 'run-example-size';
  sizeLabel.textContent = 'Terminal ';
  const size = document.createElement('select');
  for (const [c, r] of SIZES) size.add(new Option(`${c}×${r}`, `${c}x${r}`));
  sizeLabel.append(size);
  const note = document.createElement('span');
  note.className = 'run-example-note';
  note.textContent = 'Runs the listing above, compiled to WebAssembly. Press F1 to quit.';
  bar.append(main, ...extra.map((x) => x.b), sizeLabel, note);
  const screen = document.createElement('div');
  screen.className = 'run-example-screen not-content';
  // The frame wraps the whole terminal. When the terminal is wider than the column, the frame
  // runs past the edge too, and its scroller lets the reader drag to see the rest.
  const scroller = document.createElement('div');
  scroller.className = 'run-example-scroller not-content';
  scroller.hidden = true;
  scroller.append(screen);
  box.append(bar, scroller);

  const chosen = () => SIZES[size.selectedIndex];
  let term: Terminal | null = null;
  let pty: Pty | null = null;
  let running = false;

  // A wide terminal is wider than the content column. Shrink the font until every column
  // fits, down to 9px, then scroll.
  const fit = () => {
    if (!term) return;
    const px = (el: Element, ...keys: ('paddingLeft' | 'paddingRight' | 'borderLeftWidth' | 'borderRightWidth')[]) => {
      const style = getComputedStyle(el);
      return keys.reduce((n, k) => n + (parseFloat(style[k]) || 0), 0);
    };
    const avail =
      scroller.clientWidth -
      px(scroller, 'paddingLeft', 'paddingRight') -
      px(screen, 'paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth');
    const width = () => screen.querySelector('.xterm-screen')?.getBoundingClientRect().width ?? 0;
    let fontPx = FONT_SIZE;
    term.options.fontSize = fontPx;
    while (width() > avail && fontPx > 9) term.options.fontSize = fontPx -= 0.5;
  };

  // A new size applies at once: the terminal changes, and a running program gets SIGWINCH and
  // sees KEY_RESIZE, as it would when a real terminal window is resized.
  size.addEventListener('change', () => {
    const [cols, rows] = chosen();
    if (!term) return;
    term.resize(cols, rows);
    fit();
    if (running) pty?.resize(rows, cols);
  });

  const run = async (example: string, label: string, clicked: HTMLButtonElement) => {
    if (running) return;
    running = true;
    for (const b of [main, ...extra.map((x) => x.b)]) b.disabled = true;
    scroller.hidden = false;
    const [cols, rows] = chosen();
    if (!term) {
      term = new Terminal({
        cols,
        rows,
        cursorBlink: true,
        cursorStyle: cursorStyle(),
        fontSize: FONT_SIZE,
        theme: terminalTheme(),
      });
      term.open(screen);
      const restyle = term;
      new MutationObserver(() => {
        restyle.options.theme = terminalTheme();
        restyle.options.cursorStyle = cursorStyle();
      }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-style'] });
      // On the alternate screen xterm.js turns the wheel into arrow keys, which a curses program
      // reads as input (getstr() echoed them as ^[[A) while the page scrolls too. Leave the wheel
      // to the page, unless the program turned on mouse tracking and asked for wheel reports
      // (BUTTON4/BUTTON5): then the terminal takes it and the page stays put.
      const t = term;
      t.attachCustomWheelEventHandler((event) => {
        if (t.modes.mouseTrackingMode === 'none') return false;
        event.preventDefault();
        return true;
      });
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
      window.addEventListener('resize', fit);
    } else {
      term.resize(cols, rows);
    }
    fit();
    term.reset();
    term.focus();
    const encoder = new TextEncoder();
    pty = null;
    const input = term.onData((d) => pty?.push(encoder.encode(d)));
    const done = (message: string) => {
      input.dispose();
      pty = null;
      term!.write(`\r\n\x1b[2m${message}\x1b[0m\r\n`);
      running = false;
      for (const b of [main, ...extra.map((x) => x.b)]) b.disabled = false;
      if (clicked === main) main.textContent = '↻ Run again';
    };
    try {
      const { default: create } = await import(/* @vite-ignore */ `${base}/examples/${example}.mjs`);
      await create({
        locateFile: (f: string) => `${base}/examples/${f}`,
        // A program that reads a file gets its own listing, embedded in the build as example.c.
        arguments: args,
        preRun: [
          (m: { ENV: Record<string, string>; pty: Pty }) => {
            m.ENV.TERM = 'xterm-256color';
            m.ENV.ESCDELAY = '25';
            pty = m.pty;
            // The program asks the terminal for its size (TIOCGWINSZ), so a resize can change it.
            [pty.cols, pty.rows] = chosen();
            pty.write = (bytes) => term!.write(keepScreen(bytes));
          },
        ],
        onExit: (code: number) => done(`${label} exited (${code}).`),
        onAbort: () => done(`${label} stopped with an error.`),
      });
    } catch (e) {
      done(`Could not start ${label}: ${(e as Error).message}`);
    }
  };

  main.addEventListener('click', () => run(id, title, main));
  for (const { v, b } of extra) b.addEventListener('click', () => run(v.id, `${title} (${v.define} defined)`, b));
}

// exit() ends a program by throwing ExitStatus out of the resumed Asyncify stack; it is the
// normal end of a run, and onExit has already reported it.
window.addEventListener('error', (e) => {
  if ((e.error as { name?: string } | null)?.name === 'ExitStatus') e.preventDefault();
});

/**
 * Drops the "leave the alternate screen" sequence (rmcup, CSI ?1049 l) from a program's output.
 * endwin() sends it, and xterm.js would then switch back to the empty normal screen, so whatever
 * the program printed last, such as a choice it reports just before it ends, would vanish with
 * it. A real terminal shows the shell there; this page has no shell, so it keeps the program's
 * last screen in view instead.
 */
const RMCUP = [0x1b, 0x5b, 0x3f, 0x31, 0x30, 0x34, 0x39, 0x6c];
function keepScreen(bytes: Uint8Array): Uint8Array {
  const out: number[] = [];
  for (let i = 0; i < bytes.length; i++) {
    if (RMCUP.every((b, k) => bytes[i + k] === b)) i += RMCUP.length - 1;
    else out.push(bytes[i]);
  }
  return out.length === bytes.length ? bytes : Uint8Array.from(out);
}

const boxes = document.querySelectorAll<HTMLElement>('.run-example');
if (boxes.length) {
  void statuses().then((all) => {
    for (const box of boxes) {
      const s = all?.get(box.dataset.example!);
      if (s?.status === 'runs') setup(box, s.variants ?? [], s.args ?? []);
      else if (s) flag(box, `This program doesn't run in the browser${s.status === 'needs-shell' ? '' : ' yet'}: it ${REASONS[s.status] ?? s.status}.`, s.detail);
      else flag(box, 'This program has no browser build in this copy of the site.');
    }
  });
}
