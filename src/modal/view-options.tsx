import { ModalContentProps } from "./modal-content";
import modalContentsStyles from "./modal-contents.module.css";
import buttonStyle from "../button/button.module.css";
import { useId } from "react";

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
  const pixelShape = useId();
  const pixelShapeSquare = useId();
  const pixelShapeThreeFour = useId();
  const pixelShapeKnit = useId();
  
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
            checked={props.state.shape === PIXEL_SHAPE.SQUARE}
            onChange={() => props.onStateChange({...props.state, shape: PIXEL_SHAPE.SQUARE})}
          />
          <label htmlFor={pixelShapeSquare}>Square</label>
          <input
            id={pixelShapeThreeFour}
            className={modalContentsStyles.input}
            type="radio"
            name={pixelShape}
            value={PIXEL_SHAPE.THREE_FOUR}
            checked={props.state.shape === PIXEL_SHAPE.THREE_FOUR}
            onChange={() => props.onStateChange({...props.state, shape: PIXEL_SHAPE.THREE_FOUR})}
          />
          <label htmlFor={pixelShapeThreeFour}>4:3</label>
          <input
            id={pixelShapeKnit}
            className={modalContentsStyles.input}
            type="radio"
            name={pixelShape}
            value={PIXEL_SHAPE.KNIT}
            checked={props.state.shape === PIXEL_SHAPE.KNIT}
            onChange={() => props.onStateChange({...props.state, shape: PIXEL_SHAPE.KNIT})}
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
