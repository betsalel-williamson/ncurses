// A listing that scrolls sideways fades out under its copy button while there is more to the
// right, so the reader can tell the line goes on (styles in layout.css, "Copy button"). The
// frame gets data-nc-more and the listing's box, which the fade covers, as custom properties.
(() => {
  if (window.__ncScrollFade) return;
  window.__ncScrollFade = true;
  const update = (pre) => {
    const frame = pre.closest('.frame');
    if (!frame) return;
    const more = pre.scrollLeft + pre.clientWidth < pre.scrollWidth - 1;
    frame.toggleAttribute('data-nc-more', more);
    if (more) {
      frame.style.setProperty('--nc-fade-top', `${pre.offsetTop}px`);
      frame.style.setProperty('--nc-fade-height', `${pre.clientHeight}px`);
    }
  };
  const all = () => document.querySelectorAll('.expressive-code pre').forEach(update);
  addEventListener('scroll', (e) => e.target instanceof Element && e.target.matches?.('.expressive-code pre') && update(e.target), {
    capture: true,
    passive: true,
  });
  addEventListener('resize', all, { passive: true });
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', all, { once: true });
  else all();
  addEventListener('load', all, { once: true });
  document.fonts?.ready.then(all);
  // A style change can change the font, and so how wide each listing is.
  new MutationObserver(all).observe(document.documentElement, { attributes: true, attributeFilter: ['data-style'] });
})();
