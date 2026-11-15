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

## Reader styles

A Style menu beside Starlight's Auto/Light/Dark picker lets each reader choose how the site looks. The choice is saved in their browser.

| File | What it does |
| --- | --- |
| `src/components/ThemeProvider.astro` | Runs at the top of `<body>`, before anything paints. It sets `data-style` on `<html>` from `localStorage`, forces the color scheme a style is drawn for, and holds the status bar that Text mode shows. |
| `src/components/ThemeSelect.astro` | The Style menu. Starlight's color-scheme picker hides while a style with only one scheme is chosen. |
| `src/styles/styles.css` | Each style's tokens, then the components written once against them. |
| `src/code-themes/*.json` | Each style's syntax colors for code blocks, used by `ec.config.mjs`. |
| `src/components/run-example.ts` | Reads the terminal demo's colors from the style's tokens. |
| `src/icons/pixel/` | The pixel icons (pixelarticons, MIT) that the styles other than Modern draw in place of Starlight's. `styles.css` names each one in an `--nc-icon-*` token and draws it as a mask, so it takes the color of the text around it. |

The styles are Modern (Starlight's own, following Auto/Light/Dark), Text mode (a blue 16-color console in VT323, with a menu bar, a function-key bar and boxed panels), Workstation (Motif-era beveled gray panels, Charter text, Helvetica-style headings and an xterm terminal) Terminal (amber on near black with VT323 headings) and Manual page (set like a printed man page: Times-metric Tinos and Courier-metric Cousine on paper, bold capital section headings, monochrome code).

Each style but Modern defines Starlight's own tokens (`--sl-*`) and this site's (`--nc-*`). The `--nc-*` tokens name every part a style draws: the menu bar and status bar, the contents, page and "On this page" panels (background, border, shadow, title), headings, links, inline code, code blocks, buttons, the shell listing's title bar, the search dialog, the code hint, the terminal frame, and the terminal's 16 colors (`--nc-ansi-0` to `--nc-ansi-15`). To add a style, copy one style's token block in `styles.css`, add its option to `ThemeSelect.astro`, its color scheme to `modes` in `ThemeProvider.astro`, and a syntax theme to `src/code-themes/` and `ec.config.mjs`. Each style but Modern also draws its own scrollbars at the end of `styles.css`, always shown, with arrow buttons in Chrome and Safari and only the colors in Firefox. The arrow-button rules stand alone, without `:root[data-style]` in front, because Chrome doesn't match them on the page's own scrollbar otherwise. They take effect only where a style sets `::-webkit-scrollbar`. The fonts come from `@fontsource` packages, Latin subsets only, so nothing loads from another site.

Astro caches the code-block stylesheet's name between local builds. After changing `ec.config.mjs`, delete `node_modules/.astro` before building, or the pages link a stylesheet that no longer exists.

## Code hints

In C listings, each call of a curses library function links to its man page, and each use of the listing's own functions and variables links to where it is defined. Hovering or focusing the name shows the function's declaration from the page's SYNOPSIS, so a reader sees its arguments, and the page's NAME summary.

- `scripts/sync.mjs` writes `.generated/symbols.json` from every 3X page: each name from the NAME line, its page, the summary and its declaration from SYNOPSIS (598 of 708 names have one).
- pandoc leaves the man pages' code blocks without a language, so `sync.mjs` marks an indented block in a 3X page as C when it looks like code (a line ending in `;`, an `#include`, a comment or a brace). The blocks are then highlighted and linked like the guides' listings.
- `code-links.mjs` is an Expressive Code plugin, loaded from `ec.config.mjs`. It links a name only when a `(` follows it, so a variable called `box` or `move` stays plain.
- A name the listing defines for itself links to its definition instead: its functions, macros, types and file-scope variables, and each function's parameters and locals. The hint shows the defining line and what the name is, such as "Parameter of print_in_middle(), line 26", and the definition is outlined when the link is followed. `code-defs.mjs` finds the definitions from the text, because most listings are fragments that don't compile alone. It reads comments and strings as blank, follows braces to scope parameters and locals to their function, and takes the innermost definition in scope. Names after `.` or `->` stay plain. A name it misses stays plain too. These links show only on hover or focus, since they are on almost every line.
- `src/components/code-hints.js` draws the hint, and `src/styles/styles.css` styles it from the `--nc-hint-*` tokens of each reader style.

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

A pull request's run (`.github/workflows/docs-site-pr.yml`) builds the site from the merge ref and uploads it as the artifact `site-<tree>`, where `<tree>` is the git tree hash of what it built. When the pull request merges and `master` has the same tree, the `reuse` job in `docs-site.yml` deploys that artifact instead of building again. Both workflows run the same build and checks from `docs-site-build.yml`, so a pull request shows one job and `master` shows reuse, build, deploy and IndexNow. The reuse job takes the artifact only if all of these hold:

- It was uploaded by this repository, not a fork.
- It came from `docs-site-pr.yml`, run on a `pull_request` event.
- That run succeeded.

If no artifact matches, because `master` moved on after the pull request's last run, the `build` job builds and deploys as before. Requiring branches to be up to date before merging makes the trees match every time.

### Build caches

Most of a cold CI run went to the runnable examples. The WebAssembly ncurses build took 46 seconds, and compiling and smoke-testing the examples one at a time took two minutes. Three caches skip that work:

- **The WebAssembly ncurses build** (`.generated/ncurses-wasm`). It is keyed by every tracked file outside `docs/`, `site/`, `man/` and `.github/`, plus `build-examples.mjs` and the Emscripten version. A change to the docs or the site keeps the key, so the library restores and is not rebuilt.
- **Each example build** (`.generated/example-cache/<hash>`). `build-examples.mjs` keys each build of a listing by a hash of its inputs: the listing, its macros and arguments, the libraries it links, `examples/`, the smoke test, the script itself and the `emcc` version. A build whose hash is cached is copied with its smoke-test result. Only listings whose inputs changed are compiled and run, in parallel, one per CPU. CI restores the newest saved set (a partial restore), and the script deletes the entries the run didn't use, so the saved set matches the current examples.
- **Emscripten itself and npm**, through `setup-emsdk` and `setup-node`.

A pull request can restore caches saved only on its own branch or on `master`. When a merge deploys the pull request's build, nothing builds on `master`, so the `cache` job in `docs-site.yml` runs the build there, publishes nothing, and saves the caches for the next pull request. The deploy doesn't wait for it. The same caches work locally: a second `npm run build` reuses `.generated/`.
