import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { useCarrito } from "../context/CarritoContext.jsx";
import { formatearPrecio } from "../utils/format.js";
import styles from "./DulceriaSection.module.css";

const ICONOS_CATEGORIA = {
  crispetas: "popcorn",
  bebidas: "local_drink",
  comida: "fastfood",
  combos: "lunch_dining",
  dulces: "candy",
};

export default function DulceriaSection() {
  const { agregar } = useCarrito();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [agregadoId, setAgregadoId] = useState(null);
  const [imagenRota, setImagenRota] = useState({});

  useEffect(() => {
    let cancelado = false;
    api
      .getProductos()
      .then((res) => {
        if (!cancelado) setProductos(res);
      })
      .catch(() => {
        if (!cancelado) setProductos([]);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  function manejarAgregar(producto) {
    agregar(producto);
    setAgregadoId(producto.id_producto);
    window.setTimeout(() => setAgregadoId(null), 1200);
  }

  return (
    <div id="dulceria" className={`container-wide ${styles.bloque}`}>
      <div className={styles.encabezado}>
        <div>
          <p className="label-md text-gold">Crispetas, bebidas y combos</p>
          <h2 className="headline-lg" style={{ marginTop: "0.5rem" }}>
            Dulcería
          </h2>
        </div>
        <span className="body-sm text-muted">Arma tu combo y págala con tus boletos o sola</span>
      </div>

      {cargando ? (
        <p className="body-md text-muted">Cargando dulcería…</p>
      ) : productos.length === 0 ? (
        <p className="body-md text-muted">La dulcería no está disponible por ahora.</p>
      ) : (
        <div className={styles.grilla}>
          {productos.map((producto) => (
            <div key={producto.id_producto} className={styles.card}>
              {producto.imagen_url && !imagenRota[producto.id_producto] ? (
                <img
                  src={producto.imagen_url}
                  alt={producto.nombre}
                  className={styles.foto}
                  loading="lazy"
                  onError={() =>
                    setImagenRota((actual) => ({ ...actual, [producto.id_producto]: true }))
                  }
                />
              ) : (
                <span className={`material-symbols-outlined ${styles.icono}`}>
                  {ICONOS_CATEGORIA[producto.categoria] || "shopping_bag"}
                </span>
              )}
              <div className={styles.info}>
                <span className="headline-sm">{producto.nombre}</span>
                {producto.descripcion && (
                  <span className="body-sm text-secondary">{producto.descripcion}</span>
                )}
                <span className={`body-md ${styles.precio}`}>
                  {formatearPrecio(producto.precio)}
                </span>
              </div>
              <button
                type="button"
                className={styles.boton}
                onClick={() => manejarAgregar(producto)}
              >
                {agregadoId === producto.id_producto ? "¡Agregado!" : "Agregar"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
