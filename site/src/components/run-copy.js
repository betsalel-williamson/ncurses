// Copy to run: the row under a shell listing (code-run-copy.mjs works out what it copies, and
// stores it on the block as data-run-code). A button in the Run row's secondary look, a live
// region, and a note. After a copy the button shows a check and "Copied N steps" for 2.5 seconds,
// and the live region says the same, with the version it filled in or where it stopped.
// The icons follow the reader's style (styles in Footer.astro and styles.css): Starlight's round
// line icons in Modern, thin square-ended lines in Manual page, and pixel icons in the others.
(() => {
  if (window.__ncRunCopy) return;
  window.__ncRunCopy = true;
  const LINE = { prompt: '<path d="M4 17l6-6-6-6"/><path d="M12 19h8"/>', check: '<path d="M20 6 9 17l-5-5"/>' };
  const PIXEL = { prompt: __PIXEL_PROMPT__, check: __PIXEL_CHECK__ };
  const line = (k, cls, width, cap, join) =>
    `<svg class="run-copy-svg ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${width}" stroke-linecap="${cap}" stroke-linejoin="${join}" aria-hidden="true" focusable="false">${LINE[k]}</svg>`;
  const pixel = (k) => PIXEL[k].replace('<svg ', '<svg class="run-copy-svg is-pixel" aria-hidden="true" focusable="false" ');
  const icon = (k) => line(k, 'is-round', 2, 'round', 'round') + line(k, 'is-square', 1.5, 'square', 'miter') + pixel(k);

  /** Copies with the Clipboard API, or, where it is missing or refused, a hidden text area. */
  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.cssText = 'position:fixed;inset:0 auto auto 0;opacity:0';
      document.body.append(area);
      area.select();
      let ok = false;
      try {
        ok = document.execCommand('copy');
      } catch {
        ok = false;
      }
      area.remove();
      return ok;
    }
  };

  const add = (block) => {
    const wrap = block.closest('.expressive-code') ?? block;
    if (wrap.nextElementSibling?.classList.contains('run-copy-bar')) return;
    const steps = Number(block.dataset.runSteps);
    const done = `Copied ${steps} step${steps === 1 ? '' : 's'}`;
    const note = block.dataset.runNote;
    const bar = document.createElement('div');
    bar.className = 'run-example-bar run-copy-bar';
    bar.innerHTML =
      '<button type="button" class="nc-key run-copy" title="Copy the commands only, joined so a failed step stops the rest">' +
      '<span class="run-copy-icon"></span><span class="run-copy-label">Copy to run</span></button>' +
      '<span class="nc-sr-only" aria-live="polite"></span>' +
      '<span class="run-example-note">Copies the commands without comments, joined so a failed step stops the rest.</span>';
    const button = bar.querySelector('button');
    const ico = bar.querySelector('.run-copy-icon');
    const label = bar.querySelector('.run-copy-label');
    const live = bar.querySelector('.nc-sr-only');
    let timer;
    const show = (copied) => {
      ico.innerHTML = icon(copied ? 'check' : 'prompt');
      label.textContent = copied ? done : 'Copy to run';
    };
    show(false);
    button.addEventListener('click', async () => {
      const ok = await copy(block.dataset.runCode);
      clearTimeout(timer);
      live.textContent = '';
      if (!ok) {
        live.textContent = "Couldn't copy. Select the listing and copy it instead.";
        return;
      }
      show(true);
      // A fresh node, so a screen reader announces a second copy too.
      requestAnimationFrame(() => (live.textContent = `${done}${note ? `, ${note}` : ''}.`));
      timer = setTimeout(() => show(false), 2500);
    });
    wrap.after(bar);
  };
  const all = () => document.querySelectorAll('.expressive-code [data-run-code]').forEach(add);
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', all, { once: true });
  else all();
})();
