import { useState } from "react";
import { Link } from "react-router-dom";
import { useCatalogo } from "../context/CatalogoContext.jsx";
import { formatearDuracion } from "../utils/format.js";
import { etiquetaClasificacion } from "../utils/clasificacion.js";
import Badge from "./Badge.jsx";
import styles from "./PosterCard.module.css";

export default function PosterCard({ pelicula }) {
  const [errorImagen, setErrorImagen] = useState(false);
  const { getClasificacionById } = useCatalogo();
  const clasificacion = getClasificacionById(pelicula.id_clasificacion);

  return (
    <Link to={`/pelicula/${pelicula.id_pelicula}`} className={styles.card}>
      <div className={styles.posterWrap}>
        {!errorImagen && (
          <img
            src={pelicula.poster_url}
            alt={`Póster de ${pelicula.titulo_local}`}
            className={styles.poster}
            onError={() => setErrorImagen(true)}
          />
        )}
        {errorImagen && (
          <div className={styles.fallback}>
            <span className={styles.fallbackInitial}>{pelicula.titulo_local.charAt(0)}</span>
            <span className="body-sm text-muted">{pelicula.titulo_local}</span>
          </div>
        )}
        <div className={styles.overlay}>
          <span className={`label-sm ${styles.overlayAction}`}>Ver funciones</span>
        </div>
      </div>

      <div className={styles.meta}>
        <h3 className="headline-sm">{pelicula.titulo_local}</h3>
        <p className="body-sm text-secondary">
          {new Date(pelicula.fecha_estreno_nacional).getFullYear()} · {pelicula.director} · {formatearDuracion(pelicula.duracion_minutos)}
        </p>
        <div className={styles.metaBadges}>
          {clasificacion && <Badge>{etiquetaClasificacion(clasificacion)}</Badge>}
          {Boolean(pelicula.destacada) && <Badge variant="prestige">Estreno</Badge>}
        </div>
      </div>
    </Link>
  );
}
