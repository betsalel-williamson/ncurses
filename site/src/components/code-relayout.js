// Safari sizes a listing's box before it applies the reader style's ::-webkit-scrollbar to the
// listing's horizontal scrollbar (styles.css, "Scrollbars"). The box then stays a scrollbar's
// height short, and the scrollbar covers whatever follows, such as the Run row, until something
// forces a new layout. Turning the scrollbar off and on again once the page and its fonts are
// ready gives Safari that layout. Other browsers size the box right, and this changes nothing.
(() => {
  if (window.__ncRelayout) return;
  window.__ncRelayout = true;
  const relayout = () => {
    for (const pre of document.querySelectorAll('.expressive-code pre')) {
      if (pre.scrollWidth <= pre.clientWidth) continue;
      pre.style.overflowX = 'hidden';
      void pre.offsetHeight;
      pre.style.overflowX = '';
    }
  };
  if (document.readyState === 'complete') relayout();
  else addEventListener('load', relayout, { once: true });
  document.fonts?.ready.then(relayout);
  // A style change swaps the scrollbar's look, so Safari needs the same help again.
  new MutationObserver(relayout).observe(document.documentElement, { attributes: true, attributeFilter: ['data-style'] });
})();
