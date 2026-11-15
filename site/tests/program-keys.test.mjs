// Which keys a program's Run row offers (scripts/examples.mjs), on listings written for each case.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { findPrograms, programKeys } from '../scripts/examples.mjs';

test('a program that reads arrow or page keys asks for them', () => {
  assert.deepEqual(programKeys('if (ch == KEY_F(1)) break;'), []);
  assert.deepEqual(programKeys('case KEY_UP: y--; break;'), ['arrows']);
  assert.deepEqual(programKeys('case KEY_NPAGE: case KEY_LEFT:'), ['arrows', 'pages']);
  assert.deepEqual(programKeys('int MY_KEY_UPPER = 1;'), []);
});

test('findPrograms carries each program\'s keys', () => {
  const text = '**Example: Menu**\n\n```c\nint main(void)\n{\n  return getch() == KEY_DOWN;\n}\n```\n';
  const [p] = findPrograms(text, 'guide/menu.md');
  assert.deepEqual(p.keys, ['arrows']);
});
