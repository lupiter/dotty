import styles from "./document.module.css";
import { Size } from "./geometry";

type DocumentProps = {
  active: boolean;
  size: Size;
  children: JSX.Element;
};

export function Document(props: DocumentProps) {
  return (
    <div className={styles.window}>
      <div className={`${styles.titlebar} ${props.active && styles.active}`}>
        <h1 className={styles.title}>
          <span>Dotty</span>—
          <span>
            {props.size.width}x{props.size.height}
          </span>
        </h1>
      </div>
      {props.children}
    </div>
  );
}
