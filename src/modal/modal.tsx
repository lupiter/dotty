import { JSX, useEffect, useRef } from "react";
import styles from "./modal.module.css";

export function Modal(props: { children: JSX.Element; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, [dialogRef]);

  return (
    <dialog
      ref={dialogRef}
      className={styles.modalDialog}
      onClose={props.onClose}
    >
      <div className={styles.modalInner}>
        <div className={styles.modalContent}>{props.children}</div>
      </div>
    </dialog>
  );
}
