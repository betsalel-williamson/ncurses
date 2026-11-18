/**
 * Turns each `.run-example` placeholder into a "Run this example" button. A click loads the
 * example's WebAssembly build (public/examples/<id>.mjs, from scripts/build-examples.mjs) and
 * runs it in an xterm.js terminal: keys go to the program's stdin, its output to the screen.
 */
import { keySequence } from './terminal-fit.js';
import { type Program, type Variant, createRunner, loadTerminfo, reducedMotion, runnablePrograms, statuses } from './terminal-runner.ts';

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

/** Terminal sizes a reader can pick, columns by rows. The first is the default. */
const SIZES: [number, number][] = [[80, 24], [100, 30], [60, 20]];

const REASONS: Record<string, string> = {
  'compile-error': "doesn't compile",
  'link-error': "doesn't link",
  crashed: 'stops with an error when run',
  'no-quit': "doesn't quit on F1",
  'no-output': 'draws nothing when run',
};

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
    const term = runner.term();
    if (!term || !runner.frames.at(-1)?.pty) return;
    runner.input(keySequence(k, term.modes.applicationCursorKeysMode));
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
  let typing = false;
  const buttons = [main, ...extra.map((x) => x.b)];

  /** The keys show while a program has the keyboard; the Run buttons work at the top prompt. */
  const refresh = () => {
    const frames = runner.frames;
    // A game from /usr/games quits on its own key, not F1, so it gets no key row.
    const program = !!frames.length && frames.at(-1)!.pty !== undefined && !frames.at(-1)!.game;
    if (!program) {
      keys.stop();
      const hadFocus = keys.group.contains(document.activeElement);
      keys.group.hidden = true;
      if (hadFocus) runner.term()?.focus();
    } else keys.group.hidden = false;
    const powered = runner.powered();
    const idle = (!powered && !runner.stopping()) || (powered && frames.length === 1 && !typing);
    for (const b of buttons) b.disabled = !idle;
    main.textContent = powered ? '↻ Run again' : '▶ Run this example';
  };

  // The terminal (terminal-runner.ts). It is off until the first Run, which boots it and runs the
  // program. When the program ends, the pretend shell (page-shell.js) takes over: Run again types
  // the program's name at its prompt, any program the site has built runs by name, and halt
  // powers it off. Fit to width is shown only when fitting the terminal takes its text below 9px
  // (on a phone), and is pressed unless the reader turned it off.
  const runner = createRunner({
    screen,
    scroller,
    size: chosen,
    programs,
    id,
    title,
    fitChoice: (offered) => {
      fitToggle.hidden = !offered;
      return !offered || fitToggle.getAttribute('aria-pressed') === 'true';
    },
    onChange: () => {
      if (!runner.powered()) typing = false;
      refresh();
    },
  });
  fitToggle.addEventListener('click', () => {
    const on = fitToggle.getAttribute('aria-pressed') !== 'true';
    fitToggle.setAttribute('aria-pressed', String(on));
    preferFit(on);
    runner.fit();
  });
  // A new size applies at once: the terminal changes, and a running program gets SIGWINCH and
  // sees KEY_RESIZE, as it would when a real terminal window is resized.
  size.addEventListener('change', runner.resize);
  // Blank, with no cursor, until the reader runs it.
  runner.open().write('\x1b[?25l');

  /** A Run button: boots the terminal, or types the program's name at the shell's prompt. */
  const start = (example: string, label: string, verbose: boolean) => {
    const top = runner.top();
    if (runner.powered() && !verbose) {
      if (runner.frames.length !== 1 || typing || !top) return;
      typing = true;
      refresh();
      runner.term()?.focus();
      // From the program's own folder ./name, as a reader would type it; from anywhere else its path.
      const where = runner.home(example);
      const command = top.cwd() === where ? `./${example}` : `${where.replace(/^\/home\/reader/, '~')}/${example}`;
      void top.type(command, reducedMotion() ? 0 : 40).then(() => {
        typing = false;
        refresh();
      });
      return;
    }
    // Shift+Run reboots, verbosely.
    void (async () => {
      if (runner.powered()) await runner.powerOff(false);
      await runner.powerOn(example, label, verbose);
    })();
  };

  main.addEventListener('click', (e) => start(id, title, e.shiftKey));
  for (const { v, b } of extra) {
    b.addEventListener('click', (e) => start(v.id, `${title} (${v.define} defined)`, e.shiftKey));
  }
}

const boxes = document.querySelectorAll<HTMLElement>('.run-example');
if (boxes.length) {
  void loadTerminfo();
  void statuses().then((all) => {
    const programs = runnablePrograms(all);
    for (const box of boxes) {
      const s = all?.get(box.dataset.example!);
      if (s?.status === 'runs') setup(box, s.variants ?? [], programs, s.shell);
      else if (s) flag(box, `This program doesn't run in the browser yet: it ${REASONS[s.status] ?? s.status}.`, s.detail);
      else flag(box, 'This program has no browser build in this copy of the site.');
    }
  });
}
