#!/usr/bin/env node
/**
 * Build the guides' runnable examples to WebAssembly, so the site can run them in the page.
 * - ncurses (wide, static, xterm-256color compiled in, no terminfo database) is cross-built
 *   once with Emscripten into .generated/ncurses-wasm/.
 * - Each example in examples/examples.json is the first C code block after its marker line in
 *   its shard, so the program that runs is exactly the listing on the page.
 * - examples/pty.js gives the program a terminal: stdin and poll() wait on the page's input
 *   with Asyncify, and stdout goes to xterm.js unbuffered.
 * Output: public/examples/<id>.{mjs,wasm} (gitignored). Requires emcc on PATH; without it
 * this prints a note and exits 0, and the site shows the listings without a Run button.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

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
const examples = JSON.parse(readFileSync(join(site, 'examples/examples.json'), 'utf8'));
for (const ex of examples) {
  const text = readFileSync(join(repo, ex.shard), 'utf8');
  const at = text.indexOf(ex.after);
  const block = at < 0 ? null : /^```c\n([\s\S]*?)^```$/m.exec(text.slice(at));
  if (!block) throw new Error(`${ex.id}: no \`\`\`c block after "${ex.after}" in ${ex.shard}`);
  const file = join(src, `${ex.id}.c`);
  writeFileSync(file, block[1]);
  const libs = [...ex.libs.map((l) => `${l}w`), 'ncursesw'].map((l) => join(build, `lib/lib${l}.a`));
  const obj = join(src, `${ex.id}.o`);
  run('emcc', [
    '-O2', '-DNCURSES_STATIC', '-Dmain=example_main', '-c', file, '-o', obj,
    '-I', join(build, 'include'),
    ...ex.libs.map((l) => ['-I', join(repo, l)]).flat(),
  ]);
  run('emcc', [
    '-O2', obj, join(site, 'examples/main.c'), ...libs,
    '-o', join(out, `${ex.id}.mjs`),
    '--js-library', join(site, 'examples/pty.js'),
    '-sASYNCIFY', '-sASYNCIFY_IMPORTS=["fd_read","__syscall_poll"]',
    '-sMODULARIZE', '-sEXPORT_ES6', '-sENVIRONMENT=web,node', '-sEXIT_RUNTIME=1',
    '-sEXPORTED_RUNTIME_METHODS=["ENV"]', '-sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE=["$PTY"]',
  ]);
  console.log(`build-examples: ${ex.id}`);
}
