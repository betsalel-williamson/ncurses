// Which inline code in a guide's prose becomes a link to a man page (prose-links.mjs), on a small
// index and small Markdown pages made for each case.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { linkFor, linkProse } from '../prose-links.mjs';

const symbols = {
  echo: { href: '/m/curs_inopts/', page: 'curs_inopts(3X)', summary: 'input options', proto: 'int echo(void);' },
  stdscr: { href: '/m/curs_variables/', page: 'curs_variables(3X)', summary: 'variables', proto: 'WINDOW * stdscr;' },
  REQ_NEXT_FIELD: { href: '/m/form_driver/', page: 'form_driver(3X)', summary: 'Move to the next field.', constant: true },
  refresh: { href: '/m/curs_refresh/', page: 'curs_refresh(3X)', summary: 'refresh windows', proto: 'int refresh(void);' },
};
const options = { symbols, version: '6.6' };

test('a function links only with its parentheses; a variable or constant links as written', () => {
  assert.equal(linkFor('echo()', options).href, '/m/curs_inopts/');
  assert.equal(linkFor('echo', options), null);
  assert.equal(linkFor('stdscr', options).href, '/m/curs_variables/');
  assert.equal(linkFor('stdscr()', options), null);
  assert.equal(linkFor('REQ_NEXT_FIELD', options).properties['data-summary'], 'Move to the next field.');
});

test('names outside the index, qualified names and expressions stay plain', () => {
  for (const v of ['printf()', 'curses.wrapper()', 'obj->refresh()', 'echo(x)', 'refresh() twice']) assert.equal(linkFor(v, options), null);
});

test('the hint names the release, and a history page leaves out the declaration', () => {
  const now = linkFor('echo()', options).properties;
  assert.equal(now['data-proto'], 'int echo(void);');
  assert.equal(now['data-version'], 'ncurses 6.6');
  const then = linkFor('echo()', { ...options, historical: true }).properties;
  assert.equal(then['data-proto'], undefined);
  assert.equal(then['data-page'], 'curs_inopts(3X)');
});

test('inline code in prose becomes a link; link text, headings and fenced code stay as written', () => {
  const page = [
    'Call `echo()` first, then [the `refresh()` call](/elsewhere/).',
    '',
    '## When `echo()` is on',
    '',
    '```sh',
    'echo `echo()`',
    '```',
  ].join('\n');
  const lines = linkProse(page, options).split('\n');
  assert.match(lines[0], /^Call <a href="\/m\/curs_inopts\/" class="nc-sym"[^>]*><code>echo\(\)<\/code><\/a> first/);
  assert.match(lines[0], /\[the `refresh\(\)` call\]\(\/elsewhere\/\)\.$/);
  assert.equal(lines[2], '## When `echo()` is on');
  assert.equal(lines[5], 'echo `echo()`');
});

test('a name a C listing on the same page defines stays plain there', () => {
  const page = 'Our `refresh()` differs from `echo()`.\n\n```c\nstatic int refresh(void)\n{\n  return 0;\n}\n```\n';
  const first = linkProse(page, options).split('\n')[0];
  assert.match(first, /^Our `refresh\(\)` differs from <a /);
});

test('attribute values are escaped', () => {
  const tricky = { x: { href: '/m/x/', page: 'x(3X)', summary: 'a "quoted" <b>', proto: 'int x(void);' } };
  const out = linkProse('`x()`', { symbols: tricky });
  assert.match(out, /data-summary="a &quot;quoted&quot; &lt;b>"/);
});
