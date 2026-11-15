// Which C listings get line numbers (code-line-numbers.mjs), on listing sizes chosen for each case.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { wantsLineNumbers } from '../code-line-numbers.mjs';

test('C listings of 6 lines or more get numbers; shorter ones and other languages do not', () => {
  assert.equal(wantsLineNumbers('c', 6), true);
  assert.equal(wantsLineNumbers('h', 40), true);
  assert.equal(wantsLineNumbers('c', 5), false);
  assert.equal(wantsLineNumbers('sh', 30), false);
  assert.equal(wantsLineNumbers('text', 30), false);
});
