/* =========================================================================
   seed.js
   Llena la base de datos con los mismos datos de ejemplo que tenía la
   versión anterior (front-only). Bórralo/edítalo con tus datos reales
   cuando quieras. Se puede correr varias veces: limpia las tablas antes
   de insertar.

   OJO con "funciones": se generan para HOY y MAÑANA en el momento en que
   corres este script (igual que hacía el front antes). Si pasan varios
   días sin volver a sembrar, las funciones quedarán en el pasado — vuelve
   a correr `npm run seed` para refrescarlas.

   Uso:
     npm run seed
   ========================================================================= */

import { pool } from "./db.js";

const CLASIFICACIONES = [
  { codigo: "TP", edad_minima: 0, descripcion_corta: "Todo público" },
  { codigo: "PG", edad_minima: 7, descripcion_corta: "Se sugiere compañía de un adulto" },
  { codigo: "B", edad_minima: 12, descripcion_corta: "Apta para mayores de 12 años" },
  { codigo: "B-15", edad_minima: 15, descripcion_corta: "Apta para mayores de 15 años" },
  { codigo: "C", edad_minima: 18, descripcion_corta: "Exclusiva para adultos" },
];

const SALAS = [
  { numero_sala: 1, filas: 8, asientos_por_fila: 12, capacidad_maxima: 96, tipo_proyeccion: "2D", tecnologia_sonido: "Digital 5.1", es_vip: 0 },
  { numero_sala: 2, filas: 7, asientos_por_fila: 10, capacidad_maxima: 70, tipo_proyeccion: "3D", tecnologia_sonido: "Dolby Atmos", es_vip: 0 },
  { numero_sala: 3, filas: 9, asientos_por_fila: 12, capacidad_maxima: 108, tipo_proyeccion: "2D", tecnologia_sonido: "Digital 5.1", es_vip: 0 },
  { numero_sala: 4, filas: 5, asientos_por_fila: 8, capacidad_maxima: 40, tipo_proyeccion: "4DX", tecnologia_sonido: "Dolby Atmos", es_vip: 1 },
];

// codigoClasificacion en vez de id porque el id real se resuelve luego de insertar
// Películas reales en cartelera en Colombia (septiembre 2026).
const PELICULAS = [
  { titulo_original: "The Dog Stars", titulo_local: "La Guerra de los Últimos", sinopsis: "Tras la pandemia que devastó al mundo, Hig sobrevive aislado en un hangar de aviones en Colorado junto a su perro y a Bangley, un hosco experto en supervivencia. Cuando capta una misteriosa transmisión de radio mientras vuela su vieja avioneta, decide arriesgarlo todo para descubrir de dónde viene la señal, en busca de la esperanza y la humanidad en las que aún cree.", duracion_minutos: 100, director: "Ridley Scott", estudio_productor: "20th Century Studios", fecha_estreno_nacional: "2026-08-27", codigoClasificacion: "B", genero: "Acción / Ciencia ficción", destacada: 1, poster_url: "/posters/guerra-de-los-ultimos.jpg" },
  { titulo_original: "The Odyssey", titulo_local: "La Odisea", sinopsis: "El legendario rey Odiseo emprende su largo y peligroso viaje de regreso a Ítaca tras la Guerra de Troya. A lo largo de su travesía debe enfrentarse a dioses caprichosos, monstruos mitológicos y pruebas que ponen a prueba su astucia y su humanidad hasta el límite, mientras Penélope lo espera desde hace veinte años.", duracion_minutos: 172, director: "Christopher Nolan", estudio_productor: "Universal Pictures", fecha_estreno_nacional: "2026-07-16", codigoClasificacion: "B", genero: "Épica / Aventura", destacada: 0, poster_url: "/posters/la-odisea.jpg" },
  { titulo_original: "Coyote vs. ACME", titulo_local: "Coyote vs. ACME", sinopsis: "Después de que todos los productos de la Corporación ACME fallaran en su eterna persecución del Correcaminos, Wile E. Coyote contrata al abogado Kevin Avery para demandar a la empresa. La creciente amistad entre los dos impulsará su determinación por ganar el caso frente a Buddy Crane, el intimidante jefe del antiguo bufete de Kevin, que ahora representa a ACME.", duracion_minutos: 103, director: "Dave Green", estudio_productor: "Warner Bros. Pictures", fecha_estreno_nacional: "2026-08-27", codigoClasificacion: "PG", genero: "Animación / Comedia", destacada: 0, poster_url: "/posters/coyote-acme.jpg" },
  { titulo_original: "Insidious: Out of the Further", titulo_local: "La Noche del Demonio: Están Entre Nosotros", sinopsis: "Gemma, una joven madre que cría sola a su hija en la casa de su infancia, descubre que puede viajar a El Más Allá y traer de regreso al mundo real lo que vive allí. Cuando las entidades demoníacas descubren su poder, comienzan a usarlo como un portal que pone en riesgo a su familia y a nuestro mundo.", duracion_minutos: 106, director: "Jacob Chase", estudio_productor: "Blumhouse / Sony Pictures", fecha_estreno_nacional: "2026-08-20", codigoClasificacion: "C", genero: "Terror", destacada: 0, poster_url: "/posters/noche-del-demonio.jpg" },
  { titulo_original: "Spider-Man: Brand New Day", titulo_local: "Spider-Man: Un Nuevo Día", sinopsis: "Cuatro años después de los eventos de Sin regreso a casa, Peter Parker es un adulto que vive completamente solo, borrado de las vidas y recuerdos de sus seres queridos. Combatiendo el crimen en una Nueva York que ya no conoce su nombre, la presión desencadena una sorprendente evolución física que amenaza su existencia, mientras un extraño patrón de crímenes da lugar a una de las amenazas más poderosas a las que se ha enfrentado.", duracion_minutos: 145, director: "Destin Daniel Cretton", estudio_productor: "Sony Pictures / Marvel Studios", fecha_estreno_nacional: "2026-07-30", codigoClasificacion: "B", genero: "Acción / Superhéroes", destacada: 0, poster_url: "/posters/spider-man-nuevo-dia.jpg" },
  { titulo_original: "Ice Cream Man", titulo_local: "El Heladero: Dulce Sabor a Muerte", sinopsis: "La idílica tranquilidad de un pueblo suburbano se convierte en una auténtica pesadilla cuando un enigmático vendedor de helados reparte sus irresistibles creaciones entre los niños. Al probar sus dulces, los pequeños se convierten en maníacos homicidas que desatan una ola de violencia sobre todos sus habitantes.", duracion_minutos: 86, director: "Eli Roth", estudio_productor: "The Horror Section", fecha_estreno_nacional: "2026-09-03", codigoClasificacion: "C", genero: "Terror", destacada: 0, poster_url: "/posters/el-heladero.jpg" },
  { titulo_original: "Tonari no Totoro", titulo_local: "Mi Vecino Totoro", sinopsis: "Dos hermanas se mudan al campo con su padre para estar cerca de su madre hospitalizada y descubren que los árboles que rodean su nueva casa están habitados por los Totoros, espíritus mágicos del bosque. Cuando la pequeña Mei se pierde, su hermana mayor pedirá ayuda a los espíritus para encontrarla. (Reestreno en cines)", duracion_minutos: 86, director: "Hayao Miyazaki", estudio_productor: "Studio Ghibli", fecha_estreno_nacional: "2026-09-01", codigoClasificacion: "TP", genero: "Animación / Familiar", destacada: 0, poster_url: "/posters/mi-vecino-totoro.jpg" },
];

// numeroSala en vez de id_sala, tituloLocal en vez de id_pelicula: se
// resuelven luego de insertar, igual que las clasificaciones.
const PLANTILLAS_FUNCIONES = [
  { tituloLocal: "La Guerra de los Últimos", numeroSala: 3, horas: ["15:00", "20:30"], idioma_audio: "Subtitulada", precio_base: 18000 },
  { tituloLocal: "La Odisea", numeroSala: 1, horas: ["13:30", "18:30"], idioma_audio: "Subtitulada", precio_base: 22000 },
  { tituloLocal: "Coyote vs. ACME", numeroSala: 2, horas: ["14:15", "17:45", "20:15"], idioma_audio: "Doblada", precio_base: 17000 },
  { tituloLocal: "La Noche del Demonio: Están Entre Nosotros", numeroSala: 1, horas: ["22:00"], idioma_audio: "Subtitulada", precio_base: 16000 },
  { tituloLocal: "Spider-Man: Un Nuevo Día", numeroSala: 4, horas: ["16:30", "20:30"], idioma_audio: "Subtitulada", precio_base: 28000 },
  { tituloLocal: "El Heladero: Dulce Sabor a Muerte", numeroSala: 3, horas: ["12:00"], idioma_audio: "Subtitulada", precio_base: 16000 },
  { tituloLocal: "Mi Vecino Totoro", numeroSala: 2, horas: ["10:30", "15:30"], idioma_audio: "Doblada", precio_base: 14000 },
];

function letraDeFila(indice) {
  return String.fromCharCode(65 + indice);
}

// Determinista (mismo criterio que usaba el front): ~4% de los asientos
// quedan "fuera de servicio", siempre los mismos.
function hashAsiento(texto) {
  let hash = 0;
  for (let i = 0; i < texto.length; i++) hash = (hash * 31 + texto.charCodeAt(i)) % 1000;
  return hash;
}

async function limpiarTablas() {
  await pool.query("SET FOREIGN_KEY_CHECKS = 0");
  for (const tabla of ["boletos", "ventas", "clientes", "funciones", "asientos", "peliculas", "salas", "clasificaciones"]) {
    await pool.query(`TRUNCATE TABLE ${tabla}`);
  }
  await pool.query("SET FOREIGN_KEY_CHECKS = 1");
}

async function sembrarClasificaciones() {
  const idsPorCodigo = {};
  for (const c of CLASIFICACIONES) {
    const [resultado] = await pool.query(
      "INSERT INTO clasificaciones (codigo, edad_minima, descripcion_corta) VALUES (?, ?, ?)",
      [c.codigo, c.edad_minima, c.descripcion_corta]
    );
    idsPorCodigo[c.codigo] = resultado.insertId;
  }
  return idsPorCodigo;
}

async function sembrarSalasYAsientos() {
  const idsPorNumero = {};
  for (const s of SALAS) {
    const [resultado] = await pool.query(
      `INSERT INTO salas (numero_sala, capacidad_maxima, tipo_proyeccion, tecnologia_sonido, es_vip)
       VALUES (?, ?, ?, ?, ?)`,
      [s.numero_sala, s.capacidad_maxima, s.tipo_proyeccion, s.tecnologia_sonido, s.es_vip]
    );
    const idSala = resultado.insertId;
    idsPorNumero[s.numero_sala] = idSala;

    for (let f = 0; f < s.filas; f++) {
      const fila = letraDeFila(f);
      const esFilaPreferencial = !s.es_vip && f >= s.filas - 2;

      for (let n = 1; n <= s.asientos_por_fila; n++) {
        const tipoAsiento = s.es_vip ? "vip" : esFilaPreferencial ? "preferencial" : "estandar";
        const fueraDeServicio = hashAsiento(`${idSala}-${fila}${n}`) % 25 === 0;
        await pool.query(
          "INSERT INTO asientos (id_sala, fila, numero, tipo_asiento, estado_fisico) VALUES (?, ?, ?, ?, ?)",
          [idSala, fila, n, tipoAsiento, fueraDeServicio ? "mantenimiento" : "operativo"]
        );
      }
    }
  }
  return idsPorNumero;
}

async function sembrarPeliculas(idsClasificacion) {
  const idsPorTitulo = {};
  for (const p of PELICULAS) {
    const [resultado] = await pool.query(
      `INSERT INTO peliculas
        (titulo_original, titulo_local, sinopsis, duracion_minutos, director, estudio_productor,
         fecha_estreno_nacional, id_clasificacion, poster_url, genero, destacada)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.titulo_original, p.titulo_local, p.sinopsis, p.duracion_minutos, p.director, p.estudio_productor,
        p.fecha_estreno_nacional, idsClasificacion[p.codigoClasificacion], p.poster_url, p.genero, p.destacada,
      ]
    );
    idsPorTitulo[p.titulo_local] = resultado.insertId;
  }
  return idsPorTitulo;
}

async function sembrarFunciones(idsPelicula, idsSala) {
  const hoy = new Date();
  const manana = new Date();
  manana.setDate(hoy.getDate() + 1);

  for (const fecha of [hoy, manana]) {
    for (const plantilla of PLANTILLAS_FUNCIONES) {
      const idPelicula = idsPelicula[plantilla.tituloLocal];
      const idSala = idsSala[plantilla.numeroSala];
      const pelicula = PELICULAS.find((p) => p.titulo_local === plantilla.tituloLocal);

      for (const hora of plantilla.horas) {
        const [h, m] = hora.split(":").map(Number);
        const inicio = new Date(fecha);
        inicio.setHours(h, m, 0, 0);
        const fin = new Date(inicio.getTime() + (pelicula.duracion_minutos + 20) * 60000);

        // Hora LOCAL (no toISOString, que convierte a UTC): si se guardara en
        // UTC, las funciones de la noche "hoy" quedarían fechadas como "mañana"
        // y no aparecerían en la cartelera de hoy.
        const formatoSql = (d) => {
          const pad = (n) => String(n).padStart(2, "0");
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
        };

        await pool.query(
          `INSERT INTO funciones (id_pelicula, id_sala, fecha_hora_inicio, fecha_hora_fin, idioma_audio, precio_base)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [idPelicula, idSala, formatoSql(inicio), formatoSql(fin), plantilla.idioma_audio, plantilla.precio_base]
        );
      }
    }
  }
}

async function main() {
  console.log("Limpiando tablas...");
  await limpiarTablas();

  console.log("Sembrando clasificaciones...");
  const idsClasificacion = await sembrarClasificaciones();

  console.log("Sembrando salas y asientos...");
  const idsSala = await sembrarSalasYAsientos();

  console.log("Sembrando películas...");
  const idsPelicula = await sembrarPeliculas(idsClasificacion);

  console.log("Sembrando funciones (hoy y mañana)...");
  await sembrarFunciones(idsPelicula, idsSala);

  console.log("Listo ✔");
  await pool.end();
}

main().catch((err) => {
  console.error("Error sembrando datos:", err);
  process.exit(1);
});
