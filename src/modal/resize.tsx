import { ModalContentProps } from "./modal-content";
import modalContentsStyles from "./modal-contents.module.css";
import buttonStyle from "../button/button.module.css";
import { useId } from "react";

export function Resize(props: ModalContentProps) {
  const widthId = useId();
  const heightId = useId();
  
  return (
    <>
      <h1 className={modalContentsStyles.header}>Resize</h1>

      <div className={modalContentsStyles.grid}>
        <label htmlFor={widthId} className={modalContentsStyles.text}>
          Width:
        </label>
        <span className="field-label">
          <input id={widthId} type="number" value="16" max="256" /> px
        </span>
        <label htmlFor="resize-height" className="modeless-text field-label">
          Height:
        </label>
        <span className="field-label">
          <input id="resize-height" type="number" value="16" max="256" /> px
        </span>
        <fieldset className="field-label resize-mode-grid">
          <legend>From</legend>
          <input
            id="resize-mode-top-left"
            type="radio"
            name="resize"
            value="top-left"
          />
          <label htmlFor="resize-mode-top-left">Top Left</label>
          <span></span>
          <input
            id="resize-mode-top-right"
            type="radio"
            name="resize"
            value="top-right"
          />
          <label htmlFor="resize-mode-top-right">Top Right</label>
          <span></span>
          <input
            id="resize-mode-center-center"
            type="radio"
            name="resize"
            value="center-center"
            checked
          />
          <label htmlFor="resize-mode-center-center">Center</label>
          <span></span>
          <input
            id="resize-mode-bottom-left"
            type="radio"
            name="resize"
            value="bottom-left"
          />
          <label htmlFor="resize-mode-bottom-left">Bottom Left</label>
          <span></span>
          <input
            id="resize-mode-bottom-right"
            type="radio"
            name="resize"
            value="bottom-right"
          />
          <label htmlFor="resize-mode-bottom-right">Bottom Right</label>
        </fieldset>
      </div>

      <div className="modal-text">
        Warning: This action cannot be undone! If your new size is smaller than
        your curren size, you might loose data!
      </div>

      <section className={modalContentsStyles.buttons}>
        <button className={buttonStyle.btn} onClick={props.onClose}>
          Cancel
        </button>
        <button className={buttonStyle.btn}>
          Resize
        </button>
      </section>
    </>
  );
}
