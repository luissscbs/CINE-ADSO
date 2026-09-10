// Tráilers oficiales en español latino / doblados (YouTube).
// Clave: titulo_local de la película en BD. Verificados por oEmbed.
export const TRAILERS_LATINO = {
  "La Guerra de los Últimos": "8E1pkrmZQ0o",
  "La Odisea": "7GxoGRGkhBQ",
  "Coyote vs. ACME": "2xSRAnHGKHI",
  "La Noche del Demonio: Están Entre Nosotros": "lJA355ncZD4",
  "Spider-Man: Un Nuevo Día": "YAfxu9voYLs",
  "El Heladero: Dulce Sabor a Muerte": "IKWvaj70a20",
  "Mi Vecino Totoro": "Pr8drhw55A4",
};

export function urlBusquedaTrailer(titulo) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${titulo} trailer español latino`
  )}`;
}
