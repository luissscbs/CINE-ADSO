import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const [filas] = await pool.query(
      "SELECT * FROM clasificaciones WHERE estado_activa = 1 ORDER BY edad_minima"
    );
    res.json(filas);
  } catch (err) {
    next(err);
  }
});

export default router;
