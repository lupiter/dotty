import styles from "./menu-option.module.css";

export type BaseMenuOptionProps = {
  label: string;
  shortcut?: string;
};

type LinkMenuOptionProps = BaseMenuOptionProps & {
  href: string;
  download?: string;
};

export function LinkMenuOption(props: LinkMenuOptionProps) {
  return (
    <>
      <li role="menuitem" className={styles.menuItem}>
        <a href={props.href} download={props.download} className={styles.menuButton}>
          {props.label}
          {props.shortcut && (
            <span className={styles.menuShortcut}>{props.shortcut}</span>
          )}
        </a>
      </li>
    </>
  );
}
