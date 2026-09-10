import { Link, NavLink } from "react-router-dom";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={`container-wide ${styles.inner}`}>
        <Link to="/" className={`headline-sm ${styles.logo}`}>
          <span>Cine ADSO</span>
          <span className={styles.logoDot}>·</span>
        </Link>
        <nav className={`label-md ${styles.nav}`}>
          <NavLink
            to="/"
            end
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
          >
            Cartelera
          </NavLink>
          <a href="#salas" className={styles.navLink}>
            Salas
          </a>
        </nav>
      </div>
    </header>
  );
}
