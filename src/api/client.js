const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function solicitar(ruta, opciones) {
  const respuesta = await fetch(`${BASE_URL}${ruta}`, {
    headers: { "Content-Type": "application/json" },
    ...opciones,
  });

  const cuerpo = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    throw new Error(cuerpo?.error || `Error ${respuesta.status} al consultar ${ruta}`);
  }
  return cuerpo;
}

export const api = {
  getClasificaciones: () => solicitar("/clasificaciones"),
  getSalas: () => solicitar("/salas"),
  getAsientosDeSala: (idSala) => solicitar(`/salas/${idSala}/asientos`),
  getPeliculas: () => solicitar("/peliculas"),
  getPelicula: (id) => solicitar(`/peliculas/${id}`),
  getFunciones: ({ peliculaId, hoy } = {}) => {
    const params = new URLSearchParams();
    if (peliculaId) params.set("pelicula_id", peliculaId);
    if (hoy) params.set("hoy", "true");
    const query = params.toString() ? `?${params.toString()}` : "";
    return solicitar(`/funciones${query}`);
  },
  getFuncion: (id) => solicitar(`/funciones/${id}`),
  getAsientosOcupados: (idFuncion) => solicitar(`/funciones/${idFuncion}/ocupados`),
  crearVenta: (payload) =>
    solicitar("/ventas", { method: "POST", body: JSON.stringify(payload) }),
};
