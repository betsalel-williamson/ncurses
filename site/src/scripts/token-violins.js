// The front page's tokens-per-file violins (MigrationProgress.astro): inline SVG drawn from
// doc-sizes.json's per-file token counts, redrawn when the tokenizer, the width or the site style changes.

const NC_V = {
  domain: [5, 100000],  // fixed across tokenizers, so switching never rescales the axis
  smallN: 12,           // at or below this many files: dots, no violin
  boxN: 5,              // below this many files: no median or quartiles drawn
  svgNS: 'http://www.w3.org/2000/svg',
};
const ncFmt = new Intl.NumberFormat('en');
const ncCompact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });

/** Linear-interpolated quantile of an ascending array (the same method as numpy's default). */
function ncQuantile(sorted, q) {
  const k = (sorted.length - 1) * q, i = Math.floor(k);
  return sorted[i] + (sorted[Math.min(i + 1, sorted.length - 1)] - sorted[i]) * (k - i);
}

/** One side of one track for one tokenizer: files sorted by tokens, and their quartiles. */
function ncSide(perFile, tok) {
  const files = perFile.path.map((path, i) => ({ path, v: perFile[tok][i] })).sort((a, b) => a.v - b.v);
  const vs = files.map((f) => f.v);
  return { files, n: files.length, q1: ncQuantile(vs, 0.25), med: ncQuantile(vs, 0.5), q3: ncQuantile(vs, 0.75), max: vs[vs.length - 1] };
}

/** Gaussian kernel density of log10(tokens), Silverman's bandwidth, from the smallest file to the largest. */
function ncKde(sorted, steps = 72) {
  const lx = sorted.map(Math.log10), n = lx.length;
  const mean = lx.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(lx.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1)) || 0.1;
  const iqr = ncQuantile(lx, 0.75) - ncQuantile(lx, 0.25);
  const h = 0.9 * Math.min(sd, (iqr || sd) / 1.34) * n ** -0.2;
  const lo = lx[0], hi = lx[n - 1], pts = [];
  for (let s = 0; s <= steps; s++) {
    const x = lo + ((hi - lo) * s) / steps;
    let d = 0;
    for (const v of lx) { const u = (x - v) / h; d += Math.exp(-0.5 * u * u); }
    pts.push([x, d]);
  }
  const max = Math.max(...pts.map((p) => p[1]));
  return pts.map(([x, d]) => [x, d / max]);  // each violin scaled to its own peak
}

function ncEl(parent, name, attrs, text) {
  const el = document.createElementNS(NC_V.svgNS, name);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  if (text !== undefined) el.textContent = text;
  parent.appendChild(el);
  return el;
}

/** Draw every track's before/now violins into fig's .nc-v-plot, for one tokenizer. */
function ncRenderViolins(fig, data, tok) {
  const plot = fig.querySelector('.nc-v-plot');
  plot.replaceChildren();
  const tokName = data.tokenizers.find((t) => t.id === tok).name;
  const W = Math.max(300, Math.round(plot.clientWidth));
  const narrow = W < 520;
  const gutter = narrow ? 0 : 96, padR = 14;
  const x0 = gutter + 8, x1 = W - padR;
  const [d0, d1] = NC_V.domain.map(Math.log10);
  const x = (v) => x0 + ((Math.log10(v) - d0) / (d1 - d0)) * (x1 - x0);
  const fromX = (px) => 10 ** (d0 + ((px - x0) / (x1 - x0)) * (d1 - d0));
  const hh = 17;                                   // half-height of a violin
  const headH = narrow ? 42 : 28, laneH = narrow ? 74 : 60, gap = 18, axisH = 40;
  const sides = data.groups.map((g) => ({ g, before: ncSide(g.before, tok), now: ncSide(g.now, tok) }));
  const H = sides.length * (headH + 2 * laneH + gap) - gap + axisH;

  const svg = ncEl(plot, 'svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img',
    'aria-label': `Violin plot of tokens per file (${tokName}, log scale), before and now, for each of ${sides.length} tracks`,
    'aria-describedby': 'nc-violins-caption' });

  // Gridlines: one per power of ten, fainter ones at 2x and 5x; labels on the axis below.
  const grid = ncEl(svg, 'g', {});
  for (let p = 1; p <= 5; p++) {
    for (const m of [1, 2, 5]) {
      const v = m * 10 ** p;
      if (v < NC_V.domain[0] || v > NC_V.domain[1]) continue;
      ncEl(grid, 'line', { class: m === 1 ? 'nc-v-grid' : 'nc-v-grid-minor', x1: x(v), x2: x(v), y1: headH - 6, y2: H - axisH + 4 });
      if (m === 1) ncEl(grid, 'text', { x: x(v), y: H - axisH + 20, 'text-anchor': 'middle' }, v >= 1000 ? `${v / 1000}K` : String(v));
    }
  }
  ncEl(svg, 'text', { x: x1, y: H - 4, 'text-anchor': 'end' }, `Tokens per file, ${tokName}, log scale`);

  const tip = document.createElement('div');
  tip.className = 'nc-v-tip';
  tip.hidden = true;
  plot.appendChild(tip);

  let y = 0;
  for (const { g, before, now } of sides) {
    const name = ncEl(svg, 'text', { class: 'nc-v-track', x: 0, y: y + 16 }, g.name);
    ncEl(svg, 'text', { x: narrow ? 0 : name.getComputedTextLength() + 10, y: narrow ? y + 34 : y + 16 },
      `${ncFmt.format(before.n)} → ${ncFmt.format(now.n)} files`);
    y += headH;
    for (const [key, label, s] of [['before', 'Before', before], ['now', 'Now', now]]) {
      const lane = ncEl(svg, 'g', { class: `nc-v-${key}` });
      const cy = narrow ? y + 34 : y + hh + 6;
      // Lane label: in a left gutter when wide, above the lane when narrow.
      if (narrow) {
        ncEl(lane, 'circle', { class: 'nc-v-key', cx: 4, cy: y + 8, r: 4 });
        const t = ncEl(lane, 'text', { class: 'nc-v-lane', x: 13, y: y + 12 }, `${label} `);
        ncEl(t, "tspan", { style: 'font-weight:400;fill:var(--sl-color-gray-3)' }, `· ${ncFmt.format(s.n)} ${s.n === 1 ? 'file' : 'files'}`);
      } else {
        ncEl(lane, 'circle', { class: 'nc-v-key', cx: 4, cy: cy - 5, r: 4 });
        ncEl(lane, 'text', { class: 'nc-v-lane', x: 13, y: cy - 1 }, label);
        ncEl(lane, 'text', { x: 13, y: cy + 14 }, `n = ${ncFmt.format(s.n)}`);
      }
      const small = s.n <= NC_V.smallN;
      if (!small) {
        const pts = ncKde(s.files.map((f) => f.v));
        const top = pts.map(([lx, d]) => `${x(10 ** lx).toFixed(1)},${(cy - d * hh).toFixed(1)}`);
        const bot = pts.slice().reverse().map(([lx, d]) => `${x(10 ** lx).toFixed(1)},${(cy + d * hh).toFixed(1)}`);
        ncEl(lane, 'path', { class: 'nc-v-area', d: `M${top.join('L')}L${bot.join('L')}Z` });
      }
      if (s.n >= NC_V.boxN) ncEl(lane, 'line', { class: 'nc-v-iqr', x1: x(s.q1), x2: x(s.q3), y1: cy, y2: cy });
      if (small) {
        // Few files: draw each one; nudge a dot up or down when it would touch its neighbour.
        let lastX = -99, k = 0;
        for (const f of s.files) {
          const fx = x(f.v);
          k = fx - lastX < 9 ? k + 1 : 0;
          lastX = fx;
          const dy = k === 0 ? 0 : (k % 2 ? -1 : 1) * 8 * Math.ceil(k / 2);
          f.dy = dy;
          ncEl(lane, 'circle', { class: 'nc-v-dot', cx: fx, cy: cy + dy, r: 4.5 });
        }
      }
      if (s.n >= NC_V.boxN) ncEl(lane, 'circle', { class: 'nc-v-med', cx: x(s.med), cy, r: 4.5 });
      // Direct labels, below the lane: the median, or each file's size when there are only a couple.
      const labels = s.n >= NC_V.boxN ? [[s.med, `median ${ncFmt.format(Math.round(s.med))}`]]
        : s.files.map((f) => [f.v, ncCompact.format(f.v)]);
      // Centre each label on its mark, then push labels apart left to right and back inside the plot.
      const placed = labels.map(([v, text]) => {
        const t = ncEl(lane, 'text', { class: 'nc-v-val', y: cy + hh + 14 }, text);
        const w = t.getComputedTextLength();
        return { t, w, left: x(v) - w / 2 };
      });
      for (let i = 0; i < placed.length; i++) {
        const prev = placed[i - 1];
        placed[i].left = Math.max(placed[i].left, x0, prev ? prev.left + prev.w + 8 : -Infinity);
      }
      for (let i = placed.length - 1; i >= 0; i--) {
        const next = placed[i + 1];
        placed[i].left = Math.min(placed[i].left, x1 - placed[i].w, next ? next.left - placed[i].w - 8 : Infinity);
      }
      for (const p of placed) p.t.setAttribute('x', p.left.toFixed(1));

      // Hover and keyboard: the whole lane is the target; the nearest file (in log space) is shown.
      const hi = ncEl(lane, 'circle', { class: 'nc-v-hi', r: 5.5, visibility: 'hidden' });
      const hit = ncEl(lane, 'rect', { class: 'nc-v-hit', x: x0 - 6, y: cy - hh - 3, width: x1 - x0 + 12, height: 2 * hh + 6, rx: 4,
        tabindex: 0, 'aria-label': `${g.name}, ${label.toLowerCase()}: ${ncFmt.format(s.n)} files, median ${ncFmt.format(Math.round(s.med))} tokens. Arrow keys step through the files.` });
      let cur = -1;
      const show = (i) => {
        cur = Math.max(0, Math.min(s.n - 1, i));
        const f = s.files[cur], fx = x(f.v);
        hi.setAttribute('cx', fx); hi.setAttribute('cy', cy + (f.dy || 0)); hi.setAttribute('visibility', 'visible');
        const b = tip.appendChild.bind(tip);
        tip.replaceChildren();
        const strong = document.createElement('b'); strong.textContent = `${ncFmt.format(f.v)} tokens`; b(strong);
        const code = document.createElement('code'); code.textContent = f.path; b(code);
        const meta = document.createElement('span');
        meta.textContent = `${g.name}, ${label.toLowerCase()}: ${cur + 1} of ${ncFmt.format(s.n)} by size`;
        b(meta);
        tip.hidden = false;
        const pw = plot.clientWidth, tw = tip.offsetWidth, th = tip.offsetHeight;
        const scale = pw / W;
        let tx = fx * scale - tw / 2, ty = (cy - hh - 10) * scale - th;
        tx = Math.max(4, Math.min(pw - tw - 4, tx));
        if (ty < 0) ty = (cy + hh + 10) * scale;
        tip.style.left = `${tx}px`; tip.style.top = `${ty}px`;
      };
      const nearest = (v) => {
        const lv = Math.log10(v);
        let lo = 0, hiI = s.n - 1;
        while (lo < hiI) { const m = (lo + hiI) >> 1; if (s.files[m].v < v) lo = m + 1; else hiI = m; }
        if (lo > 0 && Math.abs(Math.log10(s.files[lo - 1].v) - lv) <= Math.abs(Math.log10(s.files[lo].v) - lv)) lo--;
        return lo;
      };
      const hide = () => { hi.setAttribute('visibility', 'hidden'); tip.hidden = true; };
      hit.addEventListener('pointermove', (ev) => {
        const r = svg.getBoundingClientRect();
        show(nearest(fromX(((ev.clientX - r.left) * W) / r.width)));
      });
      hit.addEventListener('pointerleave', () => { if (document.activeElement !== hit) hide(); });
      hit.addEventListener('focus', () => show(nearest(s.med)));
      hit.addEventListener('blur', hide);
      hit.addEventListener('keydown', (ev) => {
        const step = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 10, PageDown: -10 }[ev.key];
        if (step) show(cur + step);
        else if (ev.key === 'Home') show(0);
        else if (ev.key === 'End') show(s.n - 1);
        else if (ev.key === 'Escape') hide();
        else return;
        ev.preventDefault();
      });
      y += laneH;
    }
    y += gap;
  }
}

/** The caption and the table, which carry the same numbers as text. */
function ncDescribeViolins(fig, data, tok) {
  const sides = data.groups.map((g) => ({ g, before: ncSide(g.before, tok), now: ncSide(g.now, tok) }));
  const r = (v) => ncFmt.format(Math.round(v));
  const [guides, man, contrib] = sides;
  const gb = guides.before.files.map((f) => ncCompact.format(f.v));
  fig.querySelector('figcaption').textContent =
    `The ${guides.before.n} upstream guides held ${gb.slice(0, -1).join(', ')} and ${gb.at(-1)} tokens; ` +
    `the ${ncFmt.format(guides.now.n)} shards that replaced them have a median of ${r(guides.now.med)}, ` +
    `while the median ${man.g.name.toLowerCase()} file fell from ${r(man.before.med)} to ${r(man.now.med)} tokens ` +
    `and the median ${contrib.g.name.toLowerCase()} file from ${r(contrib.before.med)} to ${r(contrib.now.med)}.`;
  const body = fig.querySelector('.nc-v-table tbody');
  body.replaceChildren();
  for (const { g, before, now } of sides) {
    for (const [label, s] of [['before', before], ['now', now]]) {
      const tr = body.insertRow();
      const th = document.createElement('th');
      th.scope = 'row';
      th.textContent = `${g.name}, ${label}`;
      tr.appendChild(th);
      for (const v of [ncFmt.format(s.n), r(s.q1), r(s.med), r(s.q3), r(s.max)]) tr.insertCell().textContent = v;
    }
  }
}

/** Wire-up: the page's existing #nc-tokenizer picker drives the chart; redraw on resize. */
function ncInitViolins(fig, data, pick) {
  const draw = () => { ncRenderViolins(fig, data, pick.value); ncDescribeViolins(fig, data, pick.value); };
  pick.addEventListener('change', draw);
  let last = 0, timer;
  new ResizeObserver(() => {
    const w = fig.querySelector('.nc-v-plot').clientWidth;
    if (Math.abs(w - last) < 2) return;
    last = w; clearTimeout(timer); timer = setTimeout(draw, 80);
  }).observe(fig.querySelector('.nc-v-plot'));
  // A site style brings other fonts, so the labels need laying out again.
  new MutationObserver(() => (document.fonts ? document.fonts.ready : Promise.resolve()).then(draw)).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-style', 'data-theme'],
  });
  draw();
}


export { ncInitViolins };
