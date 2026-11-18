#!/usr/bin/env node
/**
 * Build the guides' runnable examples to WebAssembly, so the site can run them in the page.
 * - ncurses (wide, static, xterm-256color compiled in, no terminfo database) is cross-built
 *   once with Emscripten into .generated/ncurses-wasm/, with the options in terminfo.mjs.
 * - Every complete program in a guide (a ```c block that defines main(), see examples.mjs) is
 *   built, so the program that runs is exactly the listing on the page. Each is then run in
 *   Node (smoke-example.mjs); one that doesn't compile, link, or run is flagged, not built.
 * - examples/pty.js gives the program a terminal: stdin and poll() wait on the page's input
 *   with Asyncify, and stdout goes to xterm.js unbuffered.
 * Output: public/examples/<id>.{mjs,wasm}, status.json, the result for every program, and
 * terminfo.json, what the build does about the terminal database (gitignored). Requires emcc
 * on PATH; without it this prints a note and exits 0, and the site shows the listings without a Run button.
 */
import { execFile, execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { appendFileSync, copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { availableParallelism } from 'node:os';
import { promisify } from 'node:util';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GAMES, GUIDE_DIRS, findPrograms } from './examples.mjs';
import { NCURSES_CONFIGURE, buildFacts } from './terminfo.mjs';

const site = join(dirname(fileURLToPath(import.meta.url)), '..');
const run = promisify(execFile);
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
    ...NCURSES_CONFIGURE,
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
// What this build of ncurses does about the terminal database, from its own Makefile and
// ncurses_cfg.h, for the pretend shell's /usr/share/terminfo and infocmp (terminfo.mjs).
writeFileSync(join(out, 'terminfo.json'), JSON.stringify(buildFacts(wasmBuild, NCURSES_CONFIGURE, repo), null, 2));
const src = join(site, '.generated/examples');
mkdirSync(src, { recursive: true });

// Each build of a listing is cached under a hash of everything it depends on: the listing, its
// macros and arguments, the libraries it links, the files linked in, this script, the smoke
// test and the emcc version. A build whose hash is in .generated/example-cache/ is copied from
// there, result and all, so CI rebuilds only the listings a change touched. Same input, same
// .wasm, same smoke-test result. Entries this run didn't use are deleted at the end, so the
// cache CI saves holds exactly the current examples.
const cacheDir = join(site, '.generated/example-cache');
mkdirSync(cacheDir, { recursive: true });
const fileHash = new Map();
const hashFile = (f) => {
  if (!fileHash.has(f)) fileHash.set(f, createHash('sha256').update(readFileSync(f)).digest('hex'));
  return fileHash.get(f);
};
const emccVersion = execFileSync('emcc', ['--version'], { encoding: 'utf8' }).split('\n')[0];
const toolHash = createHash('sha256')
  .update(emccVersion)
  .update(hashFile(fileURLToPath(import.meta.url)))
  .update(hashFile(join(site, 'scripts/smoke-example.mjs')))
  .update(hashFile(join(site, 'examples/pty.js')))
  .digest('hex');
const used = new Set();
let hits = 0;
let builds = 0;

// Builds run in parallel, one per CPU: emcc and the smoke test each use one core and spend
// much of their time waiting.
const jobs = Math.max(1, availableParallelism());
async function pool(items, fn) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(jobs, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await fn(items[i]);
      }
    }),
  );
  return results;
}

// Build each program, then run it, and record how far it got. A listing that doesn't compile,
// link or run is flagged on its page (status.json) and in the CI summary, not an error.
const status = [];
const tail = (e) => String(e.stderr ?? e.message ?? e).trim().split('\n').slice(-12).join('\n');
const programs = [];
for (const dir of GUIDE_DIRS) {
  for (const file of readdirSync(join(repo, dir)).filter((f) => f.endsWith('.md')).sort()) {
    const shard = `${dir}/${file}`;
    for (const ex of findPrograms(readFileSync(join(repo, shard), 'utf8'), shard)) {
      const entry = { id: ex.id, title: ex.title, shard };
      status.push(entry);
      // A program that shells out gets the pretend shell in examples/pty.js; the page says so.
      if (ex.shell) entry.shell = true;
      programs.push({ ex, entry });
    }
  }
}
// The test programs the pretend shell keeps in /usr/games (examples.mjs): each is built from
// its source in test/ with the test directory's own header, and quits on its own key.
for (const { id, quit, with: also = [] } of GAMES) {
  const source = `test/${id}.c`;
  const entry = { id, title: id, source, hidden: true };
  status.push(entry);
  const ex = {
    id,
    code: readFileSync(join(repo, source), 'utf8'),
    args: [],
    argv: true,
    libs: [],
    macros: [],
    cflags: ['-DHAVE_CONFIG_H', '-I', join(repo, 'test'), '-I', join(repo, 'include')],
    sleep: true,
    quit,
    with: also.map((f) => join(repo, `test/${f}.c`)),
  };
  programs.push({ ex, entry });
}
await pool(programs, async ({ ex, entry }) => Object.assign(entry, await cachedBuild(ex, ex.id, [])));
// A listing that tests a macro of its own (#ifdef _DEBUG) gets a second build with the macro
// defined, so a reader can run the code it hides.
const variantBuilds = programs
  .filter(({ entry }) => entry.status === 'runs')
  .flatMap(({ ex, entry }) =>
    ex.macros.map((name) => ({
      ex,
      entry,
      name,
      vid: `${ex.id}--${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
    })),
  );
const variantResults = await pool(variantBuilds, (v) => cachedBuild(v.ex, v.vid, [v.name]));
variantBuilds.forEach((v, i) => {
  const result = variantResults[i];
  if (result.status === 'runs') (v.entry.variants ??= []).push({ define: v.name, id: v.vid });
  else console.log(`--- ${v.vid}: ${result.status} with -D${v.name}\n${result.detail}`);
});
for (const d of readdirSync(cacheDir)) if (!used.has(d)) rmSync(join(cacheDir, d), { recursive: true, force: true });
console.log(`build-examples: ${hits} build(s) from the cache, ${builds} built, ${jobs} at a time`);

/** One build of a listing: from the cache when its inputs are unchanged, else built and cached. */
async function cachedBuild(ex, id, defines) {
  const libs = [...ex.libs.map((l) => `${l}w`), 'ncursesw'].map((l) => join(wasmBuild, `lib/lib${l}.a`));
  const entryFile = join(site, ex.args.length || ex.argv ? 'examples/main-args.c' : 'examples/main.c');
  const extra = [...(ex.sleep ? [join(site, 'examples/sleep.c')] : []), ...(ex.with ?? [])];
  const key = createHash('sha256')
    .update(JSON.stringify({ id, code: ex.code, defines, args: ex.args, libs: ex.libs, cflags: ex.cflags, quit: ex.quit }))
    .update(toolHash)
    .update(hashFile(entryFile))
    .update(extra.map(hashFile).join())
    .update(libs.map(hashFile).join())
    .digest('hex')
    .slice(0, 32);
  used.add(key);
  const dir = join(cacheDir, key);
  if (existsSync(join(dir, 'result.json'))) {
    const result = JSON.parse(readFileSync(join(dir, 'result.json'), 'utf8'));
    if (result.status === 'runs') for (const ext of ['mjs', 'wasm']) copyFileSync(join(dir, `${id}.${ext}`), join(out, `${id}.${ext}`));
    hits++;
    return result;
  }
  const result = await buildExample(ex, id, defines, libs, [entryFile, ...extra]);
  mkdirSync(dir, { recursive: true });
  if (result.status === 'runs') for (const ext of ['mjs', 'wasm']) copyFileSync(join(out, `${id}.${ext}`), join(dir, `${id}.${ext}`));
  writeFileSync(join(dir, 'result.json'), JSON.stringify(result));
  builds++;
  return result;
}

/** Compile, link and smoke-test one build of a listing; returns { status, detail }. */
async function buildExample(ex, id, defines, libs, entryFiles) {
  const c = join(src, `${id}.c`);
  const obj = join(src, `${id}.o`);
  writeFileSync(c, ex.code);
  const quiet = { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 };
  // main() is renamed to example_main() in the compiled IR, not with -Dmain=: C gives
  // main(), and only main(), an implicit "return 0" at its closing brace, so a listing that
  // ends without a return would otherwise report a garbage exit status.
  const ll = join(src, `${id}.ll`);
  try {
    await run('emcc', [
      '-O2', '-DNCURSES_STATIC', ...defines.map((d) => `-D${d}`), '-S', '-emit-llvm', c, '-o', ll,
      '-I', join(wasmBuild, 'include'),
      ...(ex.cflags ?? []),
      ...ex.libs.map((l) => ['-I', join(repo, l)]).flat(),
    ], quiet);
    const ir = readFileSync(ll, 'utf8')
      .replace(/^@__main_void = .*\n/m, '')
      // main(argc, argv) is __main_argc_argv in WebAssembly.
      .replace(/@(?:__main_argc_argv|main)\b/g, '@example_main');
    writeFileSync(ll, ir);
    await run('emcc', ['-O2', '-c', ll, '-o', obj], quiet);
  } catch (e) {
    return { status: 'compile-error', detail: tail(e) };
  }
  // A listing whose main() takes a file name (the attributes pager) gets its own source to
  // read, embedded as example.c, and the page passes that name as its argument.
  const files = ex.args.length ? ['--embed-file', `${c}@/example.c`] : [];
  try {
    await run('emcc', [
      // The include paths are for the files compiled here: sleep.c, and a game's other files.
      '-O2', '-DNCURSES_STATIC', '-I', join(wasmBuild, 'include'), ...(ex.cflags ?? []), obj, ...entryFiles, ...libs, ...files,
      '-o', join(out, `${id}.mjs`),
      '--js-library', join(site, 'examples/pty.js'),
      '-sASYNCIFY', '-sASYNCIFY_IMPORTS=["fd_read","__syscall_poll","_emscripten_system"]',
      '-sMODULARIZE', '-sEXPORT_ES6', '-sENVIRONMENT=web,node', '-sEXIT_RUNTIME=1',
      '-sEXPORTED_RUNTIME_METHODS=["ENV"]', '-sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE=["$PTY"]',
    ], quiet);
  } catch (e) {
    return { status: 'link-error', detail: tail(e) };
  }
  const smokeEnv = { ...process.env, ...(ex.quit ? { SMOKE_QUIT: ex.quit } : {}) };
  const { stdout } = await run('node', [join(site, 'scripts/smoke-example.mjs'), join(out, `${id}.mjs`), ...ex.args], { ...quiet, env: smokeEnv });
  const result = JSON.parse(stdout.trim().split('\n').pop());
  if (ex.args.length) result.args = ex.args;
  if (result.status !== 'runs' && !process.env.KEEP) for (const ext of ['mjs', 'wasm']) rmSync(join(out, `${id}.${ext}`), { force: true });
  return result;
}
// Each build's .wasm size, so the page can show its download's progress: the server may compress
// it, and then the response's own length isn't the size the page counts.
const wasmBytes = (id) => statSync(join(out, `${id}.wasm`)).size;
for (const entry of status) {
  if (entry.status !== 'runs') continue;
  entry.bytes = wasmBytes(entry.id);
  for (const v of entry.variants ?? []) v.bytes = wasmBytes(v.id);
}
writeFileSync(join(out, 'status.json'), JSON.stringify(status, null, 2));

const flagged = status.filter((e) => e.status !== 'runs');
for (const e of status) console.log(`build-examples: ${e.status.padEnd(13)} ${e.id} (${e.shard ?? e.source})`);
for (const e of flagged) {
  // A GitHub annotation on the shard, and the reason in the job log.
  if (process.env.GITHUB_ACTIONS) console.log(`::warning file=${e.shard ?? e.source},title=Example doesn't run yet::${e.title}: ${e.status}`);
  console.log(`--- ${e.id}: ${e.status}\n${e.detail}`);
}
if (process.env.GITHUB_STEP_SUMMARY) {
  const rows = status.map((e) => `| ${e.title} | \`${e.shard ?? e.source}\` | ${e.status === 'runs' ? 'runs' : `**${e.status}**`} |`);
  appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    `### Runnable examples\n\n${status.length - flagged.length} of ${status.length} run in the browser.\n\n| Example | Shard | Status |\n| --- | --- | --- |\n${rows.join('\n')}\n`,
  );
}
