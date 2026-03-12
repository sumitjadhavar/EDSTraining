/**
 * Cards Carousel (EDS block)
 * - Enhances the horizontal scroller with prev/next buttons
 * - Keeps buttons enabled/disabled correctly
 * - Adds gentle edge fades only when overflowing
 * - Supports ArrowLeft/ArrowRight keys and vertical-wheel → horizontal scroll
 */
export default function decorate(block) {
  // 1) Find or create the scroller wrapper
  let scroller = block.querySelector('.scroller');
  if (!scroller) {
    // If authoring rendered direct children as cards, wrap them
    scroller = document.createElement('div');
    scroller.className = 'scroller';
    [...block.children].forEach((child) => scroller.append(child));
    block.append(scroller);
  }

  // 2) Add Prev/Next buttons
  const makeNav = (cls, label, symbol) => {
    const wrap = document.createElement('div');
    wrap.className = `nav ${cls}`;
    const btn = document.createElement('button');
    btn.setAttribute('type', 'button');
    btn.setAttribute('aria-label', label);
    // Symbols: ‹ and › (U+2039, U+203A) or SVGs if you prefer
    btn.innerHTML = symbol;
    wrap.append(btn);
    return { wrap, btn };
  };

  const { wrap: prevWrap, btn: prevBtn } = makeNav('prev', 'Scroll left', '&#x2039;');
  const { wrap: nextWrap, btn: nextBtn } = makeNav('next', 'Scroll right', '&#x203A;');
  block.prepend(prevWrap);
  block.append(nextWrap);

  // 3) Compute a good paging amount (visible cards at once)
  const getPage = () => {
    const firstCard = scroller.querySelector('.card') || scroller.firstElementChild;
    const cardW = firstCard ? firstCard.getBoundingClientRect().width : scroller.clientWidth * 0.9;
    const perView = Math.max(1, Math.floor(scroller.clientWidth / cardW));
    return Math.max(cardW * perView, 160);
  };

  // 4) Button handlers
  prevBtn.addEventListener('click', () => {
    scroller.scrollBy({ left: -getPage(), behavior: 'smooth' });
  });
  nextBtn.addEventListener('click', () => {
    scroller.scrollBy({ left: getPage(), behavior: 'smooth' });
  });

  // 5) Keyboard support when the block is focused
  block.setAttribute('tabindex', '0');
  block.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { nextBtn.click(); }
    if (e.key === 'ArrowLeft') { prevBtn.click(); }
  });

  // 6) Convert vertical wheel to horizontal (nice on desktops)
  scroller.addEventListener('wheel', (e) => {
    // If user scrolls mostly vertically, shift to horizontal
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      scroller.scrollBy({ left: e.deltaY, behavior: 'auto' });
    }
  }, { passive: false });

  // 7) Edge fades + button disabled states
  function updateAffordances() {
    const maxScroll = scroller.scrollWidth - scroller.clientWidth - 1;
    const x = scroller.scrollLeft;
    prevBtn.disabled = x <= 0;
    nextBtn.disabled = x >= maxScroll;
    block.classList.toggle('show-fades', scroller.scrollWidth > scroller.clientWidth + 4);
  }

  scroller.addEventListener('scroll', updateAffordances, { passive: true });
  window.addEventListener('resize', () => requestAnimationFrame(updateAffordances));
  updateAffordances();

  // 8) ARIA
  if (!block.hasAttribute('aria-label')) {
    block.setAttribute('role', 'region');
    block.setAttribute('aria-label', 'Cards carousel');
  }
  scroller.setAttribute('aria-live', 'polite');
}
