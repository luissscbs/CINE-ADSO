export function formatearPrecio(valor) {
  return "$" + Number(valor).toLocaleString("es-CO");
}

export function formatearFecha(fechaIso) {
  const fecha = new Date(fechaIso);
  const hoy = new Date();
  const manana = new Date();
  manana.setDate(hoy.getDate() + 1);

  const esMismoDia = (a, b) =>
    a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

  if (esMismoDia(fecha, hoy)) return "Hoy";
  if (esMismoDia(fecha, manana)) return "Mañana";

  return fecha.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "short" });
}

export function formatearHora(fechaIso) {
  return new Date(fechaIso).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export function formatearDuracion(minutos) {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${h}h ${m}min`;
}
