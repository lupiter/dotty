import { ModalContentProps } from "./modal-content";
import modalContentsStyles from "./modal-contents.module.css";
import buttonStyle from "../button/button.module.css";
import { ChangeEvent, useId, useState } from "react";

type ImportPaletteState = {
  error?: string;
  chips?: JSX.Element;
};

export function ImportPalette(props: ModalContentProps) {
  const [state, setState] = useState<ImportPaletteState>({});
  const id = useId();

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    // TODO
  };

  return (
    <>
      <h1 className={modalContentsStyles.header}>Import Palette</h1>

      <div className={modalContentsStyles.grid}>
        <label className="modeless-text field-label" htmlFor={id}>
          File:
        </label>
        <input
          type="file"
          className={modalContentsStyles.input}
          id={id}
          accept=".png, image/png"
          onChange={onChange}
        />
      </div>

      <div className={modalContentsStyles.text}>{state.error}</div>

      <div className={modalContentsStyles.grid}>{state.chips}</div>

      <section className={modalContentsStyles.buttons}>
        <button className={buttonStyle.btn} onClick={props.onClose}>
          Cancel
        </button>
        <button className={buttonStyle.btn}>Open</button>
      </section>
    </>
  );
}
