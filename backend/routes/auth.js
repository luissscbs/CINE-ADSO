import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "cine-adso-dev-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function firmarToken(usuario) {
  return jwt.sign(
    { id_usuario: usuario.id_usuario, email: usuario.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function usuarioPublico(fila) {
  return {
    id_usuario: fila.id_usuario,
    nombres: fila.nombres,
    apellidos: fila.apellidos,
    email: fila.email,
    fecha_registro: fila.fecha_registro,
  };
}

export function requerirAuth(req, res, next) {
  const encabezado = req.headers.authorization || "";
  const token = encabezado.startsWith("Bearer ") ? encabezado.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Debes ingresar para continuar." });
  try {
    req.usuarioAuth = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Tu sesión expiró. Vuelve a ingresar." });
  }
}

// POST /api/auth/registro
router.post("/registro", async (req, res, next) => {
  try {
    const { nombres, apellidos, email, password } = req.body || {};

    if (!nombres?.trim() || !apellidos?.trim()) {
      return res.status(400).json({ error: "Nombres y apellidos son obligatorios." });
    }
    if (!/^\S+@\S+\.\S+$/.test((email || "").trim())) {
      return res.status(400).json({ error: "El correo electrónico no es válido." });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres." });
    }

    const correo = email.trim().toLowerCase();
    const [existentes] = await pool.query("SELECT id_usuario FROM usuarios WHERE email = ?", [correo]);
    if (existentes.length > 0) {
      return res.status(409).json({ error: "Ese correo ya está registrado. Ingresa en su lugar." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [resultado] = await pool.query(
      "INSERT INTO usuarios (nombres, apellidos, email, password_hash) VALUES (?, ?, ?, ?)",
      [nombres.trim(), apellidos.trim(), correo, passwordHash]
    );
    const [[fila]] = await pool.query(
      "SELECT id_usuario, nombres, apellidos, email, fecha_registro FROM usuarios WHERE id_usuario = ?",
      [resultado.insertId]
    );

    const usuario = usuarioPublico(fila);
    res.status(201).json({ token: firmarToken(usuario), usuario });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Correo y contraseña son obligatorios." });
    }

    const [filas] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [
      email.trim().toLowerCase(),
    ]);
    if (filas.length === 0) {
      return res.status(401).json({ error: "Correo o contraseña incorrectos." });
    }

    const fila = filas[0];
    const coincide = await bcrypt.compare(password, fila.password_hash);
    if (!coincide) {
      return res.status(401).json({ error: "Correo o contraseña incorrectos." });
    }

    const usuario = usuarioPublico(fila);
    res.json({ token: firmarToken(usuario), usuario });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/perfil
router.get("/perfil", requerirAuth, async (req, res, next) => {
  try {
    const [filas] = await pool.query(
      "SELECT id_usuario, nombres, apellidos, email, fecha_registro FROM usuarios WHERE id_usuario = ?",
      [req.usuarioAuth.id_usuario]
    );
    if (filas.length === 0) return res.status(404).json({ error: "Usuario no encontrado." });
    res.json(usuarioPublico(filas[0]));
  } catch (err) {
    next(err);
  }
});

export default router;
