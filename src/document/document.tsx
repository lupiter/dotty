import { useState } from 'react';
import styles from './document.module.css';

type DocumentProps = {
  active: boolean;
};

export type DocumentState = {
  width: number,
  height: number,

}

export function Document(props: DocumentProps) {
  const [state, setState] = useState<DocumentState>({ width: 16, height: 16});

  return (
    <div className={styles.window}>
      <div className={`${styles.titlebar} ${props.active && styles.active}`}>
        <h1 className={styles.title}>
          <span>Dotty</span>—<span>{state.width}x{state.height}</span>
        </h1>
      </div>

      <div className={styles.wrapper}>
        <div className={styles.inner}>
          <canvas className={styles.canvas} width={state.width} height={state.height}></canvas>
        </div>
      </div>
    </div>
  );
}
