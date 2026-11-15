/**
 * On a short or narrow screen, the header and the "On this page" bar slide away while the reader
 * scrolls down and come back on any scroll up, as phone browsers do with their own address bar.
 * They stay put at the top of the page, while the menu or the contents list is open, and while
 * keyboard focus is inside them. Desktop windows keep them fixed. The motion itself is in
 * styles.css, under data-nc-chrome.
 */
const SPACE_IS_TIGHT = '(max-width: 50rem), (max-width: 72rem) and (max-height: 32rem)';
// How far the page must scroll in one direction before the bars move, so a jittery thumb
// doesn't flicker them.
const THRESHOLD = 12;

const root = document.documentElement;
const tight = matchMedia(SPACE_IS_TIGHT);
let last = scrollY;
let ticking = false;

const inUse = () =>
  !!document.querySelector('#starlight__sidebar:popover-open, mobile-starlight-toc details[open]') ||
  !!document.activeElement?.closest('header.header, mobile-starlight-toc');

const set = (hidden: boolean) => {
  if (hidden) root.dataset.ncChrome = 'hidden';
  else delete root.dataset.ncChrome;
};

const update = () => {
  ticking = false;
  const y = scrollY;
  const navHeight = document.querySelector('header.header')?.getBoundingClientRect().height ?? 64;
  if (!tight.matches || y <= navHeight || inUse()) {
    set(false);
    last = y;
  } else if (y > last + THRESHOLD) {
    set(true);
    last = y;
  } else if (y < last - THRESHOLD) {
    set(false);
    last = y;
  }
};

const schedule = () => {
  if (!ticking) requestAnimationFrame(update);
  ticking = true;
};

addEventListener('scroll', schedule, { passive: true });
tight.addEventListener('change', schedule);
// Tabbing into the bars, opening the menu or the contents list brings them back.
document.addEventListener('focusin', schedule);
document.addEventListener('toggle', schedule, true);
