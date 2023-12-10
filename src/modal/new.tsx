import { ModalContentProps } from "./modal-content";
import modalContentsStyles from "./modal-contents.module.css";
import buttonStyle from "../button/button.module.css";
import { ChangeEvent, useId, useState } from "react";

type NewState = {
  height: number;
  width: number;
  name: string;
};

export function New(props: ModalContentProps) {
  const [state, setState] = useState<NewState>({
    height: 16,
    width: 15,
    name: "My Cool Art",
  });
  const nameId = useId();
  const presetId = useId();
  const widthId = useId();
  const heightId = useId();

  const onNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, name: event.target.value });
  };

  const onWidthChange = (event: ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, width: Number.parseInt(event.target.value) });
  };

  const onHeightChange = (event: ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, height: Number.parseInt(event.target.value) });
  };

  const onPresetChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number.parseInt(event.target.value);
    setState({ ...state, height: newSize, width: newSize });
  };

  return (
    <>
      <h1 className={modalContentsStyles.header}>New</h1>

      <div className={modalContentsStyles.grid}>
        <label className={modalContentsStyles.text} htmlFor={nameId}>
          Name:
        </label>
        <input
          type="text"
          value={state.name}
          id={nameId}
          onChange={onNameChange}
        />
        <label className="modeless-text field-label" htmlFor={presetId}>
          Presets:
        </label>
        <select id={presetId} onChange={onPresetChange}>
          <option value="16">S - 16x16</option>
          <option value="32">M - 32x32</option>
          <option value="64">L - 64x64</option>
          <option value="128">XL - 128x128</option>
        </select>
        <label htmlFor={widthId} className={modalContentsStyles.text}>
          Width:
        </label>
        <span className="field-label">
          <input
            id={widthId}
            type="number"
            value={state.width}
            onChange={onWidthChange}
            max="256"
          />{" "}
          px
        </span>
        <label htmlFor={heightId} className={modalContentsStyles.text}>
          Height:
        </label>
        <span className="field-label">
          <input
            id={heightId}
            type="number"
            value={state.height}
            onChange={onHeightChange}
            max="256"
          />{" "}
          px
        </span>
      </div>

      <section className={modalContentsStyles.buttons}>
        <button className={buttonStyle.btn} onClick={props.onClose}>
          Cancel
        </button>
        <button className={buttonStyle.btn}>Create</button>
      </section>
    </>
  );
}
