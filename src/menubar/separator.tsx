import styles from "./separator.module.css";

export function MenuSeparator() {
  return (
    <hr role="separator" className={styles.separator} />
  );
}