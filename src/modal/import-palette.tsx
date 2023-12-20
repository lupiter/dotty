import { ModalContentProps } from "./modal-content";
import modalContentsStyles from "./modal-contents.module.css";
import buttonStyle from "../button/button.module.css";
import { ChangeEvent, useId, useRef, useState } from "react";
import { Size } from "../document/geometry";
import { ArtMaths } from "../document/maths";

type ImportPaletteState = {
  error?: string;
  data?: string;
  size?: Size;
  colors: string[];
};

export function ImportPalette(
  props: ModalContentProps & { onImport: (colors: string[]) => void }
) {
  const [state, setState] = useState<ImportPaletteState>({ colors: [] });
  const id = useId();
  const image = useRef<HTMLImageElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      const data = URL.createObjectURL(file);
      setState({ ...state, data, error: undefined });
    }
  };

  const extractColors = () => {
    if (canvas.current && image.current) {
      if (canvas.current.width < image.current.naturalWidth) {
        canvas.current.width = image.current.naturalWidth;
        canvas.current.height = image.current.naturalHeight;
      }
      const ctx = canvas.current.getContext("2d")!;
      ctx.imageSmoothingEnabled = false;
      ctx.beginPath();
      ctx.drawImage(image.current, 0, 0);
      ctx.closePath();

      const colors = new Set<string>();
      for (let x = 0; x < image.current.naturalWidth; x++) {
        for (let y = 0; y < image.current.naturalHeight; y++) {
          const color = ArtMaths.pixelToColor(
            ctx.getImageData(x, y, 1, 1).data
          );
          colors.add(color);

          if (colors.size > 256) {
            const err =
              "There's more than 256 colours in this image. Sorry, we don't support that many.";
            console.warn(err);
            setState({ ...state, error: err });
            return;
          }
        }
      }

      setState({ ...state, colors: Array.from(colors).sort(ArtMaths.colorSort) });
    }
  }

  const onLoad = () => {
    extractColors();
  };

  const onImport = () => {
    props.onImport(state.colors);
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
      <img src={state.data} ref={image} onLoad={onLoad} className={modalContentsStyles.hidden} />
      <canvas
        ref={canvas}
        width={image.current?.width}
        height={image.current?.height}
        className={modalContentsStyles.hidden}
      />

      <div className={modalContentsStyles.text}>{state.error}</div>

      <div className={modalContentsStyles.chipGrid}>
        {state.colors.map((color: string) => (
          <div
            className={modalContentsStyles.colorChip}
            style={{ backgroundColor: color, color }}
            key={color}
          >
            {color}
          </div>
        ))}
      </div>

      <section className={modalContentsStyles.buttons}>
        <button className={buttonStyle.btn} onClick={props.onClose}>
          Cancel
        </button>
        <button
          className={buttonStyle.btn}
          disabled={state.colors.length <= 0}
          onClick={onImport}
        >
          Import
        </button>
      </section>
    </>
  );
}
