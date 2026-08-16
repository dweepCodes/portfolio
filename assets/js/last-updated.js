/**
 * last-updated.js — stamps the footer with the page's last-modified date.
 *
 * No build step means no compile-time date injection, so this reads
 * document.lastModified (set by the file server from the file's mtime) at
 * runtime instead. Falls back to a hardcoded date if the browser reports
 * the unreliable "01/01/1970" sentinel some servers send when they don't
 * expose a real Last-Modified header.
 */

// update manually on deploy — used only if document.lastModified is unreliable
const FALLBACK_DATE = '2026.08.16';

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

export function initLastUpdated() {
  const el = document.getElementById('last-updated');
  if (!el) return;

  const parsed = new Date(document.lastModified);
  const isReliable = !Number.isNaN(parsed.getTime()) && parsed.getFullYear() > 1970;

  el.textContent = `LAST UPDATED: ${isReliable ? formatDate(parsed) : FALLBACK_DATE}`;
}
