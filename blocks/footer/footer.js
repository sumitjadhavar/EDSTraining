/**
 * FOOTER BLOCK — AEM EDS
 * Structure:
 * - Optional image on top acts as background
 * - 3-column table for Footer content
 * - Text below table becomes copyright
 */

export default function decorate(block) {
  block.classList.add('footer');

  const table = block.querySelector('table');
  if (!table) return;

  const rows = [...table.querySelectorAll('tr')];
  const cols = rows[0] ? [...rows[0].children] : [];

  // Extract cells
  const col1 = cols[0] || document.createElement('td');
  const col2 = cols[1] || document.createElement('td');
  const col3 = cols[2] || document.createElement('td');

  // Identify background image if placed above table
  const bgImg = block.querySelector('img');
  let bgUrl = '';
  if (bgImg) bgUrl = bgImg.src;

  // Remove old content
  block.innerHTML = '';

  // Background & overlay
  if (bgUrl) {
    const bg = document.createElement('div');
    bg.className = 'footer-bg';
    bg.style.backgroundImage = `url("${bgUrl}")`;
    block.append(bg);
  }

  const overlay = document.createElement('div');
  overlay.className = 'footer-overlay';
  block.append(overlay);

  // Grid container
  const grid = document.createElement('div');
  grid.className = 'footer-grid';

  // Helper to build columns
  function createColumn(title, contentEl) {
    const wrap = document.createElement('div');
    wrap.className = 'footer-col';

    const h3 = document.createElement('h3');
    h3.textContent = title;

    wrap.append(h3, contentEl);
    return wrap;
  }

  // Column 1: About + social icons
  const aboutWrap = document.createElement('div');
  const aboutLines = col1.innerHTML.split('<br>').filter(Boolean);

  aboutLines.forEach(line => {
    const p = document.createElement('p');
    p.innerHTML = line;
    aboutWrap.append(p);
  });

  // Social icons (detect images)
  const socialImgs = [...col1.querySelectorAll('img')];
  if (socialImgs.length) {
    const socials = document.createElement('div');
    socials.className = 'social-icons';
    socialImgs.forEach(img => socials.append(img.cloneNode(true)));
    aboutWrap.append(socials);
  }

  // Column 2: Quick Contact
  const contactWrap = document.createElement('div');
  col2.innerHTML.split('<br>').forEach(line => {
    const p = document.createElement('p');
    p.innerHTML = line;
    contactWrap.append(p);
  });

  // Column 3: Recent Posts
  const postWrap = document.createElement('div');
  postWrap.className = 'recent-posts';
  col3.innerHTML.split('<br>').forEach(line => {
    const p = document.createElement('p');
    p.innerHTML = line;
    postWrap.append(p);
  });

  grid.append(
    createColumn('About', aboutWrap),
    createColumn('Quick Contact', contactWrap),
    createColumn('Recent Posts', postWrap)
  );

  block.append(grid);

  // Copyright / bottom bar
  const copyrightRow = block.parentElement.querySelector('p:last-of-type');
  const bottom = document.createElement('div');
  bottom.className = 'footer-bottom';
  bottom.textContent = copyrightRow ? copyrightRow.textContent : '';
  block.append(bottom);
}
