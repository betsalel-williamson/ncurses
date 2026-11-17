/**
 * The pretend shell an example's terminal comes back to (run-example.ts). A web page has no real
 * shell, so this one reads a line at a time with its own echo, as a shell in cooked mode does,
 * and knows a few commands. It can run any example the site has built, by name, and it can
 * power the terminal off. A program that calls system() gets one too, nested under it: there
 * `exit` goes back to the program, with the exit status a real system() reports.
 */

/** What `halt`, or `exit` at the top shell, returns: the terminal powers off. */
export const HALT = 'halt';

/** Each line fits the narrowest terminal the page offers (60 columns). */
export const HELP =
  'A pretend shell, since a web page has no real one.\r\n' +
  'ls lists the programs on this site; ./name runs one.\r\n' +
  'It also knows echo, pwd, date, whoami, uname, clear, help.\r\n' +
  'exit leaves this shell; halt powers the terminal off.\r\n';

/** Names a shell is started by, so system("sh") gets a prompt rather than one command. */
export const SHELL_NAMES = /^\s*(?:(?:\/usr)?\/bin\/)?(?:sh|bash|ksh|zsh|dash)\s*$|^\s*\$SHELL\s*$/;

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

/**
 * A shell. `write` sends text to the terminal; `programs()` names the examples it can run;
 * `launch(name)` runs one and resolves with its exit status, or HALT when the terminal powered
 * off while it ran; `cols()` is the terminal's width. Keys go in through `feed`.
 */
export function createShell({ write, programs, launch, cols = () => 80 }) {
  const queue = [];
  let waiter = null;
  const say = (text) => write(text);
  const out = (text) => say(`${text}\r\n`);

  const next = async () => {
    while (!queue.length) await new Promise((resolve) => (waiter = resolve));
    return queue.shift();
  };

  /** One line, echoed as it is typed; null at Ctrl-D on an empty line. */
  const line = async () => {
    let text = '';
    let esc = 0;
    for (;;) {
      const ch = await next();
      const b = ch.charCodeAt(0);
      // Function and cursor keys (ESC [ ... or ESC O x) mean nothing at this prompt.
      if (esc) {
        if (esc === 1 && (ch === '[' || ch === 'O')) esc = 2;
        else if (b >= 0x40 && b <= 0x7e) esc = 0;
        continue;
      }
      if (ch === '\x1b') esc = 1;
      else if (ch === '\r' || ch === '\n') {
        say('\r\n');
        return text;
      } else if (ch === '\x04') {
        if (!text) return null;
      } else if (ch === '\x03') {
        say('^C\r\n');
        return '';
      } else if (ch === '\x7f' || ch === '\b') {
        if (text) {
          text = text.slice(0, -1);
          say('\b \b');
        }
      } else if (ch === '\x15') {
        say('\b \b'.repeat(text.length));
        text = '';
      } else if (b >= 0x20 && b !== 0x7f) {
        text += ch;
        say(ch);
      }
    }
  };

  /** The example a command names: `name`, `./name` or `/home/reader/name`. */
  const program = (word) => {
    const name = word.replace(/^(?:\.|\/home\/reader)\//, '');
    return programs().includes(name) ? name : null;
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
      case 'ls':
        for (const l of columns(programs(), cols())) out(l);
        return 0;
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
    const name = program(cmd);
    if (name) return launch(name);
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
