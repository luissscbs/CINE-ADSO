import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";

const CatalogoContext = createContext(null);

export function CatalogoProvider({ children }) {
  const [clasificaciones, setClasificaciones] = useState([]);
  const [salas, setSalas] = useState([]);
  const [peliculas, setPeliculas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelado = false;

    Promise.all([api.getClasificaciones(), api.getSalas(), api.getPeliculas()])
      .then(([clasificacionesRes, salasRes, peliculasRes]) => {
        if (cancelado) return;
        setClasificaciones(clasificacionesRes);
        setSalas(salasRes);
        setPeliculas(peliculasRes);
      })
      .catch((err) => {
        if (!cancelado) setError(err.message);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const valor = useMemo(() => {
    const clasificacionesPorId = new Map(clasificaciones.map((c) => [c.id_clasificacion, c]));
    const salasPorId = new Map(salas.map((s) => [s.id_sala, s]));
    const peliculasPorId = new Map(peliculas.map((p) => [p.id_pelicula, p]));

    return {
      clasificaciones,
      salas,
      peliculas,
      cargando,
      error,
      getClasificacionById: (id) => clasificacionesPorId.get(Number(id)),
      getSalaById: (id) => salasPorId.get(Number(id)),
      getPeliculaById: (id) => peliculasPorId.get(Number(id)),
    };
  }, [clasificaciones, salas, peliculas, cargando, error]);

  return <CatalogoContext.Provider value={valor}>{children}</CatalogoContext.Provider>;
}

export function useCatalogo() {
  const contexto = useContext(CatalogoContext);
  if (!contexto) throw new Error("useCatalogo debe usarse dentro de <CatalogoProvider>");
  return contexto;
}
