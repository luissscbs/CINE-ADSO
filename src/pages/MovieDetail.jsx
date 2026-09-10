import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCatalogo } from "../context/CatalogoContext.jsx";
import { api } from "../api/client.js";
import { formatearDuracion } from "../utils/format.js";
import { etiquetaClasificacion } from "../utils/clasificacion.js";
import Badge from "../components/Badge.jsx";
import ProgramList from "../components/ProgramList.jsx";
import TrailerModal from "../components/TrailerModal.jsx";
import styles from "./MovieDetail.module.css";

export default function MovieDetail() {
  const { id } = useParams();
  const [errorImagen, setErrorImagen] = useState(false);
  const { getPeliculaById, getClasificacionById, cargando: cargandoCatalogo } = useCatalogo();
  const [funciones, setFunciones] = useState([]);
  const [cargandoFunciones, setCargandoFunciones] = useState(true);
  const [verTrailer, setVerTrailer] = useState(false);

  const pelicula = getPeliculaById(id);

  useEffect(() => {
    setCargandoFunciones(true);
    api
      .getFunciones({ peliculaId: id })
      .then(setFunciones)
      .catch(() => setFunciones([]))
      .finally(() => setCargandoFunciones(false));
  }, [id]);

  if (cargandoCatalogo) {
    return (
      <div className="container" style={{ padding: "4rem 0" }}>
        <p className="body-md text-muted">Cargando…</p>
      </div>
    );
  }

  if (!pelicula) {
    return (
      <div className={`container ${styles.noEncontrada}`}>
        <h1 className="headline-lg text-gold">Esta función ya terminó</h1>
        <p className="body-md text-muted" style={{ margin: "0.75rem 0 1.5rem" }}>
          No encontramos esa película en la cartelera.
        </p>
        <Link to="/" className="body-md text-gold">
          Volver a la cartelera
        </Link>
      </div>
    );
  }

  const clasificacion = getClasificacionById(pelicula.id_clasificacion);

  return (
    <div className="container">
      <Link to="/" className={`body-sm ${styles.volver}`}>
        ← Volver a cartelera
      </Link>

      <div className={styles.layout}>
        <div className={styles.posterWrap}>
          {!errorImagen && (
            <img
              src={pelicula.poster_url}
              alt={`Póster de ${pelicula.titulo_local}`}
              className={styles.posterImg}
              onError={() => setErrorImagen(true)}
            />
          )}
          {errorImagen && (
            <div className={styles.posterFallback}>
              <span className="display-xl text-muted">{pelicula.titulo_local.charAt(0)}</span>
              <span className="body-sm text-muted">{pelicula.titulo_local}</span>
            </div>
          )}
        </div>

        <div>
          <p className="label-md text-gold">{pelicula.genero}</p>
          <h1 className="headline-lg" style={{ marginTop: "0.5rem" }}>{pelicula.titulo_local}</h1>
          <p className="body-sm text-muted" style={{ marginTop: "0.35rem" }}>
            Título original: {pelicula.titulo_original}
          </p>

          <div className={styles.badges}>
            {clasificacion && (
              <Badge variant="prestige">{etiquetaClasificacion(clasificacion)}</Badge>
            )}
            <Badge>{formatearDuracion(pelicula.duracion_minutos)}</Badge>
          </div>

          <div className={styles.acciones}>
            <button
              type="button"
              className={`label-md ${styles.botonTrailer}`}
              onClick={() => setVerTrailer(true)}
            >
              <span className="material-symbols-outlined">play_circle</span>
              Ver tráiler latino
            </button>
          </div>

          <p className={`body-lg text-secondary ${styles.sinopsis}`}>{pelicula.sinopsis}</p>

          <dl className={`body-md ${styles.datos}`}>
            <dt className={styles.datosLabel}>Director</dt>
            <dd>{pelicula.director}</dd>
            <dt className={styles.datosLabel}>Productora</dt>
            <dd>{pelicula.estudio_productor}</dd>
            <dt className={styles.datosLabel}>Estreno nacional</dt>
            <dd>
              {new Date(pelicula.fecha_estreno_nacional).toLocaleDateString("es-CO", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </dd>
          </dl>
        </div>
      </div>

      <section className={styles.funcionesSection}>
        <h2 className={`headline-md ${styles.funcionesHeading}`}>Funciones disponibles</h2>
        {cargandoFunciones ? (
          <p className="body-md text-muted">Cargando funciones…</p>
        ) : (
          <ProgramList funciones={funciones} />
        )}
      </section>

      {verTrailer && <TrailerModal pelicula={pelicula} onCerrar={() => setVerTrailer(false)} />}
    </div>
  );
}
