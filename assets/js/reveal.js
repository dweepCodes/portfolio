/**
 * reveal.js — one-time scroll reveals.
 *
 * The hidden state lives in base.css behind `.js [data-reveal]`, so with
 * JavaScript off nothing is ever hidden in the first place. Each element is
 * revealed once and then unobserved: no re-triggering on the way back up.
 */

const TARGET_SELECTOR = '[data-reveal]';
const REVEALED_CLASS = 'is-revealed';
const THRESHOLD = 0.12;
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

const mediaReduced = window.matchMedia(REDUCED_QUERY);

export function initReveal() {
  const targets = Array.from(document.querySelectorAll(TARGET_SELECTOR));
  if (!targets.length) return;

  const revealAll = () => targets.forEach((el) => el.classList.add(REVEALED_CLASS));

  if (!('IntersectionObserver' in window) || mediaReduced.matches) {
    revealAll();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add(REVEALED_CLASS);
        observer.unobserve(entry.target);
      });
    },
    { threshold: THRESHOLD }
  );

  targets.forEach((el) => observer.observe(el));

  /* A live OS toggle must not leave anything stranded below the fold. */
  mediaReduced.addEventListener('change', () => {
    if (!mediaReduced.matches) return;
    observer.disconnect();
    revealAll();
  });
}
