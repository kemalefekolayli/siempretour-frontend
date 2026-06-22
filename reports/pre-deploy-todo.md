# Siempre Tour — Pre-Deploy Fix TODO

Phased checklist derived from `pre-deploy-audit.md`. **Do one phase at a time.** Each phase is self-contained and verifiable. Do not batch unrelated changes.

---

## Phase 1 — Deploy config & secrets (config only, no UI risk)
- [ ] Add to `.dockerignore`: `data/`, `siempretour-images/`, `reports/`, `dashboard/`, `scripts/`, `uploads/`, `.chrome-profile-*/`, `.edge-profile-*/`, `.git/`, `**/.DS_Store`, `**/__MACOSX/` (C1, G4, G6)
- [ ] Align `.dockerignore` with `.gcloudignore` so both deploy paths match (C1)
- [ ] Verify production backend JWT secret ≠ `docker-local-dev-secret-key-...` (G4 — backend owner check)
- [ ] Add `.env.example` documenting `PROD_BACKEND_ORIGIN`, chat origin, contact email/phone/address (H)
- [ ] **Verify:** rebuild Docker image, confirm size drops from ~2.4 GB; confirm `scripts/` no longer in image

## Phase 2 — Broken navigation (high impact, low risk)
- [ ] Repoint footer `about-us.html` links → `about.html` across all 16 HTML files (B1)
- [ ] Fix malformed `href="#about-us.html"` (İade Politikası) (B1)
- [ ] Decide: create real Privacy/Terms/Delivery/Customer-Service pages OR remove those footer links (B1)
- [ ] Fix/remove dead links: `trip.html`, `register.html`, `cruise-detail.html`, `detail-fullwidth.html`, `grid-leftfilter.html`, `destination-single1.html`, `car-list.html` (D5)
- [ ] **Verify:** click every footer + nav link on each page → no 404s

## Phase 3 — Production-breaking runtime issues
- [ ] Add env switch to `js/chat-widget.js:3` (localhost vs prod chat origin) (B4)
- [ ] Resolve European images: ship `avrupa-turlari/` to deployed path/CDN + fix manifest base path, OR confirm backend always supplies images and remove the dead fallback (B3)
- [ ] Decide hero-video delivery: un-gitignore `siempre-video1.mp4`, move to CDN, or replace with poster image (F)
- [ ] **Verify:** deploy to staging; chat works, European country pages show images, hero video loads

## Phase 4 — Content / placeholder text
- [ ] Replace lorem ipsum in `about.html` (B2)
- [ ] Replace lorem ipsum in `faq.html` (entire FAQ) (B2)
- [ ] Decide fate of demo pages `cruise-list.html`, `tour-single.html`, `tour-single1.html`, `tour-grid.html` — fix content or remove + delink (B2, G2)
- [ ] Reconcile contact info: standardize `info@siempretour.com` in `contact-config.js` (C2)
- [ ] **Verify:** grep site for "Lorem ipsum" → 0 matches in linked pages

## Phase 5 — Polish & cleanup (low risk, do last)
- [ ] Remove 14 `console.log/debug` from app JS (D3, G1)
- [ ] Fix BOM/mojibake in `template_tour_grid_page_2.js`, `_5.js` (D2)
- [ ] Remove duplicate theme forms in `login.html`, `contact.html` (D1, G3)
- [ ] Remove `.DS_Store` / `__MACOSX` junk (D6)
- [ ] Add user-facing empty state to grid catch block `template_tours_grid_page.js:104` (H)

## Phase 6 — Live verification (requires running backend)
- [ ] Run `scripts/website-smoke-test.js` against prod backend (E)
- [ ] Walk country grid → tour detail → booking flow with real data (E)
- [ ] Exercise filters/search/sorting; confirm results match selection (E)
- [ ] Spot-check tour photos for wrong/duplicate/generic stock images (E, F)
- [ ] Commit all changes; confirm clean `git status` before final deploy (H)

---

### Do NOT touch automatically (see audit §J)
`scripts/*` JWT secret · `images/tour-photos/` · `siempretour-images/` · `avrupa-turlari/` paths · `data/` JSON · `import_tours.js` · `PROD_BACKEND_ORIGIN`
