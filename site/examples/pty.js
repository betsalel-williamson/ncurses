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
  __syscall_poll__deps: ['$PTY', '$ptyWinch'],
  __syscall_poll__async: true,
  __syscall_poll: (fds, nfds, timeout) => {
    const r = Asyncify.handleAsync(async () => {
      const ready = () => {
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
      };
      let n = ready();
      if (n || timeout === 0 || PTY.winch) return n;
      await PTY.wait(timeout);
      return ready();
    });
    if (ptyWinch()) return -27; // EINTR
    return r;
  },
});
