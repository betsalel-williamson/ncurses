#!/usr/bin/env node
/**
 * Keep the C listings in docs/ in one style.
 * - A complete program (a block with a main() definition) must be as clang-format leaves it,
 *   with docs/.clang-format: the ncurses source style, indented with spaces. clang-format
 *   leaves trailing comments where they are, because it can't keep a multi-line comment's
 *   continuation lines under its first line.
 * - Trailing comments line up: every one in a declaration listing, and those in each run of
 *   lines (no blank line between) in a program.
 * Usage: node site/scripts/check-listings.mjs [--fix]   (--fix reformats complete programs)
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '../..');
const docs = join(repo, 'docs');
const fix = process.argv.includes('--fix');
const style = `file:${join(docs, '.clang-format')}`;

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.md') ? [p] : [];
  });

const problems = [];
for (const file of walk(docs)) {
  const rel = relative(repo, file);
  const text = readFileSync(file, 'utf8');
  let changed = false;
  const out = text.replace(/^```c\n([\s\S]*?)^```$/gm, (block, body, offset) => {
    let code = body;
    const startLine = text.slice(0, offset).split('\n').length + 1;
    if (/^main\s*\(/m.test(code)) {
      const formatted = execFileSync('clang-format', [`--style=${style}`, '--assume-filename=x.c'], {
        input: code,
        encoding: 'utf8',
      });
      if (formatted !== code && fix) changed = true;
      else if (formatted !== code) {
        const a = code.split('\n');
        const b = formatted.split('\n');
        const i = a.findIndex((l, n) => l !== b[n]);
        problems.push(`${rel}:${startLine + i}: not formatted (clang-format wants: ${JSON.stringify(b[i])})`);
      }
      if (fix) code = formatted;
    }
    // Trailing comments line up: in a declaration listing, every one in the block; in a
    // program, those in each run of lines with no blank line between.
    const lines = code.split('\n');
    const program = /^main\s*\(/m.test(code);
    let run = [];
    const flush = () => {
      const cols = run
        .filter(([, l]) => /\S.*\s\/\*/.test(l))
        .map(([n, l]) => [n, l.search(/\s\/\*/) + 2]);
      if (cols.length > 1) {
        const want = Math.max(...cols.map(([, c]) => c));
        for (const [n, c] of cols)
          if (c !== want)
            problems.push(`${rel}:${startLine + n}: comment starts in column ${c}, the lines around it use ${want}`);
      }
      run = [];
    };
    lines.forEach((l, n) => (l.trim() || !program ? run.push([n, l]) : flush()));
    flush();
    return '```c\n' + code + '```';
  });
  if (changed) writeFileSync(file, out);
}
for (const p of problems) console.log(p);
if (problems.length) {
  console.log(`check-listings: ${problems.length} problem(s); run with --fix to reformat complete programs`);
  process.exit(1);
}
console.log('check-listings: ok');
