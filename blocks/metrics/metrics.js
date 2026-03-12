/**
 * METRICS BLOCK — robust decorate
 * Authoring: 3-column table (icon | number | label)
 */

const ENABLE_COUNT_UP = true;

function parseNumber(raw) {
  const s = (raw || '').trim();
  const m = s.match(/^(\d+(?:\.\d+)?)(.*)$/i);
  if (!m) return { val: 0, suffix: '' };
  return { val: parseFloat(m[1]) || 0, suffix: (m[2] || '').trim() };
}

function animate(el, target, suffix, ms = 900) {
  const start = 0;
  const t0 = performance.now();
  function step(t) {
    const p = Math.min(1, (t - t0) / ms);
    const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
    el.textContent = String(Math.round(start + (target - start) * eased)) + suffix;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function setupObserver(items) {
  if (!ENABLE_COUNT_UP || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const num = e.target.querySelector('.number');
      if (!num || num.dataset.animated === '1') return;
      const { val, suffix } = parseNumber(num.dataset.raw || num.textContent);
      animate(num, val, suffix);
      num.dataset.animated = '1';
      obs.unobserve(e.target);
    });
  }, { threshold: 0.2 });
  items.forEach((it) => io.observe(it));
}

export default function decorate(block) {
  block.classList.add('metrics');

  const rows = [...block.querySelectorAll('tr')];
  if (!rows.length) {
    // No table? Leave content as-is; CSS fallback might still handle it.
    return;
  }

  // Build grid
  const grid = document.createElement('div');
  grid.className = 'metrics-grid';

  rows.forEach((tr) => {
    const tds = [...tr.querySelectorAll('td,th')];
    if (tds.length < 3) return;

    const metric = document.createElement('div');
    metric.className = 'metric';

    // Icon
    const iconWrap = document.createElement('div');
    iconWrap.className = 'icon';
    const img = tds[0].querySelector('img');
    if (img) iconWrap.append(img.cloneNode(true));
    metric.append(iconWrap);

    // Number
    const number = document.createElement('div');
    number.className = 'number';
    const raw = (tds[1].textContent || '').trim();
    number.textContent = raw;
    number.dataset.raw = raw;
    metric.append(number);

    // Label
    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = (tds[2].textContent || '').trim();
    metric.append(label);

    grid.append(metric);
  });

  // Replace only if we actually created items
  if (grid.children.length) {
    block.innerHTML = '';
    block.append(grid);
    setupObserver([...grid.children]);
  }
}
``
