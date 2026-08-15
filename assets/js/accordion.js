/**
 * accordion.js — progressive enhancement over a working <details> list.
 *
 * With JavaScript off the rows are plain <details name="projects">, which
 * gives native single-open behaviour and full keyboard support for free.
 * This module takes that `name` away and re-implements the same behaviour
 * with an animated height, because the native exclusive accordion closes a
 * sibling instantly and would cut any transition in half.
 *
 * Duration and easing come from the tokens, so prefers-reduced-motion
 * collapses the animation to 1ms without this file knowing about it.
 *
 * The open/closed state is never allowed to depend on an animation
 * finishing: browsers freeze animations in a hidden tab, so a row told to
 * close while the tab is in the background would otherwise stay open
 * forever. Anything in flight settles immediately instead.
 */

const ROW_SELECTOR = '#projects .row';
const SUMMARY_SELECTOR = '.row__summary';
const DURATION_TOKEN = '--dur-fast';
const EASING_TOKEN = '--ease';
const FALLBACK_DURATION_MS = 180;
const INSTANT_THRESHOLD_MS = 20;

function readToken(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function readDurationMs() {
  const raw = readToken(DURATION_TOKEN);
  if (raw.endsWith('ms')) return Number.parseFloat(raw);
  if (raw.endsWith('s')) return Number.parseFloat(raw) * 1000;
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : FALLBACK_DURATION_MS;
}

class Row {
  constructor(element, onExpand) {
    this.element = element;
    this.summary = element.querySelector(SUMMARY_SELECTOR);
    this.onExpand = onExpand;
    this.animation = null;
    /* null when settled; true or false while an animation is in flight. */
    this.pendingOpen = null;

    /* Hand exclusivity over from the browser to this module. */
    this.element.removeAttribute('name');
    this.summary.addEventListener('click', (event) => this.onClick(event));
  }

  get isOpen() {
    return this.element.open;
  }

  /** What the row will be once everything settles. */
  get settledOpen() {
    return this.pendingOpen === null ? this.isOpen : this.pendingOpen;
  }

  /** Height of the row with only its summary showing, borders included. */
  closedHeight() {
    const styles = getComputedStyle(this.element);
    return (
      this.summary.offsetHeight +
      Number.parseFloat(styles.borderBlockStartWidth || 0) +
      Number.parseFloat(styles.borderBlockEndWidth || 0)
    );
  }

  onClick(event) {
    event.preventDefault();
    if (this.settledOpen) this.collapse();
    else this.expand();
  }

  expand() {
    this.onExpand(this);
    const from = this.element.offsetHeight;
    this.element.open = true;
    this.animateHeight(from, this.element.offsetHeight, true);
  }

  collapse() {
    if (!this.settledOpen) return;
    this.element.open = true; // measure and animate from the open height
    this.animateHeight(this.element.offsetHeight, this.closedHeight(), false);
  }

  animateHeight(from, to, willBeOpen) {
    this.cancelAnimation();

    const duration = readDurationMs();
    /* Reduced motion collapses the token to 1ms, and a hidden tab freezes
       the timeline entirely. Either way, skip straight to the end state. */
    if (duration <= INSTANT_THRESHOLD_MS || document.hidden) {
      this.settle(willBeOpen);
      return;
    }

    this.pendingOpen = willBeOpen;
    this.element.style.overflow = 'hidden';

    this.animation = this.element.animate(
      { height: [`${from}px`, `${to}px`] },
      { duration, easing: readToken(EASING_TOKEN) || 'ease' }
    );
    this.animation.addEventListener('finish', () => this.settle(willBeOpen));
  }

  cancelAnimation() {
    if (!this.animation) return;
    const animation = this.animation;
    this.animation = null;
    animation.cancel();
  }

  /** Finish anything in flight right now — used when the tab goes away. */
  flush() {
    if (this.pendingOpen === null) return;
    this.settle(this.pendingOpen);
  }

  settle(willBeOpen) {
    this.cancelAnimation();
    this.element.open = willBeOpen;
    this.element.style.overflow = '';
    this.element.style.height = '';
    this.pendingOpen = null;
  }
}

export function initAccordion() {
  const elements = Array.from(document.querySelectorAll(ROW_SELECTOR));
  if (!elements.length) return;

  /* Web Animations on a <details> element is the one capability this module
     needs. Without it, leave the native accordion exactly as it is. */
  if (typeof Element.prototype.animate !== 'function') return;

  const rows = [];
  const closeOthers = (opened) => {
    rows.forEach((row) => {
      if (row !== opened && row.settledOpen) row.collapse();
    });
  };

  elements.forEach((element) => rows.push(new Row(element, closeOthers)));

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) rows.forEach((row) => row.flush());
  });

  /* Paper has no disclosure widgets. Open everything, then put it back. */
  let reopenAfterPrint = [];
  window.addEventListener('beforeprint', () => {
    rows.forEach((row) => row.flush());
    reopenAfterPrint = elements.filter((element) => !element.open);
    reopenAfterPrint.forEach((element) => {
      element.open = true;
    });
  });
  window.addEventListener('afterprint', () => {
    reopenAfterPrint.forEach((element) => {
      element.open = false;
    });
    reopenAfterPrint = [];
  });
}
