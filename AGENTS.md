# AGENTS.md

## Project overview

Fullstack cinema ticketing app: **React 18 + Vite** frontend, **Express 4** API, **MySQL**. Not a monorepo — two independent `package.json` files (root + `backend/`), both `"type": "module"` (ESM).

Language: Spanish (variable names, comments, UI, seed data).

## Commands

Frontend (root):

```bash
npm install
npm run dev      # Vite → http://localhost:5173
npm run build    # production build → dist/
```

Backend (`backend/`):

```bash
cd backend
npm install
npm run seed     # truncate + reseed (see gotcha below)
npm run dev      # node --watch server.js → http://localhost:4000
npm run start    # production start (no watch)
```

**No lint, typecheck, test, or formatter exists.** No ESLint/Prettier/TS/test framework, no CI workflows, no `.github/`.

## Environment setup

- **Node 18.11+** (`backend` uses `node --watch`; Vite 5 needs Node 18+).
- **MySQL 8.0.13+** — `schema.sql` uses `DEFAULT (CURRENT_DATE)` (fails on MySQL 5.x).
- Fresh DB: `mysql -u root -p < backend/schema.sql` (already includes `usuarios`, `productos`, `detalle_venta`). Existing DBs created before those tables: run `backend/migrations/001_usuarios_productos.sql` once instead.
- `backend/.env` — copy from `backend/.env.example`. Key vars: `DB_HOST`, `DB_PORT` (defaults 3306), `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `PORT` (default 4000), `CORS_ORIGIN` (default `http://localhost:5173`). `JWT_SECRET`/`JWT_EXPIRES_IN` have dev fallbacks in `routes/auth.js`, so auth works without them locally.
- Frontend root `.env` — copy from `.env.example`, only var is `VITE_API_URL` (falls back to `http://localhost:4000/api` if unset).
- **Gotcha:** the root `.env` currently contains backend DB vars (`PORT`, `DB_*`) instead of `VITE_API_URL`. Only `backend/.env` needs DB credentials; don't "fix" the frontend by adding DB vars to it.

## Architecture

- **Routes** (`src/App.jsx`): `/`, `/pelicula/:id`, `/asientos/:id`, `/ingresar`, `/carrito`, `/dulceria`. Providers nest `Theme > Auth > Carrito > Catalogo` — keep that order (Carrito/Catalogo pages consume Auth).
- **API client** (`src/api/client.js`): all fetches go through `api.*`. Reads `VITE_API_URL`, attaches `cine-adso-token` from localStorage as `Bearer` when present.
- **Catalog** (`src/context/CatalogoContext.jsx`): loads clasificaciones + salas + peliculas once via `Promise.all`; exposes `useCatalogo()` with `*ById` map helpers. Cart (`cine-adso-carrito`) and theme (`cine-adso-theme`) also persist in localStorage.
- **Backend routers** (`backend/server.js`): `clasificaciones`, `salas`, `peliculas`, `funciones`, `ventas`, `auth`, `productos`. Centralized error handler in `server.js`; pool config in `backend/db.js` (`dateStrings: true`).
- **Auth is JWT, not absent:** `POST /api/auth/registro`, `POST /api/auth/login` (bcrypt + `jsonwebtoken`), `GET /api/auth/perfil` (only route using `requerirAuth`). Ticket/dulcería purchase endpoints are still public and identify the buyer by email via `clientes` upsert.
- **Pricing split:** boleto prices are computed in frontend (`src/utils/seats.js`, 1.15x for `vip`/`preferencial`, rounded to 100) and trusted as-is by `POST /api/ventas`. Dulcería prices are always re-resolved server-side from `productos` (`resolverDulceria` in `backend/routes/ventas.js`) — never trust client prices there.
- **Purchases are transactional** (`backend/routes/ventas.js`): `POST /api/ventas` (boletos + optional dulcería) and `POST /api/ventas/dulceria` (dulcería only). Double-booking is caught via `ER_DUP_ENTRY` on `boletos(id_funcion, id_asiento)` → 409. 8% service charge (`CARGO_SERVICIO`) lives in both `ventas.js` and `SeatSelection.jsx`; 8-seat cap (`LIMITE_ASIENTOS`) is frontend-only.

## Gotchas

- `npm run seed` truncates 11 tables (including `usuarios`) and generates `funciones` for **today + tomorrow only** — days later the cartelera looks empty; just re-seed.
- Seed writes datetimes in **local time** (not UTC) on purpose; night shows would otherwise shift to "tomorrow" and vanish from today's cartelera. Don't "simplify" with `toISOString`.
- Last two seat rows are `preferencial` (non-VIP salas); ~4% deterministic `mantenimiento` seats via `hashAsiento` — not random.
- Images: posters → `public/posters/`, dulcería → `public/dulceria/`; filenames must match `poster_url` / `imagen_url` in DB. Backdrops (`backdrop_url`) have no local files.
- CORS allows only `CORS_ORIGIN`; both servers must run simultaneously.
- Styling: CSS custom properties in `src/index.css` + CSS Modules per page/component. Font: Outfit, dark theme.
