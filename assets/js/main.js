/**
 * main.js — the only entry point.
 *
 * Every module exports a single init() and does nothing on import. Each
 * init() is wrapped here so a failure in one enhancement — a blocked CDN, a
 * missing WebGL context, an API the browser does not have — can never blank
 * the page. The site is fully readable before any of this runs.
 */

import { initNav } from './nav.js';
import { initReveal } from './reveal.js';
import { initAccordion } from './accordion.js';
import { initTilt } from './tilt.js';
import { initHero3D } from './hero3d.js';
import { initLastUpdated } from './last-updated.js';

function report(name, error) {
  console.warn(
    `[portfolio] "${name}" did not start. The page works without it.`,
    error
  );
}

function boot(name, init) {
  try {
    const result = init();
    /* Async inits (hero3d loads three.js on demand) reject rather than
       throw, so the promise needs catching too. */
    if (result && typeof result.catch === 'function') {
      result.catch((error) => report(name, error));
    }
  } catch (error) {
    report(name, error);
  }
}

boot('nav', initNav);
boot('reveal', initReveal);
boot('accordion', initAccordion);
boot('tilt', initTilt);
boot('hero3d', initHero3D);
boot('lastUpdated', initLastUpdated);
