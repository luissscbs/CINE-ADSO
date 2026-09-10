# Cine ADSO (React + API + MySQL)

Front en React + Vite (sistema de diseño **Cinema Editorial**) conectado a
una API propia en Node.js + Express, con MySQL como base de datos —
siguiendo el diagrama ER que definiste.

## Estructura

```
cine-adso-react/
├── src/                → front (React + Vite)
│   ├── api/client.js    → todas las llamadas fetch a la API
│   ├── context/          → CatalogoContext: carga clasificaciones/salas/
│   │                        películas una sola vez al abrir la app
│   ├── components/       → piezas reutilizables (SeatMap, PurchaseSummary...)
│   └── pages/             → Home, MovieDetail, SeatSelection
└── backend/             → API (Node.js + Express + mysql2)
    ├── schema.sql         → estructura de la base de datos
    ├── seed.js             → datos de ejemplo (mismos que tenía el front)
    ├── db.js                → pool de conexión MySQL
    ├── server.js             → arranque del servidor Express
    └── routes/                → clasificaciones, salas, peliculas, funciones, ventas
```

## 1. Base de datos

Necesitas MySQL corriendo localmente (o accesible por red). Crea el
esquema:

```bash
mysql -u root -p < backend/schema.sql
```

Esto crea la base `cine_adso` con las 7 tablas del diagrama
(`clasificaciones`, `salas`, `asientos`, `peliculas`, `funciones`,
`clientes`, `ventas`, `boletos`), con sus llaves foráneas y dos
restricciones `UNIQUE` importantes:

- `asientos (id_sala, fila, numero)` — no puede haber dos butacas
  iguales en la misma sala.
- `boletos (id_funcion, id_asiento)` — no puede venderse el mismo
  asiento dos veces para la misma función, ni siquiera si dos compras
  llegan al mismo tiempo (lo valida la base de datos, no solo el código).

## 2. Backend (API)

```bash
cd backend
npm install
cp .env.example .env      # ajusta usuario/contraseña de tu MySQL
npm run seed               # llena la base con datos de ejemplo
npm run dev                 # http://localhost:4000
```

`npm run seed` se puede correr las veces que quieras — limpia las tablas
antes de insertar. Ojo: las funciones se generan para "hoy" y "mañana" en
el momento en que corres el seed, así que si pasan varios días sin volver
a sembrar, quedarán en el pasado — vuelve a correr `npm run seed`.

### Endpoints principales

| Método | Ruta                              | Qué hace                                   |
|--------|------------------------------------|---------------------------------------------|
| GET    | `/api/clasificaciones`             | lista de clasificaciones activas             |
| GET    | `/api/salas`                       | lista de salas                                |
| GET    | `/api/salas/:id/asientos`          | asientos físicos de esa sala                   |
| GET    | `/api/peliculas`                   | lista de películas                              |
| GET    | `/api/peliculas/:id`               | una película                                     |
| GET    | `/api/funciones?pelicula_id=&hoy=` | funciones, filtrables por película o por hoy      |
| GET    | `/api/funciones/:id`               | una función                                        |
| GET    | `/api/funciones/:id/ocupados`      | asientos ya vendidos para esa función               |
| POST   | `/api/ventas`                      | registra venta + boletos (transacción)               |

## 3. Frontend

```bash
npm install
cp .env.example .env       # VITE_API_URL, por defecto http://localhost:4000/api
npm run dev                 # http://localhost:5173
```

Con el backend y MySQL corriendo, abre `http://localhost:5173` y ya
navegas la cartelera real desde la base de datos.

## Cómo se relaciona con el diagrama ER

- Cada tabla del diagrama tiene su ruta en `backend/routes/`.
- Los **asientos** ya no se generan en el navegador: son filas reales en
  la tabla `asientos`, con `tipo_asiento` y `estado_fisico` guardados en
  la base de datos. El front los pide con `GET /api/salas/:id/asientos`
  y arma la grilla agrupando por `fila`.
- Al confirmar una compra, `POST /api/ventas` corre en una **transacción**:
  crea/actualiza el `cliente` por email, inserta la `venta` y un `boleto`
  por cada asiento. Si algo falla a mitad de camino (por ejemplo, un
  asiento que ya fue vendido por alguien más un segundo antes), se hace
  `ROLLBACK` y no queda nada a medias.

## Cambiar los datos

- **Películas, salas, clasificaciones:** edítalos directo en
  `backend/seed.js` y vuelve a correr `npm run seed`. También puedes
  editarlos a mano con cualquier cliente MySQL (Workbench, DBeaver, etc.)
  una vez que la base ya existe.
- **Imágenes de los pósters:** siguen yendo en
  `public/posters/` con el mismo nombre que tiene `poster_url` en la
  base de datos (columna de la tabla `peliculas`).

## Límites de este demo

- No hay autenticación de administrador para editar el catálogo desde la
  web — se edita por `seed.js` o directo en la base de datos.
- El precio de cada asiento (estándar vs. preferencial/VIP) se calcula en
  el front y se envía tal cual al backend; en un proyecto en producción
  también se recalcularía y validaría del lado del servidor antes de
  guardar la venta.
- El límite de 8 asientos por compra y el cargo por servicio del 8% son
  valores de ejemplo — cámbialos en `src/pages/SeatSelection.jsx` y
  `backend/routes/ventas.js`.
