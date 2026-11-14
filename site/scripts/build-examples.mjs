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
import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GUIDE_DIRS, findPrograms } from './examples.mjs';

const site = join(dirname(fileURLToPath(import.meta.url)), '..');
const repo = join(site, '..');
const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { stdio: 'inherit', ...opts });

try {
  execFileSync('emcc', ['--version'], { stdio: 'ignore' });
} catch {
  console.log('build-examples: emcc not found, skipping the runnable examples');
  process.exit(0);
}

const build = join(site, '.generated/ncurses-wasm');
if (!existsSync(join(build, 'lib/libncursesw.a'))) {
  mkdirSync(build, { recursive: true });
  run('emconfigure', [
    join(repo, 'configure'),
    '--host=wasm32-unknown-emscripten',
    '--build=x86_64-pc-linux-gnu',
    '--with-build-cc=cc',
    '--without-shared', '--without-cxx', '--without-cxx-binding', '--without-ada',
    '--without-progs', '--without-tests', '--without-manpages', '--without-debug',
    '--disable-database', '--with-fallbacks=xterm-256color',
    '--disable-stripping', '--enable-widec', '--without-pthread',
  ], { cwd: build, stdio: ['ignore', 'ignore', 'inherit'] });
  run('emmake', ['make', '-j4', 'libs'], { cwd: build, stdio: ['ignore', 'ignore', 'inherit'] });
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
      const c = join(src, `${ex.id}.c`);
      const obj = join(src, `${ex.id}.o`);
      writeFileSync(c, ex.code);
      const quiet = { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' };
      // main() is renamed to example_main() in the compiled IR, not with -Dmain=: C gives
      // main(), and only main(), an implicit "return 0" at its closing brace, so a listing that
      // ends without a return would otherwise report a garbage exit status.
      const ll = join(src, `${ex.id}.ll`);
      try {
        execFileSync('emcc', [
          '-O2', '-DNCURSES_STATIC', '-S', '-emit-llvm', c, '-o', ll,
          '-I', join(build, 'include'),
          ...ex.libs.map((l) => ['-I', join(repo, l)]).flat(),
        ], quiet);
        const ir = readFileSync(ll, 'utf8')
          .replace(/^@__main_void = .*\n/m, '')
          .replace(/@main\b/g, '@example_main');
        writeFileSync(ll, ir);
        execFileSync('emcc', ['-O2', '-c', ll, '-o', obj], quiet);
      } catch (e) {
        Object.assign(entry, { status: 'compile-error', detail: tail(e) });
        continue;
      }
      const libs = [...ex.libs.map((l) => `${l}w`), 'ncursesw'].map((l) => join(build, `lib/lib${l}.a`));
      try {
        execFileSync('emcc', [
          '-O2', obj, join(site, 'examples/main.c'), ...libs,
          '-o', join(out, `${ex.id}.mjs`),
          '--js-library', join(site, 'examples/pty.js'),
          '-sASYNCIFY', '-sASYNCIFY_IMPORTS=["fd_read","__syscall_poll"]',
          '-sMODULARIZE', '-sEXPORT_ES6', '-sENVIRONMENT=web,node', '-sEXIT_RUNTIME=1',
          '-sEXPORTED_RUNTIME_METHODS=["ENV"]', '-sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE=["$PTY"]',
        ], quiet);
      } catch (e) {
        Object.assign(entry, { status: 'link-error', detail: tail(e) });
        continue;
      }
      const smoke = execFileSync('node', [join(site, 'scripts/smoke-example.mjs'), join(out, `${ex.id}.mjs`)], quiet);
      Object.assign(entry, JSON.parse(smoke.trim().split('\n').pop()));
      if (entry.status !== 'runs') for (const ext of ['mjs', 'wasm']) rmSync(join(out, `${ex.id}.${ext}`), { force: true });
    }
  }
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
