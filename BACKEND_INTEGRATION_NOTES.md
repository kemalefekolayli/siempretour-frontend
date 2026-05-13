# Backend Integration Notes (Siempre Tour)

Last reviewed: 2026-04-08
Reviewed backend path: `C:\Users\kemal\IdeaProjects\siempre-tour`

## Stack
- Spring Boot `3.5.5`
- Java `21`
- PostgreSQL (default profile), H2 (dev profile)
- JWT auth (HS256, JJWT 0.12.5)
- JPA/Hibernate `ddl-auto=update`

## Important Config
- Main config: `src/main/resources/application.properties`
- Dev config: `src/main/resources/application-dev.properties`
- API base: `http://localhost:8080/api`
- JWT secret default: `your-local-dev-secret-key-min-256-bits`
- Token claim format:
  - `sub`: email
  - `userId`: Long
  - `role`: e.g. `ADMIN` / `USER`
- Security filter maps role to `ROLE_<role>`.

## Security Rules Relevant to Frontend
From `SecurityConfig`:
- Public:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/tours/by-destination`
  - `GET /api/tours/by-destination/paged`
  - `GET /api/tours/by-slug/**`
  - `POST /api/contact`
- Auth required:
  - `POST /api/bookings`
  - `GET /api/auth/me`
- Admin required:
  - `POST /api/tours/bulk-import`
  - `POST /api/tours`
  - `PUT /api/tours/**`
  - `DELETE /api/tours/**`

## Tour Endpoints Used by Frontend
- `GET /api/tours/by-destination?destination={country}&lang={tr|en}&category={optional}`
- `GET /api/tours/by-slug/{slug}?lang={tr|en}`
- `POST /api/tours/filter?page={page}&size={size}`

## Bulk Import Endpoint
- `POST /api/tours/bulk-import`
- Body: `List<TourCreateDto>`
- Requires admin token (`ROLE_ADMIN`)

## Existing Import Flow in Frontend Repo
File: `siempretour/import_tours.js`

What it does:
- Generates HS256 admin JWT locally using secret:
  - `docker-local-dev-secret-key-min-256-bits-long-enough-for-hs256`
- Reads multiple data folders under `siempretour/data`
- Maps JSON tour records into backend `TourCreateDto`
- Sends chunks to:
  - `POST http://localhost:8080/api/tours/bulk-import`
- Uses `Authorization: Bearer <token>`

## Data Model Mapping Notes
Important DTO/image fields consumed by frontend:
- `mainPhoto`
- `image1..image6`
- `imagealt`
- `slug`
- `destination`
- `language`

Frontend rendering behavior:
- Grid card uses `image1`, fallback `mainPhoto`
- Detail page uses `image1..image6`
- Booking hero uses `mainPhoto`

## Caveat
`TourService.bulkImportTours(...)` currently creates new tours and does not upsert by `(slug, language)`.
Re-importing can create duplicates unless DB is cleaned or dedupe/upsert logic is added.

## Re-import Checklist
1. Start backend on `localhost:8080`
2. Verify health: `GET /actuator/health`
3. Run import flow from frontend repo root:
   - `node import_tours.js`
4. Validate sample endpoints:
   - `/api/tours/by-destination?destination=France&lang=en`
   - `/api/tours/by-destination?destination=France&lang=tr`
