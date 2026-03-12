/**
 * IMAGE CAROUSEL — AEM EDS decorate()
 * Authoring: A table that contains images (any rows/cols).
 * The script collects images, wraps each as a .slide, and builds a horizontal scroller.
 */

function collectImages(block) {
  // Grab all images within the block (keeps order as authored)
  const imgs = [...block.querySelectorAll('img')];
  return imgs;
}

function makeNav(cls, label, symbol) {
  const wrap = document.createElement('div');
  wrap.className = `nav ${cls}`;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.setAttribute('aria-label', label);
  btn.innerHTML = symbol; // ‹ ›
  wrap.append(btn);
  return { wrap, btn };
}

export default function decorate(block) {
  block.classList.add('image-carousel');

  // 1) Collect images from authored content
  const imgs = collectImages(block);
  if (!imgs.length) return;

  // 2) Build scroller and slides; preserve links if image is inside <a>
  const scroller = document.createElement('div');
  scroller.className = 'scroller';

  imgs.forEach((img) => {
    const slide = document.createElement('figure');
    slide.className = 'slide';

    // If the image is wrapped in a link, move the link; else move the image
    const link = img.closest('a');
    if (link && link.contains(img)) {
      // Move the link with the image (not clone) to preserve href
      slide.append(link);
    } else {
      slide.append(img);
    }
    scroller.append(slide);
  });

  // 3) Replace original content with the carousel
  block.innerHTML = '';
  block.append(scroller);

  // 4) Add navigation controls
  const { wrap: prevWrap, btn: prevBtn } = makeNav('prev', 'Scroll left', '&#x2039;');
  const { wrap: nextWrap, btn: nextBtn } = makeNav('next', 'Scroll right', '&#x203A;');
  block.prepend(prevWrap);
  block.append(nextWrap);

  // 5) Paging logic: scroll by number of visible slides
  const getPage = () => {
    const first = scroller.querySelector('.slide');
    const slideW = first ? first.getBoundingClientRect().width : scroller.clientWidth * 0.9;
    const perView = Math.max(1, Math.floor(scroller.clientWidth / Math.max(1, slideW)));
    return Math.max(slideW * perView, 160);
  };

  prevBtn.addEventListener('click', () => scroller.scrollBy({ left: -getPage(), behavior: 'smooth' }));
  nextBtn.addEventListener('click', () => scroller.scrollBy({ left:  getPage(), behavior: 'smooth' }));

  // 6) Keyboard support (Arrow keys when block focused)
  block.tabIndex = 0;
  block.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') nextBtn.click();
    if (e.key === 'ArrowLeft') prevBtn.click();
  });

  // 7) Convert vertical mouse wheel to horizontal scrolling (desktop nicety)
  scroller.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      scroller.scrollBy({ left: e.deltaY, behavior: 'auto' });
    }
  }, { passive: false });

  // 8) Edge fades + button enabled/disabled states
  function updateUI() {
    const max = Math.max(0, scroller.scrollWidth - scroller.clientWidth - 1);
    const x = scroller.scrollLeft;
    prevBtn.disabled = x <= 0;
    nextBtn.disabled = x >= max;
    block.classList.toggle('show-fades', scroller.scrollWidth > scroller.clientWidth + 4);
  }

  scroller.addEventListener('scroll', updateUI, { passive: true });
  window.addEventListener('resize', () => requestAnimationFrame(updateUI));
  updateUI();

  // 9) Accessibility
  block.setAttribute('role', 'region');
  block.setAttribute('aria-label', 'Image carousel');
}
