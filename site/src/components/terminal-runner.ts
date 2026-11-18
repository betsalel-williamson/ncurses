/**
 * The terminal that runs the site's WebAssembly programs (public/examples/<id>.mjs, from
 * scripts/build-examples.mjs) in xterm.js, and the pretend shell (page-shell.js) it comes back to
 * when a program ends. A guide's Run button (run-example.ts) and the home page's demo terminal
 * (home-terminal.ts) each make one with createRunner() and draw their own controls around it.
 */
import { Terminal, type ITheme } from '@xterm/xterm';
import { WebglAddon } from '@xterm/addon-webgl';
import '@xterm/xterm/css/xterm.css';
import { FULL_SIZE, STEP, fitFontSize, offersFullSize, overflows } from './terminal-fit.js';
import { bootScreen } from './boot-screen.js';
import { HALT, HELP, SHELL_NAMES, createShell } from './page-shell.js';

export const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const FONT_SIZE = FULL_SIZE;

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

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

export type Pty = {
  write: (bytes: Uint8Array) => void;
  push: (bytes: Uint8Array) => void;
  resize: (rows: number, cols: number) => void;
  rows: number;
  cols: number;
};

/** A second build of a listing with one of its own macros defined (build-examples.mjs). */
export type Variant = { define: string; id: string; bytes?: number };

/** One program's build result, from public/examples/status.json (build-examples.mjs). */
export type Status = { id: string; status: string; detail?: string; variants?: Variant[]; args?: string[]; bytes?: number; shell?: boolean; hidden?: boolean; shard?: string };

/** A program the site has built, which the shell can run by name: each example, and each variant. */
/** `dir` is the guide's folder in the shell's home directory (menus), from its shard's path. */
export type Program = { args: string[]; bytes?: number; hidden?: boolean; dir?: string };

/** What the examples' ncurses build does about the terminal database, from public/examples/terminfo.json (terminfo.mjs). */
type TerminfoEntry = { name: string; path: string; bytes?: number; source?: string };
type Terminfo = { dir: string; database: boolean; options: string[]; entries: TerminfoEntry[] };

/** terminfo.json, once it has loaded; the shell shows its directory and infocmp from it. */
let terminfo: Terminfo | null = null;
export async function loadTerminfo() {
  try {
    const res = await fetch(`${base}/examples/terminfo.json`);
    if (res.ok) terminfo = await res.json();
  } catch {
    // Without it, the shell has no terminfo directory and infocmp says so.
  }
}

export async function statuses(): Promise<Map<string, Status> | null> {
  try {
    const res = await fetch(`${base}/examples/status.json`);
    if (!res.ok) return null;
    return new Map((await res.json() as Status[]).map((s) => [s.id, s]));
  } catch {
    return null;
  }
}

/** Every program that runs, by name, for the shell: each example, each variant and each game. */
export function runnablePrograms(all: Map<string, Status> | null): Map<string, Program> {
  const programs = new Map<string, Program>();
  for (const s of [...(all?.values() ?? [])].sort((a, b) => a.id.localeCompare(b.id))) {
    if (s.status !== 'runs') continue;
    // docs/client-library/menus/attributes.md is in ~/menus.
    const dir = s.shard?.split('/').at(-2);
    programs.set(s.id, { args: s.args ?? [], bytes: s.bytes, hidden: s.hidden, dir });
    for (const v of s.variants ?? []) programs.set(v.id, { args: s.args ?? [], bytes: v.bytes, dir });
  }
  return programs;
}

/** What has the keys, the last on top: a shell, or a program, whose pty is set once it has loaded. */
export type Frame = { sink: (data: string) => void; pty?: Pty | null; game?: boolean };
export type Shell = ReturnType<typeof createShell>;

export type RunnerOptions = {
  /** The element xterm.js draws in, and the scroller around it whose width the terminal fits. */
  screen: HTMLElement;
  scroller: HTMLElement;
  /** The terminal's size, columns by rows. */
  size: () => [number, number];
  programs: Map<string, Program>;
  /** The page's own example, if any: the shell starts in its folder, and names it by `title`. */
  id?: string;
  title?: string;
  /**
   * Called when the terminal is too wide for its scroller, with whether shrinking it to fit takes
   * the text below legible size (terminal-fit.js); returns whether to shrink it. Called with
   * `null` when it fits as it is. Without it, the terminal always fits.
   */
  fitChoice?: (offered: boolean | null) => boolean;
  /** After anything the controls around the terminal show changes: a program, a shell, power. */
  onChange?: () => void;
  /**
   * A program has loaded and reads keys (its pty is ready), or, behind the boot screen, once the
   * boot has played and the program's screen shows; and when it has ended.
   */
  onStart?: (name: string) => void;
  onEnd?: (name: string, code: number) => void;
};

export function createRunner(o: RunnerOptions) {
  const { screen, scroller, programs } = o;
  const id = o.id ?? '';
  const title = o.title ?? id;
  const onChange = o.onChange ?? (() => {});
  let term: Terminal | null = null;
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
      o.fitChoice?.(null);
      return;
    }
    if (o.fitChoice && !o.fitChoice(offersFullSize(avail, term.cols, cell))) return;
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

  /** A new size applies at once: a running program gets SIGWINCH and sees KEY_RESIZE. */
  const resize = () => {
    const [cols, rows] = o.size();
    if (!term) return;
    term.resize(cols, rows);
    fit();
    // Every program learns the new size; one waiting under a shell sees it when it resumes.
    for (const f of frames) f.pty?.resize(rows, cols);
  };

  const open = () => {
    const [cols, rows] = o.size();
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

  // Each power-on is a generation; a program or shell from an earlier one does nothing more.
  let powered = false;
  let stopping = false;
  let generation = 0;
  let halted: Promise<typeof HALT> = new Promise(() => {});
  let fireHalt = () => {};
  let top: Shell | null = null;
  const encoder = new TextEncoder();
  const never = <T,>() => new Promise<T>(() => {});

  /** The folder a program sits in, in the shell. */
  const home = (example: string) => `/home/reader/${programs.get(example)?.dir ?? ''}`.replace(/\/$/, '');
  const shellFor = (example = id) =>
    createShell({
      write: (text: string) => term?.write(text),
      programs: () => [...programs].filter(([, p]) => !p.hidden).map(([name, p]) => `${p.dir}/${name}`),
      cwd: home(example),
      games: () => [...programs].filter(([, p]) => p.hidden).map(([name]) => name),
      terminfo: () => terminfo,
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
          if (booting)
            shown = booting.release().then(() => {
              scroller.removeAttribute('aria-busy');
              if (live()) o.onStart?.(example);
            });
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
      onChange();
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
          onChange();
          o.onEnd?.(example, code);
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
                [m.pty.cols, m.pty.rows] = o.size();
                m.pty.write = show;
                // Behind the boot screen, the program starts for the page once the boot has played.
                if (live() && !booting) o.onStart?.(example);
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
    onChange();
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
    onChange();
    return r;
  };

  /**
   * Boots the terminal. With an example, it runs that program behind the boot screen and then
   * gives the shell; without one, the shell's prompt comes at once, after `greeting`.
   */
  const powerOn = async (example: string | null, label = example ?? '', verbose = false, greeting = '') => {
    const gen = ++generation;
    halted = new Promise((resolve) => (fireHalt = () => resolve(HALT)));
    powered = true;
    frames.length = 0;
    const t = open();
    const sh = shellFor();
    top = sh;
    frames.push({ sink: (d) => sh.feed(d) });
    if (example) {
      t.focus();
      const r = await launch(example, label, true, verbose);
      if (gen !== generation || r === HALT) return;
      t.write("\x1b[2mType help for this shell's commands, ls for the programs.\x1b[0m\r\n");
    } else if (greeting) t.write(greeting);
    onChange();
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
    stopping = true;
    generation++;
    fireHalt();
    frames.length = 0;
    top = null;
    onChange();
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
    stopping = false;
    onChange();
  };

  return {
    open,
    fit,
    resize,
    powerOn,
    powerOff,
    home,
    /** The xterm.js terminal, once open() has made it. */
    term: () => term,
    frames: frames as readonly Frame[],
    /** Whether the terminal is on (a shell or program has it), and whether it is powering off. */
    powered: () => powered,
    stopping: () => stopping,
    /** The shell the terminal boots into, while it is on. */
    top: () => top,
    /** Keys for whatever has them, sent down the path a key press takes. */
    input: (data: string) => term?.input(data, true),
  };
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
