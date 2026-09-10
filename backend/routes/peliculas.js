import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const [filas] = await pool.query("SELECT * FROM peliculas ORDER BY fecha_estreno_nacional DESC");
    res.json(filas);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const [filas] = await pool.query("SELECT * FROM peliculas WHERE id_pelicula = ?", [req.params.id]);
    if (filas.length === 0) return res.status(404).json({ error: "Película no encontrada" });
    res.json(filas[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
