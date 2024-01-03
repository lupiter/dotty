import { ModalContentProps } from "./modal-content";
import modalContentsStyles from "./modal-contents.module.css";
import buttonStyle from "../button/button.module.css";
import { ChangeEvent, useEffect, useId, useState } from "react";
import { Size } from "../color/geometry";

type NewState = {
  height: number;
  width: number;
  name: string;
  clash?: boolean;
};

export function New(
  props: ModalContentProps & { onNew: (size: Size, name: string) => void }
) {
  const [state, setState] = useState<NewState>({
    height: 16,
    width: 16,
    name: "",
  });
  const nameId = useId();
  const presetId = useId();
  const widthId = useId();
  const heightId = useId();

  const createValidDefaultName = async (base: string) => {
    const root = await navigator.storage.getDirectory();
    var guess = base;
    var loop = 0;
    while (true) { // using return to break loop, sorry
      var matched = false;
      for await (const handle of root.values()) {
        if (handle.name === guess + ".png") {
          matched = true;
          break;
        }
      }
      if (matched) {
        // next guess
        loop += 1;
        guess = `${base} ${loop}`;
      } else {
        setState({ ...state, clash: false, name: guess });
        return;
      }
    }
  };

  useEffect(() => {
    createValidDefaultName("My Cool Art");
  }, []);

  const checkNameClash = async (name: string) => {
    const root = await navigator.storage.getDirectory();
    for await (const handle of root.values()) {
      if (handle.name === name + ".png") {
        setState({ ...state, clash: true, name });
        return;
      }
    }
    setState({ ...state, clash: false, name });
  };

  const onNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    checkNameClash(event.target.value);
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

  const onNew = () => {
    if (state.clash) {
      if (!confirm(`Replace existing "${state.name}"?`)) {
        return;
      }
    }
    props.onNew({ width: state.width, height: state.height }, state.name);
  };
  const available = navigator.storage !== undefined;

  return (
    <>
      <h1 className={modalContentsStyles.header}>New</h1>

      {available === false && (
        <>
          <p>
            We're unable to save to local storage on this device, browser, or
            domain. Please use File &gt; Export instead.
          </p>

          <section className={modalContentsStyles.buttons}>
            <button className={buttonStyle.btn} onClick={props.onClose}>
              Close
            </button>
          </section>
        </>
      )}

      {available === true && (
        <div className={modalContentsStyles.grid}>
          <label className={modalContentsStyles.text} htmlFor={nameId}>
            Name:
          </label>
          <input
            type="text"
            className={modalContentsStyles.input}
            value={state.name}
            id={nameId}
            onChange={onNameChange}
          />
          <label className="modeless-text field-label" htmlFor={presetId}>
            Presets:
          </label>
          <select
            id={presetId}
            onChange={onPresetChange}
            className={modalContentsStyles.select}
          >
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
              className={modalContentsStyles.input}
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
              className={modalContentsStyles.input}
              type="number"
              value={state.height}
              onChange={onHeightChange}
              max="256"
            />{" "}
            px
          </span>
        </div>
      )}

      <section className={modalContentsStyles.buttons}>
        <button className={buttonStyle.btn} onClick={props.onClose}>
          Cancel
        </button>
        <button
          className={buttonStyle.btn}
          onClick={onNew}
          disabled={state.clash === undefined}
        >
          Create
        </button>
      </section>
    </>
  );
}
