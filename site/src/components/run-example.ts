/**
 * Turns each `.run-example` placeholder into a "Run this example" button. A click loads the
 * example's WebAssembly build (public/examples/<id>.mjs, from scripts/build-examples.mjs) and
 * runs it in an xterm.js terminal: keys go to the program's stdin, its output to the screen.
 */
import { Terminal, type ITheme } from '@xterm/xterm';
import { WebglAddon } from '@xterm/addon-webgl';
import '@xterm/xterm/css/xterm.css';
import { FULL_SIZE, STEP, fitFontSize, keySequence, offersFullSize, overflows } from './terminal-fit.js';
import { bootScreen } from './boot-screen.js';

const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const FONT_SIZE = FULL_SIZE;
/** The reader's Fit to width choice, kept in their browser. */
const FIT_KEY = 'nc-terminal-fit';
const fitPreferred = () => {
  try {
    return localStorage.getItem(FIT_KEY) !== 'off';
  } catch {
    return true;
  }
};
const preferFit = (on: boolean) => {
  try {
    localStorage.setItem(FIT_KEY, on ? 'on' : 'off');
  } catch {
    // no storage: the choice lasts until the page is left
  }
};
/** A touch screen, where there is no keyboard to press an arrow key on. */
const touch = () => matchMedia('(hover: none) and (pointer: coarse)').matches;

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
type Variant = { define: string; id: string; bytes?: number };

/** One program's build result, from public/examples/status.json (build-examples.mjs). */
type Status = { id: string; status: string; detail?: string; variants?: Variant[]; args?: string[]; bytes?: number; shell?: boolean };

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

/**
 * The keys for a running program, after the Run button: F1 Quit for every program, on every
 * device (on most laptops F1 is a brightness key unless Fn is held), and the arrows and Page
 * Up/Down on touch screens for a program that reads them (sync.mjs's data-keys). A tap sends the
 * key down the path a real key press takes, and leaves focus in the terminal.
 */
function keyGroup(wanted: string[], send: (key: string) => void) {
  const group = document.createElement('div');
  group.className = 'run-example-keys';
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', 'Keys for the running program');
  group.hidden = true;
  const key = (k: string, label: string, html: string, cls = '') => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `nc-key ${cls}`.trim();
    b.dataset.key = k;
    b.setAttribute('aria-label', label);
    b.innerHTML = html;
    return b;
  };
  group.append(key('F1', 'F1 Quit', '<kbd>F1</kbd>Quit'));
  if (touch()) {
    if (wanted.includes('arrows'))
      for (const [k, label, glyph] of [['Left', 'Left arrow', '←'], ['Up', 'Up arrow', '↑'], ['Down', 'Down arrow', '↓'], ['Right', 'Right arrow', '→']])
        group.append(key(k, label, glyph, 'is-arrow'));
    if (wanted.includes('pages'))
      group.append(key('PageUp', 'Page Up', '<kbd>PgUp</kbd>'), key('PageDown', 'Page Down', '<kbd>PgDn</kbd>'));
  }
  // A pointer press sends at once and keeps focus where it was (the terminal, with the phone's
  // keyboard as it was). An arrow repeats while held, after 400ms, as a real key does.
  let repeat: number | undefined;
  const stop = () => {
    clearTimeout(repeat);
    clearInterval(repeat);
    repeat = undefined;
  };
  group.addEventListener('pointerdown', (e) => {
    const b = (e.target as Element).closest<HTMLButtonElement>('button');
    e.preventDefault();
    if (!b) return;
    send(b.dataset.key!);
    if (b.classList.contains('is-arrow')) repeat = window.setTimeout(() => (repeat = window.setInterval(() => send(b.dataset.key!), 60)), 400);
  });
  for (const type of ['pointerup', 'pointercancel', 'pointerleave']) group.addEventListener(type, stop);
  // Enter or Space on a focused key (a keyboard user can Tab to them); a pointer has already sent.
  group.addEventListener('click', (e) => {
    const b = (e.target as Element).closest<HTMLButtonElement>('button');
    if (b && e.detail === 0) send(b.dataset.key!);
  });
  return { group, stop };
}

function setup(box: HTMLElement, variants: Variant[], args: string[], bytes?: number, shell = false) {
  const id = box.dataset.example!;
  const title = box.dataset.title ?? id;
  const wantedKeys = (box.dataset.keys ?? '').split(/\s+/).filter(Boolean);
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
  // Fit to width: shown only when fitting the terminal takes its text below 9px (on a phone),
  // pressed unless the reader turned it off. Off, the terminal keeps full size and scrolls.
  const fitToggle = document.createElement('button');
  fitToggle.type = 'button';
  fitToggle.className = 'nc-key run-example-fit';
  fitToggle.textContent = 'Fit to width';
  fitToggle.hidden = true;
  fitToggle.setAttribute('aria-pressed', String(fitPreferred()));
  const note = document.createElement('span');
  note.className = 'run-example-note';
  note.textContent =
    'Runs the listing above, compiled to WebAssembly. Press F1 or tap F1 Quit to quit. Shift+Run boots verbosely.' +
    (shell ? ' A web page has no shell, so a pretend one answers system(): type help to see what it knows, and exit to go back.' : '');
  const keys = keyGroup(wantedKeys, (k) => {
    if (!term || !running) return;
    term.input(keySequence(k, term.modes.applicationCursorKeysMode), true);
  });
  bar.append(main, keys.group, ...extra.map((x) => x.b), sizeLabel, fitToggle, note);
  const screen = document.createElement('div');
  screen.className = 'run-example-screen not-content';
  // The frame wraps the whole terminal. When the terminal is wider than the column, the frame
  // runs past the edge too, and its scroller lets the reader drag to see the rest.
  const scroller = document.createElement('div');
  scroller.className = 'run-example-scroller not-content';
  scroller.append(screen);
  // The terminal stands blank under the listing before the first run, with its controls below it.
  box.append(scroller, bar);

  const chosen = () => SIZES[size.selectedIndex];
  let term: Terminal | null = null;
  let pty: Pty | null = null;
  let running = false;

  // A terminal wider than the column (80x24 on a phone, 100x30 on a laptop) shrinks until every
  // column fits, so the reader sees the whole screen without scrolling it, unless they turned Fit
  // to width off. It sets xterm.js's font size rather than scaling the canvas, so the text is
  // drawn sharp at the new size and taps still land on the right cell. Columns and rows don't
  // change, so the program gets no resize.
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
    if (term.options.fontSize !== FONT_SIZE) term.options.fontSize = FONT_SIZE;
    const cell = width() / term.cols;
    if (!overflows(avail, term.cols, cell)) {
      fitToggle.hidden = true;
      return;
    }
    fitToggle.hidden = !offersFullSize(avail, term.cols, cell);
    if (!fitToggle.hidden && fitToggle.getAttribute('aria-pressed') !== 'true') return;
    // The size the cell width predicts, then quarter-pixel steps down until the screen fits
    // (xterm.js rounds each cell to a whole device pixel).
    let fontPx = fitFontSize(avail, term.cols, cell);
    term.options.fontSize = fontPx;
    while (width() > avail && fontPx > STEP) term.options.fontSize = fontPx -= STEP;
  };
  // Once per frame at most: each font change rebuilds the WebGL renderer's glyphs.
  let fitFrame = 0;
  const fitSoon = () => {
    cancelAnimationFrame(fitFrame);
    fitFrame = requestAnimationFrame(fit);
  };
  fitToggle.addEventListener('click', () => {
    const on = fitToggle.getAttribute('aria-pressed') !== 'true';
    fitToggle.setAttribute('aria-pressed', String(on));
    preferFit(on);
    fit();
  });

  // A new size applies at once: the terminal changes, and a running program gets SIGWINCH and
  // sees KEY_RESIZE, as it would when a real terminal window is resized.
  size.addEventListener('change', () => {
    const [cols, rows] = chosen();
    if (!term) return;
    term.resize(cols, rows);
    fit();
    if (running) pty?.resize(rows, cols);
  });

  const open = () => {
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
        // A style draws a different frame, so the room for the terminal changes.
        fitSoon();
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
      // Rotation, a resized window, the sidebar opening and late fonts all change the scroller's
      // width. Its height changes with every fit, so only a new width fits again.
      let observedWidth = -1;
      new ResizeObserver(([entry]) => {
        const w = entry.contentRect.width;
        if (w === observedWidth) return;
        observedWidth = w;
        fitSoon();
      }).observe(scroller);
    } else {
      term.resize(cols, rows);
    }
    fit();
    term.reset();
    return term;
  };
  // Blank, with no cursor, until the reader runs it.
  open().write('\x1b[?25l');

  const run = async (example: string, label: string, clicked: HTMLButtonElement, size?: number, verbose = false) => {
    if (running) return;
    running = true;
    for (const b of [main, ...extra.map((x) => x.b)]) b.disabled = true;
    const term = open();
    term.focus();
    // A boot screen plays while the program loads; its output waits until it has (boot-screen.js).
    // A key typed during it may start an easter egg (r, Esc); any other key waits for the program.
    const boot = bootScreen(term, example, { verbose });
    scroller.setAttribute('aria-busy', 'true');
    let shown: Promise<void> | null = null;
    const show = (bytes: Uint8Array) => {
      shown ??= boot.release().then(() => scroller.removeAttribute('aria-busy'));
      void shown.then(() => term!.write(keepScreen(bytes)));
    };
    keys.group.hidden = false;
    const encoder = new TextEncoder();
    pty = null;
    const input = term.onData((d) => {
      if (!boot.done && boot.key(d)) return;
      pty?.push(encoder.encode(d));
    });
    const done = (message: string) => {
      // A program that ends before it draws (an error while loading) ends the boot screen too.
      if (!shown) {
        boot.stop();
        term!.reset();
        scroller.removeAttribute('aria-busy');
      }
      input.dispose();
      pty = null;
      // After the program's last screen, which may still be waiting on the boot screen.
      // On the bottom row when it is empty: endwin() leaves the cursor there, and a new line would
      // scroll the program's last screen up.
      const note = () => {
        const t = term!;
        const buf = t.buffer.active;
        const last = buf.getLine(buf.baseY + t.rows - 1)?.translateToString(true).trim();
        t.write(last ? `\r\n\x1b[2m${message}\x1b[0m\r\n` : `\x1b[${t.rows};1H\x1b[2m${message}\x1b[0m`);
      };
      if (shown) void shown.then(note);
      else note();
      running = false;
      keys.stop();
      const hadFocus = keys.group.contains(document.activeElement);
      keys.group.hidden = true;
      for (const b of [main, ...extra.map((x) => x.b)]) b.disabled = false;
      if (clicked === main) main.textContent = '↻ Run again';
      if (hadFocus) clicked.focus();
    };
    try {
      const [{ default: create }, wasmBinary] = await Promise.all([
        import(/* @vite-ignore */ `${base}/examples/${example}.mjs`),
        download(`${base}/examples/${example}.wasm`, size, (f) => boot.progress(f)),
      ]);
      await create({
        // This Emscripten build fetches its .wasm itself and ignores wasmBinary, so the bytes
        // downloaded above (for the boot screen's bar) are handed over here instead.
        instantiateWasm: (
          imports: WebAssembly.Imports,
          receive: (instance: WebAssembly.Instance, module: WebAssembly.Module) => void,
        ) => {
          WebAssembly.instantiate(wasmBinary, imports).then(
            (r) => receive(r.instance, r.module),
            (e: Error) => done(`Could not start ${label}: ${e.message}`),
          );
          return {};
        },
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
            pty.write = show;
          },
        ],
        onExit: (code: number) => done(`${label} exited (${code}).`),
        onAbort: () => done(`${label} stopped with an error.`),
      });
    } catch (e) {
      done(`Could not start ${label}: ${(e as Error).message}`);
    }
  };

  main.addEventListener('click', (e) => run(id, title, main, bytes, e.shiftKey));
  for (const { v, b } of extra) {
    b.addEventListener('click', (e) => run(v.id, `${title} (${v.define} defined)`, b, v.bytes, e.shiftKey));
  }
}

// exit() ends a program by throwing ExitStatus out of the resumed Asyncify stack; it is the
// normal end of a run, and onExit has already reported it.
window.addEventListener('error', (e) => {
  if ((e.error as { name?: string } | null)?.name === 'ExitStatus') e.preventDefault();
});

/**
 * Downloads a program's WebAssembly, reporting the fraction that has arrived so the boot screen's
 * bar can follow it. `size` is the file's length from status.json: the server may compress it, so
 * the response's own length can't be used. Without a size, or a body to read in pieces, it reports
 * nothing and the bar keeps its own pace.
 */
async function download(url: string, size: number | undefined, progress: (fraction: number) => void): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url.split('/').pop()}`);
  if (!size || !res.body) return res.arrayBuffer();
  const reader = res.body.getReader();
  const parts: Uint8Array[] = [];
  let at = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    parts.push(value);
    at += value.length;
    progress(Math.min(1, at / size));
  }
  progress(1);
  const all = new Uint8Array(at);
  let k = 0;
  for (const p of parts) {
    all.set(p, k);
    k += p.length;
  }
  return all.buffer;
}

/**
 * Drops the "leave the alternate screen" sequence (rmcup, CSI ?1049 l) from a program's output.
 * endwin() sends it, and xterm.js would then switch back to the empty normal screen, so whatever
 * the program printed last, such as a choice it reports just before it ends, would vanish with
 * it. A real terminal shows the shell there; this page keeps the program's last screen in view
 * instead. A program that shells out gets the pretend shell (examples/pty.js), which leaves the
 * alternate screen itself with CSI ?1047 l.
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
      if (s?.status === 'runs') setup(box, s.variants ?? [], s.args ?? [], s.bytes, s.shell);
      else if (s) flag(box, `This program doesn't run in the browser yet: it ${REASONS[s.status] ?? s.status}.`, s.detail);
      else flag(box, 'This program has no browser build in this copy of the site.');
    }
  });
}
