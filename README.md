# dweep-portfolio

Personal portfolio for **Dweep Shishodia** — ML engineer, BS Data Science @ IIT
Madras, founder of [matri6](https://matri6.com).

Two static pages, no build step, no framework, no bundler. Plain HTML, CSS custom
properties, and ES modules. Three.js `0.169.0` from a CDN import map is the only
dependency, and it is kept off the critical path three ways: it is imported only
on `index.html`, only if the browser reports WebGL, and only once the main thread
goes idle. The minified build transfers at ~166KB compressed; everything else on
the page — all four stylesheets and all five modules — is under 35KB combined.

Until three.js arrives, the hero shows a static inline SVG of the same
icosahedron. If it never arrives, that SVG is what stays.

---

## Local preview

The pages use ES modules and an import map, so `file://` will not work. Any static
server does:

```bash
# Python (already installed on most machines)
python -m http.server 8000

# or Node
npx serve .
```

Then open <http://localhost:8000>.

To check the JavaScript-off path, disable JS in DevTools (Command Palette →
*Disable JavaScript*) and reload. Everything should still read and work: the hero
falls back to an inline SVG of the same icosahedron, and the project accordion
falls back to native `<details name="projects">`, which gives single-open
behaviour with no script at all.

---

## Structure

```
index.html                  main portfolio page
certifications.html         certifications & achievements
404.html                    uses root-absolute asset paths
robots.txt · sitemap.xml
assets/
  css/
    tokens.css              every colour, font, size and constant — the only file
                            allowed to contain a literal value
    base.css                reset, type scale, layout primitives, focus, print
    components.css          nav, buttons, tags, cards, accordion row, footer
    pages.css               section layout, each selector scoped to its id
  js/
    main.js                 entry; wraps every init() in try/catch
    hero3d.js               three.js scene (lazy, self-contained, fails silently)
    tilt.js                 pointer tilt on project rows
    accordion.js            animated single-open over <details>
    reveal.js               one-time IntersectionObserver reveals
  img/
    favicon.svg
    og-cover.png            1200×630 social card
    make-og-cover.ps1       regenerates og-cover.png
    certs/                  certificate thumbnails (see "Still to add")
```

### The two rules that keep it coherent

1. **`tokens.css` owns every literal.** No hex value and no `px` font-size appears
   anywhere else. Colour, type, spacing, motion, and layer values are all custom
   properties. Even `hero3d.js` reads `--ink`, `--paper`, and `--emerald` out of
   computed style rather than repeating them.
2. **Each JS module exports one `init()` and does nothing on import.** `main.js`
   wraps each call so a blocked CDN, a missing WebGL context, or an unsupported
   API can never blank the page.

Two unavoidable exceptions, both documented in place: the `<meta name="theme-color">`
value (a meta attribute cannot read a custom property) and `favicon.svg` (fetched
outside the page). Media-query breakpoints are also literal, since a media query
cannot read a custom property either — they are listed at the top of `pages.css`.

---

## Deploying

Static host, no build command, no output directory:

| Host | Setting |
|---|---|
| **Vercel** | Framework preset **Other**, build command empty, output directory `.` |
| **Netlify** | Build command empty, publish directory `.` |
| **Cloudflare Pages** | Framework preset **None**, build output directory `/` |

All three serve `404.html` automatically for unmatched routes.

### Before the first deploy

The canonical host is assumed to be **`https://dweep.matri6.com`**. If it lands
somewhere else, change it in four places:

- `index.html` — `<link rel="canonical">`, `og:url`, `og:image`, `twitter:image`
- `certifications.html` — the same five tags
- `robots.txt` — the `Sitemap:` line
- `sitemap.xml` — both `<loc>` values

---

## Still to add

Placeholders are not allowed in this repo, so anything without real content was
left out rather than faked. Each item below has a commented-out block sitting
exactly where it belongs.

- **Certificate images.** `assets/img/certs/compassionathon.jpg` and
  `assets/img/certs/claude-code-101.png`. Drop the files in and uncomment the
  `<img class="cert__thumb">` block in the matching card in `certifications.html`.
- **Project URLs.** AgroNav's live app, AutoVal's live app and repository, and
  SmartCart's repository. Each row in `index.html` has a commented `row__links`
  block with the markup ready. Until then the projects section links to the
  GitHub profile as a whole, so no link on the page is dead.
- **A fourth certification** is a copy-paste of the template comment at the end of
  the list in `certifications.html`.

## Regenerating the social card

```powershell
pwsh -File assets/img/make-og-cover.ps1 assets/img/og-cover.png
```

Windows only (it uses `System.Drawing`). The card is drawn in the site palette
with the heaviest condensed face Windows ships, since Archivo is not installed
system-wide.

---

## Two deliberate departures from `CLAUDE.md`

1. **`--fs-display` is `clamp(3rem, 8vw, 7.25rem)`, not `clamp(3rem, 11vw, 9rem)`.**
   Measured in the browser, the longest headline line ("I build the second kind.")
   costs 10.7px of width per pixel of font size in Archivo at `wdth 75 / wght 900`.
   At 11vw / 9rem it wraps at every viewport above 768px. The clamp above is the
   largest that keeps all three lines unbroken from 768px up. Readability wins.
2. **The hero headline is full-width, with the 3D object beside the sub-heading
   rather than beside the headline.** In a two-column hero the headline column is
   ~650px at 1440, which caps the display type at ~3.25rem — smaller than the
   scale's own minimum. Giving the headline the full container is what lets the
   type actually be oversized.

## Accessibility and motion

- One two-tone focus ring, defined once in `base.css`, visible on paper, on ink,
  and on all four saturated block colours. There is no per-section override.
- Body text meets 4.5:1 everywhere. The saturated colours are **block** colours,
  never text colours — emerald type on paper is 2.2:1 and coral is 2.9:1. Blue
  blocks carry paper text only (ink on blue is 3.3:1, sun on blue is 3.5:1).
- `prefers-reduced-motion: reduce` collapses the motion tokens, so every CSS
  transition and animation built from them stops. `hero3d.js` and `tilt.js` carry
  their own `matchMedia` listeners because a `requestAnimationFrame` loop cannot
  be stopped by CSS — and they listen for `change`, so toggling the OS setting
  mid-session takes effect without a reload.
- The hero render loop pauses when the canvas scrolls off-screen and when the tab
  is hidden. Pixel ratio is capped at 2, halved under 768px, where mouse parallax
  and card tilt are switched off entirely.
