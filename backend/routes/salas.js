import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const [filas] = await pool.query("SELECT * FROM salas ORDER BY numero_sala");
    res.json(filas);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const [filas] = await pool.query("SELECT * FROM salas WHERE id_sala = ?", [req.params.id]);
    if (filas.length === 0) return res.status(404).json({ error: "Sala no encontrada" });
    res.json(filas[0]);
  } catch (err) {
    next(err);
  }
});

// Devuelve todos los asientos físicos de la sala (tipo_asiento y
// estado_fisico incluidos). El front arma la grilla agrupando por fila.
router.get("/:id/asientos", async (req, res, next) => {
  try {
    const [filas] = await pool.query(
      "SELECT * FROM asientos WHERE id_sala = ? ORDER BY fila, numero",
      [req.params.id]
    );
    res.json(filas);
  } catch (err) {
    next(err);
  }
});

export default router;
