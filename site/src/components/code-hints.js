// The hint for a linked name in a code listing or in a guide's prose (code-links.mjs and
// prose-links.mjs add the links), shown on hover or keyboard focus. For a library name: its
// declaration, its man page's NAME summary (or a constant's meaning), the page and the release.
// For a name a listing defines: the line that defines it and what it is. Escape hides it.
// Each link goes to the man page or the definition, so the hint adds nothing a reader without it
// misses. On a touch screen there is no hover, so the first tap on a name shows its hint instead of
// following the link; the hint's own link, or a second tap on the name, follows it. A tap
// anywhere else hides the hint.
(() => {
  if (window.__ncHints) return;
  window.__ncHints = true;
  let hint;
  let current;
  // The name a touch tap showed the hint for: a second tap on it follows the link.
  let armed;
  let pointerType = 'mouse';
  const hide = () => {
    if (hint) hint.hidden = true;
    current = undefined;
    armed = undefined;
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
    // Where the name's own link goes: the man page, or the line that defines it.
    const page = document.createElement('a');
    page.className = 'nc-hint-page';
    page.href = a.href;
    page.textContent = a.dataset.page || 'Go to the definition';
    hint.append(name, summary, page);
    // The release whose manual pages the hint quotes, since a declaration can change between them.
    if (a.dataset.version) {
      const version = document.createElement('span');
      version.className = 'nc-hint-version';
      version.textContent = a.dataset.version;
      hint.append(version);
    }
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
  document.addEventListener(
    'pointerdown',
    (e) => {
      pointerType = e.pointerType || 'mouse';
    },
    { capture: true, passive: true },
  );
  document.addEventListener('click', (e) => {
    // A click from the keyboard (detail 0) or a mouse follows the link as usual.
    if (pointerType === 'mouse' || e.detail === 0) return;
    const a = target(e);
    if (a) {
      if (a === armed) return;
      e.preventDefault();
      show(a);
      armed = a;
    } else if (current && !(e.target instanceof Element && e.target.closest('.nc-hint'))) hide();
  });
  document.addEventListener('pointerover', (e) => {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    const a = target(e);
    if (a && a !== current) show(a);
    else if (!a && current && !(e.target instanceof Element && e.target.closest('.nc-hint'))) hide();
  });
  document.addEventListener('focusin', (e) => {
    if (pointerType !== 'mouse' && e.target === armed) return;
    const a = target(e);
    if (a) show(a);
    else hide();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hide();
  });
  addEventListener('scroll', hide, { passive: true, capture: true });
})();
