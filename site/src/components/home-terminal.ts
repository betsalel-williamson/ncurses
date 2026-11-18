/**
 * The home page's demo terminal, beside the hero (index.mdx puts its markup in the hero's image
 * slot). When it comes into view it plays the boot screen (boot-screen.js) while the first demo's
 * WebAssembly downloads, then plays ncurses's own test programs from /usr/games in turn, ten
 * seconds each, typing each one's command at the prompt as a reader would (demo-rotation.js keeps
 * the order and the timing).
 *
 * A click, a tap, a key or focus in the terminal stops the rotation for good and hands it to the
 * reader: the program on screen keeps running, its quit key ends it, and the shell's prompt comes
 * back for help, ls, cd and the rest. The rotation starts again only when the page is loaded again.
 *
 * Until its script runs, the markup shows a still terminal with a cursor, the size the terminal
 * takes. Nothing is made until the terminal is near the viewport, and no program's WebAssembly
 * loads until it is in view. Out of view, or in a hidden tab, the program on screen quits and the
 * rotation waits. With reduced motion the terminal shows a still prompt, with a line on what to
 * type, and loads no program until the reader runs one.
 */
import { createRotation } from './demo-rotation.js';
import { createRunner, loadTerminfo, reducedMotion, runnablePrograms, statuses } from './terminal-runner.ts';

/** The demos, in order: ncurses's test programs that animate on their own and quit on q. */
const DEMOS = ['firework', 'xmas', 'rain', 'worm'];
/** xmas draws its tree at column 53, 27 columns wide, so the terminal is 80 columns. */
const SIZE: [number, number] = [80, 24];
const dim = (text: string) => `\x1b[2m${text}\x1b[0m\r\n`;

function setup(root: HTMLElement) {
  // Starlight puts the hero's image slot before its text; after it, the terminal comes after the
  // title and the buttons in focus order, as it does on screen.
  const slot = root.closest('.hero-html');
  if (slot?.parentElement) slot.parentElement.append(slot);
  const screen = root.querySelector<HTMLElement>('.home-terminal-screen')!;
  const scroller = root.querySelector<HTMLElement>('.home-terminal-scroller')!;
  const hint = root.querySelector<HTMLElement>('.home-terminal-hint')!;
  const status = root.querySelector<HTMLElement>('.home-terminal-status')!;

  let inView = false;
  let started = false;
  const seen = () => inView && !document.hidden;

  const init = async () => {
    void loadTerminfo();
    const programs = runnablePrograms(await statuses());
    const names = DEMOS.filter((n) => programs.get(n)?.hidden);
    // Without the demos' builds (a local build without Emscripten) the hero keeps its own layout.
    if (!names.length) {
      root.closest('.hero')?.classList.add('no-home-terminal');
      root.hidden = true;
      return;
    }
    const still = reducedMotion();

    /** The first program, which plays behind the boot screen, has ended. */
    let firstEnded = false;
    /** The terminal has been switched on, the first time it came into view. */
    let booted = false;
    /** The page itself is switching the terminal on, so its focus is not the reader's. */
    let booting = false;
    /** The rotation has been started; it starts once. */
    let playing = false;
    /** The reader has been told how to get to the other demos. */
    let told = false;
    const play = () => {
      if (playing || still) return;
      playing = true;
      rotation.play();
    };

    const runner = createRunner({
      screen,
      scroller,
      size: () => SIZE,
      programs,
      onChange: () => show(),
      onStart: (name) => {
        rotation.started(name);
        // The rotation starts once the first demo shows, after the boot screen.
        play();
      },
      onEnd: () => {
        const first = !firstEnded;
        firstEnded = true;
        // The reader quit a demo they took over: the shell's prompt follows this line.
        if (!first && !told && rotation.state.mode === 'manual') {
          told = true;
          runner.term()?.write(dim("Type help for this shell's commands, or ls /usr/games for the other demos."));
        }
        rotation.ended();
        // A first demo that failed to load still starts the rotation, which skips what won't load.
        play();
      },
    });
    const rotation = createRotation({
      names,
      launch: (name) => {
        const top = runner.top();
        if (!top) return;
        // Each demo on a clear screen, its command typed out at the prompt.
        void top.type('clear', 30).then(() => runner.top() === top && top.type(`/usr/games/${name}`, 45));
      },
      // Each demo quits on q; a program the reader started from a guide quits on F1.
      quit: () => {
        const frame = runner.frames.at(-1);
        if (frame?.pty) runner.input(frame.game ? 'q' : '\x1bOP');
      },
      onChange: () => show(),
    });

    /** The terminal's description for screen readers, from the rotation and the terminal. */
    const show = () => {
      const { mode, running } = rotation.state;
      const program = runner.frames.length > 1;
      if (!runner.powered()) hint.textContent = 'The terminal is off. Click it to switch it on.';
      else if (mode === 'off' && !still) hint.textContent = 'Starting the demos: ncurses\'s own test programs, 10 seconds each.';
      else if (mode === 'auto') hint.textContent = `Playing ${running ? `/usr/games/${running}` : 'the demos'}, 10 seconds each. Click or focus the terminal to take over.`;
      else if (program && running && DEMOS.includes(running)) hint.textContent = `${running} is yours: press q to quit it, then type help, ls or ls /usr/games.`;
      else if (program) hint.textContent = 'A program is running. Its quit key brings back the shell.';
      else hint.textContent = 'A shell prompt. Type help, ls or ls /usr/games. Shift+Tab leaves the terminal.';
    };

    /** The reader takes the terminal: the rotation stops for good and the program on screen is theirs. */
    const takeOver = () => {
      if (!booted || booting) return;
      if (!runner.powered()) {
        if (runner.stopping()) return;
        void runner.powerOn(null);
        runner.term()?.focus();
        return;
      }
      if (rotation.state.mode !== 'manual') {
        rotation.stop();
        status.textContent = 'Demos stopped. The terminal is yours.';
      }
    };
    for (const type of ['pointerdown', 'keydown', 'focusin']) scroller.addEventListener(type, takeOver);

    /** Switches the terminal on, the first time it is in view: the boot screen, or a still prompt. */
    const boot = () => {
      if (booted || !seen()) return;
      booted = true;
      screen.replaceChildren();
      runner.open();
      // Tab completes in the shell; Shift+Tab leaves the terminal, so a keyboard can move on.
      runner.term()!.attachCustomKeyEventHandler((e) => !(e.key === 'Tab' && e.shiftKey));
      if (still)
        void runner.powerOn(null, '', false, dim("ncurses's test programs are in /usr/games. Click here, type ls /usr/games, then a name to run it."));
      else {
        // Booting with a program focuses the terminal, as a Run button should. Here the reader
        // didn't ask for it: that focus is no takeover, and the focus goes back where it was.
        const before = document.activeElement;
        booting = true;
        void runner.powerOn(names[0]);
        booting = false;
        if (before instanceof HTMLElement && before !== document.body) before.focus({ preventScroll: true });
        else runner.term()?.blur();
      }
      show();
    };

    const update = () => {
      rotation.setVisible(seen());
      boot();
    };
    // Out of view until the observer below reports otherwise, which it does at once.
    rotation.setVisible(false);
    new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        update();
      },
      { threshold: 0.3 },
    ).observe(root);
    document.addEventListener('visibilitychange', update);
  };

  // The terminal is made when it comes within a screen of the viewport.
  new IntersectionObserver(
    (entries, observer) => {
      if (started || !entries.some((e) => e.isIntersecting)) return;
      started = true;
      observer.disconnect();
      void init();
    },
    { rootMargin: '100% 0px' },
  ).observe(root);
}

for (const root of document.querySelectorAll<HTMLElement>('[data-home-terminal]')) setup(root);
