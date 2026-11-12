# ENSA Labs — Frontend

Angular 21 application of the ENSA Béni Mellal research platform:

- **Public website**: home, lab pages (direction, members with profile drawer, teams, axes and
  themes, accreditation), scientific production, partnerships, equipment and competences.
- **Management dashboard** (`/private`): labs, teams, members, publications, theses,
  collaborations, resources, research themes, users and the personal account, with menus and
  actions filtered by role.

The Spring Boot API lives in the `backend` repository and must be running.

## Run

```bash
npm install
npm start
```

Open `http://localhost:4200`. The dashboard login page is `http://localhost:4200/private-backdoor-7`
(see the backend README for the seeded accounts).

## Configuration

The API address comes from the Angular environment files:

- `src/environments/environment.development.ts` — used by `ng serve` (`http://localhost:8080`)
- `src/environments/environment.ts` — used by `ng build`; set `apiBaseUrl` to the deployed backend

The backend must allow the frontend origin (`CORS_ALLOWED_ORIGINS`).

## Authentication

- Tokens are stored in `localStorage`; `AuthService` checks their expiry and loads the account
  (`/api/account/me`) with its roles and lab / team scope.
- `authInterceptor` adds the token **only** to write requests and private reads
  (`/api/account`, `/api/users`, `/api/roles`), refreshes an expired token, and retries once after a 401.
- `authGuard` protects `/private`; `roleGuard` reads `data.roles` on each dashboard route.
  The backend remains the source of truth for permissions.

## Structure

```
src/app/
  core/            auth (service, interceptor, guards), API models, services
  features/public/ public website pages
  features/private/
    layout/        dashboard shell and role-based navigation
    shared/        list-page base class, page header, image upload, labels, lab scope
    <entity>/      one page per managed resource
  shared/          reusable public components (cards, catalog, profile drawer...)
```

Dashboard styles are global in `src/assets/styles/private/dashboard.css` (PrimeNG overlays and the
component style budget make component CSS impractical there).

## Build and test

```bash
npm run build
```

```bash
npx ng test --watch=false
```
