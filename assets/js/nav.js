/**
 * nav.js — marks the nav link for the section currently being read.
 *
 * Progressive enhancement over plain anchors: with JavaScript off the links
 * still work, they just never highlight. Nothing here scrolls the page —
 * `scroll-behavior: smooth` in base.css already does that, and it is the
 * version that prefers-reduced-motion can switch off.
 *
 * The active section is whichever observed band is crossing the reading
 * line: a strip just under the sticky nav. Sections are taller than the
 * viewport, so a plain "is it visible" test would light two links at once.
 */

const LINK_SELECTOR = '.nav-links a[href^="#"]';

/* Where the reading line sits, as a share of the viewport below the nav.
   0.65 means a section counts as current once its top has passed the nav
   and until its bottom rises above the lower third of the screen. */
const READING_LINE = 0.65;

const CURRENT = 'location'; /* aria-current token for a spot within a page */

/* Measured off the element rather than read from --nav-h: the token is in
   rem and rootMargin only takes px, and the bar can run taller than its
   min-height when the links wrap. */
function navHeight() {
  const bar = document.querySelector('.site-nav');
  return bar ? Math.round(bar.getBoundingClientRect().height) : 0;
}

export function initNav() {
  const links = Array.from(document.querySelectorAll(LINK_SELECTOR));
  if (!links.length) return;

  /* Only links that point at a section on this page. A link to another
     document, or to an id that does not exist, is left alone. */
  const targets = new Map();
  links.forEach((link) => {
    const section = document.querySelector(link.getAttribute('href'));
    if (section) targets.set(section, link);
  });
  if (!targets.size) return;

  const visible = new Set();

  const paint = () => {
    /* Document order, not intersection order: when two bands straddle the
       reading line the upper one is the one being read. */
    let current = null;
    for (const section of targets.keys()) {
      if (visible.has(section)) {
        current = section;
        break;
      }
    }
    targets.forEach((link, section) => {
      if (section === current) link.setAttribute('aria-current', CURRENT);
      else link.removeAttribute('aria-current');
    });
  };

  let observer = null;

  const observe = () => {
    if (observer) observer.disconnect();
    visible.clear();
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        });
        paint();
      },
      {
        rootMargin: `-${navHeight()}px 0px -${READING_LINE * 100}% 0px`,
      }
    );
    targets.forEach((_link, section) => observer.observe(section));
  };

  observe();

  /* The nav grows a row when the links wrap, so its height — and the margin
     built from it — changes with the viewport. Rebuild rather than
     recompute: rootMargin is fixed at construction. */
  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(observe, 150);
  });
}
