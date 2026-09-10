import { Router } from "express";
import { pool } from "../db.js";

const router = Router();
const CARGO_SERVICIO = 0.08;

async function upsertCliente(conn, cliente) {
  await conn.query(
    `INSERT INTO clientes (nombres, apellidos, email)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE nombres = VALUES(nombres), apellidos = VALUES(apellidos)`,
    [cliente.nombres, cliente.apellidos, cliente.email]
  );
  const [[filaCliente]] = await conn.query("SELECT id_cliente FROM clientes WHERE email = ?", [
    cliente.email,
  ]);
  return filaCliente.id_cliente;
}

function validarCliente(cliente) {
  return Boolean(cliente?.email && cliente?.nombres && cliente?.apellidos);
}

// Precios siempre desde la BD (nunca se confía en el precio del front).
async function resolverDulceria(conn, dulceria) {
  const lineas = [];
  for (const item of dulceria || []) {
    const cantidad = Number(item.cantidad);
    if (!Number.isInteger(cantidad) || cantidad < 1) {
      throw new Error("Las cantidades de dulcería deben ser números enteros mayores a cero.");
    }
    const [[fila]] = await conn.query(
      "SELECT id_producto, nombre, precio FROM productos WHERE id_producto = ? AND disponible = 1",
      [item.id_producto]
    );
    if (!fila) {
      throw new Error("Uno de los productos de dulcería ya no está disponible.");
    }
    lineas.push({
      id_producto: fila.id_producto,
      nombre: fila.nombre,
      cantidad,
      precio_unitario: Number(fila.precio),
      subtotal: Number(fila.precio) * cantidad,
    });
  }
  return lineas;
}

async function guardarDetalle(conn, idVenta, lineas) {
  for (const linea of lineas) {
    await conn.query(
      "INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)",
      [idVenta, linea.id_producto, linea.cantidad, linea.precio_unitario]
    );
  }
}

function totales(subtotal) {
  const impuestos = Math.round(subtotal * CARGO_SERVICIO);
  return { subtotal, impuestos, total: subtotal + impuestos };
}

// POST /api/ventas — boletos (+ dulcería opcional del carrito)
router.post("/", async (req, res, next) => {
  const { cliente, metodoPago, idFuncion, asientos, dulceria } = req.body;

  if (!validarCliente(cliente)) {
    return res.status(400).json({ error: "Faltan datos del cliente." });
  }
  if (!idFuncion || !Array.isArray(asientos) || asientos.length === 0) {
    return res.status(400).json({ error: "Debes seleccionar al menos un asiento." });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const idCliente = await upsertCliente(conn, cliente);
    const lineasDulceria = await resolverDulceria(conn, dulceria);

    const subtotalBoletos = asientos.reduce((suma, a) => suma + Number(a.precio), 0);
    const subtotalDulceria = lineasDulceria.reduce((suma, l) => suma + l.subtotal, 0);
    const { subtotal, impuestos, total } = totales(subtotalBoletos + subtotalDulceria);

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

      const codigoQr = `TECNO-${idVenta}-${asiento.fila}${asiento.numero}`;
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

    await guardarDetalle(conn, idVenta, lineasDulceria);

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
      dulceria: lineasDulceria,
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

// POST /api/ventas/dulceria — solo dulcería, sin boletos
router.post("/dulceria", async (req, res, next) => {
  const { cliente, metodoPago, dulceria } = req.body;

  if (!validarCliente(cliente)) {
    return res.status(400).json({ error: "Faltan datos del cliente." });
  }
  if (!Array.isArray(dulceria) || dulceria.length === 0) {
    return res.status(400).json({ error: "El carrito de dulcería está vacío." });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const idCliente = await upsertCliente(conn, cliente);
    const lineasDulceria = await resolverDulceria(conn, dulceria);
    if (lineasDulceria.length === 0) {
      throw new Error("El carrito de dulcería está vacío.");
    }

    const subtotalDulceria = lineasDulceria.reduce((suma, l) => suma + l.subtotal, 0);
    const { subtotal, impuestos, total } = totales(subtotalDulceria);

    const [resultadoVenta] = await conn.query(
      `INSERT INTO ventas (id_cliente, monto_subtotal, monto_impuestos, monto_total, metodo_pago, canal_venta)
       VALUES (?, ?, ?, ?, ?, 'web-dulceria')`,
      [idCliente, subtotal, impuestos, total, metodoPago || "No especificado"]
    );
    const idVenta = resultadoVenta.insertId;

    await guardarDetalle(conn, idVenta, lineasDulceria);

    await conn.commit();
    res.status(201).json({
      venta: {
        id_venta: idVenta,
        monto_subtotal: subtotal,
        monto_impuestos: impuestos,
        monto_total: total,
        metodo_pago: metodoPago,
      },
      dulceria: lineasDulceria,
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

export default router;
