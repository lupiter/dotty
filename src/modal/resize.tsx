import { ModalContentProps } from "./modal-content";
import modalContentsStyles from "./modal-contents.module.css";
import buttonStyle from "../button/button.module.css";
import { ChangeEvent, useId, useState } from "react";
import { Size } from "../document/geometry";

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
};

export function Resize(
  props: ModalContentProps & {
    onResize: (from: RESIZE_FROM, size: Size) => void;
  }
) {
  const [state, setState] = useState<ResizeState>({
    width: 16,
    height: 16,
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

  const changeWidth = (e: ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, width: parseInt(e.target.value) });
  };

  const changeHeight = (e: ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, height: parseInt(e.target.value) });
  };

  const changeFrom = (value: RESIZE_FROM) => {
    setState({ ...state, from: value });
  };

  const onResize = () => {
    props.onResize(state.from, { width: state.width, height: state.height });
  };

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

      <div className={modalContentsStyles.text}>
        Warning: This action cannot be undone. If your new size is smaller than
        your current size, you might loose data!
      </div>

      <section className={modalContentsStyles.buttons}>
        <button className={buttonStyle.btn} onClick={props.onClose}>
          Cancel
        </button>
        <button className={buttonStyle.btn} onClick={onResize}>
          Resize
        </button>
      </section>
    </>
  );
}
