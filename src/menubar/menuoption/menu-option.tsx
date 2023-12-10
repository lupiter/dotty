import styles from "./menu-option.module.css";

export type BaseMenuOptionProps = {
  label: string;
  shortcut?: string;
};

type MenuOptionProps = BaseMenuOptionProps & {
  onClick: () => void;
  hasChildren?: boolean;
  disabled?: boolean;
};

export function MenuOption(props: MenuOptionProps) {
  return (
    <>
      <li role="menuitem" className={styles.menuItem}>
        <button onClick={props.onClick} className={styles.menuButton} disabled={props.disabled}>
          {props.label}
          {props.hasChildren && "..."}{" "}
          {props.shortcut && (
            <span className={styles.menuShortcut}>{props.shortcut}</span>
          )}
        </button>
      </li>
    </>
  );
}
