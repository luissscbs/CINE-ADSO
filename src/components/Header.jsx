import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCarrito } from "../context/CarritoContext.jsx";
import { useIrASeccion } from "../hooks/useIrASeccion.js";
import styles from "./Header.module.css";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { usuario, autenticado, salir } = useAuth();
  const { cantidadTotal } = useCarrito();
  const irASeccion = useIrASeccion();
  const { pathname, search } = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const esClaro = theme === "light";

  const tabActual = new URLSearchParams(search).get("tab") || "cartelera";
  const enHome = pathname === "/";

  const primerNombre = autenticado ? usuario.nombres.split(" ")[0] : null;

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <Link to="/" className={styles.logo} onClick={() => setMenuAbierto(false)}>
            <img src="/logo-tecnocine.svg" alt="TecnoCine" className={styles.logoImg} />
            <span className={styles.logoText}>TecnoCine</span>
          </Link>
          <div className={styles.complejo}>
            <span className="material-symbols-outlined">location_on</span>
            <span className={styles.complejoTexto}>TecnoCine Plaza</span>
            <span className="material-symbols-outlined">expand_more</span>
          </div>
        </div>

        <nav className={styles.nav} aria-label="Navegación principal">
          <button
            type="button"
            className={`${styles.navLink} ${styles.navBoton} ${enHome && tabActual === "cartelera" ? styles.navLinkActive : ""}`}
            onClick={() => irASeccion("cartelera")}
          >
            Cartelera
          </button>
          <button
            type="button"
            className={`${styles.navLink} ${styles.navBoton} ${enHome && tabActual === "proximamente" ? styles.navLinkActive : ""}`}
            onClick={() => irASeccion("proximamente")}
          >
            Próximamente
          </button>
          <NavLink
            to="/dulceria"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
            }
          >
            Dulcería
          </NavLink>
        </nav>

        <div className={styles.right}>
          <button
            type="button"
            onClick={toggleTheme}
            className={styles.themeToggle}
            aria-label={esClaro ? "Cambiar a modo negro" : "Cambiar a modo blanco"}
            title={esClaro ? "Cambiar a negro" : "Cambiar a blanco"}
          >
            <span className="material-symbols-outlined">
              {esClaro ? "dark_mode" : "light_mode"}
            </span>
            <span className={styles.themeToggleTexto}>{esClaro ? "Negro" : "Blanco"}</span>
          </button>

          <Link
            to="/carrito"
            className={styles.carrito}
            aria-label={`Carrito de dulcería, ${cantidadTotal} productos`}
          >
            <span className="material-symbols-outlined">shopping_cart</span>
            {cantidadTotal > 0 && <span className={styles.carritoBadge}>{cantidadTotal}</span>}
          </Link>

          {autenticado ? (
            <span className={styles.cuenta} title={usuario.email}>
              <span className={styles.avatar}>
                <span className="material-symbols-outlined">person</span>
              </span>
              <span className={styles.ingresar}>{primerNombre}</span>
              <button type="button" onClick={salir} className={styles.salir}>
                Salir
              </button>
            </span>
          ) : (
            <Link to="/ingresar" className={styles.cuenta}>
              <span className={styles.avatar}>
                <span className="material-symbols-outlined">person</span>
              </span>
              <span className={styles.ingresar}>Ingresar</span>
            </Link>
          )}

          <button
            type="button"
            className={styles.burger}
            aria-label="Abrir menú"
            aria-expanded={menuAbierto}
            onClick={() => setMenuAbierto((v) => !v)}
          >
            <span className="material-symbols-outlined">{menuAbierto ? "close" : "menu"}</span>
          </button>
        </div>
      </div>

      {menuAbierto && (
        <nav className={styles.mobileNav} aria-label="Navegación móvil">
          <button
            type="button"
            onClick={() => {
              setMenuAbierto(false);
              irASeccion("cartelera");
            }}
          >
            Cartelera
          </button>
          <button
            type="button"
            onClick={() => {
              setMenuAbierto(false);
              irASeccion("proximamente");
            }}
          >
            Próximamente
          </button>
          <Link to="/dulceria" onClick={() => setMenuAbierto(false)}>
            Dulcería
          </Link>
          {!autenticado && (
            <Link to="/ingresar" onClick={() => setMenuAbierto(false)}>
              Ingresar
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
