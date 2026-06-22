# Siempre Tour — Pre-Deployment Audit Report

*Generated: 2026-06-21. Audit-only inspection — no application files were modified during the audit.*

> **Scope note:** Live tour data is served by the backend API (`https://siempretour-backend-...run.app/api`) at runtime, so individual live tour records (per-tour photos/fields) could not be enumerated without the running backend. The tour photo/data section covers the **frontend rendering logic and the static fallback-image system**, which were verified.

---

## A. Executive Summary

**Readiness score: 5 / 10**

Core machinery is sound: API base URL auto-switches to the production Cloud Run backend (`js/api-service.js:5-10`), the main user flow (country grid → tour detail → booking) is wired correctly through the link generators, and data-driven pages have real loading/error/empty states. Not deployment-ready because of broken sitewide navigation, leftover template placeholder content, and a deploy config that both bloats the image to ~2.4 GB and excludes images the pages reference.

**Biggest blockers**
1. Footer navigation broken on every page — `about-us.html` + legal pages don't exist (file is `about.html`).
2. Placeholder "Lorem ipsum" content ships on `about.html`, `faq.html`, `cruise-grid.html`, `cruise-list.html`, `tour-single.html`.
3. European tour photos break in production — `avrupa-turlari/` referenced 2,364× but excluded from `.dockerignore` and `.gcloudignore`.

**Biggest deployment risks**
- Docker image bundles ~2.4 GB of non-served assets (`data/` 381 MB, `siempretour-images/` 555 MB, `reports/` 17 MB, `dashboard/` 18 MB).
- Chat widget hardcoded to `http://localhost:8081` → chatbot dead in production.
- `images/` referenced video/photos are gitignored — deploy method (git vs disk-copy) changes what ships.

---

## B. Critical Issues

### B1. Footer "About / legal" links are dead sitewide
- **Where:** every page footer; e.g. `index.html:2773-2789`.
- **What's wrong:** `Hakkımızda`, `Teslimat Bilgileri`, `Gizlilik Politikası`, `Şartlar & Koşullar`, `Müşteri Hizmetleri`, `Seyahat/Teknoloji/Yaşam Tarzı/Rotalar` all link to `about-us.html`, which doesn't exist (real file is `about.html`). One is malformed: `href="#about-us.html"` (İade Politikası). Referenced from 16 HTML files.
- **Why it matters:** Every footer link 404s. Privacy Policy & Terms are typically legally required for a booking site and are entirely missing.
- **Fix:** Repoint to `about.html`; create real Privacy/Terms/Delivery pages.
- **Risk:** High.

### B2. Leftover "Lorem ipsum" placeholder content in production pages
- **Where:** `about.html:968`, `faq.html:820-1037` (entire FAQ), `cruise-grid.html:1281-1314`, `cruise-list.html:1185-1218`, `tour-single.html:989-1097`.
- **Why it matters:** FAQ and About are customer-trust pages; lorem ipsum signals an unfinished site.
- **Fix:** Replace with real copy, or hide/remove the leftover theme pages (see G2).
- **Risk:** High (about/faq), Medium (cruise/tour-single if not actually linked).

### B3. European tour photos excluded from deployment
- **Where:** referenced in `js/avrupa-photo-manifest.js` and `js/country-page-images.js` (loaded by `template_tours_grid_page.html`); paths like `avrupa-turlari/avrupa-turlari/Albania/01/01.webp` (verified on disk, double-nested). Folder excluded in `.dockerignore`, `.gcloudignore`, and `.gitignore`.
- **Why it matters:** European country photo fallback pool 404s in production (works locally, fails in prod).
- **Fix:** Ship these images to a deployed path/CDN and update the manifest base path; or confirm backend always supplies images and remove the dead references.
- **Risk:** High.

### B4. Chat widget hardcoded to localhost
- **Where:** `js/chat-widget.js:3` — `var CHATBOT_API = 'http://localhost:8081/api/chat';`
- **What's wrong:** No environment switch (unlike api-service.js). In production it calls `localhost:8081` and fails (mixed-content + connection refused).
- **Fix:** Apply the `isLocal ? localhost : PROD_ORIGIN` pattern from api-service.js.
- **Risk:** High (chat feature only).

---

## C. Important Issues

### C1. Docker image ships ~2.4 GB of non-served assets
- **Where:** `Dockerfile` (`COPY . /usr/share/nginx/html`) + `.dockerignore`.
- **What's wrong:** `.dockerignore` excludes `avrupa-turlari/`, `scss/`, `*.md`, `*.zip`, a couple data files — but **not** `data/` (381 MB), `siempretour-images/` (555 MB), `reports/` (17 MB), `dashboard/` (18 MB), `scripts/`, `uploads/`, `.chrome-profile-*`, `.edge-profile-*`. Working dir total 3.1 GB. `.gcloudignore` *does* exclude `scripts/ reports/ mail/` — so Docker and gcloud deploys diverge.
- **Why it matters:** Slow builds, storage cost, slow cold starts, possible image-size limits.
- **Fix:** Add the above to `.dockerignore`; align with `.gcloudignore`.
- **Risk:** High (deploy reliability) / Needs manual review.

### C2. Contact information inconsistent / looks like a placeholder
- **Where:** `js/contact-config.js:8` uses `efe.kolayli@sabanciuniv.edu` (personal university email); footer uses `info@siempretour.com` (`index.html:847`).
- **Why it matters:** Contact page surfaces a student email as company contact; mismatched info misroutes mail and erodes trust.
- **Fix:** Standardize on `info@siempretour.com` (or the real business address) everywhere.
- **Risk:** Medium.

### C3. `siempretour-images/` (555 MB) unreferenced by the frontend
- **Evidence:** grep for `siempretour-images` across all served HTML/JS → **0 matches**. May be used by backend tour records; frontend container has no reason to carry it.
- **Fix:** Exclude from frontend deploy; verify with backend owner before physical removal.
- **Risk:** Needs manual review.

### C4. Old `dashboard/` admin panel appears dead
- **Evidence:** `dashboard/` (18 MB, TinyMCE theme) has **0** inbound links; AGENTS.md: active admin is `admin/`, dashboard "not part of the main frontend flow."
- **Fix:** Exclude from deploy; archive later.
- **Risk:** Needs manual review.

---

## D. Minor Polish Issues

| # | Where | Issue | Risk |
|---|-------|-------|------|
| D1 | `login.html:997-1106`, `contact.html:1011-1106` | Leftover duplicate theme forms (English "Login/Register", `contactform`, `contactform1`, `action="#"`) alongside the real Turkish forms. | Medium |
| D2 | `js/template_tour_grid_page_2.js`, `_5.js` | BOM + mojibake in console strings (`"yÃ¼klendi"`) — wrong-encoding save. | Low |
| D3 | 14 `console.log/debug` in app JS (`template_tours_grid_page.js:46-47`, `template_tour_grid_page_2/4/5/6.js`) | Debug logging left in. | Low |
| D4 | `href="#"` ~30 per page | Decorative theme placeholders; some social icons may need real links. | Low |
| D5 | `trip.html` (`index.html:1167`), `register.html`, `cruise-detail.html` (14×), `detail-fullwidth.html`, `grid-leftfilter.html`, `destination-single1.html`, `car-list.html` | Dead links to non-existent demo pages. `cruise-detail.html` matters if cruise cards should open detail (real = `template_ship_detail_page.html`). | Medium (cruise) / Low (rest) |
| D6 | Root `.DS_Store`, `dashboard/.DS_Store`, `avrupa-turlari/__MACOSX/`, nested `.DS_Store` | macOS junk; ships into Docker. | Low |

---

## E. Tour Photo / Data Audit

**Positive (rendering is null-safe):**
- Grid cards: image fallback + `onerror` recovery (`template_tours_grid_page.js:74-75`).
- Detail page guards missing slug / "tour not found" (`template_tour_page.js:298-310`).
- Detail/booking links return `#` when params absent (`link_generator_2.js`, `link_generator_3.js`).

**Risks to verify against live backend:**
- European photo fallback breaks in prod (B3).
- Some `.webp` hold JPEG bytes (AGENTS.md). Generic stock photo `mid-adult-woman-taking-self-portrait...` duplicated across unrelated countries (`India/` 3.9 MB and `Hungary/` 3.9 MB) — wrong/unrelated photo smell.
- Per-tour missing title/country/price/duration/itinerary cannot be confirmed statically — requires running backend + walking `template_tour_page.html?id=...` per slug. Run `scripts/website-smoke-test.js` against prod backend pre-launch.
- Filters/search/sorting (`search-results.js`, `template_tour_grid_filter.js`) have loading/empty/error states; correctness needs live click-through.

---

## F. Asset / Image Audit

| Finding | Detail | Risk |
|---|---|---|
| Oversized hero video | `images/siempre-video1.mp4` 19.5 MB — referenced by index/template_tours_grid/tour-grid/tour-single1, but **gitignored**. Git-clone deploy → broken hero. | High (inconsistency) |
| Heavy homepage carousel | `images/month-carousel/*` 1.5–3.3 MB JPGs (dozens) + `images/testi.png` 4.8 MB. | Medium (perf/LCP) |
| `siempretour-images/` 555 MB | 0 frontend references. | See C3 |
| `avrupa-turlari/` 238 MB | Referenced 2,364× but deploy-excluded (B3). Contains `__MACOSX/` + `.DS_Store`. | High |
| Duplicate generic stock image | Same self-portrait file in `India/` and `Hungary/`. | Medium |
| Naming/structure | Double-nested `avrupa-turlari/avrupa-turlari/...`; mixed `.jpg`/`.webp` for same asset; `images/tour-photos/` gitignored but referenced by backend records. | Medium |

**Do not reorganize** — paths are consumed by backend DB records; renaming breaks them (AGENTS.md).

---

## G. Code Cleanup Audit

| # | Item | Classification |
|---|------|----------------|
| G1 | 14 `console.log/debug` in app JS (D3) | Safe to clean later |
| G2 | Leftover theme demo pages with lorem ipsum: `tour-single.html`, `tour-single1.html`, `tour-grid.html`, `cruise-list.html` — not part of real flow. Verify no live inbound links before removing. | Needs manual review |
| G3 | Duplicate/unused forms in login.html & contact.html (D1) | Needs manual review |
| G4 | Hardcoded dev JWT secret `docker-local-dev-secret-key-min-256-bits-long-enough-for-hs256` in `scripts/apply-avrupa-zip-to-backend.js`, `fill-missing-en-tours.js`, `fix-eu-images-via-api.js`, `fix-tour-mojibake.js`, `reassign-country-galleries.js`. Dev-only tools (not served) but ship in Docker (`scripts/` not in `.dockerignore`). | **High risk / do not touch without testing.** Verify prod uses a different secret; exclude `scripts/` from deploy. |
| G5 | `import_tours.js` (root) — non-upsert bulk import (re-run duplicates rows). Dev tool. | Needs manual review (keep out of deploy) |
| G6 | `data/*.py` + `geocode_cache*.json` (1.5 MB) — dev pipeline | Safe to clean from deploy |
| G7 | Chat widget hardcoded URL (B4) | High risk / do not touch without testing (mixed content) |
| G8 | Inconsistent root layout: `admin/` (live) vs `dashboard/` (dead) vs `mail/` vs `reports/` | Needs manual review |
| G9 | `style.css` 254 KB + `style.css.map` on disk; unused rules unprovable without coverage run | Safe to clean later (after coverage) |

---

## H. Deployment Readiness Audit

| Area | Status | Note |
|---|---|---|
| Build errors | N/A | No build step (static). |
| ESLint/TS | N/A | No tooling configured. |
| API config | ✅ Pass | api-service.js switches to prod Cloud Run origin. |
| Chat config | ❌ Fail | Hardcoded localhost (B4). |
| `.env.example` | ❌ Missing | Config lives in JS constants — document required values (`PROD_BACKEND_ORIGIN`, chat origin, contact info). |
| localhost refs | ⚠️ | Only `chat-widget.js` is a real runtime risk. |
| Routing after deploy | ⚠️ | nginx `try_files` fine; dead links (B1, D5) 404. |
| Base/public path | ✅ | Relative paths; root-served. |
| Loading/error states | ✅ Mostly | Grid catch only `console.error`s (`template_tours_grid_page.js:104-105`) — consider user-facing empty state. |
| Bundle/asset size | ❌ | Docker image ~2.4 GB (C1); heavy carousel (F). |
| Excluded-but-referenced assets | ❌ | `avrupa-turlari/` (B3), `siempre-video1.mp4` (F). |
| Secrets in image | ❌ | `scripts/` with dev JWT secret ships in Docker (G4). |
| Uncommitted work | ⚠️ | Many modified files unstaged on `main`; commit/verify before deploy. |

---

## I. Prioritized Next Steps

1. Fix footer navigation (B1); create real Privacy/Terms/Customer-Service pages.
2. Resolve European images (B3): ship to deployed path/CDN + fix manifest base, or remove dead fallback.
3. Fix `.dockerignore` (C1, G4): exclude `data/`, `siempretour-images/`, `reports/`, `dashboard/`, `scripts/`, `uploads/`, `.chrome-profile-*`, `.edge-profile-*`, `.git/`; align with `.gcloudignore`. Removes dev secret from image.
4. Replace lorem ipsum on about/faq (B2); decide fate of demo pages (G2).
5. Fix chat widget origin (B4).
6. Reconcile contact info (C2); decide hero-video delivery (F).
7. Verify prod JWT secret ≠ dev secret (G4).
8. Live smoke pass against prod backend: country grid → tour detail → booking, filters/search, spot-check photos (E).
9. Polish: console.logs, mojibake JS, duplicate forms, `.DS_Store`/`__MACOSX`.

---

## J. Do-Not-Touch-Automatically List

- **`scripts/*` dev JWT secret** (G4) — confirm prod secret differs first; auth-bypass risk.
- **`images/tour-photos/`, `siempretour-images/`, `avrupa-turlari/` paths** — consumed by backend DB tour records; renaming/removing breaks live tours. Some `.webp` hold JPEG bytes — don't rename casually.
- **`data/` JSON** — gitignored, local-only import source; do not delete.
- **`import_tours.js` / bulk-import scripts** — non-upsert; running duplicates DB rows.
- **`chat-widget.js` URL change** — test for mixed-content/CORS, don't blind-edit.
- **`PROD_BACKEND_ORIGIN`** in api-service.js — already correct; don't regress.
- **Demo pages** (`tour-single*.html`, `tour-grid.html`, `cruise-list.html`) — confirm zero live inbound links before deletion.
