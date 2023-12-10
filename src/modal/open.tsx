import { ModalContentProps } from "./modal-content";
import modalContentsStyles from "./modal-contents.module.css"
import buttonStyle from "../button/button.module.css";
import { ChangeEvent, useId, useState } from "react";

type OpenState = {
  image?: string,
  error?: string,
}

export function Open(props: ModalContentProps) {
  const [state, setState] = useState<OpenState>({});
  const fileId = useId();

  const onFileChanged = (event: ChangeEvent<HTMLInputElement>) => {
    // TODO
  }

  return (
    <>
      <h1 className={modalContentsStyles.header}>Open File</h1>

      <div className={modalContentsStyles.grid}>
        <label className={modalContentsStyles.text} htmlFor={fileId}>
          File:
        </label>
        <input
          type="file"
          id={fileId}
          accept=".png, .jpeg, image/png, image/jpeg"
          onChange={onFileChanged}
        />
      </div>

      <div className={modalContentsStyles.grid}>
        <label className={modalContentsStyles.text}>Preview:</label>
        <img src={state.image} />
      </div>

      <div className={modalContentsStyles.text}>
        {state.error}
      </div> 

      <section className={modalContentsStyles.buttons}>
        <button className={buttonStyle.btn} onClick={props.onClose}>
          Cancel
        </button>
        <button className={buttonStyle.btn}>
          Open
        </button>
      </section>
    </>
  );
}
