/**
 * Hero Title — EDS decorate()
 * Expected authoring:
 *  - Line 1: Eyebrow / Tagline (e.g., "Digital Consulting Agency")
 *  - Line 2: Headline (e.g., "Digital Marketing Gallery")
 * The script converts the first two lines/rows into a styled eyebrow and H1.
 */

const DEFAULT_ACCENT = 'Marketing'; // fallback if nothing provided

function extractPlainText(el) {
  return (el.textContent || '').trim();
}

function findFirstTwoLines(block) {
  // Works whether author used a table, paragraphs, or divs
  const lines = [];

  // If a table was used, take cell contents row by row
  const tableCells = block.querySelectorAll(':scope table tr > td, :scope table tr > th');
  if (tableCells.length >= 2) {
    lines.push(tableCells[0]);
    lines.push(tableCells[1]);
  }

  // Otherwise, collect direct children that have text
  if (lines.length < 2) {
    const candidates = [...block.children].filter((n) => {
      // Skip tables because we handled them above
      if (n.tagName && n.tagName.toLowerCase() === 'table') return false;
      const t = extractPlainText(n);
      return t.length > 0;
    });
    if (candidates.length >= 2) {
      lines.push(candidates[0], candidates[1]);
    }
  }

  // Fallback: any texty descendants
  if (lines.length < 2) {
    const descendants = [...block.querySelectorAll('*')].filter((n) => extractPlainText(n).length > 0);
    if (descendants.length >= 2) lines.push(descendants[0], descendants[1]);
  }

  return lines.slice(0, 2);
}

function getBlockMeta(block) {
  // Reads block metadata if present (eds pattern: last row as key/value table)
  const meta = {};
  const metaTables = block.querySelectorAll(':scope table');
  metaTables.forEach((tbl) => {
    const rows = tbl.querySelectorAll('tr');
    rows.forEach((tr) => {
      const [kCell, vCell] = tr.querySelectorAll('td, th');
      if (!kCell || !vCell) return;
      const key = (kCell.textContent || '').trim().toLowerCase();
      const val = (vCell.textContent || '').trim();
      if (key && val) meta[key] = val;
    });
  });
  return meta;
}

function highlightAccentWord(html, accentWord) {
  if (!accentWord) return html;
  // Use a case-insensitive whole-word regex; support Unicode letters
  const escaped = accentWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(\\b)(${escaped})(\\b)`, 'iu');
  return html.replace(re, (_m, g1, word, g3) => `${g1}<span class="accent">${word}</span>${g3}`);
}

export default function decorate(block) {
  block.classList.add('hero-title');

  // 1) Identify eyebrow + headline sources
  const [eyebrowNode, headlineNode] = findFirstTwoLines(block);
  if (!eyebrowNode || !headlineNode) return; // nothing to do

  const eyebrowText = extractPlainText(eyebrowNode);
  // Preserve headline inline marks (bold/italic) by copying innerHTML
  const headlineHTML = headlineNode.innerHTML.trim() || headlineNode.textContent.trim();

  // 2) Clear block and reconstruct minimal semantic markup
  block.innerHTML = '';

  const eyebrow = document.createElement('p');
  eyebrow.className = 'eyebrow';
  eyebrow.textContent = eyebrowText;

  const h1 = document.createElement('h1');
  h1.innerHTML = headlineHTML;

  // 3) Accent logic
  const meta = getBlockMeta(block);
  // Priority: bolded word in headline → metadata "accent" → default
  let accentWord = null;

  // Try to pick a bolded word if any exist
  const tmp = document.createElement('div');
  tmp.innerHTML = headlineHTML;
  const bolds = tmp.querySelectorAll('b, strong');
  if (bolds.length) {
    const candidate = (bolds[0].textContent || '').trim();
    if (candidate) accentWord = candidate;
  }

  // Metadata override
  if (!accentWord && meta.accent) {
    accentWord = meta.accent.trim();
  }

  // Fallback
  if (!accentWord) accentWord = DEFAULT_ACCENT;

  // Only apply if not already wrapped by author
  if (!h1.querySelector('.accent')) {
    h1.innerHTML = highlightAccentWord(h1.innerHTML, accentWord);
  }

  // 4) Append to block
  block.append(eyebrow, h1);
}
``
