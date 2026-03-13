

function getCells(block) {
  const row = block.querySelector('tr');
  if (!row) return [];
  return [...row.querySelectorAll('td, th')];
}

function parseSettings(text) {
  const settings = {};
  (text || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .forEach((line) => {
      const m = line.match(/^([^:]+):\s*(.+)$/);
      if (m) {
        const key = m[1].trim().toLowerCase();
        const val = m[2].trim();
        settings[key] = val;
      }
    });
  return settings;
}

function buildMapSrc({ address, placeid, lat, lng, zoom, maptype }) {
  // Base parameters
  const z = zoom ? encodeURIComponent(zoom) : '12';
  const mt = maptype ? encodeURIComponent(maptype) : 'roadmap';

  // 3 priority modes:
  // 1) placeid embed
  if (placeid) {
    // Google supports place embedding using www.google.com/maps?cid or using /place/?q=place_id:... in some variants.
    // The classic public embed works well with "q=place_id:PLACE_ID".
    const q = `place_id:${placeid}`;
    return `https://www.google.com/maps?q=${encodeURIComponent(q)}&t=&z=${z}&ie=UTF8&iwloc=&output=embed`;
  }

  // 2) lat,lng embed
  if (lat && lng) {
    const ll = `${encodeURIComponent(lat)},${encodeURIComponent(lng)}`;
    return `https://www.google.com/maps?ll=${ll}&z=${z}&t=&hl=en&ie=UTF8&output=embed`;
  }

  // 3) address (query) embed
  const q = address || '';
  return `https://www.google.com/maps?q=${encodeURIComponent(q)}&t=&z=${z}&ie=UTF8&iwloc=&output=embed`;
}

export default function decorate(block) {
  block.classList.add('map-embed');

  const cells = getCells(block);
  if (!cells.length) return;

  const left = cells[0];
  const right = cells[1] || document.createElement('td');

  const address = (left.textContent || '').trim();
  const settings = parseSettings(right.textContent || '');

  const zoom = settings.zoom || '';
  const height = settings.height || '';
  const maptype = settings.maptype || '';
  const placeid = settings.placeid || '';
  const lat = settings.lat || '';
  const lng = settings.lng || '';

  // Build iframe src
  const src = buildMapSrc({ address, placeid, lat, lng, zoom, maptype });

  // Rebuild content
  block.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'map-wrap';
  if (height) wrap.style.height = height;

  const label = document.createElement('div');
  label.className = 'map-label';
  label.textContent = address;

  const iframe = document.createElement('iframe');
  iframe.setAttribute('loading', 'lazy');
  iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
  iframe.setAttribute('aria-label', address || 'Location map');
  iframe.src = src;

  wrap.append(label, iframe);
  block.append(wrap);

  // a11y
  block.setAttribute('role', 'region');
  block.setAttribute('aria-label', 'Map location');
}
``
