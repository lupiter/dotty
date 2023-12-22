import { useId } from "react";
import styles from "./menu-option.module.css";
import { BaseMenuOptionProps } from "./menu-option";

export function CheckMenuOption(
  props: BaseMenuOptionProps & {
    value: boolean;
    onChange: (value: boolean) => void;
  }
) {
  const onChange = () => {
    props.onChange(!props.value);
  };
  const id = useId();

  return (
    <li
      role="menuitem"
      aria-haspopup="menu"
      className={`${styles.menuButton} ${styles.menuItem} ${styles.checkMenu}`}
    >
      <input
        type="checkbox"
        checked={props.value}
        onChange={onChange}
        className={styles.checkbox}
        id={id}
      />
      <label htmlFor={id} className={styles.checkboxLabel}>{props.label}</label>
    </li>
  );
}
