import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import styles from "./Auth.module.css";

export default function Auth() {
  const { ingresar, registrarse, autenticado, usuario } = useAuth();
  const navegar = useNavigate();
  const [modo, setModo] = useState("login");
  const [form, setForm] = useState({ nombres: "", apellidos: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  function cambiar(campo, valor) {
    setForm((actual) => ({ ...actual, [campo]: valor }));
  }

  async function manejarEnvio(e) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      if (modo === "login") {
        await ingresar(form.email.trim(), form.password);
      } else {
        await registrarse({
          nombres: form.nombres.trim(),
          apellidos: form.apellidos.trim(),
          email: form.email.trim(),
          password: form.password,
        });
      }
      navegar("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  if (autenticado) {
    return (
      <div className={`container ${styles.contenedor}`}>
        <p className="label-md text-gold">Sesión activa</p>
        <h1 className="headline-lg" style={{ marginTop: "0.5rem" }}>
          Hola, {usuario.nombres}
        </h1>
        <p className="body-md text-secondary" style={{ marginTop: "0.5rem" }}>
          Ya ingresaste con {usuario.email}.
        </p>
        <Link to="/" className={`label-md ${styles.botonPrimario}`} style={{ marginTop: "1.5rem" }}>
          Volver a la cartelera
        </Link>
      </div>
    );
  }

  return (
    <div className={`container ${styles.contenedor}`}>
      <p className="label-md text-gold">TecnoCine</p>
      <h1 className="headline-lg" style={{ marginTop: "0.5rem" }}>
        {modo === "login" ? "Ingresar" : "Crear cuenta"}
      </h1>

      <div className={styles.tabs}>
        <button
          type="button"
          className={modo === "login" ? styles.tabActiva : styles.tab}
          onClick={() => setModo("login")}
        >
          Ingresar
        </button>
        <button
          type="button"
          className={modo === "registro" ? styles.tabActiva : styles.tab}
          onClick={() => setModo("registro")}
        >
          Registrarme
        </button>
      </div>

      <form className={styles.form} onSubmit={manejarEnvio}>
        {modo === "registro" && (
          <>
            <label className={styles.campo}>
              <span className="label-sm text-secondary">Nombres</span>
              <input
                value={form.nombres}
                onChange={(e) => cambiar("nombres", e.target.value)}
                required
                autoComplete="given-name"
              />
            </label>
            <label className={styles.campo}>
              <span className="label-sm text-secondary">Apellidos</span>
              <input
                value={form.apellidos}
                onChange={(e) => cambiar("apellidos", e.target.value)}
                required
                autoComplete="family-name"
              />
            </label>
          </>
        )}
        <label className={styles.campo}>
          <span className="label-sm text-secondary">Correo</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => cambiar("email", e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label className={styles.campo}>
          <span className="label-sm text-secondary">Contraseña</span>
          <input
            type="password"
            value={form.password}
            onChange={(e) => cambiar("password", e.target.value)}
            required
            minLength={6}
            autoComplete={modo === "login" ? "current-password" : "new-password"}
          />
        </label>

        {error && <p className={`body-sm ${styles.error}`}>{error}</p>}

        <button type="submit" className={`label-md ${styles.botonPrimario}`} disabled={enviando}>
          {enviando ? "Espera…" : modo === "login" ? "Ingresar" : "Crear cuenta"}
        </button>
      </form>
    </div>
  );
}
