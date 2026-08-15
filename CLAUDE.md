# CLAUDE.md — dweep-portfolio

Persistent context for this repo. Read fully before writing or changing code.

---

## 1. What this is

Personal portfolio for **Dweep Shishodia** — ML engineer, BS Data Science @ IIT Madras,
founder of **matri6**. Two static pages, no build step.

**Primary audience:** an IIT Madras professor receiving this by email, plus recruiters
and internship reviewers. It must be visually distinctive *and* immediately legible.
If a design choice ever fights readability, readability wins.

**Deployment target:** a subdomain of `matri6.com` (static host — Vercel / Netlify /
Cloudflare Pages). Must work from a plain file server with no bundler.

---

## 2. Non-negotiables

- **No build step.** Plain HTML + CSS + ES modules. Three.js via CDN import map.
- **No `fetch()` for content.** All copy is authored directly in the HTML. This keeps
  the site SEO-readable, printable, and functional if JS fails.
- **The site must be fully usable with JavaScript disabled.** The 3D hero is an
  enhancement, not a dependency. Accordions must fall back to open content
  (use `<details>`/`<summary>` as the base element).
- **Responsive from 320px up.** Test at 320 / 390 / 768 / 1280 / 1920.
- **Respect `prefers-reduced-motion`.** Kills auto-rotation, tilt, and scroll reveals.
- **Accessible:** visible keyboard focus rings, semantic landmarks, alt text,
  4.5:1 contrast minimum on body text.
- **No placeholder/lorem content ever.** Every string in the repo is real.

---

## 3. Folder structure

```
dweep-portfolio/
├── CLAUDE.md
├── README.md
├── index.html                  # main portfolio page
├── certifications.html         # certifications & achievements
├── 404.html
├── robots.txt
├── sitemap.xml
└── assets/
    ├── css/
    │   ├── tokens.css          # ONLY place colors/type/spacing are defined
    │   ├── base.css            # reset, typography scale, layout primitives
    │   ├── components.css      # nav, buttons, cards, accordion, form, footer
    │   └── pages.css           # section-specific layout (index + certs)
    ├── js/
    │   ├── main.js             # entry: imports and inits everything
    │   ├── hero3d.js           # three.js scene (self-contained, fails silently)
    │   ├── tilt.js             # mouse-tracked CSS 3D tilt on cards
    │   ├── accordion.js        # progressive enhancement over <details>
    │   └── reveal.js           # IntersectionObserver scroll reveals
    └── img/
        ├── favicon.svg
        ├── og-cover.png        # 1200x630 social card
        └── certs/              # certificate thumbnails
            ├── claude-code-101.png
            └── compassionathon.jpg
```

**Rules:** `tokens.css` is the single source of truth for every color, font, and
spacing value — never hardcode a hex or px font-size anywhere else. Each JS module
exports one `init()` function and does nothing on import. `main.js` wraps every
`init()` in try/catch so one failure can't blank the page.

---

## 4. Design system

### 4.1 Direction

Flat neubrutalist / Swiss-poster shell — thick black rules, hard-edged saturated
blocks, oversized type, zero border-radius, zero soft shadows — with **one** real
3D element in the hero.

The palette and wordmark come from the existing matri6.com identity (huge
letter-spaced wordmark, black-on-white, emerald chevron field). The portfolio is a
sibling of that site, not a stranger to it.

### 4.2 Tokens (`assets/css/tokens.css`)

```css
:root {
  /* Color — 6 values, no others */
  --ink:      #0A0A0A;   /* borders, type, dark section bg */
  --paper:    #F6F7F5;   /* page background */
  --emerald:  #17BE85;   /* matri6 primary — hero object, primary blocks */
  --blue:     #1F4BFF;   /* secondary blocks */
  --coral:    #FF5A3C;   /* accents, active/hover states */
  --sun:      #FFC93C;   /* highlights, numbers */

  /* Type */
  --font-display: 'Archivo', system-ui, sans-serif;   /* variable, wght + wdth axes */
  --font-body:    'Inter Tight', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', ui-monospace, monospace;

  /* Structure */
  --rule:      3px;      /* standard border */
  --rule-thick: 6px;     /* section dividers */
  --radius:    0;        /* never change this */
}
```

**Why Archivo:** it's a variable font with a real width axis. Headlines run
condensed-and-heavy (`wdth 75, wght 900`); the matri6 wordmark in the nav runs
wide with heavy tracking (`wdth 110, wght 700, letter-spacing: 0.5em`) — matching
matri6.com. One family, two opposite personalities. Load only the axes used.

**Type scale** (clamp-based, fluid): display `clamp(3rem, 11vw, 9rem)`,
h2 `clamp(2rem, 6vw, 4.5rem)`, h3 `1.5rem`, body `1.0625rem/1.6`,
mono micro-label `0.75rem` uppercase `letter-spacing: 0.18em`.

### 4.3 The signature element

The hero 3D object. A **flat-shaded icosahedron in `--emerald`** with a **thick
black `EdgesGeometry` wireframe** drawn over it — so the 3D form reads as if it were
outlined by the same pen that drew every flat block on the page. Behind it, a
**hard-offset black silhouette** (a CSS/SVG shape offset ~14px down-right, no blur)
gives it the classic neubrutalist drop-shadow. Real depth wearing flat clothes —
that contrast is the whole idea.

Spend the boldness here. Everything else stays disciplined.

Constraints: `detail: 0` icosahedron, no textures, no post-processing, `antialias`
on desktop only, `setPixelRatio(Math.min(devicePixelRatio, 2))`, pause the render
loop when the canvas is off-screen (IntersectionObserver) and on
`document.hidden`. Under 768px: drop mouse parallax, halve pixel ratio.
If WebGL is unavailable, render a static inline SVG of the same silhouette instead.

### 4.4 Numbering discipline

Numbered markers (`01 / 02 / 03`) are used **only where order carries meaning**:

- **Projects** — numbered in reverse chronological order, with the date shown
  alongside. The number encodes the timeline.
- **Process** — numbered because the steps genuinely happen in sequence.

**Not** used on the skills grid (a set, not a sequence) — use mono category labels
there instead.

### 4.5 Motion

One orchestrated page-load sequence in the hero (wordmark → headline lines stagger
in → 3D object fades up), then quiet. Elsewhere: scroll reveals at 12% threshold,
one-time only; card tilt max 8deg; accordion open/close 180ms. Nothing loops except
the hero rotation. No parallax on text. No scroll-jacking.

---

## 5. Content

All copy below is final. Do not paraphrase, expand, or "improve" it without asking.

### 5.1 Identity

- Name: **Dweep Shishodia**
- Role line: `ML Engineer · BS Data Science, IIT Madras · Building matri6`
- Location: Pune, Maharashtra, India
- Email: `dweepshishodia57@gmail.com`
- GitHub: `https://github.com/dweep1128`
- LinkedIn: `https://www.linkedin.com/in/dweep1128/`
- Kaggle: `https://www.kaggle.com/dweepshishodia`
- Studio: `https://matri6.com`

### 5.2 Hero

> **Models are easy.**
> **Products are hard.**
> *I build the second kind.*

Sub: `Dweep Shishodia — ML engineer. I take problems from raw data to a URL someone can actually open.`

CTAs: `See the work ↓` (scrolls to projects) · `Email me ↗` (mailto)

### 5.3 About — "The matri6 thesis"

Three short paragraphs, roughly:

1. Most ML work stops at a notebook with a good score in it. Dweep's stops at a
   deployed URL — every project listed here is live, containerized, or serving
   predictions to someone.
2. **matri6** is the studio that holds that work: a parent brand under which
   products get built, branded, and shipped. **Paleskies** — AI product video
   generation for D2C brands — is its flagship, and it took runner-up at IIT
   Madras' Compassion-a-thon 3.0.
3. Currently a second-year BS Data Science student at IIT Madras (CGPA 8.0,
   Foundational Level complete) and a freelance ML engineer. Open to research
   assistantships, internships, and full-time roles.

Pull-quote block (emerald or coral, oversized): **"Models are easy. Products are hard."**

### 5.4 Skills — 6 cards, mono category labels

| Label | Contents |
|---|---|
| LANGUAGES | Python, SQL, Java |
| ML / MODELING | PyTorch, XGBoost, LightGBM, CatBoost, Scikit-Learn, Optuna, SHAP |
| GENAI / NLP | BERT, FAISS, RAG pipelines, Seedance 2.0, rembg (BiRefNet), OpenCV, Pillow |
| AGENTIC AI | LangChain, LangGraph |
| DATA & COMPUTE | Pandas, Polars, NumPy, Matplotlib, Seaborn |
| SHIP & DEPLOY | FastAPI, Flask, Streamlit, Docker, Supabase, AWS, Google Cloud, Render, Git |

### 5.5 Projects — accordion, reverse chronological

Each row: number · title · one-line hook · date · stack tags (mono) · links.
Expanded: 2–3 bullets on problem, approach, and result.

**01 — Paleskies** · 2026 · *Live* · `paleskies.matri6.com`
AI product video generation for D2C brands — replacing studio shoots with video
generated from a single product image.
Stack: FastAPI · fal.ai Seedance 2.0 · rembg (BiRefNet) · OpenCV · Pillow · Supabase · Docker · AWS
Bullets: the cost/turnaround problem D2C brands face; the backend pipeline
(background removal → preprocessing → reference-to-video generation → Postgres +
Storage persistence, containerized); runner-up at IITM Compassion-a-thon 3.0.

**02 — Personality Assessment AI** · Mar 2026 – present · *Freelance, confidential client*
Adaptive personality assessment making psychological self-insight affordable.
Stack: BERT · FAISS · Python
Bullets: 5,000 psychologist-authored questions, 2-person full-stack team; adaptive
question recommendation engine using BERT embeddings + FAISS vector search, picking
the next question from response history and semantic alignment; explainable report
layer computing weighted sub-category contribution scores so output is readable, not opaque.
No client name, no logo, no live link.

**03 — AgroNav** · May 2026 · *Live app*
Territory prioritization for agri-sales reps — predicts whether a visit converts
within 7 days so reps stop burning travel on dead leads.
Stack: CatBoost · LightGBM · XGBoost · Optuna · SHAP · FastAPI · Google Cloud Run
Metrics: **Test ROC-AUC 0.8141 · F1-macro 0.7256 · 12 engineered features · 50 Optuna trials**

**04 — StockSense** · Mar 2026 · *Kaggle*
Memory-efficient retail demand forecasting over 1.05M+ time-series records.
Stack: Polars · LightGBM · Optuna
Metrics: **RMSE 1288 → 647 (~50% cut)** via Polars lazy evaluation, lag features,
rolling statistics, store-promo interactions.

**05 — AutoVal** · Feb 2026 · *Live app · GitHub*
Instant data-driven used-car valuations for Indian consumers.
Stack: Flask · XGBoost · Optuna · Render
Metrics: **91% accuracy**, end-to-end pipeline deployed as a Flask REST backend.

**06 — SmartCart** · Jan 2026 · *GitHub*
Turned an undifferentiated customer base into 4 actionable purchasing personas.
Stack: K-Means · PCA · Scikit-Learn
Bullets: PCA dimensionality reduction ahead of K-Means; enables targeted campaigns
over blanket messaging.

> **Optional (currently excluded):** *Rizzing* (`rizzing.matri6.com`) — a free AI
> dating assistant, web app + Android APK, the second shipped product under matri6.
> Left out to keep the projects section aligned with the résumé. If Dweep asks for
> it, add as **07** with the same row format.

### 5.6 Process — numbered, 4 steps

1. **Understand the cost of being wrong.** Before any modeling, what does a false
   positive actually cost the person using this?
2. **Build the boring baseline first.** A simple model that ships beats a complex
   one that doesn't.
3. **Tune deliberately.** Optuna sweeps, honest validation, SHAP to check the model
   learned the real signal and not an artifact.
4. **Ship it.** Containerize, deploy, hand over a URL. A model nobody can call
   isn't finished.

### 5.7 Contact — dark section (`--ink`)

Headline: `Let's build something that ships.`
Line: `Open to research assistantships, internships, and freelance ML work.`
Email button (mailto), plus GitHub / LinkedIn / Kaggle / matri6 links.
Wide-tracked `DWEEP SHISHODIA` wordmark at the bottom, mirroring matri6.com.

**No form backend.** Use a single large `mailto:` button — a form that silently
fails is worse than no form.

### 5.8 certifications.html

Same shell, same nav, page title **Certifications & Achievements**. Grid of cards,
each with issuer, date, and a verify link where one exists.

1. **Runner-Up — Compassion-a-thon 3.0** · Paradox, IIT Madras · 2026
   Startup prototype competition, second position for Paleskies. Judged on problem
   clarity, solution feasibility, and market potential.
   Image: `assets/img/certs/compassionathon.jpg`
2. **Claude Code 101** · Anthropic Academy · Issued May 13, 2026
   Verify: `https://verify.skilljar.com/c/eu7ejbdvshyd`
   Image: `assets/img/certs/claude-code-101.png`
3. **Foundational Level — BS Data Science** · IIT Madras · 24 credits completed · CGPA 8.0

Build the card component so a fourth entry is a copy-paste of one block. Leave a
commented template at the end of the list.

---

## 6. Head / meta

Both pages need: `<title>`, description, canonical, `og:` + `twitter:` tags
pointing at `assets/img/og-cover.png`, favicon, and a JSON-LD `Person` schema on
`index.html` (name, jobTitle, alumniOf IIT Madras, sameAs the four profile URLs).

Title: `Dweep Shishodia — ML Engineer`
Description: `ML engineer and BS Data Science student at IIT Madras. I take problems from raw data to a URL someone can actually open. Founder of matri6.`

---

## 7. Working agreement

- Before adding a dependency: don't. Three.js is the only one.
- Before adding a section: ask.
- Keep `pages.css` section selectors scoped (`#projects .row`, not `.row`) so
  section paddings never cancel each other out.
- After any visual change, check 390px width before saying it's done.
- Commit style: `feat(hero): ...`, `fix(a11y): ...`, `style(tokens): ...`
