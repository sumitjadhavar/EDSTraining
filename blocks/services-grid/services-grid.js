/**
 * SERVICES GRID — AEM EDS Block
 * Converts author table rows into service cards with icon, title, description, and an arrow button
 */

function parseHighlights(block) {
  const metaRow = [...block.querySelectorAll("tr")].pop();
  const cells = metaRow ? [...metaRow.children] : [];
  if (!cells.length) return [];
  const key = cells[0].textContent.trim().toLowerCase();
  if (key !== "highlight") return [];
  return cells[1].textContent
    .split(",")
    .map(i => parseInt(i.trim(), 10))
    .filter(n => !isNaN(n));
}

export default function decorate(block) {
  const rows = [...block.querySelectorAll("tr")];

  // Check for highlight metadata row
  const highlightIndexes = parseHighlights(block);

  // Remove metadata row from processing
  const realRows = rows.filter(r => !r.textContent.toLowerCase().includes("highlight"));

  const grid = document.createElement("div");
  grid.className = "sg-grid";

  realRows.forEach((row, index) => {
    const cells = [...row.children];
    if (cells.length < 3) return;

    const icon = cells[0].querySelector("img");
    const title = cells[1].textContent.trim();
    const desc = cells[2].textContent.trim();

    const card = document.createElement("div");
    card.className = "sg-card";

    // Highlight if index matches metadata
    if (highlightIndexes.includes(index + 1)) {
      card.classList.add("highlighted");
    }

    if (icon) {
      card.append(icon.cloneNode(true));
    }

    const h3 = document.createElement("h3");
    h3.textContent = title;
    card.append(h3);

    const p = document.createElement("p");
    p.textContent = desc;
    card.append(p);

    // Arrow button
    const arrow = document.createElement("div");
    arrow.className = "arrow-btn";
    arrow.innerHTML = "→";
    card.append(arrow);

    grid.append(card);
  });

  // Replace block content
  block.innerHTML = "";
  block.append(grid);
}
