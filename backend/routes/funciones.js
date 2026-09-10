import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

// Filtros opcionales por querystring: ?pelicula_id=2 y/o ?hoy=true
router.get("/", async (req, res, next) => {
  try {
    const { pelicula_id, hoy } = req.query;
    const condiciones = [];
    const params = [];

    if (pelicula_id) {
      condiciones.push("id_pelicula = ?");
      params.push(pelicula_id);
    }
    if (hoy === "true") {
      condiciones.push("DATE(fecha_hora_inicio) = CURDATE()");
    }

    const where = condiciones.length ? `WHERE ${condiciones.join(" AND ")}` : "";
    const [filas] = await pool.query(
      `SELECT * FROM funciones ${where} ORDER BY fecha_hora_inicio`,
      params
    );
    res.json(filas);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const [filas] = await pool.query("SELECT * FROM funciones WHERE id_funcion = ?", [req.params.id]);
    if (filas.length === 0) return res.status(404).json({ error: "Función no encontrada" });
    res.json(filas[0]);
  } catch (err) {
    next(err);
  }
});

// Asientos ya vendidos para esta función puntual (join boletos + asientos).
router.get("/:id/ocupados", async (req, res, next) => {
  try {
    const [filas] = await pool.query(
      `SELECT a.fila, a.numero
       FROM boletos b
       JOIN asientos a ON a.id_asiento = b.id_asiento
       WHERE b.id_funcion = ?`,
      [req.params.id]
    );
    res.json(filas);
  } catch (err) {
    next(err);
  }
});

export default router;
