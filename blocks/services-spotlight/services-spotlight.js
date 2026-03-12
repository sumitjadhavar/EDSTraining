/**
 * SERVICES-SPOTLIGHT (Tabs → Content + Image)
 * Authoring table (6 columns):
 *   0: title
 *   1: description
 *   2: image (img element)
 *   3: progress list (one per line: "Label | 95%")
 *   4: CTA (first <a> used)
 *   5: category/breadcrumb text
 */

function readRows(block) {
  const rows = [...block.querySelectorAll('tr')];
  const items = [];

  rows.forEach((tr) => {
    const tds = [...tr.querySelectorAll('td,th')];
    if (tds.length < 6) return;

    const title = (tds[0].textContent || '').trim();
    const desc  = (tds[1].textContent || '').trim();
    const img   = tds[2].querySelector('img');
    const imgUrl = img ? (img.currentSrc || img.src) : '';
    const category = (tds[5].textContent || '').trim() || title;

    // progress lines: accept <br> or new paragraphs
    const listRaw = tds[3].innerHTML
      .replace(/<\/p>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const bars = listRaw.map((line) => {
      const parts = line.split('|');
      const label = (parts[0] || '').trim();
      let pct = (parts[1] || '').trim();
      if (pct && !pct.endsWith('%')) pct += '%';
      return { label, pct };
    });

    // CTA: first <a> in col 4
    const a = tds[4].querySelector('a');
    const cta = a
      ? { href: a.getAttribute('href') || '#', label: (a.textContent || 'READ MORE').trim() }
      : { href: '#', label: 'READ MORE' };

    if (title) {
      items.push({ title, desc, imgUrl, bars, cta, category });
    }
  });

  return items;
}

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}

export default function decorate(block) {
  block.classList.add('services-spotlight');

  // 1) Parse authored table
  const items = readRows(block);
  if (!items.length) return;

  // 2) Build skeleton layout
  const grid = el('div', 'ss-grid');

  const tabs = el('aside', 'ss-tabs');
  tabs.setAttribute('role', 'tablist');

  const pane = el('section', 'ss-pane');
  pane.setAttribute('role', 'region');
  pane.setAttribute('aria-live', 'polite');

  const fig = el('figure', 'ss-fig');

  block.innerHTML = '';
  grid.append(tabs, pane, fig);
  block.append(grid);

  // 3) Create tabs
  const tabButtons = items.map((it, i) => {
    const b = el('button', 'ss-tab');
    b.type = 'button';
    b.textContent = it.title;
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    b.dataset.index = String(i);
    tabs.append(b);
    return b;
  });

  // 4) Render a selected item
  function render(idx) {
    const it = items[idx];

    // Update selected state
    tabButtons.forEach((btn, i) => {
      btn.setAttribute('aria-selected', i === idx ? 'true' : 'false');
    });

    // Pane content
    pane.innerHTML = '';
    const crumb = el('div', 'ss-crumb', it.category);
    const h2 = el('h2', null, it.title);
    const p  = el('p', 'ss-desc', it.desc);

    const cta = el('a', 'ss-cta', it.cta.label);
    cta.href = it.cta.href;

    const barsWrap = el('div', 'ss-bars');
    it.bars.forEach(({ label, pct }) => {
      const bar = el('div', 'ss-bar');
      const row = el('div', 'row', `<span>${label}</span><span>${pct || ''}</span>`);
      const track = el('div', 'track');
      const fill = el('span', 'fill');
      if (pct) {
        // Start at 0 then animate to width
        requestAnimationFrame(() => { fill.style.width = pct; });
      }
      track.append(fill);
      bar.append(row, track);
      barsWrap.append(bar);
    });

    pane.append(crumb, h2, p, cta, barsWrap);

    // Figure content
    fig.innerHTML = '';
    if (it.imgUrl) {
      const img = new Image();
      img.src = it.imgUrl;
      fig.append(img);
    }
    const badge = el('figcaption', 'ss-badge', it.category);
    fig.append(badge);

    // Optional floating action button (decorative)
    const fab = el('button', 'ss-fab', '⌃');
    fab.type = 'button';
    fab.title = 'Scroll to top';
    fab.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    fig.append(fab);
  }

  // 5) Wire events
  tabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.ss-tab');
    if (!btn) return;
    render(parseInt(btn.dataset.index, 10));
  });

  // Keyboard: ArrowUp/ArrowDown to change tabs
  tabs.addEventListener('keydown', (e) => {
    const current = tabButtons.findIndex((b) => b.getAttribute('aria-selected') === 'true');
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      const next = (current + 1) % tabButtons.length;
      tabButtons[next].focus();
      render(next);
      e.preventDefault();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      const prev = (current - 1 + tabButtons.length) % tabButtons.length;
      tabButtons[prev].focus();
      render(prev);
      e.preventDefault();
    }
  });

  // Initial render
  render(0);
}
``
