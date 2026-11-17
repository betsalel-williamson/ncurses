/**
 * The pretend shell an example's terminal comes back to (run-example.ts). A web page has no real
 * shell, so this one reads a line at a time with its own echo, as a shell in cooked mode does,
 * and knows a few commands. The examples the site has built sit in folders under the home
 * directory, one per guide (~/menus/menu-basics), with cd and ls to move around them, and any
 * of them runs by its path. It can also power the terminal off. A program that calls system() gets one too, nested under it: there
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
  'The examples are in folders, one per guide: ls lists a\r\n' +
  'folder, cd goes into one, and ./name runs a program.\r\n' +
  'Tab completes a name. It also knows pwd, echo, date,\r\n' +
  'whoami, uname, env, clear and help.\r\n' +
  'exit leaves this shell; halt powers the terminal off.\r\n';

/** Names a shell is started by, so system("sh") gets a prompt rather than one command. */
export const SHELL_NAMES = /^\s*(?:(?:\/usr)?\/bin\/)?(?:sh|bash|ksh|zsh|dash)\s*$|^\s*\$SHELL\s*$/;

/** The commands the shell itself knows, for Tab. */
export const BUILTINS = ['cd', 'clear', 'date', 'echo', 'env', 'exit', 'false', 'halt', 'help', 'ls', 'poweroff', 'printenv', 'pwd', 'shutdown', 'true', 'uname', 'whoami'];

const GAMES_DIR = '/usr/games';
const HOME = '/home/reader';

/** A path made absolute against `cwd`, with ~, . and .. resolved. */
export function resolvePath(path, cwd) {
  const full = path === '~' || path.startsWith('~/') ? HOME + path.slice(1) : path.startsWith('/') ? path : `${cwd}/${path}`;
  const parts = [];
  for (const part of full.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') parts.pop();
    else parts.push(part);
  }
  return `/${parts.join('/')}`;
}

/** A path as the prompt shows it, with the home directory as ~. */
export const tilde = (path) => (path === HOME ? '~' : path.startsWith(`${HOME}/`) ? `~${path.slice(HOME.length)}` : path);

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
export function createShell({ write, programs, games = () => [], launch, cols = () => 80, rows = () => 24, cwd: start = HOME }) {
  const queue = [];
  let cwd = start;
  let last = 0;
  /** The environment echo $NAME and env see; PWD follows cd. */
  const environ = () => ({
    HOME,
    LOGNAME: 'reader',
    PATH: `/usr/local/bin:/usr/bin:/bin:${GAMES_DIR}`,
    PWD: cwd,
    SHELL: '/bin/sh',
    TERM: 'xterm-256color',
    USER: 'reader',
  });
  /** $NAME, ${NAME} and $? in a command line, as sh expands them; an unset name is empty. */
  const expand = (text) => {
    const env = environ();
    return text.replace(/\$(?:\?|\{(\w+)\}|(\w+))/g, (m, braced, bare) => (m === '$?' ? String(last) : (env[braced ?? bare] ?? '')));
  };

  /**
   * What is at an absolute path: { dir: [entries] }, with a folder's entries ending in /, or
   * { program } for an example or a game, or null. programs() gives each example's path under
   * the home directory, such as menus/menu-basics.
   */
  const node = (path) => {
    const tree = new Map();
    const add = (dir, entry) => (tree.get(dir) ?? tree.set(dir, new Set()).get(dir)).add(entry);
    const files = new Map();
    for (const p of [...programs().map((p) => `${HOME}/${p}`), ...games().map((g) => `${GAMES_DIR}/${g}`)]) {
      const parts = p.split('/').filter(Boolean);
      for (let i = 0; i < parts.length; i++) {
        const dir = `/${parts.slice(0, i).join('/')}`;
        add(dir, i === parts.length - 1 ? parts[i] : `${parts[i]}/`);
      }
      files.set(p, parts.at(-1));
    }
    add('/home', 'reader/');
    if (files.has(path)) return { program: files.get(path) };
    if (tree.has(path)) return { dir: [...tree.get(path)].sort() };
    if (path === HOME) return { dir: [] };
    return null;
  };
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
    // A command is looked for on the PATH (the shell's own, the editors and /usr/games);
    // anything with a / in it, and every argument, is a path.
    if (words.length === 1 && !word.includes('/')) return [...new Set([...BUILTINS, ...Object.keys(EDITORS), ...games()])].sort();
    const slash = word.lastIndexOf('/');
    const dirPart = word.slice(0, slash + 1);
    const at = node(resolvePath(dirPart || '.', cwd));
    const only = words[0] === 'cd' ? (e) => e.endsWith('/') : () => true;
    return (at?.dir ?? []).filter(only).map((e) => dirPart + e);
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
          await page(columns(found.map((f) => f.slice(f.lastIndexOf('/', f.length - 2) + 1)), cols()));
          say(`${prompt()}${text}`);
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

  const prompt = () => `${tilde(cwd)}$ `;

  /** The program a command names: a path to one (./menu-basics, ~/menus/menu-basics), or a game by name. */
  const program = (word) => {
    if (!word.includes('/')) return games().includes(word) ? word : null;
    return node(resolvePath(word, cwd))?.program ?? null;
  };

  /** Lists folders and files, as ls does: a folder's entries, or a file's own name. */
  const ls = async (args) => {
    const paths = args.filter((a) => !a.startsWith('-'));
    let status = 0;
    const lines = [];
    for (const [i, p] of (paths.length ? paths : ['.']).entries()) {
      const at = node(resolvePath(p, cwd));
      if (!at) {
        lines.push(`ls: cannot access '${p}': No such file or directory`);
        status = 2;
        continue;
      }
      if (paths.length > 1) lines.push(`${i ? '\n' : ''}${p}:`);
      lines.push(...(at.program ? [p] : columns(at.dir, cols())));
    }
    await page(lines.flatMap((l) => l.split('\n')));
    return status;
  };

  /** Runs one command line; resolves with its exit status, { exit } (null for the last status) or HALT. */
  const run = async (text) => {
    const words = expand(text).trim().split(/\s+/).filter(Boolean);
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
        out(cwd);
        return 0;
      case 'env':
      case 'printenv': {
        const env = environ();
        if (args.length) {
          for (const a of args) if (a in env) out(env[a]);
          return args.every((a) => a in env) ? 0 : 1;
        }
        for (const [k, v] of Object.entries(env)) out(`${k}=${v}`);
        return 0;
      }
      case 'cd': {
        const to = resolvePath(args[0] ?? '~', cwd);
        const at = node(to);
        if (!at) {
          out(`sh: cd: ${args[0]}: No such file or directory`);
          return 1;
        }
        if (!at.dir) {
          out(`sh: cd: ${args[0]}: Not a directory`);
          return 1;
        }
        cwd = to;
        return 0;
      }
      case 'ls':
        return ls(args);
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
    if (cmd.includes('/')) {
      const at = node(resolvePath(cmd, cwd));
      out(at?.dir ? `sh: ${cmd}: Is a directory` : `sh: ${cmd}: No such file or directory`);
      return at?.dir ? 126 : 127;
    }
    // An example typed by its bare name isn't on the PATH, as in a real shell: say where it is.
    const where = programs().find((p) => p.endsWith(`/${cmd}`));
    out(where ? `sh: ${cmd}: not found (it is in ~/${where.slice(0, -cmd.length - 1)}: cd there and type ./${cmd})` : `sh: ${cmd}: not found`);
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
    /** The working directory. */
    cwd: () => cwd,
    /**
     * Prompts and runs commands until `exit` or Ctrl-D, and resolves with the exit status; the
     * top shell resolves with HALT then, as does `halt` anywhere.
     */
    async session({ top = false } = {}) {
      let status = 0;
      for (;;) {
        say(prompt());
        const text = await line();
        if (text === null) {
          out('exit');
          return top ? HALT : status;
        }
        const r = await run(text);
        if (r === HALT) return HALT;
        if (typeof r === 'object') return top ? HALT : (r.exit ?? status);
        status = last = r;
      }
    },
  };
}
