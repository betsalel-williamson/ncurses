import assert from 'node:assert/strict';
import { test } from 'node:test';
import { unitProblems } from '../scripts/migration-history.mjs';

const unit = { unit: 'keyok(3X)', path: 'docs/man/keyok', reviewed_pr: 91, evidence: 'site/formal/evidence/keyok' };
const row = (where, pr = '91') => ({ category: 'addition', where, pr });

test('a review that changed nothing under the unit passes when it added the named evidence', () => {
  assert.deepEqual(unitProblems(unit, ['site/formal/evidence/keyok/keyok-check.txt'], []), []);
});

test('a review that changed nothing under the unit fails without evidence', () => {
  const [problem] = unitProblems({ ...unit, evidence: '' }, ['site/formal/keyok-check.c'], []);
  assert.match(problem, /names no evidence/);
});

test('the named evidence must come from that pull request', () => {
  const [problem] = unitProblems(unit, ['site/formal/keyok-check.c'], []);
  assert.match(problem, /changed nothing under docs\/man\/keyok or its evidence/);
});

test('a review that changed the unit needs an errata row from that pull request', () => {
  const changed = ['docs/man/keyok/04-return-value.3x'];
  assert.deepEqual(unitProblems(unit, changed, [row('docs/man/keyok/04-return-value.3x')]), []);
  assert.match(unitProblems(unit, changed, [row('docs/man/keyok/04-return-value.3x', '89')])[0], /no row under docs\/man\/keyok/);
});

test('a stack merged through one pull request counts the rows its merge brought in', () => {
  const changed = ['docs/man/keyok/04-return-value.3x'];
  const stacked = { ...row('docs/man/keyok/04-return-value.3x', '88'), brought: true };
  assert.deepEqual(unitProblems(unit, changed, [stacked]), []);
  assert.equal(unitProblems(unit, changed, [{ ...stacked, brought: false }]).length, 1);
});
