import { formatearPrecio } from "../utils/format.js";
import styles from "./PurchaseSummary.module.css";

const METODOS_PAGO = ["Tarjeta de crédito/débito", "PSE", "Efectivo en taquilla"];

export default function PurchaseSummary({
  asientosSeleccionados,
  cargoServicio,
  cliente,
  errores,
  metodoPago,
  onChangeCliente,
  onChangeMetodo,
  onConfirmar,
  limiteAlcanzado,
  limiteMax,
  enviando = false,
  errorEnvio = null,
  dulceria = [],
}) {
  const subtotalBoletos = asientosSeleccionados.reduce((suma, a) => suma + a.precio, 0);
  const subtotalDulceria = dulceria.reduce(
    (suma, i) => suma + Number(i.producto.precio) * i.cantidad,
    0
  );
  const subtotal = subtotalBoletos + subtotalDulceria;
  const cargo = Math.round(subtotal * cargoServicio);
  const total = subtotal + cargo;

  return (
    <aside className={styles.panel}>
      <h2 className="headline-sm">Tu selección</h2>

      <div className={styles.lista}>
        {asientosSeleccionados.length === 0 ? (
          <p className="body-sm text-muted">Ningún asiento seleccionado todavía.</p>
        ) : (
          [...asientosSeleccionados]
            .sort((a, b) => a.fila.localeCompare(b.fila) || a.numero - b.numero)
            .map((a) => (
              <div key={a.id_asiento} className={`body-sm ${styles.filaResumen}`}>
                <span>
                  {a.fila}{a.numero} {a.tipo_asiento !== "estandar" ? "· preferencial" : ""}
                </span>
                <span>{formatearPrecio(a.precio)}</span>
              </div>
            ))
        )}
        {dulceria.map((i) => (
          <div key={`dulceria-${i.producto.id_producto}`} className={`body-sm ${styles.filaResumen}`}>
            <span>
              {i.cantidad} × {i.producto.nombre}
            </span>
            <span>{formatearPrecio(Number(i.producto.precio) * i.cantidad)}</span>
          </div>
        ))}
      </div>

      <div className={`body-sm ${styles.totales}`}>
        <div className={styles.filaResumen}>
          <span className="text-secondary">Subtotal</span>
          <span>{formatearPrecio(subtotal)}</span>
        </div>
        <div className={styles.filaResumen}>
          <span className="text-secondary">Cargo por servicio</span>
          <span>{formatearPrecio(cargo)}</span>
        </div>
        <div className={styles.totalFinal}>
          <span>Total</span>
          <span>{formatearPrecio(total)}</span>
        </div>
      </div>

      <div className={styles.form}>
        <input
          type="text"
          placeholder="Nombres"
          value={cliente.nombres}
          onChange={(e) => onChangeCliente("nombres", e.target.value)}
          className={`${styles.input} ${errores.nombres ? styles.inputError : ""}`}
        />
        <input
          type="text"
          placeholder="Apellidos"
          value={cliente.apellidos}
          onChange={(e) => onChangeCliente("apellidos", e.target.value)}
          className={`${styles.input} ${errores.apellidos ? styles.inputError : ""}`}
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          value={cliente.email}
          onChange={(e) => onChangeCliente("email", e.target.value)}
          className={`${styles.input} ${errores.email ? styles.inputError : ""}`}
        />
        <select
          value={metodoPago}
          onChange={(e) => onChangeMetodo(e.target.value)}
          className={styles.select}
        >
          {METODOS_PAGO.map((metodo) => (
            <option key={metodo} value={metodo}>
              {metodo}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        className={styles.botonPrimario}
        disabled={asientosSeleccionados.length === 0 || enviando}
        onClick={onConfirmar}
      >
        {enviando
          ? "Procesando…"
          : asientosSeleccionados.length === 0
          ? "Selecciona al menos un asiento"
          : `Confirmar compra · ${formatearPrecio(total)}`}
      </button>

      {errorEnvio && <p className={`body-sm ${styles.avisoLimite}`}>{errorEnvio}</p>}
      {limiteAlcanzado && (
        <p className={`body-sm ${styles.avisoLimite}`}>Máximo {limiteMax} asientos por compra.</p>
      )}
    </aside>
  );
}
