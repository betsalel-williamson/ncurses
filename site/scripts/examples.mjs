/**
 * The guides' complete programs: every ```c block that defines main(). sync.mjs puts a Run
 * placeholder after each one, and build-examples.mjs builds each one to WebAssembly, so a new
 * listing gets a Run button (or a "doesn't run yet" flag) without anyone listing it.
 */

/** Guide shard directories, relative to the repository root. */
export const GUIDE_DIRS = ['docs/client-library/forms'];

const BLOCK = /^```c\n([\s\S]*?)^```$/gm;
const MAIN = /^(?:int\s+|void\s+)?main\s*\(/m;
const LIBS = { form: /#include\s*<form\.h>/, menu: /#include\s*<menu\.h>/, panel: /#include\s*<panel\.h>/ };

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
    programs.push({ id, title, code: m[1], end: m.index + m[0].length, libs });
  }
  return programs;
}
