import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mergeContinuedTables } from '../scripts/man-render.mjs';

const piece = (rows) => ['.TS', 'center;', 'Lb Lb Lb.', ...rows, '.TE'].join('\n');

test('a table split in three pieces becomes one table', () => {
  const text = [piece(['a\t1\tx']), piece(['b\t2\ty']), piece(['c\t3\tz'])].join('\n');
  assert.equal(mergeContinuedTables(text), piece(['a\t1\tx', 'b\t2\ty', 'c\t3\tz']));
});

test('a table split in four pieces becomes one table', () => {
  const rows = ['a\t1\tx', 'b\t2\ty', 'c\t3\tz', 'd\t4\tw'];
  const text = rows.map((r) => piece([r])).join('\n');
  assert.equal(mergeContinuedTables(text), piece(rows));
});

test('a following table with its own header stays separate', () => {
  const text = [piece(['a\t1\tx']), piece(['H\tI\tJ', '_', 'b\t2\ty'])].join('\n');
  assert.equal(mergeContinuedTables(text), text);
});
