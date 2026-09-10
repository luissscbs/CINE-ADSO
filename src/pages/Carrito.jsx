import { useState } from "react";
import { Link } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api/client.js";
import { formatearPrecio } from "../utils/format.js";
import styles from "./Carrito.module.css";

const METODOS_PAGO = ["Tarjeta de crédito/débito", "PSE", "Efectivo en taquilla"];

export default function Carrito() {
  const { items, cambiarCantidad, quitar, vaciar, subtotal, vacio } = useCarrito();
  const { usuario } = useAuth();
  const [cliente, setCliente] = useState({
    nombres: usuario?.nombres || "",
    apellidos: usuario?.apellidos || "",
    email: usuario?.email || "",
  });
  const [metodoPago, setMetodoPago] = useState(METODOS_PAGO[0]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [confirmacion, setConfirmacion] = useState(null);

  function cambiarCliente(campo, valor) {
    setCliente((actual) => ({ ...actual, [campo]: valor }));
  }

  async function manejarComprar() {
    setError(null);
    if (!cliente.nombres.trim() || !cliente.apellidos.trim() || !/^\S+@\S+\.\S+$/.test(cliente.email.trim())) {
      setError("Completa nombres, apellidos y un correo válido para la compra.");
      return;
    }
    setEnviando(true);
    try {
      const resultado = await api.crearVentaDulceria({
        cliente: {
          nombres: cliente.nombres.trim(),
          apellidos: cliente.apellidos.trim(),
          email: cliente.email.trim(),
        },
        metodoPago,
        dulceria: items.map((i) => ({ id_producto: i.producto.id_producto, cantidad: i.cantidad })),
      });
      setConfirmacion(resultado);
      vaciar();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  if (confirmacion) {
    return (
      <div className={`container ${styles.contenedor}`}>
        <p className="label-md text-gold">Compra confirmada</p>
        <h1 className="headline-lg" style={{ marginTop: "0.5rem" }}>
          Dulcería lista
        </h1>
        <p className="body-md text-secondary" style={{ marginTop: "0.5rem" }}>
          Venta #{confirmacion.venta.id_venta} · Total {formatearPrecio(confirmacion.venta.monto_total)}
        </p>
        <div className={styles.recibo}>
          {confirmacion.dulceria.map((l) => (
            <div key={l.id_producto} className="body-sm">
              <span>
                {l.cantidad} × {l.nombre}
              </span>
              <span className="text-muted">{formatearPrecio(l.subtotal)}</span>
            </div>
          ))}
        </div>
        <Link to="/" className={`label-md ${styles.botonPrimario}`}>
          Volver a la cartelera
        </Link>
      </div>
    );
  }

  return (
    <div className={`container ${styles.contenedor}`}>
      <p className="label-md text-gold">Dulcería</p>
      <h1 className="headline-lg" style={{ marginTop: "0.5rem" }}>
        Tu carrito
      </h1>

      {vacio ? (
        <div style={{ marginTop: "1.5rem" }}>
          <p className="body-md text-muted">Tu carrito está vacío.</p>
          <Link to="/dulceria" className={`label-md ${styles.botonPrimario}`} style={{ marginTop: "1rem" }}>
            Ver dulcería
          </Link>
        </div>
      ) : (
        <>
          <div className={styles.lista}>
            {items.map(({ producto, cantidad }) => (
              <div key={producto.id_producto} className={styles.fila}>
                <div className={styles.filaInfo}>
                  <span className="headline-sm">{producto.nombre}</span>
                  <span className="body-sm text-muted">{formatearPrecio(producto.precio)} c/u</span>
                </div>
                <div className={styles.cantidad}>
                  <button type="button" onClick={() => cambiarCantidad(producto.id_producto, cantidad - 1)} aria-label="Quitar uno">
                    −
                  </button>
                  <span>{cantidad}</span>
                  <button type="button" onClick={() => cambiarCantidad(producto.id_producto, cantidad + 1)} aria-label="Agregar uno">
                    +
                  </button>
                </div>
                <span className="body-md">{formatearPrecio(Number(producto.precio) * cantidad)}</span>
                <button
                  type="button"
                  className={styles.quitar}
                  onClick={() => quitar(producto.id_producto)}
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>

          <p className="headline-sm" style={{ marginTop: "1.25rem" }}>
            Subtotal: {formatearPrecio(subtotal)}
          </p>
          <p className="body-sm text-muted" style={{ marginTop: "0.5rem" }}>
            También puedes pagar esta dulcería junto con tus boletos al elegir asientos: el carrito
            viaja contigo a la compra.
          </p>

          <div className={styles.form}>
            <label className={styles.campo}>
              <span className="label-sm text-secondary">Nombres</span>
              <input value={cliente.nombres} onChange={(e) => cambiarCliente("nombres", e.target.value)} />
            </label>
            <label className={styles.campo}>
              <span className="label-sm text-secondary">Apellidos</span>
              <input value={cliente.apellidos} onChange={(e) => cambiarCliente("apellidos", e.target.value)} />
            </label>
            <label className={styles.campo}>
              <span className="label-sm text-secondary">Correo</span>
              <input type="email" value={cliente.email} onChange={(e) => cambiarCliente("email", e.target.value)} />
            </label>
            <label className={styles.campo}>
              <span className="label-sm text-secondary">Método de pago</span>
              <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
                {METODOS_PAGO.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error && <p className={`body-sm ${styles.error}`}>{error}</p>}

          <div className={styles.acciones}>
            <button type="button" className={styles.botonSecundario} onClick={vaciar}>
              Vaciar
            </button>
            <button
              type="button"
              className={`label-md ${styles.botonPrimario}`}
              onClick={manejarComprar}
              disabled={enviando}
            >
              {enviando ? "Comprando…" : "Comprar solo dulcería"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
