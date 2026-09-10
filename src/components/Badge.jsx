import styles from "./Badge.module.css";

export default function Badge({ children, variant = "editorial" }) {
  const variantClass = variant === "prestige" ? styles.prestige : styles.editorial;
  return <span className={`label-sm ${styles.badge} ${variantClass}`}>{children}</span>;
}
