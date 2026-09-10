// Etiqueta de clasificación en lenguaje para el público,
// sin códigos internos (TP, PG, B, C...).
export function etiquetaClasificacion(clasificacion) {
  if (!clasificacion) return null;
  const edad = Number(clasificacion.edad_minima) || 0;
  if (edad <= 0) return "Todo público";
  return `Mayores de ${edad} años`;
}
