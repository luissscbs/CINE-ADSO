import styles from "./SeatMap.module.css";

function claseEstado(asiento, estaOcupado, estaSeleccionado) {
  if (asiento.estado_fisico === "mantenimiento") return styles.asientoMantenimiento;
  if (estaOcupado) return styles.asientoOcupado;
  if (estaSeleccionado) return styles.asientoSeleccionado;
  if (asiento.tipo_asiento !== "estandar") return styles.asientoPreferencial;
  return styles.asientoDisponible;
}

export default function SeatMap({ asientos, ocupados, seleccionados, onToggle }) {
  const filas = [...new Set(asientos.map((a) => a.fila))];
  const porFilaLength = asientos.length / filas.length;
  const mitad = Math.ceil(porFilaLength / 2);

  return (
    <div>
      <div className={styles.pantallaWrap}>
        <div className={styles.pantallaLinea} />
        <span className={`label-sm ${styles.pantallaLabel}`}>Pantalla</span>
      </div>

      <div className={styles.mapa}>
        {filas.map((fila) => {
          const asientosDeFila = asientos.filter((a) => a.fila === fila);
          return (
            <div key={fila} className={styles.fila}>
              <span className={`body-sm ${styles.filaEtiqueta}`}>{fila}</span>
              <div
                className={styles.asientosFila}
                style={{ gridTemplateColumns: `repeat(${asientosDeFila.length}, minmax(0, 1fr))` }}
              >
                {asientosDeFila.map((asiento) => {
                  const clave = `${asiento.fila}${asiento.numero}`;
                  const estaOcupado = ocupados.has(clave);
                  const estaSeleccionado = seleccionados.has(asiento.id_asiento);
                  const deshabilitado = estaOcupado || asiento.estado_fisico === "mantenimiento";
                  const etiquetaEstado =
                    asiento.estado_fisico === "mantenimiento"
                      ? "fuera de servicio"
                      : estaOcupado
                      ? "ocupado"
                      : estaSeleccionado
                      ? "seleccionado"
                      : "disponible";

                  return (
                    <button
                      key={asiento.id_asiento}
                      type="button"
                      className={`${styles.asiento} ${claseEstado(asiento, estaOcupado, estaSeleccionado)}`}
                      data-mitad={asiento.numero === mitad}
                      disabled={deshabilitado}
                      aria-label={`Asiento ${clave}, ${etiquetaEstado}`}
                      onClick={() => onToggle(asiento)}
                    >
                      {asiento.numero}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.leyenda}>
        <span className={`label-sm ${styles.leyendaItem}`}>
          <span className={`${styles.leyendaSwatch} ${styles.asientoDisponible}`} />
          Disponible
        </span>
        <span className={`label-sm ${styles.leyendaItem}`}>
          <span className={`${styles.leyendaSwatch} ${styles.asientoPreferencial}`} />
          Preferencial / VIP
        </span>
        <span className={`label-sm ${styles.leyendaItem}`}>
          <span className={`${styles.leyendaSwatch} ${styles.asientoSeleccionado}`} />
          Seleccionado
        </span>
        <span className={`label-sm ${styles.leyendaItem}`}>
          <span className={`${styles.leyendaSwatch} ${styles.asientoOcupado}`} />
          Ocupado
        </span>
        <span className={`label-sm ${styles.leyendaItem}`}>
          <span className={`${styles.leyendaSwatch} ${styles.asientoMantenimiento}`} />
          Fuera de servicio
        </span>
      </div>
    </div>
  );
}
