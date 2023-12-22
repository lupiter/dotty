import { ModalContentProps } from "./modal-content";
import modalContentsStyles from "./modal-contents.module.css";
import buttonStyle from "../button/button.module.css";
import { ChangeEvent, useId, useRef, useState } from "react";
import { Size } from "../color/geometry";

type OpenState = {
  image?: string;
  name?: string;
  error?: string;
  ready: boolean;
};

export function Open(
  props: ModalContentProps & {
    onOpen: (data: string, size: Size, title: string) => void;
  }
) {
  const [state, setState] = useState<OpenState>({ ready: false });
  const fileId = useId();
  const image = useRef<HTMLImageElement>(null);

  const onFileChanged = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files![0];
      setState({
        ready: false,
        name: file.name,
        image: URL.createObjectURL(file),
      });
    }
  };

  const onLoad = () => {
    if (image.current) {
      if (
        image.current.naturalWidth > 256 ||
        image.current.naturalHeight > 256
      ) {
        setState({
          ...state,
          error:
            "Sorry, this image is too large. Files should be no larger than 256x256 pixels",
        });
        return;
      }
      setState({ ...state, ready: true });
    }
  };

  const onOpen = () => {
    if (state.image && image.current && state.name) {
      props.onOpen(
        state.image,
        {
          width: image.current.naturalWidth,
          height: image.current.naturalHeight,
        },
        state.name
      );
    }
  };

  return (
    <>
      <h1 className={modalContentsStyles.header}>Open File</h1>

      <div className={modalContentsStyles.grid}>
        <label className={modalContentsStyles.text} htmlFor={fileId}>
          File:
        </label>
        <input
          type="file"
          className={modalContentsStyles.input}
          id={fileId}
          accept=".png, .jpeg, image/png, image/jpeg"
          onChange={onFileChanged}
        />
      </div>

      <div className={modalContentsStyles.grid}>
        <label className={modalContentsStyles.text}>Preview:</label>
        <img src={state.image} onLoad={onLoad} ref={image} />
      </div>

      <div className={modalContentsStyles.text}>{state.error}</div>

      <section className={modalContentsStyles.buttons}>
        <button className={buttonStyle.btn} onClick={props.onClose}>
          Cancel
        </button>
        <button
          className={buttonStyle.btn}
          disabled={!state.ready}
          onClick={onOpen}
        >
          Open
        </button>
      </section>
    </>
  );
}
