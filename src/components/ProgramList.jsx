import { useState } from "react";
import { Link } from "react-router-dom";
import { useCatalogo } from "../context/CatalogoContext.jsx";
import { formatearFecha, formatearHora, formatearPrecio } from "../utils/format.js";
import Badge from "./Badge.jsx";
import styles from "./ProgramList.module.css";

function agruparPorDia(funciones) {
  const grupos = new Map();
  funciones.forEach((funcion) => {
    const etiqueta = formatearFecha(funcion.fecha_hora_inicio);
    if (!grupos.has(etiqueta)) grupos.set(etiqueta, []);
    grupos.get(etiqueta).push(funcion);
  });
  return grupos;
}

function MiniPoster({ pelicula }) {
  const [errorImagen, setErrorImagen] = useState(false);

  if (!pelicula) return null;

  if (errorImagen) {
    return (
      <div className={styles.posterFallback} aria-hidden="true">
        <span className="label-sm">{pelicula.titulo_local.charAt(0)}</span>
      </div>
    );
  }

  return (
    <img
      src={pelicula.poster_url}
      alt=""
      className={styles.poster}
      onError={() => setErrorImagen(true)}
    />
  );
}

export default function ProgramList({ funciones, mostrarTitulo = false }) {
  const { getSalaById, getPeliculaById } = useCatalogo();

  if (funciones.length === 0) {
    return <p className="body-md text-muted">No hay funciones programadas por ahora.</p>;
  }

  const grupos = agruparPorDia(funciones);

  return (
    <div>
      {Array.from(grupos.entries()).map(([dia, funcionesDelDia]) => (
        <div key={dia} className={styles.grupo}>
          <p className={`label-md ${styles.grupoLabel}`}>{dia}</p>
          <div className={styles.lista}>
            {funcionesDelDia.map((funcion) => {
              const sala = getSalaById(funcion.id_sala);
              const pelicula = getPeliculaById(funcion.id_pelicula);
              if (!sala) return null;
              return (
                <Link key={funcion.id_funcion} to={`/asientos/${funcion.id_funcion}`} className={styles.fila}>
                  <span className={`body-md ${styles.hora}`}>{formatearHora(funcion.fecha_hora_inicio)}</span>
                  <MiniPoster pelicula={pelicula} />
                  <span className={styles.detalle}>
                    {pelicula && mostrarTitulo && (
                      <span className={`body-md ${styles.titulo}`}>{pelicula.titulo_local}</span>
                    )}
                    <span className={styles.meta}>
                      <Badge>Sala {sala.numero_sala}</Badge>
                      <Badge>{sala.tipo_proyeccion}</Badge>
                      <span className="body-sm text-secondary">{funcion.idioma_audio}</span>
                    </span>
                  </span>
                  <span className={`body-md ${styles.precio}`}>{formatearPrecio(funcion.precio_base)}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}