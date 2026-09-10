import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CarritoContext = createContext(null);
const CLAVE_CARRITO = "cine-adso-carrito";

function cargarInicial() {
  try {
    const guardado = window.localStorage.getItem(CLAVE_CARRITO);
    const items = guardado ? JSON.parse(guardado) : [];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export function CarritoProvider({ children }) {
  const [items, setItems] = useState(cargarInicial);

  useEffect(() => {
    try {
      window.localStorage.setItem(CLAVE_CARRITO, JSON.stringify(items));
    } catch {
      // almacenamiento no disponible: el carrito vive solo en memoria
    }
  }, [items]);

  const valor = useMemo(() => {
    const cantidadTotal = items.reduce((suma, i) => suma + i.cantidad, 0);
    const subtotal = items.reduce((suma, i) => suma + Number(i.producto.precio) * i.cantidad, 0);

    return {
      items,
      cantidadTotal,
      subtotal,
      vacio: items.length === 0,
      agregar(producto, cantidad = 1) {
        setItems((actual) => {
          const existente = actual.find((i) => i.producto.id_producto === producto.id_producto);
          if (existente) {
            return actual.map((i) =>
              i.producto.id_producto === producto.id_producto
                ? { ...i, cantidad: i.cantidad + cantidad }
                : i
            );
          }
          return [...actual, { producto, cantidad }];
        });
      },
      quitar(idProducto) {
        setItems((actual) => actual.filter((i) => i.producto.id_producto !== idProducto));
      },
      cambiarCantidad(idProducto, cantidad) {
        if (cantidad < 1) return;
        setItems((actual) =>
          actual.map((i) =>
            i.producto.id_producto === idProducto ? { ...i, cantidad } : i
          )
        );
      },
      vaciar() {
        setItems([]);
      },
    };
  }, [items]);

  return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>;
}

export function useCarrito() {
  const contexto = useContext(CarritoContext);
  if (!contexto) throw new Error("useCarrito debe usarse dentro de <CarritoProvider>");
  return contexto;
}
