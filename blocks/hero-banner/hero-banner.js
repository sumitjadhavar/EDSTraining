/**
 * Hero Banner — robust decorate()
 * Works with:
 *  - 2-column table: [image] | [heading + optional link]
 *  - 1-column table: image and text in same cell
 * Ensures the image becomes a background layer and text sits on top.
 */

function getPrimaryCells(block) {
  const table = block.querySelector('table');
  if (!table) return [];
  // Prefer first row
  const row = table.querySelector('tr');
  if (!row) return [];
  const cells = [...row.querySelectorAll('td, th')];
  // If author added multiple rows by mistake, we only consider the first row
  return cells;
}

function extractTextAndLink(container) {
  // Gather visible text with line breaks from <p> and <br>
  const lines = [];
  let ctaEl = container.querySelector('a');

  // If there are headings, prefer them for title
  const headings = container.querySelectorAll('h1,h2,h3');
  if (headings.length) {
    const t = (headings[0].textContent || '').trim();
    if (t) lines.push(t);
    // Also capture next paragraph (optional)
    const next = headings[0].nextElementSibling;
    if (next && /p|div/i.test(next.tagName) && next.textContent.trim()) {
      lines.push(next.textContent.trim());
    }
  } else {
    // Collect line-like blocks
    container.childNodes.forEach((n) => {
      if (n.nodeType === Node.ELEMENT_NODE) {
        const tag = n.nodeName.toLowerCase();
        if (tag === 'p' || tag === 'div') {
          const t = n.textContent.replace(/\s+/g, ' ').trim();
          if (t) lines.push(t);
        } else if (tag === 'br') {
          lines.push('\n');
        }
      } else if (n.nodeType === Node.TEXT_NODE) {
        const t = n.textContent.replace(/\s+/g, ' ').trim();
        if (t) lines.push(t);
      }
    });
  }

  // Rebuild keeping at most 2 visual lines for the large title
  const joined = lines.join(' ').replace(/\s*\n\s*/g, '\n').trim();
  const titleLines = joined.split('\n').map((l) => l.trim()).filter(Boolean);
  const title = titleLines.slice(0, 2).join('\n');

  // CTA
  let cta = null;
  if (ctaEl) {
    cta = {
      label: (ctaEl.textContent || 'READ MORE').trim(),
      href: ctaEl.getAttribute('href') || '#',
    };
  }

  return { title, cta };
}

export default function decorate(block) {
  block.classList.add('hero-banner');

  // 1) Find authored content
  const cells = getPrimaryCells(block);
  if (!cells.length) return;

  // Look for an image anywhere inside these cells
  let imgEl = null;
  let textCell = null;

  if (cells.length === 1) {
    // Single cell: try to find image + text in same cell
    const c0 = cells[0];
    imgEl = c0.querySelector('img');
    textCell = c0;
  } else {
    // Two cells: prefer image in first, text in second; else detect by presence
    const [c0, c1] = cells;
    const img0 = c0.querySelector('img');
    const img1 = c1.querySelector('img');
    if (img0 && !img1) {
      imgEl = img0;
      textCell = c1;
    } else if (img1 && !img0) {
      imgEl = img1;
      textCell = c0;
    } else {
      // both or none – pick first image we find; the other becomes text
      imgEl = (block.querySelector('img')) || null;
      textCell = imgEl ? (imgEl.closest('td,th') === c0 ? c1 : c0) : c1 || c0;
    }
  }

  const bgUrl = imgEl ? (imgEl.currentSrc || imgEl.src) : '';
  const { title, cta } = extractTextAndLink(textCell || block);

  // 2) Rebuild block content: background, shade, content
  block.innerHTML = '';

  const bg = document.createElement('div');
  bg.className = 'hb-bg';
  if (bgUrl) bg.style.backgroundImage = `url("${bgUrl}")`;

  const shade = document.createElement('div');
  shade.className = 'hb-shade';

  const content = document.createElement('div');
  content.className = 'hb-content';

  const h = document.createElement('h2');
  h.className = 'hb-title';
  h.innerHTML = (title || '').replace(/\n/g, '<br>');
  content.appendChild(h);

  const a = document.createElement('a');
  a.className = 'hb-cta';
  a.href = (cta && cta.href) ? cta.href : '#';
  a.textContent = (cta && cta.label) ? cta.label : 'READ MORE';
  content.appendChild(a);

  block.append(bg, shade, content);

  // 3) Accessibility
  block.setAttribute('role', 'region');
  block.setAttribute('aria-label', 'Hero banner');
}
``
