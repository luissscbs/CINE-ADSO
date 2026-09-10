import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import clasificacionesRouter from "./routes/clasificaciones.js";
import salasRouter from "./routes/salas.js";
import peliculasRouter from "./routes/peliculas.js";
import funcionesRouter from "./routes/funciones.js";
import ventasRouter from "./routes/ventas.js";

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/clasificaciones", clasificacionesRouter);
app.use("/api/salas", salasRouter);
app.use("/api/peliculas", peliculasRouter);
app.use("/api/funciones", funcionesRouter);
app.use("/api/ventas", ventasRouter);

// manejador de errores centralizado
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Error interno del servidor." });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Cine ADSO API escuchando en http://localhost:${PORT}`);
});
