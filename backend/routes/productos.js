import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

// GET /api/productos — carta de dulcería disponible
router.get("/", async (req, res, next) => {
  try {
    const [filas] = await pool.query(
      "SELECT * FROM productos WHERE disponible = 1 ORDER BY orden ASC, id_producto ASC"
    );
    res.json(filas);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const [filas] = await pool.query("SELECT * FROM productos WHERE id_producto = ?", [
      req.params.id,
    ]);
    if (filas.length === 0) return res.status(404).json({ error: "Producto no encontrado." });
    res.json(filas[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
