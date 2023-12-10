import { useEffect, useRef } from "react";
import styles from "./modal.module.css"

export function Modal(props: { children: JSX.Element; open: boolean, onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (dialogRef.current?.open && !props.open) {
      dialogRef.current?.close();
    } else if (!dialogRef.current?.open && props.open) {
      dialogRef.current?.showModal();
    }
  }, [props.open]);

  // TODO: capture dialog close

  return (
    <dialog ref={dialogRef} className={styles.modalDialog} open={props.open}>
      <div className={styles.modalInner}>
        <div className="inner-border center">
          <div className={styles.modalContent}>{props.children}</div>
        </div>
      </div>
    </dialog>
  );
}
