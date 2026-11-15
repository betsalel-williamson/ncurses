# Docs site

This is the Starlight site for the ncurses documentation, published at https://betsalel-williamson.github.io/ncurses/. The guides' source lives in `docs/` as shards. The manual pages stay troff under `man/`, and `scripts/sync.mjs` turns both into site pages. This file is for people working on the site itself.

## Build

```bash
cd site
npm ci
npm run build      # sync.mjs, then build-examples.mjs, then astro build
npx astro preview  # serves dist/ at http://localhost:4321/ncurses/
```

The runnable examples need Emscripten (`emcc` on `PATH`). Without it, `build-examples.mjs` skips them and the rest of the site still builds.

## Runnable examples

Every complete C program in the guides (a listing with a `main()`) gets a "Run this example" button. The program runs in the reader's browser, compiled to WebAssembly and drawn in an xterm.js terminal.

| File | What it does |
| --- | --- |
| `scripts/examples.mjs` | Finds the programs in the guide shards and the libraries each one links. |
| `scripts/build-examples.mjs` | Builds ncurses once with Emscripten, then compiles, links and smoke-tests each program. It writes `public/examples/<id>.{mjs,wasm}` and `status.json`. |
| `scripts/smoke-example.mjs` | Runs one build in Node on a fake 80×24 xterm and decides whether it runs. |
| `examples/main.c`, `examples/main-args.c` | Entry points. They call the listing's `main()`, renamed `example_main()`, and pass its result to `exit()`. |
| `examples/pty.js` | The terminal bridge between the program and the page. |
| `src/components/run-example.ts` | The button, the terminal, the size picker and the "Run with X defined" variants. |

### The terminal bridge waits on events

A curses program is a loop that asks for the next input. It calls `getch()`, which reads stdin. When ncurses needs to wait with a time limit, it calls `poll()`. Examples of those waits:

- ESCDELAY, which tells a lone Esc from the start of an arrow key.
- Mouse click resolution, where ncurses waits up to the mouse interval for the release that turns a press into a click.
- `halfdelay()` and `timeout()`.

In the browser, nothing about this is a busy loop. `pty.js` implements `read()` (`fd_read`) and `poll()` (`__syscall_poll`) as Asyncify imports. When the program blocks, Asyncify suspends it and returns control to the page. The call then awaits a promise, which resolves for one of three reasons:

- xterm.js's `onData` event delivers a keypress or a mouse report through `pty.push()`.
- The page resizes the terminal through `pty.resize()`.
- The `poll()` timeout passes.

The program then resumes where it stopped. The C code keeps the polling model that curses teaches, and the page underneath it runs on events.

A resize sets the size that `TIOCGWINSZ` reports. It then interrupts the wait with `SIGWINCH` and `EINTR`, as a real terminal does, so the program gets `KEY_RESIZE`.

### ncurses must use `poll()`, not `select()`

ncurses waits with `poll()` only when configure finds a working one. That test runs a program, which configure can't do when it cross-compiles to WebAssembly. Without the test result, ncurses falls back to `select()`. Emscripten's `select()` reports stdin ready at once instead of waiting, which causes two bugs:

- Timed waits never wait.
- After a mouse press, ncurses keeps reading mouse reports until a key arrives, so every click after the first is held back.

`build-examples.mjs` therefore runs configure with `cf_cv_working_poll=yes`. If you change how ncurses is configured, keep that setting, and check that `emnm .generated/ncurses-wasm/lib/libncursesw.a` lists `poll`, not `select`.

### The smoke test

A program's button appears only if its build passes the smoke test. The test runs the program in Node and requires it to draw something and to keep running until it gets input. It must then exit with status 0 after one of these, tried in order:

1. F1, up to three times.
2. Enter, then F1. A program reading a line with `getstr()` ignores F1 until the line ends.
3. A click on the word Exit, for a program that turned on mouse tracking. The test finds the word on a rough model of the 80×24 screen.

A program that fails shows a note instead of a button, with its build log, and CI lists it in the run summary.

### Build messages

`build-examples.mjs` sorts what the ncurses build prints to stderr. Messages in its `EXPECTED` list are counted and hidden, each with the reason it is safe. Any other line is printed, and in CI it also becomes a warning annotation on the run. The expected messages are:

- `cross compiling: assume setvbuf params not reversed`. Configure can't run its test program, and the assumption is right for musl.
- `MB_LEN_MAX is missing/inconsistent`. musl sets it to 4, and ncurses falls back to its own value of 16, which is what it needs.
- `cat: write error: Broken pipe`. `make_hash` reads only the lines it needs, so the `cat` feeding it sees the pipe close early.
- `creating temporary terminfo directory...` and `removing temporary terminfo directory...`. `MKfallback.sh` prints these when it compiles the built-in xterm-256color entry with the host's `tic`, so they appear only where `tic` is installed.
- The `emconfigure` and `emmake` banner lines.

Two warnings are fixed rather than hidden. Configure gets `CPPFLAGS=-D_XOPEN_SOURCE=600`, which ends the `_POSIX_C_SOURCE` and `_XOPEN_SOURCE` warnings. `CFLAGS` adds `-Wno-unknown-warning-option`, because clang doesn't know the GCC-only warning that one ncurses pragma names.

### Deploying a merge without rebuilding

A pull request's run builds the site from the merge ref and uploads it as the artifact `site-<tree>`, where `<tree>` is the git tree hash of what it built. When the pull request merges and `master` has the same tree, the `reuse` job deploys that artifact instead of building again. It uses the artifact only if all of these hold:

- It was uploaded by this repository, not a fork.
- It came from this workflow, run on a `pull_request` event.
- That run succeeded.

If no artifact matches, because `master` moved on after the pull request's last run, the `build` job builds and deploys as before. Requiring branches to be up to date before merging makes the trees match every time.
