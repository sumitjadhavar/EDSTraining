
function getCells(block) {
  const table = block.querySelector('table');
  if (!table) return [];
  return [...table.querySelectorAll('td, th')];
}

function extractHeadingAndCTA(container) {
  // Prefer first heading; else gather text nodes/paragraphs.
  let heading = '';
  let ctaEl = container.querySelector('a');

  // Build heading from the first two non-empty lines
  const textPieces = [];
  // Preserve line breaks that come from <p>, <br>, or text nodes
  container.childNodes.forEach((n) => {
    if (n.nodeType === Node.ELEMENT_NODE) {
      const tag = n.nodeName.toLowerCase();
      if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'p') {
        const t = n.textContent.trim();
        if (t) textPieces.push(t);
      } else if (tag === 'br') {
        textPieces.push('\n');
      } else if (tag === 'a') {
        // already captured as ctaEl
      }
    } else if (n.nodeType === Node.TEXT_NODE) {
      const t = n.textContent.replace(/\s+/g, ' ').trim();
      if (t) textPieces.push(t);
    }
  });

  // Reconstruct with up to 2 lines if available
  const joined = textPieces.join(' ').replace(/\s*\n\s*/g, '\n').trim();
  const lines = joined.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length) {
    heading = lines.slice(0, 2).join('\n'); // keep at most 2 lines
  }

  // CTA defaults if not authored as a link
  let cta = {
    label: 'READ MORE',
    href: '#',
  };
  if (ctaEl) {
    cta = {
      label: (ctaEl.textContent || 'READ MORE').trim(),
      href: ctaEl.getAttribute('href') || '#',
    };
  }

  return { heading, cta };
}

export default function decorate(block) {
  block.classList.add('hero-banner');

  const cells = getCells(block);
  if (cells.length < 2) return;

  const leftCell = cells[0];
  const rightCell = cells[1];

  // Background image from left cell
  const img = leftCell.querySelector('img');
  const bgUrl = img ? img.currentSrc || img.src : '';

  // Heading + CTA from right cell
  const { heading, cta } = extractHeadingAndCTA(rightCell);

  // Rebuild block content
  block.innerHTML = '';

  // Background & shade layers
  const bg = document.createElement('div');
  bg.className = 'hb-bg';
  if (bgUrl) bg.style.backgroundImage = `url("${bgUrl}")`;

  const shade = document.createElement('div');
  shade.className = 'hb-shade';

  // Content
  const content = document.createElement('div');
  content.className = 'hb-content';

  const h = document.createElement('h2');
  h.className = 'hb-title';
  // Convert internal newlines to <br> for two-line layout
  h.innerHTML = (heading || '').replace(/\n/g, '<br>');
  content.appendChild(h);

  const a = document.createElement('a');
  a.className = 'hb-cta';
  a.href = cta.href || '#';
  a.innerHTML = `${cta.label} <span class="chev">»</span>`;
  content.appendChild(a);

  block.append(bg, shade, content);

  // a11y landmarks
  block.setAttribute('role', 'region');
  block.setAttribute('aria-label', 'Hero banner');
}
``
