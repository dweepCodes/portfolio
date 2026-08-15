/**
 * tilt.js — mouse-tracked 3D tilt on the project rows.
 *
 * The ceiling is never written here: it is read from the --tilt-max token,
 * which prefers-reduced-motion collapses to 0deg. Re-read on every media
 * change so an OS toggle mid-session takes effect without a reload.
 */

const ROW_SELECTOR = '#projects .row';
const TILT_TOKEN = '--tilt-max';

/* Matches the 48rem breakpoint in pages.css (768px). */
const MOBILE_QUERY = '(max-width: 47.99rem)';
const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)';
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

const mediaMobile = window.matchMedia(MOBILE_QUERY);
const mediaFinePointer = window.matchMedia(FINE_POINTER_QUERY);
const mediaReduced = window.matchMedia(REDUCED_QUERY);

function readMaxDegrees() {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(TILT_TOKEN)
    .trim();
  const degrees = Number.parseFloat(raw);
  return Number.isFinite(degrees) ? degrees : 0;
}

export function initTilt() {
  const rows = Array.from(document.querySelectorAll(ROW_SELECTOR));
  if (!rows.length) return;

  let maxDegrees = readMaxDegrees();

  /* Pointer-only and desktop-only. A touch device has no hover state to
     tilt during, and under 768px the rows are too close to the screen edge
     for the effect to read as anything but a wobble. */
  const enabled = () =>
    maxDegrees > 0 && mediaFinePointer.matches && !mediaMobile.matches;

  const clear = (row) => {
    row.style.transform = '';
  };

  const onMove = (event) => {
    const row = event.currentTarget;
    /* An open row is being read, not browsed. Leave it flat. */
    if (!enabled() || row.open) {
      clear(row);
      return;
    }
    const bounds = row.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    const y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
    row.style.transform =
      `rotateX(${(-y * maxDegrees).toFixed(2)}deg) ` +
      `rotateY(${(x * maxDegrees).toFixed(2)}deg)`;
  };

  rows.forEach((row) => {
    row.addEventListener('pointermove', onMove);
    row.addEventListener('pointerleave', () => clear(row));
    row.addEventListener('toggle', () => clear(row));
  });

  const refresh = () => {
    maxDegrees = readMaxDegrees();
    rows.forEach(clear);
  };

  mediaReduced.addEventListener('change', refresh);
  mediaMobile.addEventListener('change', refresh);
  mediaFinePointer.addEventListener('change', refresh);
}
