// Los asientos ya no se generan en el cliente: ahora vienen de la API
// (GET /api/salas/:id/asientos), que es la fuente de verdad para
// tipo_asiento y estado_fisico. Aquí solo queda el cálculo de precio,
// que sigue siendo responsabilidad del front en este demo (en un backend
// de producción también se validaría del lado del servidor antes de
// registrar la venta).
export function calcularPrecioAsiento(funcion, tipoAsiento) {
  const factor = tipoAsiento === "vip" || tipoAsiento === "preferencial" ? 1.15 : 1;
  return Math.round((funcion.precio_base * factor) / 100) * 100;
}
