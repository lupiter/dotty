import styles from "./document.module.css";
import { Size } from "../color/geometry";

type DocumentProps = {
  active: boolean;
  size: Size;
  title: string;
  children: JSX.Element;
};

export function Document(props: DocumentProps) {
  return (
    <div className={styles.window}>
      <div className={`${styles.titlebar} ${props.active && styles.active}`}>
        <h1 className={styles.title}>
          <span>{props.title}</span>—
          <span>
            {props.size.width}x{props.size.height}
          </span>
        </h1>
      </div>
      <hr className={styles.divider} />
      {props.children}
    </div>
  );
}
