import assert from 'node:assert/strict';
import { test } from 'node:test';
import { changedPages, compare, normalize, sections, shardFor } from '../scripts/man-check.mjs';
import { resolveConditionals } from '../scripts/man-render.mjs';

test('resolveConditionals takes the branch groff takes', () => {
  const src = [
    '.ie \\n(.g \\{\\',
    '.ds `` \\(lq',
    '.\\}',
    '.el \\{\\',
    '.ds `` ""',
    '.\\}',
    '.ie t .ds X typeset',
    '.el   .ds X terminal',
    '.if !\\n(.g .ds Y old',
    '.if \\n(.g .ds Y groff',
    '.ie \\n[foo] .ds Z kept',
    '.el .ds Z also kept',
    'text',
  ].join('\n');
  assert.equal(
    resolveConditionals(src),
    ['.ds `` \\(lq', '.ds X terminal', '.ds Y groff', '.ie \\n[foo] .ds Z kept', '.el .ds Z also kept', 'text'].join('\n'),
  );
});

test('resolveConditionals drops a skipped block with its nested conditionals', () => {
  const nested = ['.ie !\\n(.g \\{\\', '.ie t .ds A 1', '.el .ds A 2', '.\\}', '.el .ds A 3'].join('\n');
  assert.equal(resolveConditionals(nested), '.ds A 3');
});

test('normalize drops file names and line numbers', () => {
  assert.equal(normalize('mandoc', 'mandoc: <stdin>:31:5: STYLE: lower case character in document title: TH x'), 'mandoc: STYLE: lower case character in document title: TH x');
  assert.equal(normalize('groff', 'troff:<standard input>:208: warning: table row does not fit on page 1'), 'groff: warning: table row does not fit');
  assert.equal(normalize('pandoc', "[INFO] Skipped 'TABLE' at line 276 column 1"), "pandoc: Skipped 'TABLE'");
});

test('compare reports messages that are new, more frequent, or gone', () => {
  const { added, gone } = compare({ a: 2, b: 1 }, { a: 1, c: 3 });
  assert.deepEqual(added, ['a (1 → 2)', 'b (0 → 1)']);
  assert.deepEqual(gone, ['c (3 → 0)']);
  assert.deepEqual(compare({ a: 1 }, { a: 1 }), { added: [], gone: [] });
});

test('sections names each subsection with its section', () => {
  const s = sections('lead\n# NAME\nn\n# DESCRIPTION\nd\n## Keypad Mode\nk');
  assert.deepEqual(
    s.map((x) => [x.heading, x.section, x.text]),
    [
      ['', '', 'lead\n'],
      ['NAME', 'NAME', 'n\n'],
      ['DESCRIPTION', 'DESCRIPTION', 'd\n'],
      ['DESCRIPTION › Keypad Mode', 'DESCRIPTION', 'k\n'],
    ],
  );
});

test('shardFor finds the shard by its section slug', () => {
  const shards = ['docs/man/x/01-name.3x', 'docs/man/x/03-description.3x', 'docs/man/x/08-see-also.3x'];
  assert.equal(shardFor(shards, 'DESCRIPTION'), 'docs/man/x/03-description.3x');
  assert.equal(shardFor(shards, 'SEE ALSO'), 'docs/man/x/08-see-also.3x');
  assert.equal(shardFor(shards, 'HISTORY'), undefined);
});

test('changedPages maps shards, man/ files and the terminfo sources to pages', () => {
  const files = ['curs_getch.3x', 'term.5', 'term.7', 'terminfo.5', 'tput.1'];
  assert.deepEqual(
    [...changedPages(['docs/man/curs_getch/03-description.3x', 'man/tput.1', 'include/Caps', 'site/x.js'], files)].sort(),
    ['curs_getch.3x', 'terminfo.5', 'tput.1'],
  );
  assert.deepEqual([...changedPages(['docs/man/term/02-description.5'], files)].sort(), ['term.5', 'term.7']);
});
