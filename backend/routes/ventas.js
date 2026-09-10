import { Router } from "express";
import { pool } from "../db.js";

const router = Router();
const CARGO_SERVICIO = 0.08;

router.post("/", async (req, res, next) => {
  const { cliente, metodoPago, idFuncion, asientos } = req.body;

  if (!cliente?.email || !cliente?.nombres || !cliente?.apellidos) {
    return res.status(400).json({ error: "Faltan datos del cliente." });
  }
  if (!idFuncion || !Array.isArray(asientos) || asientos.length === 0) {
    return res.status(400).json({ error: "Debes seleccionar al menos un asiento." });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // upsert del cliente por email (tabla clientes)
    await conn.query(
      `INSERT INTO clientes (nombres, apellidos, email)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE nombres = VALUES(nombres), apellidos = VALUES(apellidos)`,
      [cliente.nombres, cliente.apellidos, cliente.email]
    );
    const [[filaCliente]] = await conn.query(
      "SELECT id_cliente FROM clientes WHERE email = ?",
      [cliente.email]
    );
    const idCliente = filaCliente.id_cliente;

    const subtotal = asientos.reduce((suma, a) => suma + Number(a.precio), 0);
    const impuestos = Math.round(subtotal * CARGO_SERVICIO);
    const total = subtotal + impuestos;

    const [resultadoVenta] = await conn.query(
      `INSERT INTO ventas (id_cliente, monto_subtotal, monto_impuestos, monto_total, metodo_pago, canal_venta)
       VALUES (?, ?, ?, ?, ?, 'web')`,
      [idCliente, subtotal, impuestos, total, metodoPago || "No especificado"]
    );
    const idVenta = resultadoVenta.insertId;

    const boletosCreados = [];
    for (const asiento of asientos) {
      const [[filaAsiento]] = await conn.query(
        `SELECT id_asiento FROM asientos
         WHERE id_sala = (SELECT id_sala FROM funciones WHERE id_funcion = ?)
           AND fila = ? AND numero = ?`,
        [idFuncion, asiento.fila, asiento.numero]
      );
      if (!filaAsiento) {
        throw new Error(`El asiento ${asiento.fila}${asiento.numero} no existe en esa sala.`);
      }

      const codigoQr = `ADSO-${idVenta}-${asiento.fila}${asiento.numero}`;
      const [resultadoBoleto] = await conn.query(
        `INSERT INTO boletos (id_venta, id_funcion, id_asiento, tipo_boleto, precio_final_pagado, codigo_qr)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [idVenta, idFuncion, filaAsiento.id_asiento, asiento.tipo_asiento, asiento.precio, codigoQr]
      );

      boletosCreados.push({
        id_boleto: resultadoBoleto.insertId,
        fila: asiento.fila,
        numero: asiento.numero,
        codigo_qr: codigoQr,
      });
    }

    await conn.commit();
    res.status(201).json({
      venta: {
        id_venta: idVenta,
        monto_subtotal: subtotal,
        monto_impuestos: impuestos,
        monto_total: total,
        metodo_pago: metodoPago,
      },
      boletos: boletosCreados,
    });
  } catch (err) {
    await conn.rollback();
    // uq_asiento_por_funcion: alguien más compró ese asiento primero
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: "Uno de los asientos que elegiste ya fue vendido para esta función. Vuelve a intentarlo.",
      });
    }
    next(err);
  } finally {
    conn.release();
  }
});

export default router;
