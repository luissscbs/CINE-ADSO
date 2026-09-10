import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCatalogo } from "../context/CatalogoContext.jsx";
import { api } from "../api/client.js";
import { formatearDuracion } from "../utils/format.js";
import PosterCard from "../components/PosterCard.jsx";
import ProgramList from "../components/ProgramList.jsx";
import ProximamenteGrid from "../components/ProximamenteSection.jsx";
import TrailerModal from "../components/TrailerModal.jsx";
import Badge from "../components/Badge.jsx";
import { etiquetaClasificacion } from "../utils/clasificacion.js";
import { PROXIMAMENTE } from "../data/proximamente.js";
import styles from "./Home.module.css";

const AUTOPLAY_MS = 6000;

function HeroCarrusel({ peliculas, getClasificacionById, onVerTrailer }) {
  const n = peliculas.length;
  const [indice, setIndice] = useState(0);
  const [auto, setAuto] = useState(true);
  const [pausado, setPausado] = useState(false);
  const [imagenRota, setImagenRota] = useState({});
  const viewportRef = useRef(null);
  const primeraVez = useRef(true);
  const animRef = useRef(0);

  const ir = (i) => setIndice(((i % n) + n) % n);

  // Autoplay: avanza solo; se reinicia con cada cambio manual.
  useEffect(() => {
    if (!auto || pausado || n < 2) return;
    const temporizador = window.setInterval(() => setIndice((i) => (i + 1) % n), AUTOPLAY_MS);
    return () => window.clearInterval(temporizador);
  }, [auto, pausado, n, indice]);

  // Centra el slide activo con animación rápida (coverflow, ~380ms).
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp || n === 0) return;
    const slide = vp.querySelector(`[data-slide="${indice % n}"]`);
    if (!slide) return;
    const objetivo = slide.offsetLeft - (vp.clientWidth - slide.clientWidth) / 2;
    if (primeraVez.current) {
      vp.scrollLeft = objetivo;
      primeraVez.current = false;
      return;
    }
    window.cancelAnimationFrame(animRef.current);
    const inicio = vp.scrollLeft;
    const distancia = objetivo - inicio;
    if (Math.abs(distancia) < 1) {
      vp.scrollLeft = objetivo;
      return;
    }
    const t0 = performance.now();
    const DURACION = 380;
    function paso(t) {
      const p = Math.min((t - t0) / DURACION, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      vp.scrollLeft = inicio + distancia * ease;
      if (p < 1) animRef.current = window.requestAnimationFrame(paso);
    }
    animRef.current = window.requestAnimationFrame(paso);
    return () => window.cancelAnimationFrame(animRef.current);
  }, [indice, n]);

  if (n === 0) return null;
  const pelicula = peliculas[indice % n];
  const clasificacion = getClasificacionById(pelicula.id_clasificacion);

  return (
    <section
      className={styles.carrusel}
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      aria-roledescription="carrusel"
      aria-label="Películas destacadas"
    >
      <div className={styles.viewport} ref={viewportRef}>
        <div className={styles.track}>
          {peliculas.map((p, i) => {
            const activa = i === indice % n;
            const sinFoto = imagenRota[p.id_pelicula];
            return (
              <div
                key={p.id_pelicula}
                data-slide={i}
                className={`${styles.slide} ${activa ? styles.slideActiva : ""}`}
                onClick={() => (activa ? onVerTrailer(p) : ir(i))}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (activa) onVerTrailer(p);
                    else ir(i);
                  }
                }}
                aria-label={activa ? `Ver tráiler de ${p.titulo_local}` : `Ir a ${p.titulo_local}`}
                title={activa ? "Ver tráiler en español latino" : p.titulo_local}
              >
                {!sinFoto && (p.backdrop_url || p.poster_url) ? (
                  <img
                    src={p.backdrop_url || p.poster_url}
                    alt=""
                    className={styles.foto}
                    draggable={false}
                    onError={() => setImagenRota((actual) => ({ ...actual, [p.id_pelicula]: true }))}
                  />
                ) : (
                  <div className={styles.fotoFallback}>
                    <span className="display-xl text-muted">{p.titulo_local.charAt(0)}</span>
                  </div>
                )}
                <span className={styles.slideTitulo}>{p.titulo_local}</span>
                {activa && (
                  <span className={styles.playHint}>
                    <span className="material-symbols-outlined">play_circle</span>
                    Ver tráiler latino
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.carruselInfo}>
        <div>
        <p className="label-md text-gold">
          {pelicula.genero} · {formatearDuracion(pelicula.duracion_minutos)}
        </p>
        <h1 className="display-xl" style={{ marginTop: "0.5rem" }}>
          {pelicula.titulo_local}
        </h1>
          <div className={styles.heroBadges}>
            {clasificacion && <Badge variant="prestige">{etiquetaClasificacion(clasificacion)}</Badge>}
            <Badge>{pelicula.genero}</Badge>
          </div>
        <div className={styles.carruselAcciones}>
          <Link to={`/pelicula/${pelicula.id_pelicula}`} className={`label-md ${styles.ctaGhost}`}>
            Ver funciones
          </Link>
          <button
            type="button"
            className={`label-md ${styles.ctaTrailer}`}
            onClick={() => onVerTrailer(pelicula)}
          >
            Ver tráiler
          </button>
        </div>
        </div>

        {n > 1 && (
          <div className={styles.controles}>
            <button
              type="button"
              className={styles.controlBoton}
              onClick={() => ir(indice - 1)}
              aria-label="Película anterior"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <div className={styles.puntos}>
              {peliculas.map((p, i) => (
                <button
                  key={p.id_pelicula}
                  type="button"
                  className={`${styles.punto} ${i === indice % n ? styles.puntoActivo : ""}`}
                  onClick={() => ir(i)}
                  aria-label={`Ir a ${p.titulo_local}`}
                />
              ))}
            </div>
            <button
              type="button"
              className={styles.controlBoton}
              onClick={() => ir(indice + 1)}
              aria-label="Película siguiente"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
            <button
              type="button"
              className={styles.controlBoton}
              onClick={() => setAuto((v) => !v)}
              aria-label={auto ? "Pausar animación" : "Reanudar animación"}
              title={auto ? "Pausar animación" : "Reanudar animación"}
            >
              <span className="material-symbols-outlined">{auto ? "pause" : "play_arrow"}</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default function Home() {
  const { peliculas, cargando, error, getClasificacionById } = useCatalogo();
  const [funcionesHoy, setFuncionesHoy] = useState([]);
  const [cargandoFunciones, setCargandoFunciones] = useState(true);
  const [trailerPelicula, setTrailerPelicula] = useState(null);
  const [params, fijarParams] = useSearchParams();
  const [tab, setTab] = useState(params.get("tab") === "proximamente" ? "proximamente" : "cartelera");

  useEffect(() => {
    const t = params.get("tab");
    if (t === "proximamente" || t === "cartelera") setTab(t);
  }, [params]);

  function cambiarTab(nuevo) {
    setTab(nuevo);
    fijarParams(nuevo === "cartelera" ? {} : { tab: nuevo }, { replace: true });
  }

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

  // Destacadas primero y hasta 5: así el carrusel siempre tiene con qué rotar.
  const carrusel = [...peliculas]
    .sort((a, b) => Number(b.destacada || 0) - Number(a.destacada || 0))
    .slice(0, 5);

  return (
    <>
      {carrusel.length > 0 && (
        <div className="container-wide">
          <HeroCarrusel
            peliculas={carrusel}
            getClasificacionById={getClasificacionById}
            onVerTrailer={setTrailerPelicula}
          />
        </div>
      )}
      {trailerPelicula && (
        <TrailerModal pelicula={trailerPelicula} onCerrar={() => setTrailerPelicula(null)} />
      )}

      <div id="cartelera" className={`container-wide ${styles.section} ${styles.cartelera}`}>
        <div className={styles.tabs} role="tablist" aria-label="Cartelera o próximos estrenos">
          <span
            aria-hidden="true"
            className={`${styles.tabIndicador} ${tab === "proximamente" ? styles.tabIndicadorDer : ""}`}
          />
          <button
            type="button"
            role="tab"
            aria-selected={tab === "cartelera"}
            className={tab === "cartelera" ? styles.tabActiva : styles.tab}
            onClick={() => cambiarTab("cartelera")}
          >
            Cartelera
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "proximamente"}
            className={tab === "proximamente" ? styles.tabActiva : styles.tab}
            onClick={() => cambiarTab("proximamente")}
          >
            Próximamente
          </button>
        </div>

        {tab === "cartelera" ? (
          <>
            <div className={styles.sectionHeading}>
              <h2 className="headline-lg">En cartelera</h2>
              <span className="body-sm text-muted">{peliculas.length} títulos</span>
            </div>
            <div className={styles.grillaPeliculas}>
              {peliculas.map((pelicula) => (
                <PosterCard key={pelicula.id_pelicula} pelicula={pelicula} />
              ))}
            </div>
          </>
        ) : (
          <>
            <div className={styles.sectionHeading}>
              <h2 className="headline-lg">Próximos estrenos</h2>
              <span className="body-sm text-muted">{PROXIMAMENTE.length} estrenos</span>
            </div>
            <ProximamenteGrid />
          </>
        )}
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

    </>
  );
}
