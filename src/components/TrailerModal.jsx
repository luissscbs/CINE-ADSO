import { useEffect } from "react";
import { TRAILERS_LATINO, urlBusquedaTrailer } from "../data/trailers.js";
import styles from "./TrailerModal.module.css";

export default function TrailerModal({ pelicula, onCerrar }) {
  useEffect(() => {
    function manejarTecla(e) {
      if (e.key === "Escape") onCerrar();
    }
    document.addEventListener("keydown", manejarTecla);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", manejarTecla);
      document.body.style.overflow = "";
    };
  }, [onCerrar]);

  if (!pelicula) return null;
  const videoId = TRAILERS_LATINO[pelicula.titulo_local];

  return (
    <div className={styles.fondo} onClick={onCerrar} role="dialog" aria-modal="true" aria-label={`Tráiler de ${pelicula.titulo_local}`}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.encabezado}>
          <span className="body-sm text-secondary">
            {pelicula.titulo_local} · Tráiler en español latino
          </span>
          <button type="button" className={styles.cerrar} onClick={onCerrar} aria-label="Cerrar tráiler">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {videoId ? (
          <div className={styles.video}>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
              title={`Tráiler de ${pelicula.titulo_local}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className={styles.sinVideo}>
            <p className="body-md text-secondary">
              Aún no tenemos el tráiler latino de esta película.
            </p>
            <a
              className={`label-md ${styles.boton}`}
              href={urlBusquedaTrailer(pelicula.titulo_local)}
              target="_blank"
              rel="noreferrer"
            >
              Buscar en YouTube
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
