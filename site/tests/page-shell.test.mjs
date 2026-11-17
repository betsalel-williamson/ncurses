import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HALT, SHELL_NAMES, columns, commonPrefix, createShell, resolvePath, tilde } from '../src/components/page-shell.js';

/**
 * A shell over a fake 60x5 terminal, started in ~/start, with two programs there that exit with
 * 3 and 0, and two games. A program named without a folder is in ~/start.
 */
function fixture(programs = ['hello', 'menus']) {
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
  });
  return { shell, ran, text: () => screen.join('') };
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
  assert.match(text(), /menus\/\s+panels\//);
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
