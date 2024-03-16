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
  ORIGINAL,
}

type ExportState = {
  size: ExportSizeOption;
  src?: string;
};

type ExportSizeOption = {
  size: ExportSize;
  label: string;
  pixels?: number;
  id: string;
};

export function Export(
  props: { data: string; size: Size; title: string } & ModalContentProps
) {
  const exportSizeOptions: ExportSizeOption[] = [
    {
      size: ExportSize.SMALL,
      label: "256px - Small, for forums",
      pixels: 256,
      id: useId(),
    },
    {
      size: ExportSize.MEDIUM,
      label: "1080px - Medium, for social media",
      pixels: 1080,
      id: useId(),
    },
    {
      size: ExportSize.LARGE,
      label: "2480px - Large, for printing",
      pixels: 2480,
      id: useId(),
    },
    {
      size: ExportSize.ORIGINAL,
      label: "Original - for game assets etc.",
      id: useId(),
    },
  ];

  const [state, setState] = useState<ExportState>({
    size: exportSizeOptions[2],
  });
  const name = useId();
  const img = useRef<HTMLImageElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  const zoom = state.size.pixels
    ? Math.ceil(state.size.pixels / props.size.width)
    : 1;
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

  const exportSizeChanged = (value: ExportSizeOption) => {
    setState({ ...state, size: value });
  };

  const filename = `export-${props.title}.png`;
  const src = props.data === "" ? SINGLE_TRANSPARENT_PIXEL : props.data;

  return (
    <>
      <h1 className={modalContentsStyles.header}>Export</h1>

      <fieldset className={modalContentsStyles.groupedFieldset}>
        <legend>Size</legend>

        {exportSizeOptions.map((option) => (
          <span className={modalContentsStyles.fieldset} key={option.id}>
            <input
              id={option.id}
              className={modalContentsStyles.input}
              type="radio"
              name={name}
              value={option.size}
              checked={state.size.size === option.size}
              onChange={() => exportSizeChanged(option)}
            />
            <label htmlFor={option.id}>{option.label}</label>
          </span>
        ))}
      </fieldset>
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
