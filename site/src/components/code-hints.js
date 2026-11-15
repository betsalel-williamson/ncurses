// The hint for a linked name in a code listing (code-links.mjs adds the links), shown on hover
// or keyboard focus. For a library function: its declaration, its man page's NAME summary and the
// page. For a name the listing defines: the line that defines it and what it is. Escape hides it.
// Each link goes to the man page or the definition, so the hint adds nothing a reader without it
// misses.
(() => {
  if (window.__ncHints) return;
  window.__ncHints = true;
  let hint;
  let current;
  const hide = () => {
    if (hint) hint.hidden = true;
    current = undefined;
  };
  const show = (a) => {
    if (!hint) {
      hint = document.createElement('div');
      hint.className = 'nc-hint';
      hint.setAttribute('role', 'tooltip');
      hint.id = 'nc-hint';
      document.body.append(hint);
    }
    current = a;
    hint.replaceChildren();
    // The declaration from the man page's SYNOPSIS or the listing, else the bare name.
    const name = document.createElement('code');
    name.textContent = a.dataset.proto || a.textContent;
    const summary = document.createElement('span');
    summary.textContent = a.dataset.summary;
    const page = document.createElement('span');
    page.className = 'nc-hint-page';
    page.textContent = a.dataset.page ?? '';
    hint.append(name, summary);
    if (a.dataset.page) hint.append(page);
    hint.hidden = false;
    const r = a.getBoundingClientRect();
    const w = hint.offsetWidth;
    const h = hint.offsetHeight;
    const left = Math.max(8, Math.min(r.left, innerWidth - w - 8));
    const below = r.bottom + 6;
    hint.style.left = `${left}px`;
    hint.style.top = `${below + h > innerHeight - 8 ? r.top - h - 6 : below}px`;
  };
  const target = (e) => e.target instanceof Element && e.target.closest('a.nc-sym, a.nc-def');
  document.addEventListener('pointerover', (e) => {
    const a = target(e);
    if (a && a !== current) show(a);
    else if (!a && current && !(e.target instanceof Element && e.target.closest('.nc-hint'))) hide();
  });
  document.addEventListener('focusin', (e) => {
    const a = target(e);
    if (a) show(a);
    else hide();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hide();
  });
  addEventListener('scroll', hide, { passive: true, capture: true });
})();
