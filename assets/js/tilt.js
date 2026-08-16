/**
 * tilt.js — mouse-tracked 3D tilt on the project rows and the cert cards.
 *
 * The ceiling is never written here: it is read from the token each group
 * names, and prefers-reduced-motion collapses those tokens to 0deg. Re-read
 * on every media change so an OS toggle mid-session takes effect without a
 * reload.
 *
 * Only `transform` is written. Anything else a tilting element animates —
 * the cert card's pressed state, for one — must use the separate `translate`
 * property, or it will be clobbered on the next pointermove.
 */

/* Two groups, two ceilings: a project row is read one at a time, a cert card
   sits in a grid of six, so the grid tilts less. */
const GROUPS = [
  { selector: '#projects .row', token: '--tilt-max' },
  { selector: '#certifications .cert-card', token: '--tilt-max-soft' },
];

/* Matches the 48rem breakpoint in pages.css (768px). */
const MOBILE_QUERY = '(max-width: 47.99rem)';
const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)';
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

const mediaMobile = window.matchMedia(MOBILE_QUERY);
const mediaFinePointer = window.matchMedia(FINE_POINTER_QUERY);
const mediaReduced = window.matchMedia(REDUCED_QUERY);

function readMaxDegrees(token) {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim();
  const degrees = Number.parseFloat(raw);
  return Number.isFinite(degrees) ? degrees : 0;
}

function clear(element) {
  element.style.transform = '';
}

/* Wires one group of elements to one ceiling. Returns a refresh function so
   the caller can re-read the token when a media query flips. */
function bindGroup({ selector, token }) {
  const elements = Array.from(document.querySelectorAll(selector));
  if (!elements.length) return null;

  let maxDegrees = readMaxDegrees(token);

  /* Pointer-only and desktop-only. A touch device has no hover state to
     tilt during, and under 768px the elements are too close to the screen
     edge for the effect to read as anything but a wobble. */
  const enabled = () =>
    maxDegrees > 0 && mediaFinePointer.matches && !mediaMobile.matches;

  const onMove = (event) => {
    const element = event.currentTarget;
    /* An open row is being read, not browsed. Leave it flat. */
    if (!enabled() || element.open) {
      clear(element);
      return;
    }
    const bounds = element.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    const y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
    element.style.transform =
      `rotateX(${(-y * maxDegrees).toFixed(2)}deg) ` +
      `rotateY(${(x * maxDegrees).toFixed(2)}deg)`;
  };

  elements.forEach((element) => {
    element.addEventListener('pointermove', onMove);
    element.addEventListener('pointerleave', () => clear(element));
    element.addEventListener('toggle', () => clear(element));
  });

  return () => {
    maxDegrees = readMaxDegrees(token);
    elements.forEach(clear);
  };
}

export function initTilt() {
  const refreshers = GROUPS.map(bindGroup).filter(Boolean);
  if (!refreshers.length) return;

  const refresh = () => refreshers.forEach((run) => run());

  mediaReduced.addEventListener('change', refresh);
  mediaMobile.addEventListener('change', refresh);
  mediaFinePointer.addEventListener('change', refresh);
}
