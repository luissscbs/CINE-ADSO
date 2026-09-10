# AGENTS.md

## Project overview

Fullstack cinema ticketing app: **React 18 + Vite** frontend, **Express 4** API, **MySQL** database. Not a monorepo — two independent `package.json` files (root + `backend/`). Both use `"type": "module"` (ESM).

Language: Spanish (variable names, comments, UI, seed data).

## Commands

### Frontend (root)

```bash
npm install          # install dependencies
npm run dev          # Vite dev server → http://localhost:5173
npm run build        # production build → dist/
npm run preview      # preview production build
```

### Backend (`backend/`)

```bash
cd backend
npm install
npm run seed         # seed database (safe to re-run; truncates first)
npm run dev          # node --watch server.js → http://localhost:4000
npm run start        # production start (no watch)
```

**No lint, typecheck, test, or formatter commands exist.** There is no ESLint config, no Prettier, no TypeScript, no test framework, no CI workflows.

## Environment setup

- **Node 18.11+** required (`backend` uses `node --watch`; Vite 5 needs Node 18+).
- **MySQL 8.0.13+** — `schema.sql` uses `DEFAULT (CURRENT_DATE)` (MySQL 5.x will fail).
1. MySQL must be running locally (or accessible by network).
2. `mysql -u root -p < backend/schema.sql` — creates the `cine_adso` database.
3. **Backend** `backend/.env` — copy from `backend/.env.example`, set your MySQL credentials. Key vars: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `PORT` (default 4000), `CORS_ORIGIN` (default `http://localhost:5173`).
4. **Frontend** root `.env` — copy from `.env.example`, set `VITE_API_URL` (default `http://localhost:4000/api`).

**Gotcha:** The root `.env.example` contains `VITE_API_URL`, but the actual root `.env` currently has backend DB config (wrong file placed there). The frontend reads `VITE_API_URL` via `import.meta.env`; it falls back to `http://localhost:4000/api` if unset. Only `backend/.env` needs DB credentials.

## Architecture

- **Entry point:** `src/main.jsx` → `App.jsx` → three routes (`/`, `/pelicula/:id`, `/asientos/:id`).
- **API client:** `src/api/client.js` — all fetch calls go through `api.*` methods. Uses `VITE_API_URL` env var.
- **Context:** `src/context/CatalogoContext.jsx` — loads clasificaciones, salas, and peliculas once at app start. Exposes `useCatalogo()` hook.
- **Design system:** "Cinema Editorial" — CSS custom properties in `src/index.css`, CSS Modules for component styles. Font: Outfit (Google Fonts). Dark theme.
- **Backend routes:** `backend/routes/{clasificaciones,salas,peliculas,funciones,ventas}.js`. Centralized error handler in `server.js`.
- **Seat pricing:** calculated in frontend (`src/utils/seats.js`) with 1.15x multiplier for VIP/preferencial. This is a demo simplification.

## Seed data gotcha

`npm run seed` generates `funciones` (showtimes) for **today and tomorrow only**. If days pass without re-seeding, functions expire to the past and the cartelera appears empty. Re-run `npm run seed` to refresh.

## Key constraints

- Backend runs on port 4000, frontend on 5173. Both must be running simultaneously for the app to work.
- CORS is restricted to `CORS_ORIGIN` env var (defaults to `http://localhost:5173`).
- No authentication — all endpoints are public.
- 8-seat purchase limit and 8% service charge are hardcoded in `src/pages/SeatSelection.jsx` and `backend/routes/ventas.js`.
- Poster images go in `public/posters/`, filenames must match `poster_url` values in the database.
- Purchase transaction uses MySQL `UNIQUE` constraint on `boletos(id_funcion, id_asiento)` to prevent double-booking at the DB level.
