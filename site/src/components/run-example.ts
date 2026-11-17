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
import { HALT, HELP, SHELL_NAMES, createShell } from './page-shell.js';

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
type Status = { id: string; status: string; detail?: string; variants?: Variant[]; args?: string[]; bytes?: number; shell?: boolean; hidden?: boolean; shard?: string };

/** A program the site has built, which the shell can run by name: each example, and each variant. */
/** `dir` is the guide's folder in the shell's home directory (menus), from its shard's path. */
type Program = { args: string[]; bytes?: number; hidden?: boolean; dir?: string };

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

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

function setup(box: HTMLElement, variants: Variant[], programs: Map<string, Program>, shell = false) {
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
    ' When it ends, a pretend shell takes over: the examples sit in a folder per guide, which ls and cd find, ./name runs one, and halt powers the terminal off.' +
    (shell ? ' This program calls system(), which gets the same shell: type exit there to go back to it.' : '');
  const keys = keyGroup(wantedKeys, (k) => {
    if (!term || !frames.at(-1)?.pty) return;
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
  // What has the keys, the last on top: the shell the terminal comes back to, a program started
  // from it, and the shell that program's system() starts, which can start another. A program's
  // frame has its pty once it is loaded.
  type Frame = { sink: (data: string) => void; pty?: Pty | null; game?: boolean };
  const frames: Frame[] = [];

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
    // Every program learns the new size; one waiting under a shell sees it when it resumes.
    for (const f of frames) f.pty?.resize(rows, cols);
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
      term.onData((d) => frames.at(-1)?.sink(d));
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

  // The terminal is off until the first Run, which boots it and runs the program. When the
  // program ends, the pretend shell (page-shell.js) takes over: Run again types the program's
  // name at its prompt, any program the site has built runs by name, and halt powers it off.
  let powered = false;
  // Each power-on is a generation; a program or shell from an earlier one does nothing more.
  let generation = 0;
  let halted: Promise<typeof HALT> = new Promise(() => {});
  let fireHalt = () => {};
  let top: ReturnType<typeof createShell> | null = null;
  let typing = false;
  const buttons = [main, ...extra.map((x) => x.b)];
  const encoder = new TextEncoder();
  const never = <T,>() => new Promise<T>(() => {});

  /** The keys show while a program has the keyboard; the Run buttons work at the top prompt. */
  const refresh = () => {
    // A game from /usr/games quits on its own key, not F1, so it gets no key row.
    const program = !!frames.length && frames.at(-1)!.pty !== undefined && !frames.at(-1)!.game;
    if (!program) {
      keys.stop();
      const hadFocus = keys.group.contains(document.activeElement);
      keys.group.hidden = true;
      if (hadFocus) term?.focus();
    } else keys.group.hidden = false;
    const idle = !powered || (frames.length === 1 && !typing);
    for (const b of buttons) b.disabled = !idle;
    main.textContent = powered ? '↻ Run again' : '▶ Run this example';
  };

  /** The folder a program sits in, in the shell. */
  const home = (example: string) => `/home/reader/${programs.get(example)?.dir ?? ''}`.replace(/\/$/, '');
  const shellFor = (example = id) =>
    createShell({
      write: (text: string) => term?.write(text),
      programs: () => [...programs].filter(([, p]) => !p.hidden).map(([name, p]) => `${p.dir}/${name}`),
      cwd: home(example),
      games: () => [...programs].filter(([, p]) => p.hidden).map(([name]) => name),
      launch: (name: string, args: string[] = []) => launch(name, name === id ? title : name, false, false, args),
      cols: () => term?.cols ?? 80,
      rows: () => term?.rows ?? 24,
    });

  /** Runs a program; resolves with its exit status, or HALT if the terminal powers off first. */
  const launch = (example: string, label: string, boot = false, verbose = false, typed: string[] = []): Promise<number | typeof HALT> => {
    const gen = generation;
    const live = () => gen === generation;
    const t = term!;
    const program = programs.get(example) ?? { args: [] };
    const exited = new Promise<number>((resolve) => {
      // The first program plays the boot screen while it loads; its output waits until it has
      // (boot-screen.js). A key typed during it may start an easter egg (r, Esc); any other key
      // waits for the program. A program started from the shell shows how much has loaded.
      const booting = boot ? bootScreen(t, example, { verbose }) : null;
      if (booting) scroller.setAttribute('aria-busy', 'true');
      const loading = (f: number) => {
        if (live() && !shown) t.write(`\r\x1b[2K\x1b[2mLoading ${example}… ${Math.round(f * 100)}%\x1b[0m`);
      };
      let shown: Promise<void> | null = null;
      if (!booting) loading(0);
      const show = (bytes: Uint8Array) => {
        if (!live()) return;
        if (!shown) {
          if (booting) shown = booting.release().then(() => scroller.removeAttribute('aria-busy'));
          else {
            t.write('\r\x1b[2K');
            shown = Promise.resolve();
          }
        }
        void shown!.then(() => live() && t.write(keepScreen(bytes)));
      };
      const frame: Frame = {
        pty: null,
        game: program.hidden,
        sink: (d) => {
          if (booting && !booting.done && booting.key(d)) return;
          frame.pty?.push(encoder.encode(d));
        },
      };
      frames.push(frame);
      refresh();
      let ended = false;
      const done = (message: string, code: number) => {
        if (ended || !live()) return;
        ended = true;
        // A program that ends before it draws (an error while loading) ends the loading too.
        if (!shown) {
          if (booting) {
            booting.stop();
            t.reset();
            scroller.removeAttribute('aria-busy');
          } else t.write('\r\x1b[2K');
        }
        frames.splice(frames.indexOf(frame), 1);
        frame.pty = null;
        // After the program's last screen, which may still be waiting on the boot screen. On the
        // bottom row when it is empty: endwin() leaves the cursor there.
        const note = () => {
          if (!live()) return;
          const buf = t.buffer.active;
          const last = buf.getLine(buf.baseY + t.rows - 1)?.translateToString(true).trim();
          t.write(last ? `\r\n\x1b[2m${message}\x1b[0m\r\n` : `\x1b[${t.rows};1H\x1b[2m${message}\x1b[0m\r\n`);
          refresh();
          resolve(code);
        };
        if (shown) void shown.then(note);
        else note();
      };
      void (async () => {
        try {
          const [{ default: create }, wasmBinary] = await Promise.all([
            import(/* @vite-ignore */ `${base}/examples/${example}.mjs`),
            download(`${base}/examples/${example}.wasm`, program.bytes, (f) => (booting ? booting.progress(f) : loading(f))),
          ]);
          if (!live()) return;
          await create({
            // This Emscripten build fetches its .wasm itself and ignores wasmBinary, so the bytes
            // downloaded above (for the progress) are handed over here instead.
            instantiateWasm: (
              imports: WebAssembly.Imports,
              receive: (instance: WebAssembly.Instance, module: WebAssembly.Module) => void,
            ) => {
              WebAssembly.instantiate(wasmBinary, imports).then(
                (r) => receive(r.instance, r.module),
                (e: Error) => done(`Could not start ${label}: ${e.message}`, 1),
              );
              return {};
            },
            locateFile: (f: string) => `${base}/examples/${f}`,
            // A program that reads a file gets its own listing, embedded in the build as example.c;
            // a game gets the arguments typed after its name.
            arguments: program.args.length ? program.args : typed,
            // system() gets this page's shell (examples/pty.js).
            shell: (command: string) => nested(command, gen, example),
            preRun: [
              (m: { ENV: Record<string, string>; pty: Pty }) => {
                m.ENV.TERM = 'xterm-256color';
                m.ENV.ESCDELAY = '25';
                frame.pty = m.pty;
                // The program asks the terminal for its size (TIOCGWINSZ), so a resize can change it.
                [m.pty.cols, m.pty.rows] = chosen();
                m.pty.write = show;
              },
            ],
            onExit: (code: number) => done(`${label} exited (${code}).`, code),
            onAbort: () => done(`${label} stopped with an error.`, 134),
          });
        } catch (e) {
          done(`Could not start ${label}: ${(e as Error).message}`, 1);
        }
      })();
    });
    return Promise.race([exited, halted]);
  };

  /**
   * A program's system(). "sh" (or another shell's name) gets a prompt on the normal screen, the
   * one endwin() returned to, until exit; any other command runs once. Resolves with the exit
   * status. halt powers the terminal off, and the program waiting on it never resumes.
   */
  const nested = async (command: string, gen: number, example: string): Promise<number> => {
    if (gen !== generation || !term) return never();
    const sh = shellFor(example);
    const frame: Frame = { sink: (d) => sh.feed(d) };
    frames.push(frame);
    refresh();
    let r: number | typeof HALT;
    if (SHELL_NAMES.test(command)) {
      // 1047, not 1049, which the page drops so a program's last screen stays in view.
      term.write(`\x1b[?1047l\x1b[?25h${HELP}`);
      r = await Promise.race([sh.session(), halted]);
    } else {
      const x = await Promise.race([sh.run(command), halted]);
      r = typeof x === 'object' ? (x.exit ?? 0) : x;
    }
    if (gen !== generation) return never();
    if (r === HALT) {
      void powerOff();
      return never();
    }
    frames.splice(frames.indexOf(frame), 1);
    refresh();
    return r;
  };

  const powerOn = async (example: string, label: string, verbose: boolean) => {
    const gen = ++generation;
    halted = new Promise((resolve) => (fireHalt = () => resolve(HALT)));
    powered = true;
    frames.length = 0;
    const t = open();
    t.focus();
    const sh = shellFor();
    top = sh;
    frames.push({ sink: (d) => sh.feed(d) });
    const r = await launch(example, label, true, verbose);
    if (gen !== generation || r === HALT) return;
    t.write("\x1b[2mType help for this shell's commands, ls for the programs.\x1b[0m\r\n");
    refresh();
    await Promise.race([sh.session({ top: true }), halted]);
    if (gen === generation) await powerOff();
  };

  /**
   * halt, or exit at the top prompt: a web page can't shut anything down, so the terminal plays a
   * CRT switching off and goes blank, and the next Run boots it again. Programs still running
   * are left where they wait and never resume.
   */
  const powerOff = async (animate = true) => {
    if (!powered || !term) return;
    const t = term;
    powered = false;
    generation++;
    fireHalt();
    frames.length = 0;
    top = null;
    typing = false;
    for (const b of buttons) b.disabled = true;
    keys.stop();
    keys.group.hidden = true;
    const glass = screen.querySelector<HTMLElement>('.xterm-screen');
    if (animate) {
      t.write('\r\x1b[2mPowering off.\x1b[0m\x1b[?25l');
      if (glass && !reducedMotion()) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        await glass.animate(
          [
            { transform: 'scale(1, 1)', filter: 'brightness(1)', opacity: 1 },
            { transform: 'scale(1, 0.006)', filter: 'brightness(3)', opacity: 1, offset: 0.5 },
            { transform: 'scale(0.002, 0.006)', filter: 'brightness(5)', opacity: 1, offset: 0.85 },
            { transform: 'scale(0, 0)', filter: 'brightness(5)', opacity: 0 },
          ],
          { duration: 600, easing: 'ease-in' },
        ).finished;
      }
    }
    t.reset();
    t.write('\x1b[?25l');
    refresh();
  };

  /** A Run button: boots the terminal, or types the program's name at the shell's prompt. */
  const start = (example: string, label: string, verbose: boolean) => {
    if (powered && !verbose) {
      if (frames.length !== 1 || typing || !top) return;
      typing = true;
      refresh();
      term?.focus();
      // From the program's own folder ./name, as a reader would type it; from anywhere else its path.
      const where = home(example);
      const command = top.cwd() === where ? `./${example}` : `${where.replace(/^\/home\/reader/, '~')}/${example}`;
      void top.type(command, reducedMotion() ? 0 : 40).then(() => {
        typing = false;
        refresh();
      });
      return;
    }
    // Shift+Run reboots, verbosely.
    void (async () => {
      if (powered) await powerOff(false);
      await powerOn(example, label, verbose);
    })();
  };

  main.addEventListener('click', (e) => start(id, title, e.shiftKey));
  for (const { v, b } of extra) {
    b.addEventListener('click', (e) => start(v.id, `${title} (${v.define} defined)`, e.shiftKey));
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
    const programs = new Map<string, Program>();
    for (const s of [...(all?.values() ?? [])].sort((a, b) => a.id.localeCompare(b.id))) {
      if (s.status !== 'runs') continue;
      // docs/client-library/menus/attributes.md is in ~/menus.
      const dir = s.shard?.split('/').at(-2);
      programs.set(s.id, { args: s.args ?? [], bytes: s.bytes, hidden: s.hidden, dir });
      for (const v of s.variants ?? []) programs.set(v.id, { args: s.args ?? [], bytes: v.bytes, dir });
    }
    for (const box of boxes) {
      const s = all?.get(box.dataset.example!);
      if (s?.status === 'runs') setup(box, s.variants ?? [], programs, s.shell);
      else if (s) flag(box, `This program doesn't run in the browser yet: it ${REASONS[s.status] ?? s.status}.`, s.detail);
      else flag(box, 'This program has no browser build in this copy of the site.');
    }
  });
}
