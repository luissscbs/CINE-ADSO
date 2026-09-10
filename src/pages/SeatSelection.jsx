import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCatalogo } from "../context/CatalogoContext.jsx";
import { api } from "../api/client.js";
import { calcularPrecioAsiento } from "../utils/seats.js";
import { formatearFecha, formatearHora, formatearPrecio } from "../utils/format.js";
import SeatMap from "../components/SeatMap.jsx";
import PurchaseSummary from "../components/PurchaseSummary.jsx";
import styles from "./SeatSelection.module.css";

const LIMITE_ASIENTOS = 8;
const CARGO_SERVICIO = 0.08;
const CLIENTE_VACIO = { nombres: "", apellidos: "", email: "" };

export default function SeatSelection() {
  const { id } = useParams();
  const { getPeliculaById, getSalaById, cargando: cargandoCatalogo } = useCatalogo();

  const [funcion, setFuncion] = useState(null);
  const [asientos, setAsientos] = useState([]);
  const [ocupados, setOcupados] = useState(new Set());
  const [cargandoFuncion, setCargandoFuncion] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);

  const [seleccionados, setSeleccionados] = useState([]);
  const [cliente, setCliente] = useState(CLIENTE_VACIO);
  const [metodoPago, setMetodoPago] = useState("Tarjeta de crédito/débito");
  const [errores, setErrores] = useState({});
  const [limiteAlcanzado, setLimiteAlcanzado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState(null);
  const [confirmacion, setConfirmacion] = useState(null);

  // 1. función puntual
  useEffect(() => {
    setCargandoFuncion(true);
    setErrorCarga(null);
    api
      .getFuncion(id)
      .then(setFuncion)
      .catch((err) => setErrorCarga(err.message))
      .finally(() => setCargandoFuncion(false));
  }, [id]);

  const pelicula = funcion ? getPeliculaById(funcion.id_pelicula) : null;
  const sala = funcion ? getSalaById(funcion.id_sala) : null;

  // 2. asientos de la sala + asientos ya ocupados para esta función
  useEffect(() => {
    if (!funcion || !sala) return;
    Promise.all([api.getAsientosDeSala(sala.id_sala), api.getAsientosOcupados(funcion.id_funcion)])
      .then(([asientosRes, ocupadosRes]) => {
        setAsientos(asientosRes);
        setOcupados(new Set(ocupadosRes.map((o) => `${o.fila}${o.numero}`)));
      })
      .catch((err) => setErrorCarga(err.message));
  }, [funcion, sala]);

  const seleccionadosIds = useMemo(() => new Set(seleccionados.map((a) => a.id_asiento)), [seleccionados]);

  function manejarToggle(asiento) {
    const clave = `${asiento.fila}${asiento.numero}`;
    if (ocupados.has(clave) || asiento.estado_fisico === "mantenimiento") return;

    const yaSeleccionado = seleccionadosIds.has(asiento.id_asiento);
    if (yaSeleccionado) {
      setSeleccionados((actual) => actual.filter((a) => a.id_asiento !== asiento.id_asiento));
      setLimiteAlcanzado(false);
      return;
    }

    if (seleccionados.length >= LIMITE_ASIENTOS) {
      setLimiteAlcanzado(true);
      return;
    }

    setLimiteAlcanzado(false);
    setSeleccionados((actual) => [
      ...actual,
      { ...asiento, precio: calcularPrecioAsiento(funcion, asiento.tipo_asiento) },
    ]);
  }

  function manejarCambioCliente(campo, valor) {
    setCliente((actual) => ({ ...actual, [campo]: valor }));
  }

  async function manejarConfirmar() {
    const nuevosErrores = {
      nombres: !cliente.nombres.trim(),
      apellidos: !cliente.apellidos.trim(),
      email: !/^\S+@\S+\.\S+$/.test(cliente.email.trim()),
    };
    setErrores(nuevosErrores);
    if (Object.values(nuevosErrores).some(Boolean)) return;

    setEnviando(true);
    setErrorEnvio(null);
    try {
      const resultado = await api.crearVenta({
        idFuncion: funcion.id_funcion,
        cliente,
        metodoPago,
        asientos: seleccionados,
      });
      setConfirmacion(resultado);
    } catch (err) {
      setErrorEnvio(err.message);
      // alguien más se adelantó a comprar uno de estos asientos: refrescamos
      // los ocupados para que el mapa quede al día.
      const ocupadosRes = await api.getAsientosOcupados(funcion.id_funcion).catch(() => null);
      if (ocupadosRes) {
        setOcupados(new Set(ocupadosRes.map((o) => `${o.fila}${o.numero}`)));
        setSeleccionados([]);
      }
    } finally {
      setEnviando(false);
    }
  }

  if (cargandoCatalogo || cargandoFuncion) {
    return (
      <div className="container" style={{ padding: "4rem 0" }}>
        <p className="body-md text-muted">Cargando función…</p>
      </div>
    );
  }

  if (errorCarga || !funcion || !pelicula || !sala) {
    return (
      <div className={`container ${styles.noEncontrada}`}>
        <h1 className="headline-lg text-gold">No encontramos esa función</h1>
        {errorCarga && <p className="body-sm text-muted" style={{ marginTop: "0.5rem" }}>{errorCarga}</p>}
        <Link to="/" className="body-md text-gold" style={{ display: "inline-block", marginTop: "1rem" }}>
          Volver a la cartelera
        </Link>
      </div>
    );
  }

  if (confirmacion) {
    return (
      <div className={`container ${styles.confirmacion}`}>
        <p className="label-md text-gold">Compra confirmada</p>
        <h1 className="headline-lg" style={{ marginTop: "0.5rem" }}>{pelicula.titulo_local}</h1>
        <p className="body-sm text-muted" style={{ marginTop: "0.35rem" }}>
          {formatearFecha(funcion.fecha_hora_inicio)} · {formatearHora(funcion.fecha_hora_inicio)} · Sala {sala.numero_sala}
        </p>

        <div className={styles.reciboCard}>
          <p className="body-sm text-secondary" style={{ marginBottom: "0.75rem" }}>
            A nombre de {cliente.nombres} {cliente.apellidos} ({cliente.email})
          </p>
          {confirmacion.boletos.map((b) => (
            <div key={b.id_boleto} className={`body-sm ${styles.reciboFila}`}>
              <span>Asiento {b.fila}{b.numero}</span>
              <span className="text-muted">{b.codigo_qr}</span>
            </div>
          ))}
          <div className={`body-md ${styles.reciboTotal}`}>
            <span>Total pagado</span>
            <span>{formatearPrecio(confirmacion.venta.monto_total)}</span>
          </div>
        </div>

        <Link to="/" className={`label-md ${styles.botonVolver}`}>
          Volver a la cartelera
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <Link to={`/pelicula/${pelicula.id_pelicula}`} className={`body-sm ${styles.volver}`}>
        ← Volver a la película
      </Link>

      <div className={styles.encabezado}>
        <p className="label-md text-gold">{sala.tipo_proyeccion} · {funcion.idioma_audio}</p>
        <h1 className="headline-lg" style={{ marginTop: "0.35rem" }}>{pelicula.titulo_local}</h1>
        <p className="body-sm text-muted" style={{ marginTop: "0.35rem" }}>
          {formatearFecha(funcion.fecha_hora_inicio)} · {formatearHora(funcion.fecha_hora_inicio)} · Sala {sala.numero_sala}
        </p>
      </div>

      <div className={styles.layout}>
        {asientos.length === 0 ? (
          <p className="body-md text-muted">Cargando asientos…</p>
        ) : (
          <SeatMap
            asientos={asientos}
            ocupados={ocupados}
            seleccionados={seleccionadosIds}
            onToggle={manejarToggle}
          />
        )}

        <PurchaseSummary
          asientosSeleccionados={seleccionados}
          cargoServicio={CARGO_SERVICIO}
          cliente={cliente}
          errores={errores}
          metodoPago={metodoPago}
          onChangeCliente={manejarCambioCliente}
          onChangeMetodo={setMetodoPago}
          onConfirmar={manejarConfirmar}
          limiteAlcanzado={limiteAlcanzado}
          limiteMax={LIMITE_ASIENTOS}
          enviando={enviando}
          errorEnvio={errorEnvio}
        />
      </div>
    </div>
  );
}
