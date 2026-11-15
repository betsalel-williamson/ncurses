/**
 * The guides' complete programs: every ```c block that defines main(). sync.mjs puts a Run
 * placeholder after each one, and build-examples.mjs builds each one to WebAssembly, so a new
 * listing gets a Run button (or a "doesn't run yet" flag) without anyone listing it.
 */

/** Guide shard directories, relative to the repository root. */
export const GUIDE_DIRS = ['docs/client-library/forms', 'docs/client-library/menus', 'docs/client-library/panels', 'docs/client-library/getting-started', 'docs/client-library/windows', 'docs/client-library/output', 'docs/client-library/input', 'docs/client-library/attributes', 'docs/client-library/keyboard'];

const BLOCK = /^```c\n([\s\S]*?)^```$/gm;
const MAIN = /^(?:int\s+|void\s+)?main\s*\(/m;
/** main(int argc, char *argv[]): the program reads the file named by its first argument. */
const MAIN_ARGS = /^(?:int\s+)?main\s*\(\s*int\s+\w+\s*,/m;
const LIBS = { form: /#include\s*<form\.h>/, menu: /#include\s*<menu\.h>/, panel: /#include\s*<panel\.h>/ };

/**
 * The macros a listing tests but never defines (#ifdef _DEBUG), so a build with -D<name> runs
 * code the default build leaves out. The library's own feature macros are not the listing's.
 */
export function listingMacros(code) {
  const tested = [...code.matchAll(/^\s*#\s*(?:ifn?def\s+(\w+)|(?:el)?if\b.*?\bdefined\s*\(?\s*(\w+))/gm)].map((m) => m[1] ?? m[2]);
  const defined = new Set([...code.matchAll(/^\s*#\s*define\s+(\w+)/gm)].map((m) => m[1]));
  return [...new Set(tested)].filter((n) => !defined.has(n) && !/^(NCURSES_|_XOPEN|__)/.test(n));
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * The programs in one shard's text, in order: { id, title, code, end, libs }. `end` is the
 * offset just past the closing fence. The title is the "**Example: …**" line before the block,
 * if there is one in the preceding paragraph or two; otherwise the shard's name and a number.
 * The id comes from the title, so it is the same whatever was done to the text around it.
 */
export function findPrograms(text, shard) {
  const name = shard.replace(/^.*\//, '').replace(/\.md$/, '');
  const programs = [];
  const used = new Set();
  for (const m of text.matchAll(BLOCK)) {
    if (!MAIN.test(m[1])) continue;
    const before = text.slice(Math.max(0, m.index - 400), m.index);
    const label = [...before.matchAll(/^\*\*Example: (.+?)\*\*\s*$/gm)].pop();
    const title = label ? label[1] : `${name} program ${programs.length + 1}`;
    let id = slug(label ? label[1] : `${name}-${programs.length + 1}`);
    for (let n = 2; used.has(id); n++) id = `${slug(title)}-${n}`;
    used.add(id);
    const libs = Object.keys(LIBS).filter((l) => LIBS[l].test(m[1]));
    programs.push({ id, title, code: m[1], end: m.index + m[0].length, libs, macros: listingMacros(m[1]), args: MAIN_ARGS.test(m[1]) ? ['example.c'] : [] });
  }
  return programs;
}
