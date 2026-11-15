// The Run row's terminal arithmetic (src/components/terminal-fit.js).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FULL_SIZE, LEGIBLE, fitFontSize, keySequence, offersFullSize, overflows } from '../src/components/terminal-fit.js';

test('a terminal that fits keeps full size', () => {
  assert.equal(overflows(800, 80, 9.5), false);
  assert.equal(fitFontSize(800, 80, 9.5), FULL_SIZE);
});

test('a terminal too wide shrinks to the largest quarter pixel that fits', () => {
  // 80 columns of 9.5px cells at 16px is 760px; 300px of room allows 6.31px, so 6.25px.
  assert.equal(overflows(300, 80, 9.5), true);
  const size = fitFontSize(300, 80, 9.5);
  assert.equal(size, 6.25);
  assert.ok((80 * 9.5 * size) / FULL_SIZE <= 300);
  assert.ok((80 * 9.5 * (size + 0.25)) / FULL_SIZE > 300);
});

test('there is no floor: a very narrow column still gets every column', () => {
  const size = fitFontSize(100, 100, 9.5);
  assert.ok(size < 9 && size > 0);
  assert.ok((100 * 9.5 * size) / FULL_SIZE <= 100);
});

test('no measurement yet leaves full size', () => {
  assert.equal(fitFontSize(0, 80, 9.5), FULL_SIZE);
  assert.equal(fitFontSize(300, 80, 0), FULL_SIZE);
});

test('keys send what xterm.js sends for a real key', () => {
  assert.equal(keySequence('F1'), '\x1bOP');
  assert.equal(keySequence('Up', true), '\x1bOA');
  assert.equal(keySequence('Up', false), '\x1b[A');
  assert.equal(keySequence('Left', true), '\x1bOD');
  assert.equal(keySequence('PageUp'), '\x1b[5~');
  assert.equal(keySequence('PageDown'), '\x1b[6~');
  assert.equal(keySequence('Nope'), '');
});

test('the full-size choice is offered only where fitting makes the text small', () => {
  // A laptop's column: 80 columns fit at about 14px, so the terminal just fits.
  assert.equal(offersFullSize(690, 80, 9.5), false);
  // A phone: about 6px, so the reader may prefer full size and a scroll.
  assert.equal(offersFullSize(300, 80, 9.5), true);
  assert.ok(fitFontSize(300, 80, 9.5) < LEGIBLE);
  assert.equal(offersFullSize(900, 80, 9.5), false);
});
