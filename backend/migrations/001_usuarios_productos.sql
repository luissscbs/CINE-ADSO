-- =============================================================================
-- 001_usuarios_productos.sql — Cine ADSO
-- Migración: auth real (usuarios) + dulcería (productos, detalle_venta).
--
-- Cómo correrla (una sola vez, BD ya creada):
--   mysql -u root -p cine_adso < migrations/001_usuarios_productos.sql
--
-- En instalaciones desde cero, schema.sql ya incluye estas tablas.
-- =============================================================================

USE cine_adso;

-- ---- usuarios (auth real con email + password) ------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario      INT(11) AUTO_INCREMENT PRIMARY KEY,
  nombres         VARCHAR(100) NOT NULL,
  apellidos       VARCHAR(100) NOT NULL,
  email           VARCHAR(150) NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  fecha_registro  DATE NOT NULL DEFAULT (CURRENT_DATE),
  UNIQUE KEY uq_usuario_email (email)
);

-- ---- productos (dulcería: crispetas, bebidas, combos...) --------------------
CREATE TABLE IF NOT EXISTS productos (
  id_producto  INT(11) AUTO_INCREMENT PRIMARY KEY,
  nombre       VARCHAR(150) NOT NULL,
  descripcion  VARCHAR(500),
  categoria    VARCHAR(50) NOT NULL DEFAULT 'dulceria',
  precio       DECIMAL(10,2) NOT NULL,
  imagen_url   VARCHAR(1000),
  disponible   TINYINT(1) NOT NULL DEFAULT 1,
  orden        INT(11) NOT NULL DEFAULT 0
);

-- ---- detalle_venta (líneas de dulcería dentro de una venta) -----------------
CREATE TABLE IF NOT EXISTS detalle_venta (
  id_detalle      INT(11) AUTO_INCREMENT PRIMARY KEY,
  id_venta        INT(11) NOT NULL,
  id_producto     INT(11) NOT NULL,
  cantidad        INT(11) NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (id_venta) REFERENCES ventas(id_venta),
  FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);
