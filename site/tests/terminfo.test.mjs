import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compileEntry, entryDir, fallbacks, infocmpText, makeVars, mixedCase, terminfoFacts, terminfoOptions } from '../scripts/terminfo.mjs';

const OPTIONS = ['--without-shared', '--disable-database', '--with-fallbacks=xterm-256color,vt100', '--enable-widec', '--with-terminfo-dirs=/a:/b'];

test('the terminfo options are picked out of the configure options', () => {
  assert.deepEqual(terminfoOptions(OPTIONS), ['--disable-database', '--with-fallbacks=xterm-256color,vt100', '--with-terminfo-dirs=/a:/b']);
  assert.deepEqual(fallbacks(OPTIONS), ['xterm-256color', 'vt100']);
  assert.deepEqual(fallbacks(['--enable-database']), []);
});

test('makeVars expands ${NAME} and $(NAME) as make does, the first setting winning', () => {
  const vars = makeVars('prefix\t\t= /opt/nc\ndatarootdir\t= ${prefix}/share\nTERMINFO\t= $(datarootdir)/terminfo\nprefix = /ignored\nloop = ${loop}x\n\tcmd = not a variable\n');
  assert.equal(vars.TERMINFO, '/opt/nc/share/terminfo');
  assert.equal(vars.prefix, '/opt/nc');
  assert.equal(vars.loop, 'x');
  assert.equal(vars.missing, undefined);
});

test('an entry is under its first letter where names keep their case, else its hex code', () => {
  assert.equal(entryDir('xterm-256color', true), 'x');
  assert.equal(entryDir('xterm-256color', false), '78');
  assert.equal(entryDir('Apple', false), '41');
  assert.equal(mixedCase('#define HAVE_X 1\n#define MIXEDCASE_FILENAMES 1\n'), true);
  assert.equal(mixedCase('/* #undef MIXEDCASE_FILENAMES */\n'), false);
});

test("infocmpText replaces infocmp's scratch-directory comment with where the entry came from", () => {
  const text = infocmpText('#\tReconstructed via infocmp from file: /tmp/x/xterm\nxterm|X,\n\tam,\n\n', 'xterm');
  assert.equal(text, '#\tReconstructed via infocmp from misc/terminfo.src: the entry\n#\tcompiled into the library (--with-fallbacks=xterm)\nxterm|X,\n\tam,');
  assert.match(infocmpText('xterm|X,\n', 'xterm'), /\nxterm\|X,$/);
});

test('terminfoFacts reads the directory from the Makefile and the layout from ncurses_cfg.h', () => {
  const makefile = 'prefix = /usr/local\ndatarootdir = ${prefix}/share\nTERMINFO = ${datarootdir}/terminfo\n';
  const compiled = [];
  const facts = terminfoFacts({
    options: OPTIONS,
    makefile,
    cfgHeader: '#define MIXEDCASE_FILENAMES 1\n',
    compile: (name) => (compiled.push(name), name === 'vt100' ? null : { bytes: 10, source: 'src' }),
  });
  assert.deepEqual(compiled, ['xterm-256color', 'vt100']);
  assert.deepEqual(facts, {
    dir: '/usr/local/share/terminfo',
    database: false,
    options: ['--disable-database', '--with-fallbacks=xterm-256color,vt100', '--with-terminfo-dirs=/a:/b'],
    entries: [
      { name: 'xterm-256color', path: 'x/xterm-256color', bytes: 10, source: 'src' },
      { name: 'vt100', path: 'v/vt100' },
    ],
  });
  const hashed = terminfoFacts({ options: ['--with-fallbacks=xterm'], makefile, cfgHeader: '' });
  assert.equal(hashed.database, true);
  assert.deepEqual(hashed.entries, [{ name: 'xterm', path: '78/xterm' }]);
});

test('compileEntry gives null when the tools are missing', () => {
  assert.equal(compileEntry('xterm', { tic: '/nonexistent/tic', infocmp: '/nonexistent/infocmp', source: '/nonexistent.src' }), null);
});
