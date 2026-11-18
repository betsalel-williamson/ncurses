import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HALT, SHELL_NAMES, columns, commonPrefix, createShell, entryNote, height, resolvePath, tilde, wrap } from '../src/components/page-shell.js';

/**
 * A shell over a fake 60x5 terminal, started in ~/start, with two programs there that exit with
 * 3 and 0, and two games. A program named without a folder is in ~/start.
 */
function fixture(programs = ['hello', 'menus'], more = {}) {
  const screen = [];
  const ran = [];
  const shell = createShell({
    write: (t) => screen.push(t),
    programs: () => programs.map((p) => (p.includes('/') ? p : `start/${p}`)),
    cwd: '/home/reader/start',
    games: () => ['rain', 'worm'],
    launch: async (name, args = []) => {
      ran.push([name, ...args].join(' '));
      return name === 'hello' ? 3 : 0;
    },
    cols: () => 60,
    rows: () => 5,
    ...more,
  });
  // Colours left out, so a test reads the text as the reader does.
  return { shell, ran, text: () => screen.join('').replace(/\x1b\[[0-9;]*m/g, '') };
}

test('a program runs by its path: ./name, ~/folder/name or an absolute path', async () => {
  const { shell, ran } = fixture();
  const session = shell.session();
  shell.feed('./hello\r~/start/menus\r/home/reader/start/hello\rexit\r');
  assert.equal(await session, 3);
  assert.deepEqual(ran, ['hello', 'menus', 'hello']);
});

test('exit returns its status in a nested shell, and halts at the top', async () => {
  const nested = fixture();
  const a = nested.shell.session();
  nested.shell.feed('exit 7\r');
  assert.equal(await a, 7);
  const top = fixture();
  const b = top.shell.session({ top: true });
  top.shell.feed('exit\r');
  assert.equal(await b, HALT);
});

test('halt, shutdown and poweroff power off from any shell', async () => {
  for (const cmd of ['halt', 'shutdown -h now', 'poweroff']) {
    const { shell } = fixture();
    const session = shell.session();
    shell.feed(`${cmd}\r`);
    assert.equal(await session, HALT);
  }
});

test('an unknown command is not found, and is the status exit reports', async () => {
  const { shell, text } = fixture();
  const session = shell.session();
  shell.feed('nosuch\r./nope\r\x04');
  assert.equal(await session, 127);
  assert.match(text(), /sh: nosuch: not found/);
  assert.match(text(), /sh: \.\/nope: No such file or directory/);
});

test('the line editor takes Backspace, Ctrl-U and ignores cursor keys', async () => {
  const { shell, ran } = fixture();
  const session = shell.session();
  shell.feed('./hellx\x7fo\r');
  shell.feed('junk\x15./menus\x1b[C\r');
  shell.feed('exit\r');
  await session;
  assert.deepEqual(ran, ['hello', 'menus']);
});

test('type() replaces what was typed at the prompt', async () => {
  const { shell, ran } = fixture();
  const session = shell.session();
  shell.feed('half-typed');
  await shell.type('./menus');
  shell.feed('exit\r');
  await session;
  assert.deepEqual(ran, ['menus']);
});

test('ls lays names out in columns, down then across', () => {
  assert.deepEqual(columns(['a', 'bb', 'c', 'd', 'e'], 8), ['a   d', 'bb  e', 'c']);
  assert.deepEqual(columns(['a-long-name'], 4), ['a-long-name']);
});

test('the names system() starts a shell by', () => {
  for (const n of ['sh', '/bin/sh', 'bash', '/usr/bin/zsh', ' $SHELL ']) assert.ok(SHELL_NAMES.test(n), n);
  for (const n of ['ls', 'sh -c ls', 'shell']) assert.ok(!SHELL_NAMES.test(n), n);
});

test('a game runs from /usr/games by name, with the arguments typed after it', async () => {
  const { shell, ran, text } = fixture();
  const session = shell.session();
  shell.feed('worm -l 5\r/usr/games/rain\r./worm\rls /usr/games\rexit\r');
  await session;
  assert.deepEqual(ran, ['worm -l 5', 'rain']);
  assert.match(text(), /sh: \.\/worm: No such file or directory/);
  assert.match(text(), /rain\s+worm/);
});

test('the games are in /usr/games, not the home folder', async () => {
  const { shell, text } = fixture();
  const session = shell.session();
  shell.feed('ls\rexit\r');
  await session;
  assert.doesNotMatch(text(), /worm/);
});

test('Tab finishes a name, or the part all the names share', async () => {
  const { shell, ran } = fixture(['menu-basics', 'menu-options', 'hello']);
  const session = shell.session();
  shell.feed('./hell\t\r');
  shell.feed('./menu-b\t\r');
  shell.feed('wo\t\r');
  shell.feed('exit\r');
  await session;
  assert.deepEqual(ran, ['hello', 'menu-basics', 'worm']);
});

test('a second Tab lists the names a word could be', async () => {
  const { shell, text } = fixture(['menu-basics', 'menu-options']);
  const session = shell.session();
  shell.feed('./menu\t\t\x15exit\r');
  await session;
  assert.match(text(), /menu-basics\s+menu-options/);
});

test('ls pages a long list: Space for the next screen, q to stop', async () => {
  const names = Array.from({ length: 12 }, (_, i) => `a-very-long-program-name-${String(i).padStart(2, '0')}-xxxxxxxxxxxxxxxxxxxx`);
  const { shell, text } = fixture(names);
  const session = shell.session();
  shell.feed('ls\r');
  await new Promise((resolve) => setTimeout(resolve, 10));
  assert.match(text(), /--More--/);
  assert.doesNotMatch(text(), /-04-/);
  shell.feed(' ');
  await new Promise((resolve) => setTimeout(resolve, 10));
  assert.match(text(), /-07-/);
  assert.doesNotMatch(text(), /-08-/);
  shell.feed('qexit\r');
  await session;
  assert.doesNotMatch(text(), /-11-/);
});

test('commonPrefix', () => {
  assert.equal(commonPrefix(['menu-a', 'menu-b']), 'menu-');
  assert.equal(commonPrefix([]), '');
});

test('Up brings back the last command', async () => {
  const { shell, ran } = fixture();
  const session = shell.session();
  shell.feed('./menus\r\x1b[A\rexit\r');
  await session;
  assert.deepEqual(ran, ['menus', 'menus']);
});

test('vi is left with :q!, after the trap of :q on a changed buffer', async () => {
  const { shell, text } = fixture();
  const session = shell.session();
  const tick = () => new Promise((resolve) => setTimeout(resolve, 5));
  shell.feed('vi\r');
  shell.feed('ihello\x1b');
  // Escape and the next key arrive apart, as they do from a keyboard.
  await tick();
  shell.feed(':q\r');
  shell.feed(':q!\r');
  shell.feed('exit 4\r');
  assert.equal(await session, 4);
  assert.match(text(), /E37: No write since last change/);
});

test('nano leaves on ^X, and emacs on C-x C-c', async () => {
  const { shell } = fixture();
  const session = shell.session();
  shell.feed('nano\r\x18emacs\r\x18\x03exit 5\r');
  assert.equal(await session, 5);
});

test('cd moves between folders, and pwd and the prompt follow', async () => {
  const { shell, text } = fixture(['menus/menu-basics', 'panels/panel-basics']);
  const session = shell.session();
  shell.feed('cd ..\rpwd\rcd menus\rpwd\rcd\rpwd\rcd /usr/games\rexit\r');
  await session;
  assert.match(text(), /\/home\/reader\r\n.*\/home\/reader\/menus\r\n.*\/home\/reader\r\n/s);
  assert.match(text(), /~\/menus\$ /);
  assert.match(text(), /\/usr\/games\$ /);
});

test('ls ~ shows a folder per guide, and ls of a folder its programs', async () => {
  const { shell, text } = fixture(['menus/menu-basics', 'panels/panel-basics']);
  const session = shell.session();
  shell.feed('ls ~\rls ~/menus\rexit\r');
  await session;
  assert.match(text(), /menus\s+panels\r\n/);
  assert.match(text(), /menu-basics/);
});

test('cd refuses a file and a missing folder', async () => {
  const { shell, text } = fixture();
  const session = shell.session();
  shell.feed('cd hello\rcd nowhere\rexit\r');
  await session;
  assert.match(text(), /sh: cd: hello: Not a directory/);
  assert.match(text(), /sh: cd: nowhere: No such file or directory/);
});

test('an example typed by its bare name says which folder it is in', async () => {
  const { shell, ran, text } = fixture(['menus/menu-basics']);
  const session = shell.session();
  shell.feed('menu-basics\rexit\r');
  await session;
  assert.deepEqual(ran, []);
  assert.match(text(), /it is in ~\/menus: cd there and type \.\/menu-basics/);
});

test('Tab completes a folder for cd, and a path through folders', async () => {
  const { shell, ran, text } = fixture(['menus/menu-basics', 'panels/panel-basics']);
  const session = shell.session();
  shell.feed('cd ~/me\t\rpwd\r');
  shell.feed('../pan\tpanel-b\t\r');
  shell.feed('exit\r');
  await session;
  assert.match(text(), /\/home\/reader\/menus\r\n/);
  assert.deepEqual(ran, ['panel-basics']);
});

test('resolvePath and tilde', () => {
  assert.equal(resolvePath('../b/./c', '/home/reader/a'), '/home/reader/b/c');
  assert.equal(resolvePath('~/x', '/usr'), '/home/reader/x');
  assert.equal(resolvePath('..', '/'), '/');
  assert.equal(tilde('/home/reader/menus'), '~/menus');
  assert.equal(tilde('/usr/games'), '/usr/games');
});

test('echo expands $NAME, ${NAME} and $?, and env lists the variables', async () => {
  const { shell, text } = fixture();
  const session = shell.session();
  shell.feed('echo $PATH\r./hello\recho status $?\rcd ..\recho ${PWD}/x$NOPE.\rprintenv HOME\renv\rexit\r');
  await session;
  assert.match(text(), /\/usr\/local\/bin:\/usr\/bin:\/bin:\/usr\/games\r\n/);
  assert.match(text(), /status 3\r\n/);
  assert.match(text(), /\/home\/reader\/x\.\r\n/);
  assert.match(text(), /printenv HOME\r\n\/home\/reader\r\n/);
  assert.match(text(), /USER=reader\r\n/);
});

test('ls takes -a, -l, -1 and -F, alone or together', async () => {
  const { shell, text } = fixture(['menus/menu-basics', 'panels/panel-basics']);
  const session = shell.session();
  shell.feed('ls -aF ~\rls -l ~/menus\rls -1 ~\rls -z\rexit\r');
  await session;
  assert.match(text(), /\.\/\s+\.\.\/\s+menus\/\s+panels\//);
  assert.match(text(), /-rwxr-xr-x 1 reader reader .* menu-basics\r\n/);
  assert.match(text(), /ls -1 ~\r\nmenus\r\npanels\r\n/);
  assert.match(text(), /ls: invalid option -- 'z'/);
});

test('cd - goes back, and which, type and history answer as sh does', async () => {
  const { shell, text } = fixture(['menus/menu-basics']);
  const session = shell.session();
  shell.feed('cd ~/menus\rcd -\rhistory\rwhich worm vi\rtype cd\rexit\r');
  await session;
  assert.match(text(), /cd -\r\n\/home\/reader\/start\r\n/);
  assert.match(text(), /\/usr\/games\/worm\r\n\/usr\/bin\/vi\r\n/);
  assert.match(text(), /cd is a shell builtin/);
  assert.match(text(), /    1  cd ~\/menus\r\n    2  cd -\r\n/);
});

test('the files cannot change, and sudo is refused', async () => {
  const { shell, text } = fixture();
  const session = shell.session();
  shell.feed('rm -rf /\rmkdir x\rsudo ls\rexit\r');
  await session;
  assert.match(text(), /rm: cannot remove '\/': Read-only file system/);
  assert.match(text(), /mkdir: cannot create directory 'x': Read-only file system/);
  assert.match(text(), /reader is not in the sudoers file/);
});

test('uname takes -s, -n, -r, -m and -a', async () => {
  const { shell, text } = fixture();
  const session = shell.session();
  shell.feed('uname -sm\runame -a\rexit\r');
  await session;
  assert.match(text(), /uname -sm\r\nEmscripten wasm32\r\n/);
  assert.match(text(), /uname -a\r\nEmscripten ncurses 1\.0 wasm32\r\n/);
});


/** A build like the site's: no database, one entry compiled in, at the build's own prefix. */
const TERMINFO = {
  dir: '/opt/nc/share/terminfo',
  database: false,
  options: ['--disable-database', '--with-fallbacks=demo-term'],
  entries: [{ name: 'demo-term', path: 'd/demo-term', bytes: 1234, source: 'demo-term|a demo,\n\tam, cols#80,' }],
};
const withTerminfo = (facts = TERMINFO) => fixture(['hello'], { terminfo: () => facts, rows: () => 40 });

test('the terminfo directory holds each built-in entry where the build would look for it', async () => {
  const { shell, text } = withTerminfo();
  const session = shell.session();
  shell.feed('ls /opt/nc/share/terminfo\rcd /opt/nc/share/terminfo/d\rls -lF\rexit\r');
  await session;
  assert.match(text(), /ls \/opt\/nc\/share\/terminfo\r\nd\r\n/);
  // A plain file, root's, at its compiled size, with no * from -F.
  assert.match(text(), /-rw-r--r-- 1 root root   1234 Nov 17 08:00 demo-term\r\n/);
  assert.match(text(), /\/opt\/nc\/share\/terminfo\/d\$ /);
});

test('cat and file on an entry name the options that compiled it in', async () => {
  const { shell, text } = withTerminfo();
  const session = shell.session();
  shell.feed('cat /opt/nc/share/terminfo/d/demo-term\recho $?\rfile /opt/nc/share/terminfo/d/demo-term\rexit\r');
  await session;
  const flat = text().replace(/\r\n/g, ' ');
  assert.match(flat, /demo-term is not a file in this build: ncurses was configured with --disable-database --with-fallbacks=demo-term, so it reads no terminfo database/);
  assert.match(text(), /echo \$\?\r\n0\r\n/);
  assert.match(text(), /demo-term: Compiled terminfo entry "demo-term", built into the library \(--disable-database --with-fallbacks=demo-term\)/);
});

test("cat's note wraps to the terminal's width", async () => {
  const { shell, text } = withTerminfo();
  const session = shell.session();
  shell.feed('cat /opt/nc/share/terminfo/d/demo-term\rexit\r');
  await session;
  const lines = text().split('\r\n');
  const start = lines.findIndex((l) => l.startsWith('demo-term is not'));
  assert.ok(start > 0);
  for (const l of lines.slice(start, -2)) assert.ok(l.length <= 60, l);
});

test('cat says the entry is also read from disk when the build has a database', () => {
  const note = entryNote(TERMINFO.entries[0], { ...TERMINFO, database: true });
  assert.match(note, /compiled into the library as a fallback, and ncurses also reads this directory/);
  assert.doesNotMatch(note, /reads no terminfo database/);
});

test("infocmp prints a built-in entry, $TERM's by default, and says which entries there are", async () => {
  const xterm = { name: 'xterm-256color', path: 'x/xterm-256color', source: 'xterm-256color|xterm,' };
  const { shell, text } = withTerminfo({ ...TERMINFO, entries: [...TERMINFO.entries, xterm] });
  const session = shell.session();
  shell.feed('infocmp demo-term\rinfocmp\rinfocmp -x vt100\rexit\r');
  assert.equal(await session, 1);
  assert.match(text(), /infocmp demo-term\r\ndemo-term\|a demo,\r\n\tam, cols#80,\r\n/);
  assert.match(text(), /infocmp\r\nxterm-256color\|xterm,\r\n/);
  assert.match(text(), /infocmp: couldn't open terminfo entry vt100 \(this build has demo-term, xterm-256color\)/);
});

test('without terminfo facts there is no terminfo directory, and infocmp says so', async () => {
  const { shell, text } = fixture();
  const session = shell.session();
  shell.feed('ls /opt\rinfocmp\rexit\r');
  await session;
  assert.match(text(), /ls: cannot access '\/opt': No such file or directory/);
  assert.match(text(), /infocmp: couldn't open terminfo entry xterm-256color\r\n/);
});

test('wrap breaks text at spaces within the width', () => {
  assert.deepEqual(wrap('one two three four', 9), ['one two', 'three', 'four']);
  assert.deepEqual(wrap('  a   b ', 10), ['a b']);
  assert.deepEqual(wrap('', 10), []);
});

test('height counts the rows a line wraps onto, with tabs to stops of 8 and colours taking none', () => {
  assert.equal(height('', 60), 1);
  assert.equal(height('x'.repeat(60), 60), 1);
  assert.equal(height('x'.repeat(61), 60), 2);
  assert.equal(height('\tx', 8), 2);
  assert.equal(height('ab\tcd', 10), 1);
  assert.equal(height(`\x1b[1;34m${'x'.repeat(10)}\x1b[0m`, 10), 1);
});

test('a page counts the rows a wrapped line takes, and always shows a line', async () => {
  const long = 'w'.repeat(150);
  const entry = { name: 'demo-term', path: 'd/demo-term', source: ['l1', long, 'l3', 'l4', long, 'l6'].join('\n') };
  const { shell, text } = fixture(['hello'], { terminfo: () => ({ ...TERMINFO, entries: [entry] }) });
  const session = shell.session();
  shell.feed('infocmp demo-term\r');
  await new Promise((resolve) => setTimeout(resolve, 10));
  // Four rows to a screen: l1 and the long line's three rows.
  assert.match(text(), /w\r\n--More--/);
  assert.doesNotMatch(text(), /l3/);
  // Enter shows one more line; the next long line, taller than that one row, still shows.
  shell.feed('\r');
  await new Promise((resolve) => setTimeout(resolve, 10));
  assert.match(text(), /l3\r\n/);
  assert.doesNotMatch(text(), /l4/);
  shell.feed('\r\r');
  await new Promise((resolve) => setTimeout(resolve, 10));
  assert.match(text(), /l4\r\n--More--\(66%\)\r\x1b\[2Kw{150}\r\n--More--\(83%\)$/);
  shell.feed('qexit\r');
  await session;
  assert.doesNotMatch(text(), /l6/);
});
