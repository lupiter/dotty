import { ModalContentProps } from "./modal-content";
import modalContentsStyles from "./modal-contents.module.css";
import buttonStyle from "../button/button.module.css";
import { ChangeEvent, useId, useState } from "react";

type SaveAsState = {
  name: string;
  clash?: boolean;
};

export function SaveAs(
  props: ModalContentProps & { onSaveAs: (name: string) => void; title: string }
) {
  const [state, setState] = useState<SaveAsState>({
    name: props.title,
  });
  const nameId = useId();

  const checkNameClash = async () => {
    const root = await navigator.storage.getDirectory();
    for await (const handle of root.values()) {
      if (handle.name === state.name) {
        setState({...state, clash: true});
        return;
      }
    }
    setState({...state, clash: false});
  }

  const onNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, name: event.target.value });
    checkNameClash();
  };

  const onSaveAs = () => {
    if (state.clash) {
      if (!confirm(`Replace existing "${state.name}"?`)) {
        return;
      }
    }
    props.onSaveAs(state.name);
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
          className={modalContentsStyles.input}
          value={state.name}
          id={nameId}
          onChange={onNameChange}
        />
      </div>

      <section className={modalContentsStyles.buttons}>
        <button className={buttonStyle.btn} onClick={props.onClose}>
          Cancel
        </button>
        <button className={buttonStyle.btn} onClick={onSaveAs} disabled={state.clash === undefined}>
          Save As
        </button>
      </section>
    </>
  );
}
