-- =============================================================================
-- schema.sql — Cine ADSO
-- Tablas fieles al diagrama ER. Dos añadidos fuera del diagrama, marcados
-- explícitamente abajo, porque el front ya los usa (genero, destacada en
-- peliculas). Todo lo demás es exactamente lo que estaba en el diagrama.
--
-- Cómo correrlo:
--   mysql -u root -p < schema.sql
-- =============================================================================

CREATE DATABASE IF NOT EXISTS cine_adso
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE cine_adso;

-- ---- clasificaciones --------------------------------------------------------
CREATE TABLE clasificaciones (
  id_clasificacion INT(11) AUTO_INCREMENT PRIMARY KEY,
  codigo            VARCHAR(50)  NOT NULL,
  edad_minima       INT(11)      NOT NULL DEFAULT 0,
  descripcion_corta VARCHAR(255),
  advertencias      VARCHAR(500),
  estado_activa     TINYINT(1)   NOT NULL DEFAULT 1
);

-- ---- salas --------------------------------------------------------------------
CREATE TABLE salas (
  id_sala              INT(11) AUTO_INCREMENT PRIMARY KEY,
  numero_sala          INT(11)     NOT NULL,
  capacidad_maxima     INT(11)     NOT NULL,
  tipo_proyeccion      VARCHAR(50),
  tecnologia_sonido    VARCHAR(50),
  es_vip               TINYINT(1)  NOT NULL DEFAULT 0,
  estado_mantenimiento VARCHAR(50) NOT NULL DEFAULT 'operativa',
  UNIQUE KEY uq_numero_sala (numero_sala)
);

-- ---- asientos -------------------------------------------------------------
-- Cada butaca física de cada sala. tipo_asiento y estado_fisico son
-- propiedades del asiento en sí, independientes de si está vendido para
-- una función puntual (eso se resuelve por join con boletos, ver más abajo).
CREATE TABLE asientos (
  id_asiento    INT(11) AUTO_INCREMENT PRIMARY KEY,
  id_sala       INT(11)     NOT NULL,
  fila          CHAR(1)     NOT NULL,
  numero        INT(11)     NOT NULL,
  tipo_asiento  VARCHAR(50) NOT NULL DEFAULT 'estandar',
  estado_fisico VARCHAR(50) NOT NULL DEFAULT 'operativo',
  FOREIGN KEY (id_sala) REFERENCES salas(id_sala),
  UNIQUE KEY uq_asiento_sala (id_sala, fila, numero)
);

-- ---- clientes -------------------------------------------------------------
CREATE TABLE clientes (
  id_cliente        INT(11) AUTO_INCREMENT PRIMARY KEY,
  nombres           VARCHAR(100) NOT NULL,
  apellidos         VARCHAR(100) NOT NULL,
  email             VARCHAR(150) NOT NULL,
  telefono          VARCHAR(20),
  fecha_nacimiento  DATE,
  fecha_registro    DATE NOT NULL DEFAULT (CURRENT_DATE),
  UNIQUE KEY uq_cliente_email (email)
);

-- ---- peliculas ---------------------------------------------------------------
-- genero y destacada no están en el diagrama original; se agregaron porque
-- la cartelera (front) ya los usa para el badge de "Estreno" y el género.
CREATE TABLE peliculas (
  id_pelicula            INT(11) AUTO_INCREMENT PRIMARY KEY,
  titulo_original        VARCHAR(255) NOT NULL,
  titulo_local           VARCHAR(255) NOT NULL,
  sinopsis               TEXT,
  duracion_minutos       INT(11) NOT NULL,
  director               VARCHAR(255),
  estudio_productor      VARCHAR(255),
  fecha_estreno_nacional DATE,
  id_clasificacion       INT(11),
  poster_url             VARCHAR(1000),
  genero                 VARCHAR(100),  -- añadido, fuera del diagrama
  destacada              TINYINT(1) NOT NULL DEFAULT 0, -- añadido, fuera del diagrama
  FOREIGN KEY (id_clasificacion) REFERENCES clasificaciones(id_clasificacion)
);

-- ---- funciones -----------------------------------------------------------
CREATE TABLE funciones (
  id_funcion        INT(11) AUTO_INCREMENT PRIMARY KEY,
  id_pelicula       INT(11)  NOT NULL,
  id_sala           INT(11)  NOT NULL,
  fecha_hora_inicio DATETIME NOT NULL,
  fecha_hora_fin    DATETIME NOT NULL,
  idioma_audio      VARCHAR(50),
  precio_base       DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (id_pelicula) REFERENCES peliculas(id_pelicula),
  FOREIGN KEY (id_sala) REFERENCES salas(id_sala)
);

-- ---- ventas -------------------------------------------------------------
CREATE TABLE ventas (
  id_venta         INT(11) AUTO_INCREMENT PRIMARY KEY,
  id_cliente       INT(11) NOT NULL,
  fecha_hora_venta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  monto_subtotal   DECIMAL(10,2) NOT NULL,
  monto_impuestos  DECIMAL(10,2) NOT NULL,
  monto_total      DECIMAL(10,2) NOT NULL,
  metodo_pago      VARCHAR(50),
  canal_venta      VARCHAR(50) NOT NULL DEFAULT 'web',
  FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
);

-- ---- boletos ------------------------------------------------------------
-- La restricción UNIQUE (id_funcion, id_asiento) es la que impide, a nivel
-- de base de datos, que un mismo asiento se venda dos veces para la misma
-- función — incluso si dos personas confirman al mismo tiempo.
CREATE TABLE boletos (
  id_boleto            INT(11) AUTO_INCREMENT PRIMARY KEY,
  id_venta             INT(11) NOT NULL,
  id_funcion           INT(11) NOT NULL,
  id_asiento           INT(11) NOT NULL,
  tipo_boleto          VARCHAR(50),
  precio_final_pagado  DECIMAL(10,2) NOT NULL,
  codigo_qr            VARCHAR(255),
  FOREIGN KEY (id_venta) REFERENCES ventas(id_venta),
  FOREIGN KEY (id_funcion) REFERENCES funciones(id_funcion),
  FOREIGN KEY (id_asiento) REFERENCES asientos(id_asiento),
  UNIQUE KEY uq_asiento_por_funcion (id_funcion, id_asiento)
);
