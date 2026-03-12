/**
 * METRICS BLOCK — AEM EDS
 * Authoring: 3-column table (icon | number | label), one row per item.
 */

const ENABLE_COUNT_UP = true; // set to false to disable the counting animation

function parseNumberForCount(raw) {
  // Extract numeric part and a suffix to append (e.g., +, K, M)
  const trimmed = (raw || '').trim();
  const match = trimmed.match(/^(\d+(?:\.\d+)?)(.*)$/i);
  if (!match) return { value: 0, suffix: '' };
  const base = parseFloat(match[1]);
  // Keep suffix like "+", "K", "M", "B", "K+", etc.
  const suffix = match[2].trim();
  return { value: isNaN(base) ? 0 : base, suffix };
}

function animateCount(el, targetValue, suffix, duration = 900) {
  const start = 0;
  const startTime = performance.now();

  function step(now) {
    const t = Math.min(1, (now - startTime) / duration);
    // easeOutCubic
    const eased = 1 - Math.pow(1 - t, 3);
    const current = Math.round(start + (targetValue - start) * eased);
    el.textContent = String(current) + (suffix || '');
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function setupIntersectionCountUp(items) {
  if (!ENABLE_COUNT_UP || !('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const numEl = entry.target.querySelector('.number');
      if (!numEl || numEl.dataset.animated === '1') return;

      const { value, suffix } = parseNumberForCount(numEl.dataset.raw || numEl.textContent);
      animateCount(numEl, value, suffix);
      numEl.dataset.animated = '1';
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.2 });

  items.forEach((item) => io.observe(item));
}

export default function decorate(block) {
  block.classList.add('metrics');

  // Find table rows
  const rows = block.querySelectorAll('tr');
  if (!rows.length) return;

  // Build grid
  const grid = document.createElement('div');
  grid.className = 'metrics-grid';

  rows.forEach((tr) => {
    const tds = tr.querySelectorAll('td, th');
    if (tds.length < 3) return;

    const iconCell = tds[0];
    const numCell  = tds[1];
    const labelCell = tds[2];

    const metric = document.createElement('div');
    metric.className = 'metric';

    // Icon
    const iconWrap = document.createElement('div');
    iconWrap.className = 'icon';
    const img = iconCell.querySelector('img');
    if (img) iconWrap.append(img.cloneNode(true));
    metric.append(iconWrap);

    // Number
    const number = document.createElement('div');
    number.className = 'number';
    const rawNumber = (numCell.textContent || '').trim();
    number.textContent = rawNumber;
    number.dataset.raw = rawNumber;  // keep original for animation
    metric.append(number);

    // Label
    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = (labelCell.textContent || '').trim();
    metric.append(label);

    grid.append(metric);
  });

  // Replace block content
  block.innerHTML = '';
  block.append(grid);

  // Count-up animation on view
  const metrics = [...grid.querySelectorAll('.metric')];
  setupIntersectionCountUp(metrics);
}
``
