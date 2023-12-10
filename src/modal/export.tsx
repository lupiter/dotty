import { useId, useState } from "react";
import modalContentsStyles from "./modal-contents.module.css"
import { ModalContentProps } from "./modal-content";
import buttonStyle from "../button/button.module.css";

enum ExportSize {
  SMALL,
  MEDIUM,
  LARGE
}

type ExportState = {
  size: ExportSize,
}

export function Export(props: { getData(): ImageData } & ModalContentProps) {
  const [state, setState] = useState<ExportState>({ size: ExportSize.MEDIUM })
  const idSmall = useId();
  const idMedium = useId();
  const idLarge = useId();
  const name = useId();

  const exportSizeChanged = (value: ExportSize) => {
    setState({ size: value });
  }

  return (
    <>
      <h1 className={modalContentsStyles.header}>Export</h1>

      <div className={modalContentsStyles.grid}>
        <fieldset className={modalContentsStyles.exportGrid}>
          <legend>Size, at least:</legend>
          <input
            id={idSmall}
            type="radio"
            name={name}
            value={ExportSize.SMALL}
            checked={state.size === ExportSize.SMALL}
            onChange={() => exportSizeChanged(ExportSize.SMALL)}
          />
          <label htmlFor={idSmall}>
            256px wide - Small, for forums
          </label>
          <input
            id={idMedium}
            type="radio"
            name={name}
            value={ExportSize.MEDIUM}
            checked={state.size === ExportSize.MEDIUM}
            onChange={() => exportSizeChanged(ExportSize.MEDIUM)}
          />
          <label htmlFor={idMedium}>
            1080px wide - Medium, for social media
          </label>
          <input
            id={idLarge}
            type="radio"
            name={name}
            value={ExportSize.LARGE}
            checked={state.size === ExportSize.LARGE}
            onChange={() => exportSizeChanged(ExportSize.LARGE)}
          />
          <label htmlFor={idLarge}>
            2480px wide - Large, for printing
          </label>
        </fieldset>
      </div>

      <section className={modalContentsStyles.buttons}>
        <button className={buttonStyle.btn} onClick={props.onClose}>
          Cancel
        </button>
        <button className={buttonStyle.btn}>
          Export
        </button>
      </section>
    </>
  );
}
