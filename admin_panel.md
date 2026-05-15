# Admin Panel Handoff

Date: 2026-05-13

## Pre-work snapshots

- Frontend repo: `C:\Users\kemal\Desktop\siempreFRONT\siempretour`
  - Snapshot commit before admin work: `c35d44aa` (`Snapshot current site before admin panel`)
- Backend repo: `C:\Users\kemal\IdeaProjects\siempre-tour`
  - Snapshot commit before admin work: `41f9c57` (`Snapshot backend before admin panel`)

## What was implemented

Added an admin-only panel for the existing Siempre Tour website without replacing the public site.

Frontend admin pages:

- `/admin/`
- `/admin/analytics.html`
- `/admin/tours.html`
- `/admin/tour-form.html`

Backend admin API namespace:

- `/api/admin/**`

Admin access uses the existing Spring Security JWT role system. A user is treated as admin when their role is `ADMIN`. Backend protection is enforced with `.hasRole("ADMIN")`; frontend protection is only a UI/access guard.

## Frontend files added

- `admin/index.html`
- `admin/analytics.html`
- `admin/tours.html`
- `admin/tour-form.html`
- `css/admin.css`
- `js/admin-nav.js`
- `js/admin-panel.js`

## Frontend files modified

- `js/api-service.js`
- Public HTML pages now load `js/admin-nav.js` after `js/main.js`, so admin users see an `Admin Panel` nav entry.

Modified public HTML files:

- `404.html`
- `about.html`
- `booking.html`
- `contact.html`
- `cruise-grid.html`
- `cruise-list.html`
- `faq.html`
- `index.html`
- `login.html`
- `template_tour_page.html`
- `template_tours_grid_page.html`
- `thank_you.html`
- `tour-grid.html`
- `tour-single.html`
- `tour-single1.html`

## Backend files added

- `src/main/java/com/siempretour/Admin/AdminController.java`
- `src/main/java/com/siempretour/Admin/AdminService.java`
- `src/main/java/com/siempretour/Admin/AdminImageStorageService.java`
- `src/main/java/com/siempretour/Admin/Dto/AdminDeleteImpactDto.java`
- `src/main/java/com/siempretour/Admin/Dto/AdminDemandDto.java`
- `src/main/java/com/siempretour/Admin/Dto/AdminImageUploadResponseDto.java`
- `src/main/java/com/siempretour/Admin/Dto/AdminRequestDto.java`
- `src/main/java/com/siempretour/Admin/Dto/AdminSummaryDto.java`
- `src/main/java/com/siempretour/Admin/Dto/AdminTimeSeriesPointDto.java`
- `src/main/java/com/siempretour/Config/StaticUploadConfig.java`

## Backend files modified

- `src/main/java/com/siempretour/Security/SecurityConfig.java`
- `src/main/java/com/siempretour/Booking/BookingRepository.java`
- `src/main/java/com/siempretour/Contact/ContactMessageRepository.java`
- `src/main/java/com/siempretour/Filter/TourSpecification.java`
- `src/main/java/com/siempretour/Tours/Dto/TourCreateDto.java`
- `src/main/java/com/siempretour/Tours/Dto/TourFilterDto.java`
- `src/main/java/com/siempretour/Tours/Dto/TourUpdateDto.java`
- `src/main/java/com/siempretour/Tours/TourRepository.java`
- `src/main/java/com/siempretour/Tours/TourService.java`
- `src/main/resources/application.properties`

## Admin backend endpoints

Analytics:

- `GET /api/admin/analytics/summary`
- `GET /api/admin/analytics/requests-over-time`
- `GET /api/admin/analytics/top-tours`
- `GET /api/admin/analytics/top-categories`
- `GET /api/admin/requests`

Tour management:

- `GET /api/admin/tours`
- `GET /api/admin/tours/{tourId}`
- `POST /api/admin/tours`
- `PUT /api/admin/tours/{tourId}`
- `POST /api/admin/tours/{tourId}/deactivate`
- `GET /api/admin/tours/{tourId}/delete-check`
- `DELETE /api/admin/tours/{tourId}/permanent`
- `POST /api/admin/tours/images`
- `GET /api/admin/metadata`

## Admin user creation

The backend already has `UserRole.ADMIN`. To mark an existing user as admin in PostgreSQL:

```sql
UPDATE users
SET role = 'ADMIN'
WHERE email = 'admin@example.com';
```

If using the existing local Docker database from previous work, the command pattern is:

```powershell
docker exec siempre-postgres psql -U postgres -d tourdb -c "UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';"
```

Replace `admin@example.com` with the actual registered user email. After updating the role, log out and log back in so the JWT token contains `role: ADMIN`.

## Local image upload behavior

- Upload endpoint: `POST /api/admin/tours/images`
- Default upload folder: `uploads/tours`
- Configurable env/property: `ADMIN_UPLOAD_DIR`
- Served publicly at: `/uploads/tours/...`
- Supported types: JPG, PNG, WEBP
- Max file size: 8 MB per image
- Existing tour image model is preserved: `mainPhoto`, `image1` through `image6`, `imagealt`.

## Important behavior decisions

- Deactivate tour:
  - Sets `isActive=false`
  - Sets status to `CANCELLED`
  - Keeps bookings/history intact
  - Public active tour lookups hide inactive tours

- Permanent delete:
  - Uses `/delete-check` first
  - Prevents deletion if bookings reference the tour
  - Deletes only when safe

## Analytics limitations

- Reservation data comes from `bookings`.
- Information request data comes from `contact_messages`.
- Current contact messages are not linked to tours/categories, so tour/category analytics are reservation-based.
- Gender and age are shown as unavailable because current backend models do not collect those fields.

## Validation run

Backend:

```powershell
.\mvnw.cmd -DskipTests package
```

Result: build success.

Frontend JS:

```powershell
node --check js\admin-panel.js
node --check js\api-service.js
node --check js\admin-nav.js
```

Result: syntax checks passed.

## Notes for next agent

- There are unrelated untracked browser profile folders in the frontend repo: `.chrome-profile-*`, `.edge-profile-*`. Ignore them.
- Frontend is static HTML/CSS/JS and calls backend at `http://localhost:8080/api`.
- Admin pages can be opened directly from `admin/`, but live data requires the Spring Boot backend to be running and a logged-in admin JWT in `localStorage`.
- The old `dashboard/` folder was not used; it has a different visual language and would not match the public site.
