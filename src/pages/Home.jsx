import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCatalogo } from "../context/CatalogoContext.jsx";
import { api } from "../api/client.js";
import { formatearDuracion } from "../utils/format.js";
import PosterCard from "../components/PosterCard.jsx";
import ProgramList from "../components/ProgramList.jsx";
import Badge from "../components/Badge.jsx";
import styles from "./Home.module.css";

function HeroDestacado({ pelicula, clasificacion }) {
  const [errorImagen, setErrorImagen] = useState(false);

  return (
    <section className={styles.hero}>
      <div>
        <p className="label-md text-gold">Estreno de la semana</p>
        <h1 className="display-xl" style={{ marginTop: "0.75rem", marginBottom: "1.25rem" }}>
          {pelicula.titulo_local}
        </h1>
        <p className={`body-lg text-secondary ${styles.heroSynopsis}`}>{pelicula.sinopsis}</p>
        <div className={styles.heroBadges}>
          {clasificacion && <Badge variant="prestige">{clasificacion.codigo}</Badge>}
          <Badge>{pelicula.genero}</Badge>
          <Badge>{formatearDuracion(pelicula.duracion_minutos)}</Badge>
        </div>
        <Link to={`/pelicula/${pelicula.id_pelicula}`} className={`label-md ${styles.ctaGhost}`}>
          Ver funciones
        </Link>
      </div>

      <div className={styles.heroFrame}>
        {!errorImagen && (
          <img
            src={pelicula.poster_url}
            alt={`Imagen de ${pelicula.titulo_local}`}
            className={styles.heroImg}
            onError={() => setErrorImagen(true)}
          />
        )}
        {errorImagen && (
          <div className={styles.heroFallback}>
            <span className="display-xl text-muted">{pelicula.titulo_local.charAt(0)}</span>
            <span className="body-sm text-muted">{pelicula.titulo_local}</span>
          </div>
        )}
      </div>
    </section>
  );
}

export default function Home() {
  const { peliculas, salas, cargando, error, getClasificacionById } = useCatalogo();
  const [funcionesHoy, setFuncionesHoy] = useState([]);
  const [cargandoFunciones, setCargandoFunciones] = useState(true);

  useEffect(() => {
    api
      .getFunciones({ hoy: true })
      .then(setFuncionesHoy)
      .catch(() => setFuncionesHoy([]))
      .finally(() => setCargandoFunciones(false));
  }, []);

  if (cargando) {
    return (
      <div className="container-wide" style={{ padding: "4rem 0" }}>
        <p className="body-md text-muted">Cargando cartelera…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-wide" style={{ padding: "4rem 0" }}>
        <p className="body-md text-gold">No pudimos conectar con la API ({error}).</p>
        <p className="body-sm text-muted" style={{ marginTop: "0.5rem" }}>
          Verifica que el backend esté corriendo en la URL de VITE_API_URL.
        </p>
      </div>
    );
  }

  const destacada = peliculas.find((p) => p.destacada) || peliculas[0];

  return (
    <>
      {destacada && (
        <div className="container-wide">
          <HeroDestacado pelicula={destacada} clasificacion={getClasificacionById(destacada.id_clasificacion)} />
        </div>
      )}

      <div className={`container-wide ${styles.section}`}>
        <div className={styles.sectionHeading}>
          <h2 className="headline-lg">En cartelera</h2>
          <span className="body-sm text-muted">{peliculas.length} títulos</span>
        </div>
        <div className={styles.grillaPeliculas}>
          {peliculas.map((pelicula) => (
            <PosterCard key={pelicula.id_pelicula} pelicula={pelicula} />
          ))}
        </div>
      </div>

      <div className={`container ${styles.section}`}>
        <div className={styles.sectionHeading}>
          <h2 className="headline-lg">Programación de hoy</h2>
        </div>
        {cargandoFunciones ? (
          <p className="body-md text-muted">Cargando funciones…</p>
        ) : (
          <ProgramList funciones={funcionesHoy} mostrarTitulo />
        )}
      </div>

      <div id="salas" className={`container-wide ${styles.section}`}>
        <div className={styles.sectionHeading}>
          <h2 className="headline-lg">Nuestras salas</h2>
        </div>
        <div className={styles.grillaSalas}>
          {salas.map((sala) => (
            <div key={sala.id_sala} className={styles.salaCard}>
              <div className={styles.salaHead}>
                <span className="headline-sm">Sala {sala.numero_sala}</span>
                {Boolean(sala.es_vip) && <Badge variant="prestige">VIP</Badge>}
              </div>
              <div className={`body-sm text-secondary ${styles.salaSpecs}`}>
                <span>{sala.tipo_proyeccion} · {sala.tecnologia_sonido}</span>
                <span>{sala.capacidad_maxima} asientos</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
