/**
 * The pretend shell an example's terminal comes back to (run-example.ts). A web page has no real
 * shell, so this one reads a line at a time with its own echo, as a shell in cooked mode does,
 * and knows a few commands. It can run any example the site has built, by name, and it can
 * power the terminal off. A program that calls system() gets one too, nested under it: there
 * `exit` goes back to the program, with the exit status a real system() reports.
 *
 * Easter eggs, not in help: ncurses's own test programs live in /usr/games and run by name
 * (worm, rain, …), and vi, nano and emacs open pretend editors (pretend-editors.js).
 */
import { EDITORS, runEditor } from './pretend-editors.js';

/** What `halt`, or `exit` at the top shell, returns: the terminal powers off. */
export const HALT = 'halt';

/** Each line fits the narrowest terminal the page offers (60 columns). */
export const HELP =
  'A pretend shell, since a web page has no real one.\r\n' +
  'ls lists the programs on this site; ./name runs one.\r\n' +
  'Tab completes a name. It also knows echo, pwd, date,\r\n' +
  'whoami, uname, clear and help.\r\n' +
  'exit leaves this shell; halt powers the terminal off.\r\n';

/** Names a shell is started by, so system("sh") gets a prompt rather than one command. */
export const SHELL_NAMES = /^\s*(?:(?:\/usr)?\/bin\/)?(?:sh|bash|ksh|zsh|dash)\s*$|^\s*\$SHELL\s*$/;

/** The commands the shell itself knows, for Tab. */
export const BUILTINS = ['clear', 'date', 'echo', 'exit', 'false', 'halt', 'help', 'ls', 'poweroff', 'pwd', 'shutdown', 'true', 'uname', 'whoami'];

const GAMES_DIR = '/usr/games';

/** Names in columns, as ls prints them to a terminal `width` columns wide. */
export function columns(names, width) {
  if (!names.length) return [];
  const col = Math.max(...names.map((n) => n.length)) + 2;
  const per = Math.max(1, Math.floor((width + 2) / col));
  const rows = Math.ceil(names.length / per);
  const lines = [];
  for (let r = 0; r < rows; r++) {
    let line = '';
    for (let c = 0; c < per; c++) {
      const n = names[c * rows + r];
      if (n !== undefined) line += n.padEnd(col);
    }
    lines.push(line.trimEnd());
  }
  return lines;
}

/** The longest start every name shares. */
export function commonPrefix(names) {
  if (!names.length) return '';
  let p = names[0];
  for (const n of names) while (!n.startsWith(p)) p = p.slice(0, -1);
  return p;
}

/**
 * A shell. `write` sends text to the terminal; `programs()` names the examples it can run, and
 * `games()` the test programs in /usr/games; `launch(name, args)` runs one and resolves with its
 * exit status, or HALT when the terminal powered off while it ran; `cols()` and `rows()` are the
 * terminal's size. Keys go in through `feed`.
 */
export function createShell({ write, programs, games = () => [], launch, cols = () => 80, rows = () => 24 }) {
  const queue = [];
  let waiter = null;
  const history = [];
  const say = (text) => write(text);
  const out = (text) => say(`${text}\r\n`);

  const next = async () => {
    while (!queue.length) await new Promise((resolve) => (waiter = resolve));
    return queue.shift();
  };

  /**
   * The next key: a character, or a name for a key that sends a sequence ('up', 'down', 'left',
   * 'right', 'other'), 'esc' for Escape alone and 'M-x' for Alt (or Escape) and a letter. The
   * terminal sends a key's whole sequence at once, so what follows ESC is already queued.
   */
  const key = async () => {
    const ch = await next();
    if (ch !== '\x1b') return ch;
    if (!queue.length) return 'esc';
    const c = queue.shift();
    if (c !== '[' && c !== 'O') return `M-${c}`;
    let seq = '';
    while (queue.length) {
      const d = queue.shift();
      seq += d;
      if (d >= '@' && d <= '~') break;
    }
    return { A: 'up', B: 'down', C: 'right', D: 'left' }[seq.slice(-1)] ?? 'other';
  };

  /** What Tab can finish the last word of `text` with. */
  const candidates = (text) => {
    const words = text.split(' ');
    const word = words.at(-1);
    const first = words.length === 1;
    if (word.startsWith(`${GAMES_DIR}/`)) return games().map((g) => `${GAMES_DIR}/${g}`);
    if (word.startsWith('./')) return programs().map((p) => `./${p}`);
    if (first) return [...new Set([...BUILTINS, ...Object.keys(EDITORS), ...programs(), ...games()])].sort();
    return [...programs(), `${GAMES_DIR}/`];
  };

  /** One line, echoed as it is typed; null at Ctrl-D on an empty line. */
  const line = async () => {
    let text = '';
    let tabs = 0;
    let back = history.length;
    const replace = (t) => {
      say('\b \b'.repeat(text.length) + t);
      text = t;
    };
    for (;;) {
      const k = await key();
      tabs = k === '\t' ? tabs + 1 : 0;
      if (k === '\r' || k === '\n') {
        say('\r\n');
        if (text.trim() && history.at(-1) !== text) history.push(text);
        return text;
      }
      if (k === '\x04') {
        if (!text) return null;
      } else if (k === '\x03') {
        say('^C\r\n');
        return '';
      } else if (k === '\x7f' || k === '\b') {
        if (text) replace(text.slice(0, -1));
      } else if (k === '\x15') replace('');
      else if (k === 'up' || k === 'down') {
        back = Math.max(0, Math.min(history.length, back + (k === 'up' ? -1 : 1)));
        replace(history[back] ?? '');
      } else if (k === '\t') {
        const word = text.split(' ').at(-1);
        const found = candidates(text).filter((c) => c.startsWith(word));
        const common = commonPrefix(found);
        if (found.length === 1) replace(text + found[0].slice(word.length) + (found[0].endsWith('/') ? '' : ' '));
        else if (common.length > word.length) replace(text + common.slice(word.length));
        else if (found.length > 1 && tabs >= 2) {
          // A second Tab lists what the word could be, then the line again.
          say('\r\n');
          await page(columns(found, cols()));
          say(`$ ${text}`);
        } else say('\x07');
      } else if (k.length === 1 && k >= ' ' && k !== '\x7f') {
        text += k;
        say(k);
      }
    }
  };

  /**
   * Prints lines a screen at a time, as more does: Space shows the next screen, Enter the next
   * line, q stops.
   */
  const page = async (lines) => {
    let shown = 0;
    let room = rows() - 1;
    while (shown < lines.length) {
      for (; room > 0 && shown < lines.length; room--) out(lines[shown++]);
      if (shown >= lines.length) break;
      say(`\x1b[7m--More--(${Math.floor((shown / lines.length) * 100)}%)\x1b[0m`);
      let k;
      do k = await key();
      while (![' ', '\r', 'q', 'Q', '\x03', 'down'].includes(k));
      say('\r\x1b[2K');
      if (k === 'q' || k === 'Q' || k === '\x03') break;
      room = k === ' ' ? rows() - 1 : 1;
    }
  };

  /** The program a command names: an example as `name`, `./name` or `/home/reader/name`, or a game as `name` or `/usr/games/name`. */
  const program = (word) => {
    if (word.startsWith(`${GAMES_DIR}/`)) {
      const g = word.slice(GAMES_DIR.length + 1);
      return games().includes(g) ? g : null;
    }
    const name = word.replace(/^(?:\.|\/home\/reader)\//, '');
    if (programs().includes(name)) return name;
    return word.includes('/') || !games().includes(word) ? null : word;
  };

  /** Runs one command line; resolves with its exit status, { exit } (null for the last status) or HALT. */
  const run = async (text) => {
    const words = text.trim().split(/\s+/).filter(Boolean);
    if (!words.length) return 0;
    const [cmd, ...args] = words;
    switch (cmd) {
      case 'exit':
        // With no status, the shell exits with the last command's, as sh does.
        return { exit: args.length ? Number.parseInt(args[0], 10) & 255 || 0 : null };
      case 'halt':
      case 'poweroff':
      case 'shutdown':
        return HALT;
      case 'echo':
        out(args.join(' '));
        return 0;
      case 'pwd':
        out('/home/reader');
        return 0;
      case 'ls': {
        const dirs = args.filter((a) => !a.startsWith('-'));
        const dir = (dirs[0] ?? '.').replace(/\/+$/, '') || '/';
        if (dir === GAMES_DIR) await page(columns(games(), cols()));
        else if (['.', '~', '/home/reader'].includes(dir)) await page(columns(programs(), cols()));
        else {
          out(`ls: cannot access '${dirs[0]}': No such file or directory`);
          return 2;
        }
        return 0;
      }
      case 'date':
        out(new Date().toString());
        return 0;
      case 'whoami':
        out('reader');
        return 0;
      case 'uname':
        out(args.includes('-a') ? 'Emscripten browser 1.0 wasm32 (pretend shell)' : 'Emscripten');
        return 0;
      case 'clear':
        say('\x1b[H\x1b[2J');
        return 0;
      case 'help':
        say(HELP);
        return 0;
      case 'true':
      case ':':
        return 0;
      case 'false':
        return 1;
    }
    if (SHELL_NAMES.test(cmd)) {
      out('sh: already in the pretend shell');
      return 0;
    }
    if (EDITORS[cmd]) return runEditor(EDITORS[cmd], { write, key, rows, cols });
    const name = program(cmd);
    if (name) return launch(name, args);
    out(cmd.includes('/') ? `sh: ${cmd}: No such file or directory` : `sh: ${cmd}: not found`);
    return 127;
  };

  return {
    /** Keys from the terminal. */
    feed(data) {
      for (const ch of data) queue.push(ch);
      const w = waiter;
      waiter = null;
      if (w) w();
    },
    /** Types a command at the prompt, as a reader would, replacing what was typed there. */
    async type(command, delay = 0) {
      this.feed('\x15');
      for (const ch of command) {
        if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
        this.feed(ch);
      }
      if (delay) await new Promise((resolve) => setTimeout(resolve, delay * 3));
      this.feed('\r');
    },
    run,
    /**
     * Prompts and runs commands until `exit` or Ctrl-D, and resolves with the exit status; the
     * top shell resolves with HALT then, as does `halt` anywhere.
     */
    async session({ top = false } = {}) {
      let status = 0;
      for (;;) {
        say('$ ');
        const text = await line();
        if (text === null) {
          out('exit');
          return top ? HALT : status;
        }
        const r = await run(text);
        if (r === HALT) return HALT;
        if (typeof r === 'object') return top ? HALT : (r.exit ?? status);
        status = r;
      }
    },
  };
}
