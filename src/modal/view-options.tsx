import { ModalContentProps } from "./modal-content";
import modalContentsStyles from "./modal-contents.module.css";
import buttonStyle from "../button/button.module.css";
import { useId, useState } from "react";

export enum PIXEL_SHAPE {
  SQUARE,
  THREE_FOUR,
  KNIT,
}

export type ViewOptionsState = {
  shape: PIXEL_SHAPE
}

export function ViewOptions(
  props: ModalContentProps & {
    state: ViewOptionsState,
    onStateChange: (state: ViewOptionsState) => void
  }
) {
  const [state, setState] = useState(props.state);
  const pixelShape = useId();
  const pixelShapeSquare = useId();
  const pixelShapeThreeFour = useId();
  const pixelShapeKnit = useId();

  const onChange = (shape: PIXEL_SHAPE) => {
    props.onStateChange({...props.state, shape})
    setState({...state, shape})
  }
  
  return (
    <>
      <h1 className={modalContentsStyles.header}>View Options</h1>

      <div className={modalContentsStyles.grid}>

      <fieldset className={modalContentsStyles.fieldset}>
          <legend>Pixel shape</legend>
          <input
            id={pixelShapeSquare}
            className={modalContentsStyles.input}
            type="radio"
            name={pixelShape}
            value={PIXEL_SHAPE.SQUARE}
            checked={state.shape === PIXEL_SHAPE.SQUARE}
            onChange={() => onChange(PIXEL_SHAPE.SQUARE)}
          />
          <label htmlFor={pixelShapeSquare}>Square</label>
          <input
            id={pixelShapeThreeFour}
            className={modalContentsStyles.input}
            type="radio"
            name={pixelShape}
            value={PIXEL_SHAPE.THREE_FOUR}
            checked={state.shape === PIXEL_SHAPE.THREE_FOUR}
            onChange={() => onChange(PIXEL_SHAPE.THREE_FOUR)}
          />
          <label htmlFor={pixelShapeThreeFour}>4:3</label>
          <input
            id={pixelShapeKnit}
            className={modalContentsStyles.input}
            type="radio"
            name={pixelShape}
            value={PIXEL_SHAPE.KNIT}
            checked={state.shape === PIXEL_SHAPE.KNIT}
            onChange={() => onChange(PIXEL_SHAPE.KNIT)}
          />
          <label htmlFor={pixelShapeKnit}>Knitting</label>
        </fieldset>

      </div>
      <section className={modalContentsStyles.buttons}>
        <button className={buttonStyle.btn} onClick={props.onClose}>
          Done
        </button>
      </section>
    </>
  );
}
