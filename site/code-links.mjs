// An Expressive Code plugin: in C listings, each call of a curses library function becomes a
// link to the function's man page, with the page's NAME summary shown on hover and focus.
// The names and pages come from .generated/symbols.json, which scripts/sync.mjs writes.
import { existsSync, readFileSync } from 'node:fs';

const file = new URL('./.generated/symbols.json', import.meta.url);
const symbols = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
const LANGS = new Set(['c', 'h', 'cpp']);
// A name followed by "(", so a variable that shares a function's name (box, move) stays plain.
const CALL = /\b[A-Za-z_]\w*(?=\s*\()/g;

/** Text nodes of a hast subtree, in document order, with each node's parent. */
function textNodes(node, out = []) {
  for (const child of node.children ?? []) {
    if (child.type === 'text') out.push({ node: child, parent: node });
    else if (child.type === 'element' && child.tagName !== 'a') textNodes(child, out);
  }
  return out;
}

function link(name, sym) {
  return {
    type: 'element',
    tagName: 'a',
    properties: {
      href: sym.href,
      className: ['nc-sym'],
      dataSummary: sym.summary,
      dataPage: sym.page,
      ariaLabel: `${name}: ${sym.summary}, in ${sym.page}`,
    },
    children: [{ type: 'text', value: name }],
  };
}

export function codeLinks() {
  return {
    name: 'ncurses-code-links',
    jsModules: [readFileSync(new URL('./src/components/code-hints.js', import.meta.url), 'utf8')],
    hooks: {
      postprocessRenderedLine({ codeBlock, renderData }) {
        if (!LANGS.has(codeBlock.language)) return;
        const texts = textNodes(renderData.lineAst);
        const line = texts.map((t) => t.node.value).join('');
        // Offsets of each text node in the line, to find the node a match falls in.
        let at = 0;
        const spans = texts.map((t) => ({ ...t, start: at, end: (at += t.node.value.length) }));
        const hits = [...line.matchAll(CALL)].filter((m) => Object.hasOwn(symbols, m[0]));
        // Right to left, so splitting a node leaves earlier offsets valid.
        for (const m of hits.reverse()) {
          const start = m.index;
          const end = start + m[0].length;
          const span = spans.find((s) => s.start <= start && end <= s.end);
          if (!span) continue; // the name spans two tokens: leave it plain
          const { node, parent } = span;
          const value = node.value;
          const a = start - span.start;
          const b = end - span.start;
          const parts = [
            a > 0 && { type: 'text', value: value.slice(0, a) },
            link(m[0], symbols[m[0]]),
            b < value.length && { type: 'text', value: value.slice(b) },
          ].filter(Boolean);
          parent.children.splice(parent.children.indexOf(node), 1, ...parts);
          // Any earlier hit in this node now falls in the text before the link.
          if (a > 0) span.node = parts[0];
          span.end = start;
        }
      },
    },
  };
}
