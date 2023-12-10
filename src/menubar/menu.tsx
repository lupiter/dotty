import styles from './menu.module.css';

export function Menu(props: {
  children: JSX.Element[] | JSX.Element;
  label: string;
  icon?: string;
  open: boolean;
  onClick: () => void;
}) {
  let Label: JSX.Element;
  if (props.icon) {
    Label = <img src={props.icon} alt={props.label} className={styles.menuItemImage} />;
  } else {
    Label = <label className={styles.menuItemLabel}>{props.label}</label>;
  }

  return (
    <li role="menuitem" className={`${styles.menuItem} ${props.open && styles.menuItemOpen}`} aria-haspopup="menu" aria-expanded={props.open}>
      <span onClick={props.onClick} className={styles.labelWrapper}>{Label}</span>
      {props.open && <ul role="menu" className={styles.menu}>{props.children}</ul>}
    </li>
  );
}
