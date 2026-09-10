import { useState } from "react";
import { PROXIMAMENTE } from "../data/proximamente.js";
import Badge from "./Badge.jsx";
import styles from "./ProximamenteSection.module.css";

// Grilla de próximos estrenos con el mismo formato de cards que Cartelera.
// Se usa dentro de las pestañas Cartelera | Próximamente del home.
export default function ProximamenteGrid() {
  const [posterRoto, setPosterRoto] = useState({});

  return (
    <div className={styles.grilla}>
      {PROXIMAMENTE.map((pelicula) => (
        <article key={pelicula.id} className={styles.card}>
          <div className={styles.posterWrap}>
            {pelicula.poster && !posterRoto[pelicula.id] ? (
              <img
                src={pelicula.poster}
                alt={`Póster de ${pelicula.titulo}`}
                className={styles.poster}
                loading="lazy"
                onError={() => setPosterRoto((actual) => ({ ...actual, [pelicula.id]: true }))}
              />
            ) : (
              <div className={styles.fallback}>
                <span className={styles.fallbackInitial}>{pelicula.titulo.charAt(0)}</span>
                <span className="body-sm text-muted">{pelicula.titulo}</span>
              </div>
            )}
          </div>

          <div className={styles.meta}>
            <h3 className="headline-sm">{pelicula.titulo}</h3>
            <p className="body-sm text-secondary">
              {pelicula.fechaEstreno} · {pelicula.genero}
            </p>
            <div className={styles.metaBadges}>
              <Badge variant="prestige">Pronto</Badge>
              <Badge>{pelicula.genero}</Badge>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
