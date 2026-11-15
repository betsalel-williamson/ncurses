#!/usr/bin/env node
/**
 * Build the guides' runnable examples to WebAssembly, so the site can run them in the page.
 * - ncurses (wide, static, xterm-256color compiled in, no terminfo database) is cross-built
 *   once with Emscripten into .generated/ncurses-wasm/.
 * - Every complete program in a guide (a ```c block that defines main(), see examples.mjs) is
 *   built, so the program that runs is exactly the listing on the page. Each is then run in
 *   Node (smoke-example.mjs); one that doesn't compile, link, or run is flagged, not built.
 * - examples/pty.js gives the program a terminal: stdin and poll() wait on the page's input
 *   with Asyncify, and stdout goes to xterm.js unbuffered.
 * Output: public/examples/<id>.{mjs,wasm} and status.json, the result for every program
 * (gitignored). Requires emcc on PATH; without it
 * this prints a note and exits 0, and the site shows the listings without a Run button.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GUIDE_DIRS, findPrograms } from './examples.mjs';

const site = join(dirname(fileURLToPath(import.meta.url)), '..');
const repo = join(site, '..');

try {
  execFileSync('emcc', ['--version'], { stdio: 'ignore' });
} catch {
  console.log('build-examples: emcc not found, skipping the runnable examples');
  process.exit(0);
}

const wasmBuild = join(site, '.generated/ncurses-wasm');
const expected = new Set();
let unexpected = 0;

/**
 * Messages the ncurses build prints that are expected for this cross-build, each with the
 * reason it is safe. They are counted, not printed; anything else on stderr is printed, and in
 * CI it becomes a warning annotation. site/README.md explains each one.
 */
const EXPECTED = [
  // A cross-build can't run the test, and Emscripten's libc (musl) takes setvbuf's arguments
  // in the standard order, which is what configure assumes.
  [/^configure: WARNING: cross compiling: assume setvbuf params not reversed$/, 'setvbuf'],
  // musl's MB_LEN_MAX is 4, the longest UTF-8 sequence. configure wants at least 6, so
  // ncurses uses its own value, 16 (term.priv.h): larger buffers, never smaller.
  [/^configure: WARNING: MB_LEN_MAX is missing\/inconsistent in system headers$/, 'MB_LEN_MAX'],
  // make_hash reads only as many capability lines as its table holds and exits, so the cat
  // feeding it (MKcaptab.sh, MKuserdefs.sh) can find the pipe closed. The tables are complete.
  [/^cat: write error: Broken pipe$/, 'make_hash pipe'],
  // MKfallback.sh compiles the xterm-256color fallback entry with the host's tic in a scratch
  // directory, and says so on stderr. It prints this only where tic is installed.
  [/^(creating|removing) temporary terminfo directory\.\.\.$/, 'fallback terminfo'],
  // emconfigure and emmake name the command they run.
  [/^em(configure|make): /, null],
];

/** Runs one step of the ncurses build, sorting its stderr into expected and new messages. */
function buildStep(cmd, args, env = {}) {
  const r = spawnSync(cmd, args, {
    cwd: wasmBuild,
    env: { ...process.env, ...env },
    stdio: ['ignore', 'ignore', 'pipe'],
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  const stderr = r.stderr ?? '';
  if (r.status !== 0) {
    process.stderr.write(stderr);
    throw new Error(`${cmd} failed (${r.status ?? r.signal ?? r.error})`);
  }
  for (const line of String(stderr).split('\n').filter(Boolean)) {
    const known = EXPECTED.find(([re]) => re.test(line));
    if (known) {
      if (known[1]) expected.add(known[1]);
    } else {
      unexpected++;
      console.log(line);
      if (process.env.GITHUB_ACTIONS) console.log(`::warning title=ncurses build::${line}`);
    }
  }
}
if (!existsSync(join(wasmBuild, 'lib/libncursesw.a'))) {
  mkdirSync(wasmBuild, { recursive: true });
  buildStep('emconfigure', [
    join(repo, 'configure'),
    '--host=wasm32-unknown-emscripten',
    '--build=x86_64-pc-linux-gnu',
    '--with-build-cc=cc',
    '--without-shared', '--without-cxx', '--without-cxx-binding', '--without-ada',
    '--without-progs', '--without-tests', '--without-manpages', '--without-debug',
    '--disable-database', '--with-fallbacks=xterm-256color',
    '--disable-stripping', '--enable-widec', '--without-pthread',
  ], {
    // configure can't run its poll() test when cross-compiling, and without it ncurses waits
    // with select(), which Emscripten answers at once. examples/pty.js gives poll() a real wait,
    // which mouse click resolution and ESCDELAY need.
    cf_cv_working_poll: 'yes',
    // musl shows the X/Open interfaces without a feature macro, so configure's probe finds no
    // need for one and the wide-character build falls back to guessing. Naming the level
    // ncurses asks for on other systems settles both checks.
    CPPFLAGS: '-D_XOPEN_SOURCE=600',
    // ncurses silences a GCC analyzer warning with a pragma that clang doesn't know.
    CFLAGS: '-g -O2 -Wno-unknown-warning-option',
  });
  buildStep('emmake', ['make', '-j4', 'libs']);
  const seen = expected.size ? ` (${[...expected].join(', ')})` : '';
  console.log(
    unexpected
      ? `build-examples: ncurses build printed ${unexpected} unexpected message(s), shown above${seen}`
      : `build-examples: ncurses build printed only expected messages${seen}`,
  );
}

const out = join(site, 'public/examples');
mkdirSync(out, { recursive: true });
const src = join(site, '.generated/examples');
mkdirSync(src, { recursive: true });

// Build each program, then run it, and record how far it got. A listing that doesn't compile,
// link or run is flagged on its page (status.json) and in the CI summary, not an error.
const status = [];
const tail = (e) => String(e.stderr ?? e.message ?? e).trim().split('\n').slice(-12).join('\n');
for (const dir of GUIDE_DIRS) {
  for (const file of readdirSync(join(repo, dir)).filter((f) => f.endsWith('.md')).sort()) {
    const shard = `${dir}/${file}`;
    for (const ex of findPrograms(readFileSync(join(repo, shard), 'utf8'), shard)) {
      const entry = { id: ex.id, title: ex.title, shard };
      status.push(entry);
      Object.assign(entry, buildExample(ex, ex.id, []));
      if (entry.status !== 'runs') continue;
      // A listing that tests a macro of its own (#ifdef _DEBUG) gets a second build with the
      // macro defined, so a reader can run the code it hides.
      const variants = [];
      for (const name of ex.macros) {
        const vid = `${ex.id}--${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
        const result = buildExample(ex, vid, [name]);
        if (result.status === 'runs') variants.push({ define: name, id: vid });
        else console.log(`--- ${vid}: ${result.status} with -D${name}\n${result.detail}`);
      }
      if (variants.length) entry.variants = variants;
    }
  }
}

/** Compile, link and smoke-test one build of a listing; returns { status, detail }. */
function buildExample(ex, id, defines) {
  const c = join(src, `${id}.c`);
  const obj = join(src, `${id}.o`);
  writeFileSync(c, ex.code);
  const quiet = { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' };
  // main() is renamed to example_main() in the compiled IR, not with -Dmain=: C gives
  // main(), and only main(), an implicit "return 0" at its closing brace, so a listing that
  // ends without a return would otherwise report a garbage exit status.
  const ll = join(src, `${id}.ll`);
  try {
    execFileSync('emcc', [
      '-O2', '-DNCURSES_STATIC', ...defines.map((d) => `-D${d}`), '-S', '-emit-llvm', c, '-o', ll,
      '-I', join(wasmBuild, 'include'),
      ...ex.libs.map((l) => ['-I', join(repo, l)]).flat(),
    ], quiet);
    const ir = readFileSync(ll, 'utf8')
      .replace(/^@__main_void = .*\n/m, '')
      // main(argc, argv) is __main_argc_argv in WebAssembly.
      .replace(/@(?:__main_argc_argv|main)\b/g, '@example_main');
    writeFileSync(ll, ir);
    execFileSync('emcc', ['-O2', '-c', ll, '-o', obj], quiet);
  } catch (e) {
    return { status: 'compile-error', detail: tail(e) };
  }
  const libs = [...ex.libs.map((l) => `${l}w`), 'ncursesw'].map((l) => join(wasmBuild, `lib/lib${l}.a`));
  // A listing whose main() takes a file name (the attributes pager) gets its own source to
  // read, embedded as example.c, and the page passes that name as its argument.
  const files = ex.args.length ? ['--embed-file', `${c}@/example.c`] : [];
  const entry = join(site, ex.args.length ? 'examples/main-args.c' : 'examples/main.c');
  try {
    execFileSync('emcc', [
      '-O2', obj, entry, ...libs, ...files,
      '-o', join(out, `${id}.mjs`),
      '--js-library', join(site, 'examples/pty.js'),
      '-sASYNCIFY', '-sASYNCIFY_IMPORTS=["fd_read","__syscall_poll"]',
      '-sMODULARIZE', '-sEXPORT_ES6', '-sENVIRONMENT=web,node', '-sEXIT_RUNTIME=1',
      '-sEXPORTED_RUNTIME_METHODS=["ENV"]', '-sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE=["$PTY"]',
    ], quiet);
  } catch (e) {
    return { status: 'link-error', detail: tail(e) };
  }
  const smoke = execFileSync('node', [join(site, 'scripts/smoke-example.mjs'), join(out, `${id}.mjs`), ...ex.args], quiet);
  const result = JSON.parse(smoke.trim().split('\n').pop());
  if (ex.args.length) result.args = ex.args;
  if (result.status !== 'runs') for (const ext of ['mjs', 'wasm']) rmSync(join(out, `${id}.${ext}`), { force: true });
  return result;
}
writeFileSync(join(out, 'status.json'), JSON.stringify(status, null, 2));

const flagged = status.filter((e) => e.status !== 'runs');
for (const e of status) console.log(`build-examples: ${e.status.padEnd(13)} ${e.id} (${e.shard})`);
for (const e of flagged) {
  // A GitHub annotation on the shard, and the reason in the job log.
  if (process.env.GITHUB_ACTIONS) console.log(`::warning file=${e.shard},title=Example doesn't run yet::${e.title}: ${e.status}`);
  console.log(`--- ${e.id}: ${e.status}\n${e.detail}`);
}
if (process.env.GITHUB_STEP_SUMMARY) {
  const rows = status.map((e) => `| ${e.title} | \`${e.shard}\` | ${e.status === 'runs' ? 'runs' : `**${e.status}**`} |`);
  appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    `### Runnable examples\n\n${status.length - flagged.length} of ${status.length} run in the browser.\n\n| Example | Shard | Status |\n| --- | --- | --- |\n${rows.join('\n')}\n`,
  );
}
