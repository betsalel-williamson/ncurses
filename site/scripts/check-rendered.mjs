#!/usr/bin/env node
/**
 * Look for Markdown that reached the built site as text: a literal ** or an escaped <strong>/<em>
 * outside code. pandoc's man reader once left bold running on, and GFM shows ** as text when it
 * can't close the emphasis, so the pages had stray ** that no source file contains. Run after
 * `astro build`; reads dist/. Exits 1 on a hit.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const files = readdirSync(dist, { recursive: true }).filter((f) => f.endsWith('index.html'));
const entities = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" };

/** The page's main text, without code, scripts, styles and tags. */
export function mainText(html) {
  const main = /<main[\s\S]*?<\/main>/.exec(html)?.[0] ?? '';
  return main
    .replace(/<(pre|code|script|style)\b[^>]*>[\s\S]*?<\/\1>/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => entities[e]);
}

/** Literal Markdown in text: ** that isn't a C pointer-to-pointer, or a written-out tag. */
export function strayMarkup(text) {
  const hits = [];
  for (const m of text.matchAll(/\*\*|<\/?(?:strong|em)>/g)) {
    const around = text.slice(Math.max(0, m.index - 30), m.index + 30);
    if (m[0] === '**' && /(\w|\)) ?\*\* ?\w+\s*[,);]|\(\w+ \*\*\)/.test(around)) continue;
    hits.push(around.replace(/\s+/g, ' '));
  }
  return hits;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  let bad = 0;
  for (const f of files) {
    for (const hit of strayMarkup(mainText(readFileSync(join(dist, f), 'utf8')))) {
      console.error(`${relative(process.cwd(), join(dist, f))}: literal markup in "${hit}"`);
      bad++;
    }
  }
  if (bad) {
    console.error(`${bad} place(s) show Markdown as text. See site/scripts/sync.mjs and man-inlines.lua.`);
    process.exit(1);
  }
  console.log(`no literal markup in ${files.length} pages`);
}
