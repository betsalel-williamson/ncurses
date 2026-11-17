// Terminal I/O for curses programs in the browser: stdin from a JS queue, stdout/stderr to a
// JS sink, poll() that waits on the queue. Blocking calls suspend the program with Asyncify.
// A resize changes the size TIOCGWINSZ reports, then interrupts the wait the program is in with
// SIGWINCH and EINTR, as a terminal does, so curses sees KEY_RESIZE.
addToLibrary({
  $PTY__deps: ['$TTY'],
  $PTY: {
    input: [],
    waiter: null,
    rows: 24,
    cols: 80,
    winch: false,
    inShell: false,
    write: (bytes) => {},
    wake() {
      const w = PTY.waiter; PTY.waiter = null; if (w) w();
    },
    push(bytes) {
      for (const b of bytes) PTY.input.push(b);
      PTY.wake();
    },
    resize(rows, cols) {
      PTY.rows = rows; PTY.cols = cols; PTY.winch = true;
      PTY.wake();
    },
    wait(timeout) {
      return new Promise((resolve) => {
        let timer = null;
        PTY.waiter = () => { if (timer) clearTimeout(timer); resolve(); };
        if (timeout >= 0) timer = setTimeout(() => { PTY.waiter = null; resolve(); }, timeout);
      });
    },
  },
  $PTY__postset: 'Module["pty"] = PTY; TTY.default_tty_ops.ioctl_tiocgwinsz = () => [PTY.rows, PTY.cols];',
  // Called on the resumed stack, where it is safe to run the program's signal handler.
  $ptyWinch__deps: ['$PTY', 'raise'],
  $ptyWinch: () => {
    if (!PTY.winch || Asyncify.state !== Asyncify.State.Normal) return false;
    PTY.winch = false;
    _raise(28); // SIGWINCH
    return true;
  },
  fd_write__deps: ['$PTY'],
  fd_write: (fd, iov, iovcnt, pnum) => {
    let n = 0;
    for (let i = 0; i < iovcnt; i++) {
      const ptr = HEAPU32[(iov + i * 8) >> 2], len = HEAPU32[(iov + i * 8 + 4) >> 2];
      if (len) PTY.write(HEAPU8.slice(ptr, ptr + len));
      n += len;
    }
    HEAPU32[pnum >> 2] = n;
    return 0;
  },
  fd_read__deps: ['$PTY', '$ptyWinch', '$doReadv'],
  fd_read__async: true,
  fd_read: (fd, iov, iovcnt, pnum) => {
    // Anything but stdin is a file the program opened (the attributes pager reads one).
    if (fd !== 0) {
      HEAPU32[pnum >> 2] = doReadv(SYSCALLS.getStreamFromFD(fd), iov, iovcnt);
      return 0;
    }
    const r = Asyncify.handleAsync(async () => {
      while (!PTY.input.length && !PTY.winch) await PTY.wait(-1);
      let n = 0;
      for (let i = 0; i < iovcnt && PTY.input.length; i++) {
        const ptr = HEAPU32[(iov + i * 8) >> 2], len = HEAPU32[(iov + i * 8 + 4) >> 2];
        while (n < len && PTY.input.length) HEAPU8[ptr + n++] = PTY.input.shift();
      }
      HEAPU32[pnum >> 2] = n;
      return 0;
    });
    if (fd === 0 && ptyWinch()) return 27; // EINTR
    return r;
  },
  // system() where the page gives no shell of its own (in Node, for the smoke test): a web page
  // has no shell, so a small pretend one stands in. A program that shells
  // out (system("sh"), system("/bin/sh")) gets a prompt in the terminal's normal screen, the one
  // endwin() returned to; any other command runs once. It reads a line at a time with its own
  // echo, as a shell in cooked mode does, and knows a few commands; `exit` returns to the program
  // with the status a real system() gives (the exit code times 256).
  $ptyShell__deps: ['$PTY'],
  $ptyShell: {
    // Each line fits the narrowest terminal size the page offers.
    HELP: 'A pretend shell, since a web page has no real one.\r\n' +
      'It knows echo, pwd, ls, cat, date, whoami, uname, clear\r\n' +
      'and help. Type exit, or press Ctrl-D, to go back.\r\n',
    say(text) {
      PTY.write(new TextEncoder().encode(text));
    },
    /** One line from the terminal, echoed as it is typed; null at Ctrl-D on an empty line. */
    async line() {
      let text = '';
      let esc = 0;
      for (;;) {
        while (!PTY.input.length) await PTY.wait(-1);
        const b = PTY.input.shift();
        // Function and cursor keys (ESC [ ... or ESC O x) mean nothing at this prompt.
        if (esc) { if (esc === 1 && (b === 0x5b || b === 0x4f)) esc = 2; else if (b >= 0x40 && b <= 0x7e) esc = 0; continue; }
        if (b === 0x1b) { esc = 1; continue; }
        if (b === 0x0d || b === 0x0a) { ptyShell.say('\r\n'); return text; }
        if (b === 0x04 && !text) { ptyShell.say('exit\r\n'); return null; }
        if (b === 0x03) { ptyShell.say('^C\r\n'); return ''; }
        if (b === 0x7f || b === 0x08) { if (text) { text = text.slice(0, -1); ptyShell.say('\b \b'); } continue; }
        if (b === 0x15) { ptyShell.say('\b \b'.repeat(text.length)); text = ''; continue; }
        if (b >= 0x20 && b < 0x7f) { text += String.fromCharCode(b); ptyShell.say(String.fromCharCode(b)); }
      }
    },
    /** Runs one command line; returns its exit status, or ['exit', status]. */
    run(line) {
      const words = line.trim().split(/\s+/).filter(Boolean);
      if (!words.length) return 0;
      const [cmd, ...args] = words;
      const out = (t) => ptyShell.say(`${t}\r\n`);
      switch (cmd) {
        case 'exit': return ['exit', Number.parseInt(args[0] ?? '0', 10) & 255 || 0];
        case 'echo': out(args.join(' ')); return 0;
        case 'pwd': out('/home/reader'); return 0;
        case 'ls': out('example.c'); return 0;
        case 'cat':
          if (args[0] === 'example.c') { out('/* The listing above this terminal, compiled to WebAssembly. */'); return 0; }
          out(`cat: ${args[0] ?? '-'}: No such file or directory`); return 1;
        case 'date': out(new Date().toString()); return 0;
        case 'whoami': out('reader'); return 0;
        case 'uname': out(args.includes('-a') ? 'Emscripten browser 1.0 wasm32 (pretend shell)' : 'Emscripten'); return 0;
        case 'clear': ptyShell.say('\x1b[H\x1b[2J'); return 0;
        case 'help': ptyShell.say(ptyShell.HELP); return 0;
        case 'true': case ':': return 0;
        case 'false': return 1;
        case 'sh': case 'bash': case '/bin/sh': out('sh: already in the pretend shell'); return 0;
        default: out(`sh: ${cmd}: not found`); return 127;
      }
    },
    async system(command) {
      const shell = /^\s*(?:\/bin\/|\/usr\/bin\/)?(?:sh|bash|ksh|zsh|dash)\s*$/.test(command) || command === '$SHELL';
      if (!shell) {
        const r = ptyShell.run(command);
        return (Array.isArray(r) ? r[1] : r) << 8;
      }
      PTY.inShell = true;
      // Back to the normal screen, as endwin() leaves a real terminal. (1047, not 1049, which the
      // page drops so a program's last screen stays in view.)
      ptyShell.say('\x1b[?1047l\x1b[?25h' + ptyShell.HELP);
      let status = 0;
      for (;;) {
        ptyShell.say('$ ');
        const line = await ptyShell.line();
        if (line === null) break;
        const r = ptyShell.run(line);
        if (Array.isArray(r)) { status = r[1]; break; }
        status = r;
      }
      PTY.inShell = false;
      return status << 8;
    },
  },
  // musl's system() calls _emscripten_system, which in Node would run a real shell. A page that
  // gives Module.shell (run-example.ts) answers with its own shell, which can run the site's
  // other examples; it resolves with the exit status. Without one, the shell above answers.
  _emscripten_system__deps: ['$ptyShell'],
  _emscripten_system__async: true,
  _emscripten_system: (command) => {
    if (!command) return 1; // a shell is available
    const text = UTF8ToString(command);
    const page = Module['shell'];
    return Asyncify.handleAsync(async () => (page ? ((await page(text)) & 255) << 8 : ptyShell.system(text)));
  },
  // Which of the descriptors poll() asks about are ready: stdin when a key is queued, any
  // other for writing. Fills in revents and returns the count.
  $ptyReady__deps: ['$PTY'],
  $ptyReady: (fds, nfds) => {
    let count = 0;
    for (let i = 0; i < nfds; i++) {
      const p = fds + i * 8, fd = HEAP32[p >> 2], events = HEAP16[(p + 4) >> 1];
      let rev = 0;
      if (fd === 0 && (events & 1) && PTY.input.length) rev |= 1;       // POLLIN
      if (fd !== 0 && (events & 4)) rev |= 4;                             // POLLOUT
      HEAP16[(p + 6) >> 1] = rev;
      if (rev) count++;
    }
    return count;
  },
  // poll() with a zero timeout comes here instead (Emscripten's musl), and Emscripten's own
  // answer calls stdin always ready: nodelay() and timeout(0) programs then blocked in read().
  __syscall_poll_nonblocking__deps: ['$ptyReady'],
  __syscall_poll_nonblocking: (fds, nfds) => ptyReady(fds, nfds),
  __syscall_poll__deps: ['$PTY', '$ptyWinch', '$ptyReady'],
  __syscall_poll__async: true,
  __syscall_poll: (fds, nfds, timeout) => {
    const r = Asyncify.handleAsync(async () => {
      const ready = () => ptyReady(fds, nfds);
      let n = ready();
      if (n || timeout === 0 || PTY.winch) return n;
      await PTY.wait(timeout);
      return ready();
    });
    if (ptyWinch()) return -27; // EINTR
    return r;
  },
});
