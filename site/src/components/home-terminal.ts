/**
 * The home page's demo terminal, beside the hero (index.mdx puts its markup in the hero's image
 * slot). It boots straight into the pretend shell and plays ncurses's own test programs from
 * /usr/games in turn, ten seconds each, typing each one's command at the prompt as a reader would
 * (demo-rotation.js keeps the order and the timing).
 *
 * A click, a tap, a key or focus in the terminal stops the rotation and hands it to the reader:
 * the program on screen keeps running, its quit key ends it, and the shell's prompt comes back
 * for help, ls, cd and the rest. The Pause and Play button does the same from the keyboard.
 *
 * Nothing is made until the terminal is near the viewport, and no program's WebAssembly loads
 * until it is in view. Out of view, or in a hidden tab, the program on screen quits and the
 * rotation waits. With reduced motion nothing plays until the reader presses Play.
 */
import { createRotation } from './demo-rotation.js';
import { createRunner, loadTerminfo, reducedMotion, runnablePrograms, statuses } from './terminal-runner.ts';

/** The demos, in order: ncurses's test programs that animate on their own and quit on q. */
const DEMOS = ['firework', 'xmas', 'rain', 'worm'];
/** xmas draws its tree at column 53, 27 columns wide, so the terminal is 80 columns. */
const SIZE: [number, number] = [80, 24];

function setup(root: HTMLElement) {
  // Starlight puts the hero's image slot before its text; after it, the terminal comes after the
  // title and the buttons in focus order, as it does on screen.
  const slot = root.closest('.hero-html');
  if (slot?.parentElement) slot.parentElement.append(slot);
  const screen = root.querySelector<HTMLElement>('.home-terminal-screen')!;
  const scroller = root.querySelector<HTMLElement>('.home-terminal-scroller')!;
  const toggle = root.querySelector<HTMLButtonElement>('.home-terminal-play')!;
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

    const runner = createRunner({
      screen,
      scroller,
      size: () => SIZE,
      programs,
      onChange: () => show(),
      onStart: (name) => rotation.started(name),
      onEnd: () => rotation.ended(),
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

    /** The line under the terminal and the button, from the rotation and the terminal. */
    const show = () => {
      const { mode, running } = rotation.state;
      const program = runner.frames.length > 1;
      const auto = mode === 'auto';
      toggle.textContent = auto ? 'Pause demos' : 'Play demos';
      toggle.setAttribute('aria-pressed', String(!auto));
      toggle.disabled = !runner.powered();
      if (!runner.powered()) hint.textContent = 'The terminal is off. Click it to switch it on.';
      else if (auto) hint.textContent = `Playing ${running ? `/usr/games/${running}` : 'the demos'}, 10 seconds each. Click the terminal to take over.`;
      else if (program && running && DEMOS.includes(running))
        hint.textContent = `${running} is yours now: press q to quit it, then type help, ls or ls /usr/games.`;
      else if (program) hint.textContent = 'A program is running. Its quit key brings back the shell.';
      else hint.textContent = 'Type help, ls or ls /usr/games, or press Play demos. Shift+Tab leaves the terminal.';
    };

    /** The reader takes the terminal: the rotation stops and the program on screen is theirs. */
    const takeOver = () => {
      if (!runner.powered()) {
        if (runner.stopping()) return;
        void runner.powerOn(null);
        runner.term()?.focus();
        return;
      }
      if (rotation.state.mode === 'auto') {
        rotation.stop();
        status.textContent = 'Demos paused. The terminal is yours.';
      }
    };
    for (const type of ['pointerdown', 'keydown', 'focusin']) scroller.addEventListener(type, takeOver);
    toggle.addEventListener('click', () => {
      if (rotation.state.mode === 'auto') {
        rotation.stop();
        status.textContent = 'Demos paused.';
      } else {
        rotation.play();
        status.textContent = 'Demos playing.';
      }
    });

    runner.open();
    // Tab completes in the shell; Shift+Tab leaves the terminal, so a keyboard can move on.
    runner.term()!.attachCustomKeyEventHandler((e) => !(e.key === 'Tab' && e.shiftKey));
    void runner.powerOn(null);
    // Out of view until the observer below reports otherwise, which it does at once.
    rotation.setVisible(false);
    if (!reducedMotion()) rotation.play();
    show();

    const update = () => rotation.setVisible(seen());
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
