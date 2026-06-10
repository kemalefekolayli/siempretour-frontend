# Siempre Tour — Agent Context

Last updated: 2026-06-10

## Repo Paths

| | Path |
|---|---|
| Frontend | `C:\Users\kemal\Desktop\siempreFRONT\siempretour` |
| Backend | `C:\Users\kemal\IdeaProjects\siempre-tour` |
| Local frontend URL | `http://localhost:5500/index.html` |
| Backend API base | `http://localhost:8080/api` |

---

## Frontend Stack

Static HTML/CSS/JS — no framework, no package.json at root.

**Key pages:**
- `index.html` — homepage
- `template_tours_grid_page.html?country=X` — country guide / tour listing page
- `template_tour_page.html?id=SLUG&country=X` — tour detail page
- `booking.html` — booking form
- `login.html` — auth
- `admin/index.html` — admin panel (requires ADMIN JWT)

**Key JS files:**
- `js/api-service.js` — all backend API calls, defines global `ApiService` class
- `js/main.js` — global nav, mega-menu photo paths
- `js/template_tour_grid_page_2.js` — country overview section render
- `js/template_tour_grid_page_3.js` — best-time text/month render
- `js/template_tour_grid_page_5.js` — best-time image section render
- `js/country-page-images.js` — country photo pool fallback (built from backend tour images)
- `js/template_tour_page.js` — tour detail page logic
- `js/reviews.js` — approved-only review render
- `js/lang-detect.js` — Google Translate widget stability
- `js/admin-panel.js` — admin panel logic
- `js/admin-nav.js` — injects "Admin Panel" nav link for admin users

**Key CSS:**
- `css/style.css` — main stylesheet
- `css/admin.css` — admin panel styles

---

## Backend Stack

- Spring Boot `3.5.5` / Java 21
- PostgreSQL (default), H2 (dev profile)
- JWT auth — HS256, JJWT 0.12.5
- JPA/Hibernate `ddl-auto=update`
- Config: `src/main/resources/application.properties`
- Dev config: `src/main/resources/application-dev.properties`

**JWT token claims:**
- `sub` → email
- `userId` → Long
- `role` → `ADMIN` or `USER`

---

## API Endpoints

### Public (no auth)
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me                          ← requires auth
GET  /api/tours/by-destination?destination={country}&lang={tr|en}&category={optional}
GET  /api/tours/by-destination/paged
GET  /api/tours/by-slug/{slug}?lang={tr|en}
POST /api/tours/filter?page={n}&size={n}
GET  /api/reviews/by-tour/{tourId}?lang=tr
GET  /api/reviews/by-destination?destination={country}&lang={tr|en}
POST /api/reviews                          ← creates PENDING review
POST /api/contact
```

### Admin only (ROLE_ADMIN JWT required)
```
POST /api/tours/bulk-import
POST /api/tours
PUT  /api/tours/**
DELETE /api/tours/**

GET  /api/reviews/pending
PUT  /api/reviews/{id}/approve
PUT  /api/reviews/{id}/reject

GET  /api/admin/analytics/summary
GET  /api/admin/analytics/requests-over-time
GET  /api/admin/analytics/top-tours
GET  /api/admin/analytics/top-categories
GET  /api/admin/requests
GET  /api/admin/tours
GET  /api/admin/tours/{tourId}
POST /api/admin/tours
PUT  /api/admin/tours/{tourId}
POST /api/admin/tours/{tourId}/deactivate
GET  /api/admin/tours/{tourId}/delete-check
DELETE /api/admin/tours/{tourId}/permanent
POST /api/admin/tours/images
GET  /api/admin/metadata
```

---

## Tour Image Model

Backend stores **string paths only**, never binary image data.

| Field | Used by |
|---|---|
| `mainPhoto` | booking hero, grid card fallback |
| `image1`..`image6` | tour detail gallery; grid card uses `image1` |
| `imagealt` | alt text |
| `slug` | URL-friendly ID |

Image paths look like: `images/tour-photos/Hungary/01/02.webp`

---

## Image / Photo Assets

| Folder | Contents | Size |
|---|---|---|
| `images/` | UI assets — logos, banners, sliders, icons, carousels | ~50 MB |
| `siempretour-images/` | Tur fotoğrafları, tur koduna göre (AFBN/, AFDD/, ...) | 555 MB / ~4900 files |
| `avrupa-turlari/` | Avrupa tur fotoğrafları, ülkeye göre (Austria/, France/, ...) | 238 MB / 2738 files |

`images/tour-photos/` — referenced by backend tour records; was previously populated from zip archives. Physically absent from this machine at last check; paths still live in the DB.

**Important rules:**
- Never upload image binaries to the backend or database.
- `data/` is gitignored — `data/siempre_tour_country_datas_tr/*/datas.json` changes are local only.
- Some `.webp` files actually contain JPEG bytes — do not rename casually, paths are used by backend data.
- Do not use `09-African-safari` folder images for non-African/non-safari countries.
- Prefer country-specific photos; semantic fallbacks must be explainable.

---

## Country Guide Data

Country guide page (overview + best-time sections) reads from:

`data/siempre_tour_country_datas_tr/{Country}/datas.json`

Image fields: `overview.image1/2/3`, `best-time-to.image1/2`

Scripts:
- `scripts/assign-country-guide-images.js` — assigns image paths, dry-run by default (`APPLY=1` to write)
- `scripts/photo-quality-report.js` — compares current assets with originals
- `scripts/replace-photo-assets-from-originals.js` — replaces lower-quality assets
- `scripts/website-smoke-test.js` — smoke test, should always return `SMOKE_OK`
- `scripts/check-turkish-encoding.js` — checks for mojibake in HTML

---

## Reviews System

- Public reads return only `APPROVED` reviews.
- `POST /api/reviews` creates `PENDING`, must be approved by admin.
- `guestEmail` is stored but never exposed in public response DTOs.
- Frontend hides the Yorumlar tab entirely when no approved reviews exist.
- Do not seed fake reviews — ever.

Backend package: `com.siempretour.Review`

---

## Admin Panel

- Frontend: `admin/index.html`, `admin/analytics.html`, `admin/tours.html`, `admin/tour-form.html`
- Requires `ADMIN` role in JWT (`localStorage`)
- Image upload endpoint: `POST /api/admin/tours/images` → saves to `uploads/tours/`, served at `/uploads/tours/...`
- Max upload: 8 MB per image, types: JPG/PNG/WEBP
- Tour deactivate sets `isActive=false` + `status=CANCELLED`, keeps booking history
- Permanent delete blocked if bookings reference the tour

To promote a user to admin:
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'you@example.com';
```
Or via Docker:
```powershell
docker exec siempre-postgres psql -U postgres -d tourdb -c "UPDATE users SET role = 'ADMIN' WHERE email = 'you@example.com';"
```

---

## Bulk Tour Import

File: `import_tours.js` (frontend repo root)

- Reads JSON from `data/` subfolders
- Maps to `TourCreateDto` and POSTs to `POST /api/tours/bulk-import`
- Uses locally generated HS256 JWT: `docker-local-dev-secret-key-min-256-bits-long-enough-for-hs256`
- **Warning:** `bulkImportTours` does not upsert — re-running creates duplicates unless DB is cleaned first.

---

## Docker (Backend)

```powershell
docker compose build app
docker compose up -d app
docker compose ps
docker compose logs app --tail=100
```

- App: `siempre-app` on `localhost:8080`
- DB: `siempre-postgres`
- Rate limiting: disabled for local Docker via `RATE_LIMIT_ENABLED=false`

---

## Validation Commands

```powershell
node scripts\website-smoke-test.js        # must return SMOKE_OK
node scripts\check-turkish-encoding.js    # must return TURKISH_ENCODING_OK
node --check js\api-service.js
node --check js\reviews.js
node --check js\template_tour_page.js
node --check js\lang-detect.js
```

Backend:
```powershell
cd C:\Users\kemal\IdeaProjects\siempre-tour
.\mvnw.cmd -DskipTests compile
.\mvnw.cmd test
```

---

## Known Constraints / User Preferences

- Do not upload image binaries to backend/DB.
- Keep backend architecture unchanged unless task explicitly requires it.
- Prefer existing code/data conventions.
- Turkish text must be UTF-8 — watch for mojibake (`HakkÄ±mÄ±zda`, `Giri?`).
- Do not commit `.chrome-profile-*` or `.edge-profile-*` folders (browser profile data).
- `data/` is gitignored — do not try to git add it.
- Multiple agents are acceptable for parallel image/data tasks.
