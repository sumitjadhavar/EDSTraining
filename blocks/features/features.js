export default function decorate(block) {
  // Find rows inside the table
  const rows = [...block.querySelectorAll('table tr')];
  if (!rows.length) return;

  // Clear block HTML
  block.innerHTML = '';
  block.classList.add('features');

  rows.forEach((row, index) => {
    const cells = [...row.children];
    if (cells.length < 3) return;

    const card = document.createElement('div');
    card.className = 'feature-card';

    // Icon
    const icon = cells[0].querySelector('img');
    if (icon) {
      const cloned = icon.cloneNode(true);
      cloned.classList.add('feature-icon');
      card.append(cloned);
    }

    // Title
    const title = document.createElement('h3');
    title.textContent = cells[1].textContent.trim();
    card.append(title);

    // Description
    const desc = document.createElement('p');
    desc.textContent = cells[2].textContent.trim();
    card.append(desc);

    // Auto numbering
    const number = document.createElement('div');
    number.className = 'feature-number';
    number.textContent = String(index + 1).padStart(2, '0');
    card.append(number);

    block.append(card);
  });
}
