import { useEffect, useId, useRef, useState } from "react";
import modalContentsStyles from "./modal-contents.module.css";
import { ModalContentProps } from "./modal-content";
import buttonStyle from "../button/button.module.css";
import { Size } from "../color/geometry";
import { SINGLE_TRANSPARENT_PIXEL } from "../document/canvas-controler";

enum ExportSize {
  SMALL,
  MEDIUM,
  LARGE,
}

type ExportState = {
  size: ExportSize;
  src?: string;
};

export function Export(
  props: { data: string; size: Size; title: string } & ModalContentProps
) {
  const [state, setState] = useState<ExportState>({ size: ExportSize.MEDIUM });
  const idSmall = useId();
  const idMedium = useId();
  const idLarge = useId();
  const name = useId();
  const img = useRef<HTMLImageElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  let requestedSize: number = 256;
  if (state.size === ExportSize.MEDIUM) {
    requestedSize = 1080;
  } else if (state.size === ExportSize.LARGE) {
    requestedSize = 2480;
  }
  const zoom = Math.ceil(requestedSize / props.size.width);
  const width = zoom * props.size.width;
  const height = zoom * props.size.height;

  const onLoad = () => {
    const ctx = canvas.current!.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    ctx.beginPath();
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img.current!, 0, 0);
    ctx.closePath();

    setState({ ...state, src: canvas.current!.toDataURL() });
  };
  useEffect(onLoad, [state.size]);

  const exportSizeChanged = (value: ExportSize) => {
    setState({ ...state, size: value });
  };

  const filename = `export-${props.title}.png`;
  const src = props.data === "" ? SINGLE_TRANSPARENT_PIXEL : props.data;

  return (
    <>
      <h1 className={modalContentsStyles.header}>Export</h1>

      <div className={modalContentsStyles.grid}>
        <fieldset className={modalContentsStyles.fieldset}>
          <legend>Size, at least:</legend>
          <input
            id={idSmall}
            className={modalContentsStyles.input}
            type="radio"
            name={name}
            value={ExportSize.SMALL}
            checked={state.size === ExportSize.SMALL}
            onChange={() => exportSizeChanged(ExportSize.SMALL)}
          />
          <label htmlFor={idSmall}>256px wide - Small, for forums</label>
          <input
            id={idMedium}
            className={modalContentsStyles.input}
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
            className={modalContentsStyles.input}
            type="radio"
            name={name}
            value={ExportSize.LARGE}
            checked={state.size === ExportSize.LARGE}
            onChange={() => exportSizeChanged(ExportSize.LARGE)}
          />
          <label htmlFor={idLarge}>2480px wide - Large, for printing</label>
        </fieldset>
      </div>
      <img
        src={src}
        onLoad={onLoad}
        ref={img}
        className={modalContentsStyles.hidden}
      />
      <canvas
        ref={canvas}
        width={width}
        height={height}
        className={modalContentsStyles.hidden}
      />

      <section className={modalContentsStyles.buttons}>
        <button className={buttonStyle.btn} onClick={props.onClose}>
          Cancel
        </button>
        <a className={buttonStyle.btn} download={filename} href={state.src}>
          Export
        </a>
      </section>
    </>
  );
}
