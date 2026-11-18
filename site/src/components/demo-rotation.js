// The order and timing of the home page's terminal demos (home-terminal.ts): each program runs for
// `dwell` milliseconds, is asked to quit, and the next starts once it has ended, in a loop. Kept
// apart from the terminal and the DOM, with the timers passed in, so tests can run it
// (tests/demo-rotation.test.mjs).
//
// The terminal tells the rotation what happens in it: started(name) once a program is running and
// can take keys, ended() once it has exited. The rotation answers through launch(name), which
// types the program's name at the shell's prompt, and quit(), which presses the running program's
// quit key.
//
// Modes:
// - 'off': nothing has started yet, or no program would load.
// - 'auto': the demos rotate.
// - 'manual': the reader took the terminal over. The program on screen keeps running and the
//   rotation does nothing more until play() is called again.
// While the terminal is out of view (setVisible(false)), an automatic rotation quits the program
// on screen and starts no other; back in view, it goes on with the next one.

/** How long each demo runs. */
export const DWELL_MS = 10_000;
/** The pause at the prompt between one demo's end and the next one's command. */
export const GAP_MS = 700;

/**
 * @param {object} o
 * @param {string[]} o.names the programs, in order
 * @param {(name: string) => void} o.launch starts one (types its command at the prompt)
 * @param {() => void} o.quit asks the running program to quit
 * @param {(fn: () => void, ms: number) => unknown} [o.setTimer]
 * @param {(id: unknown) => void} [o.clearTimer]
 * @param {(state: { mode: string, running: string | null, next: string }) => void} [o.onChange]
 * @param {number} [o.dwell]
 * @param {number} [o.gap]
 */
export function createRotation({
  names,
  launch,
  quit,
  setTimer = (fn, ms) => setTimeout(fn, ms),
  clearTimer = (id) => clearTimeout(id),
  onChange = () => {},
  dwell = DWELL_MS,
  gap = GAP_MS,
}) {
  if (!names.length) throw new Error('createRotation: no programs to rotate');
  let mode = 'off';
  let visible = true;
  let index = 0;
  /** The program running in the terminal, whoever started it. */
  let running = null;
  /** A launch has been made and its program hasn't started or ended yet. */
  let launching = false;
  /** Quit has been pressed for the running program. */
  let quitting = false;
  let timer = null;
  /** Launches in a row that ended before their program started: none of them loads. */
  let failures = 0;

  const state = () => ({ mode, running, next: names[index % names.length] });
  const changed = () => onChange(state());
  const disarm = () => {
    if (timer !== null) clearTimer(timer);
    timer = null;
  };
  const arm = (fn, ms) => {
    disarm();
    timer = setTimer(() => {
      timer = null;
      fn();
    }, ms);
  };
  const askQuit = () => {
    disarm();
    if (quitting) return;
    quitting = true;
    quit();
  };
  const launchNext = () => {
    if (mode !== 'auto' || !visible || running || launching) return;
    launching = true;
    launch(names[index % names.length]);
    changed();
  };
  /** What an automatic rotation does next from where it is now. */
  const proceed = (wait) => {
    if (mode !== 'auto') return;
    if (running) {
      if (!visible) askQuit();
      else if (!quitting && timer === null) arm(askQuit, dwell);
    } else if (visible && !launching) arm(launchNext, wait);
  };

  return {
    /** Starts or restarts the rotation. A program already running gets the full dwell from now. */
    play() {
      if (mode === 'auto') return;
      mode = 'auto';
      disarm();
      proceed(0);
      changed();
    },
    /** The reader takes over: the program on screen keeps running, and nothing more is started. */
    stop() {
      if (mode === 'manual') return;
      disarm();
      mode = 'manual';
      changed();
    },
    /** Whether the terminal is in view and its tab shown. */
    setVisible(v) {
      if (visible === v) return;
      visible = v;
      if (mode !== 'auto') return;
      disarm();
      proceed(0);
    },
    started(name) {
      failures = 0;
      running = name;
      launching = false;
      quitting = false;
      proceed(0);
      changed();
    },
    ended() {
      const was = running ?? (launching ? names[index % names.length] : null);
      if (!running && launching) failures++;
      running = null;
      launching = false;
      quitting = false;
      disarm();
      // The demo next in line moves the rotation on once it ends, however it ended: quit by the
      // rotation or the reader, ended on its own, or failed to load.
      if (mode !== 'off' && was === names[index % names.length]) index++;
      // When every program has failed to load in turn, the rotation gives up.
      if (failures >= names.length) mode = 'off';
      proceed(gap);
      changed();
    },
    get state() {
      return state();
    },
  };
}
