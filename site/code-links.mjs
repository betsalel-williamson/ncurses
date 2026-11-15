// An Expressive Code plugin for C listings. Each call of a curses library function becomes a
// link to the function's man page, with its declaration and the page's NAME summary shown on hover
// and focus; the names and pages come from .generated/symbols.json, which scripts/sync.mjs writes.
// Each use of a name the listing defines itself (a function, macro, type, variable, parameter or
// local, found by code-defs.mjs) becomes a link to its definition, with that line as the hint.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { definitions, mask, resolve, uses } from './code-defs.mjs';

const file = new URL('./.generated/symbols.json', import.meta.url);
const symbols = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
const siteFile = new URL('./.generated/site.json', import.meta.url);
const site = existsSync(siteFile) ? JSON.parse(readFileSync(siteFile, 'utf8')) : {};
const LANGS = new Set(['c', 'h', 'cpp']);
// A name followed by "(", so a variable that shares a function's name (box, move) stays plain.
const CALL = /^\s*\(/;
const KIND = {
  function: () => 'Function defined in this listing',
  macro: () => 'Macro defined in this listing',
  type: () => 'Type defined in this listing',
  variable: () => 'Variable declared at the top of this listing',
  parameter: (d) => `Parameter of ${d.owner}()`,
  local: (d) => `Local variable in ${d.owner}()`,
};
// What each listing defines, worked out once per code block.
const analyzed = new WeakMap();
function analyze(codeBlock) {
  if (!analyzed.has(codeBlock)) {
    const code = codeBlock.code;
    const hash = createHash('sha1').update(code).digest('hex').slice(0, 8);
    analyzed.set(codeBlock, { defs: definitions(code), lines: code.split('\n'), masked: mask(code).split('\n'), hash });
  }
  return analyzed.get(codeBlock);
}
const anchor = (hash, d) => `nc-${hash}-${d.line + 1}-${d.col}`;

/** Text nodes of a hast subtree, in document order, with each node's parent. */
function textNodes(node, out = []) {
  for (const child of node.children ?? []) {
    if (child.type === 'text') out.push({ node: child, parent: node });
    else if (child.type === 'element' && child.tagName !== 'a') textNodes(child, out);
  }
  return out;
}

function defLink(name, d, hash) {
  const where = `${KIND[d.kind](d)}, line ${d.line + 1}`;
  return {
    type: 'element',
    tagName: 'a',
    properties: { href: `#${anchor(hash, d)}`, className: ['nc-def'], dataSummary: where, dataProto: d.text, ariaLabel: `${name}: ${where}` },
    children: [{ type: 'text', value: name }],
  };
}

function target(name, d, hash) {
  return { type: 'element', tagName: 'span', properties: { id: anchor(hash, d), className: ['nc-def-target'] }, children: [{ type: 'text', value: name }] };
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
      dataProto: sym.proto,
      dataVersion: site.version ? `ncurses ${site.version}` : undefined,
      ariaLabel: `${sym.proto ?? name} ${sym.summary}, in ${sym.page}`,
    },
    children: [{ type: 'text', value: name }],
  };
}

export function codeLinks() {
  return {
    name: 'ncurses-code-links',
    jsModules: ['code-hints.js', 'code-relayout.js', 'code-scroll-fade.js'].map((f) => readFileSync(new URL(`./src/components/${f}`, import.meta.url), 'utf8')),
    hooks: {
      postprocessRenderedLine({ codeBlock, lineIndex, renderData }) {
        if (!LANGS.has(codeBlock.language)) return;
        const texts = textNodes(renderData.lineAst);
        const line = texts.map((t) => t.node.value).join('');
        // Offsets of each text node in the line, to find the node a match falls in.
        let at = 0;
        const spans = texts.map((t) => ({ ...t, start: at, end: (at += t.node.value.length) }));
        const { defs, lines, masked, hash } = analyze(codeBlock);
        // The rendered line must be the source line, or the offsets below would be wrong.
        const own = line.trimEnd() === (lines[lineIndex] ?? '').trimEnd();
        const code = own ? masked[lineIndex] : line;
        const hits = [];
        for (const m of uses(code)) {
          const name = m[0];
          const site = own && defs.find((d) => d.line === lineIndex && d.col === m.index && d.name === name);
          const d = own && !site && resolve(defs, name, lineIndex);
          if (site) hits.push({ index: m.index, name, node: target(name, site, hash) });
          else if (d) hits.push({ index: m.index, name, node: defLink(name, d, hash) });
          // A constant (KEY_UP, A_BOLD) links as written; a function only when it is called.
          else if (Object.hasOwn(symbols, name) && (symbols[name].constant || CALL.test(code.slice(m.index + name.length))))
            hits.push({ index: m.index, name, node: link(name, symbols[name]) });
        }
        // Right to left, so splitting a node leaves earlier offsets valid.
        for (const m of hits.reverse()) {
          const start = m.index;
          const end = start + m.name.length;
          const span = spans.find((s) => s.start <= start && end <= s.end);
          if (!span) continue; // the name spans two tokens: leave it plain
          const { node, parent } = span;
          const value = node.value;
          const a = start - span.start;
          const b = end - span.start;
          const parts = [
            a > 0 && { type: 'text', value: value.slice(0, a) },
            m.node,
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
