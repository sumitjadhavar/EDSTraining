export default function decorate(block) {
  const cells = [...block.querySelectorAll('td')];
  if (cells.length < 2) return;

  const left = cells[0];
  const right = cells[1];

  // Clear main block
  block.innerHTML = '';

  // Create left column
  const leftCol = document.createElement('div');
  leftCol.className = 'hero-left';

  const img = left.querySelector('img')?.cloneNode(true);
  if (img) leftCol.append(img);

  const leftBtnText = left.textContent.trim();
  if (leftBtnText) {
    const btn = document.createElement('div');
    btn.className = 'left-cta';
    btn.textContent = leftBtnText;
    leftCol.append(btn);
  }

  // Create right column
  const rightCol = document.createElement('div');
  rightCol.className = 'hero-right';

  const lines = right.innerHTML.split('<br>').map(l => l.trim()).filter(Boolean);

  // First line = heading
  const h1 = document.createElement('h1');
  let heading = lines.shift();
  heading = heading.replace(/digital/i, '<span class="accent">digital</span>');
  h1.innerHTML = heading;
  rightCol.append(h1);

  // Paragraph line
  const p = document.createElement('p');
  p.innerHTML = lines.shift();
  rightCol.append(p);

  // Detect progress bars (lines with | percentage)
  lines.forEach(line => {
    if (line.includes('|')) {
      const [label, pct] = line.split('|').map(s => s.trim());

      const wrap = document.createElement('div');
      wrap.className = 'progress-wrap';

      const row = document.createElement('div');
      row.className = 'label-row';
      row.innerHTML = `<span>${label}</span><span>${pct}</span>`;
      wrap.append(row);

      const bar = document.createElement('div');
      bar.className = 'progress-bar';

      const fill = document.createElement('span');
      fill.style.width = pct;
      bar.append(fill);

      wrap.append(bar);
      rightCol.append(wrap);
    }
  });

  // Signature block
  const nameLine = lines.find(l => l.includes('|'));
  if (nameLine) {
    const [name, title] = nameLine.split('|').map(s => s.trim());
    const sig = document.createElement('div');
    sig.className = 'signature';
    sig.textContent = name;

    const des = document.createElement('div');
    des.className = 'designation';
    des.textContent = title;

    rightCol.append(sig, des);
  }

  // CTA button (last line)
  const cta = document.createElement('div');
  cta.className = 'cta-button';
  cta.textContent = 'READ MORE';
  rightCol.append(cta);

  // Append columns to block
  block.append(leftCol, rightCol);
}
