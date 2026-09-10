import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container-wide body-sm text-muted ${styles.inner}`}>
        <span>Cine ADSO — proyecto de práctica</span>
        <span>Diseño y desarrollo: Luis Cabas</span>
      </div>
    </footer>
  );
}
