import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HALT, SHELL_NAMES, columns, createShell } from '../src/components/page-shell.js';

/** A shell over a fake terminal, with two programs that exit with 3 and 0. */
function fixture() {
  const screen = [];
  const ran = [];
  const shell = createShell({
    write: (t) => screen.push(t),
    programs: () => ['hello', 'menus'],
    launch: async (name) => {
      ran.push(name);
      return name === 'hello' ? 3 : 0;
    },
    cols: () => 60,
  });
  return { shell, ran, text: () => screen.join('') };
}

test('a program runs by name, with or without ./', async () => {
  const { shell, ran } = fixture();
  const session = shell.session();
  shell.feed('./hello\rmenus\r/home/reader/hello\rexit\r');
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
  shell.feed('vi\r./nope\r\x04');
  assert.equal(await session, 127);
  assert.match(text(), /sh: vi: not found/);
  assert.match(text(), /sh: \.\/nope: No such file or directory/);
});

test('the line editor takes Backspace, Ctrl-U and ignores cursor keys', async () => {
  const { shell, ran } = fixture();
  const session = shell.session();
  shell.feed('hellx\x7fo\r');
  shell.feed('junk\x15menus\x1b[A\r');
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
