import { useRef } from "react";
import styles from "./modal.module.css";

export function Modal(props: { children: JSX.Element; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  dialogRef.current?.showModal();

  // TODO: capture dialog close

  return (
    <dialog ref={dialogRef} className={styles.modalDialog} open>
      <div className={styles.modalInner}>
        <div className="inner-border center">
          <div className={styles.modalContent}>{props.children}</div>
        </div>
      </div>
    </dialog>
  );
}
