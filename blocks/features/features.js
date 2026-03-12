/**
 * Features Block - AEM EDS
 * Converts author table rows into styled feature cards
 */

export default function decorate(block) {
  const rows = [...block.querySelectorAll('tr')];

  // Reset block content
  block.innerHTML = '';
  block.classList.add('features');

  rows.forEach((row, index) => {
    const cells = [...row.children];
    if (cells.length < 3) return;

    const card = document.createElement('div');
    card.className = 'feature-card';

    // Extract author content
    const icon = cells[0].querySelector('img')?.cloneNode(true);
    const title = cells[1].textContent.trim();
    const desc = cells[2].textContent.trim();

    // Icon
    if (icon) card.append(icon);

    // Title
    const h3 = document.createElement('h3');
    h3.textContent = title;
    card.append(h3);

    // Description
    const p = document.createElement('p');
    p.textContent = desc;
    card.append(p);

    // Number (01, 02, 03…)
    const number = document.createElement('div');
    number.className = 'feature-number';
    number.textContent = (index + 1).toString().padStart(2, '0');
    card.append(number);

    block.append(card);
  });
}
