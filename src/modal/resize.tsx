import { ModalContentProps } from "./modal-content";
import modalContentsStyles from "./modal-contents.module.css";
import buttonStyle from "../button/button.module.css";
import { ChangeEvent, useEffect, useId, useRef, useState } from "react";
import { Point, Size } from "../color/geometry";
import { SINGLE_TRANSPARENT_PIXEL } from "../document/canvas-controler";

export enum RESIZE_FROM {
  TOP_LEFT,
  TOP_RIGHT,
  CENTER,
  BOTTOM_LEFT,
  BOTTOM_RIGHT,
}

type ResizeState = {
  width: number;
  height: number;
  from: RESIZE_FROM;
  modifiedData?: string;
};

export function Resize(
  props: ModalContentProps & {
    onResize: (size: Size, data: string) => void;
    size: Size;
    data: string;
  }
) {
  const [state, setState] = useState<ResizeState>({
    width: props.size.width,
    height: props.size.height,
    from: RESIZE_FROM.CENTER,
  });
  const widthId = useId();
  const heightId = useId();
  const topLeft = useId();
  const topRight = useId();
  const center = useId();
  const bottomLeft = useId();
  const bottomRight = useId();
  const resize = useId();
  const img = useRef<HTMLImageElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  const changeWidth = (e: ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      width: parseInt(e.target.value),
      modifiedData: undefined,
    });
  };

  const changeHeight = (e: ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      height: parseInt(e.target.value),
      modifiedData: undefined,
    });
  };

  const changeFrom = (value: RESIZE_FROM) => {
    setState({ ...state, from: value, modifiedData: undefined });
  };

  const onResize = () => {
    props.onResize(
      { width: state.width, height: state.height },
      state.modifiedData!
    );
  };

  const onLoad = () => {
    let point: Point;
    switch (state.from) {
      case RESIZE_FROM.TOP_LEFT:
        point = { x: 0, y: 0 };
        break;
      case RESIZE_FROM.TOP_RIGHT:
        point = { x: state.width - props.size.width, y: 0 };
        break;
      case RESIZE_FROM.BOTTOM_LEFT:
        point = { x: 0, y: state.height - props.size.height };
        break;
      case RESIZE_FROM.BOTTOM_RIGHT:
        point = {
          x: state.width - props.size.width,
          y: state.height - props.size.height,
        };
        break;
      case RESIZE_FROM.CENTER:
        point = {
          x: (state.width - props.size.width) / 2,
          y: (state.height - props.size.height) / 2,
        };
        break;
    }

    const ctx = canvas.current!.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    ctx.beginPath();
    ctx.clearRect(0, 0, props.size.width, props.size.height);
    ctx.drawImage(
      img.current!,
      point.x,
      point.y,
      props.size.width,
      props.size.height
    );
    ctx.closePath();
    const data = canvas.current!.toDataURL();
    setState({ ...state, modifiedData: data });
  };

  useEffect(onLoad, [state.width, state.height]);

  const src = props.data === "" ? SINGLE_TRANSPARENT_PIXEL : props.data;

  return (
    <>
      <h1 className={modalContentsStyles.header}>Resize</h1>

      <div className={modalContentsStyles.grid}>
        <label htmlFor={widthId} className={modalContentsStyles.text}>
          Width:
        </label>
        <span className={modalContentsStyles.fieldLabel}>
          <input
            id={widthId}
            className={modalContentsStyles.input}
            type="number"
            value={state.width}
            max="256"
            onChange={changeWidth}
          />{" "}
          px
        </span>
        <label htmlFor={heightId} className={modalContentsStyles.fieldLabel}>
          Height:
        </label>
        <span className={modalContentsStyles.fieldLabel}>
          <input
            id={heightId}
            className={modalContentsStyles.input}
            type="number"
            value={state.height}
            max="256"
            onChange={changeHeight}
          />{" "}
          px
        </span>
        <fieldset className={modalContentsStyles.fieldset}>
          <legend>From</legend>
          <input
            id={topLeft}
            className={modalContentsStyles.input}
            type="radio"
            name={resize}
            value={RESIZE_FROM.TOP_LEFT}
            checked={state.from === RESIZE_FROM.TOP_LEFT}
            onChange={() => changeFrom(RESIZE_FROM.TOP_LEFT)}
          />
          <label htmlFor={topLeft}>Top Left</label>
          <input
            id={topRight}
            className={modalContentsStyles.input}
            type="radio"
            name={resize}
            value={RESIZE_FROM.TOP_RIGHT}
            checked={state.from === RESIZE_FROM.TOP_RIGHT}
            onChange={() => changeFrom(RESIZE_FROM.TOP_RIGHT)}
          />
          <label htmlFor={topRight}>Top Right</label>
          <input
            id={center}
            className={modalContentsStyles.input}
            type="radio"
            name={resize}
            value={RESIZE_FROM.CENTER}
            checked={state.from === RESIZE_FROM.CENTER}
            onChange={() => changeFrom(RESIZE_FROM.CENTER)}
          />
          <label htmlFor={center}>Center</label>
          <input
            id={bottomLeft}
            className={modalContentsStyles.input}
            type="radio"
            name={resize}
            value={RESIZE_FROM.BOTTOM_LEFT}
            checked={state.from === RESIZE_FROM.BOTTOM_LEFT}
            onChange={() => changeFrom(RESIZE_FROM.BOTTOM_LEFT)}
          />
          <label htmlFor={bottomLeft}>Bottom Left</label>
          <input
            id={bottomRight}
            className={modalContentsStyles.input}
            type="radio"
            name={resize}
            value={RESIZE_FROM.BOTTOM_RIGHT}
            checked={state.from === RESIZE_FROM.BOTTOM_RIGHT}
            onChange={() => changeFrom(RESIZE_FROM.BOTTOM_RIGHT)}
          />
          <label htmlFor={bottomRight}>Bottom Right</label>
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
        width={state.width}
        height={state.height}
        className={modalContentsStyles.hidden}
      />

      <div className={modalContentsStyles.text}>
        Warning: This action cannot be undone. If your new size is smaller than
        your current size, you might loose data!
      </div>

      <section className={modalContentsStyles.buttons}>
        <button className={buttonStyle.btn} onClick={props.onClose}>
          Cancel
        </button>
        <button
          className={buttonStyle.btn}
          onClick={onResize}
          disabled={state.modifiedData === undefined}
        >
          Resize
        </button>
      </section>
    </>
  );
}
