import { ModalContentProps } from "./modal-content";
import modalContentsStyles from "./modal-contents.module.css";
import buttonStyle from "../button/button.module.css";
import { useEffect, useRef, useState } from "react";
import { Size } from "../color/geometry";

type OpenState = {
  root?: FileSystemDirectoryHandle;
  files?: FileSystemFileHandle[];
  error?: string;
  image?: string;
  selected?: FileSystemFileHandle;
  available?: boolean;
};

export function Open(
  props: ModalContentProps & {
    onOpen: (data: string, size: Size, title: string) => void;
  }
) {
  const [state, setState] = useState<OpenState>({});
  const image = useRef<HTMLImageElement>(null);

  const checkAvailable = async () => {
    setState({ ...state, available: navigator.storage !== undefined });
  };

  useEffect(() => {
    checkAvailable();
  }, []);

  const readFile = async (file: File): Promise<string> => {
    const reader = new FileReader();
    const promise = new Promise<string>((resolve, reject) => {
      reader.addEventListener("load", () => {
        resolve(reader.result as string);
      });
      reader.addEventListener("error", (e) => {
        reject(e);
      });
      reader.readAsDataURL(file);
    });
    return promise;
  };

  useEffect(() => {
    async function setRoot() {
      const root = await navigator.storage.getDirectory();
      const files: FileSystemFileHandle[] = [];
      for await (const handle of root.values()) {
        if (handle.kind === "file") {
          files.push(handle as FileSystemFileHandle);
        }
      }
      if (files.length === 0) {
        setState({
          ...state,
          error:
            "No available files. If this is surprising, you might have cleaned your browser cache recently.",
        });
      } else {
        setState({
          ...state,
          files,
          root,
          selected: files[0],
          image: await readFile(await files[0].getFile()),
        });
      }
    }
    if (!state.root) {
      setRoot();
    }
  }, []);

  const onSelect = async (file: FileSystemFileHandle) => {
    setState({
      ...state,
      selected: file,
      image: await readFile(await file.getFile()),
    });
  };

  const onImport = () => {
    if (state.image && image.current && state.selected && state.selected.name) {
      props.onOpen(
        state.image,
        {
          width: image.current.naturalWidth,
          height: image.current.naturalHeight,
        },
        state.selected?.name.split(".png")[0]
      );
    }
  };

  return (
    <>
      {state.available === false && (
        <>
          <p>
            We're unable to save to local storage on this device, browser, or
            domain. Please use File &gt; Import instead.
          </p>

          <section className={modalContentsStyles.buttons}>
            <button className={buttonStyle.btn} onClick={props.onClose}>
              Close
            </button>
          </section>
        </>
      )}

      {state.available === true && (
        <>
          <ul className={modalContentsStyles.select}>
            {state.files &&
              state.files.map((file) => (
                <li
                  onClick={() => onSelect(file)}
                  className={`${modalContentsStyles.selectItem} ${
                    state.selected &&
                    file.name === state.selected.name &&
                    modalContentsStyles.selected
                  }`}
                  key={file.name}
                  aria-selected={
                    state.selected && file.name === state.selected.name
                  }
                >
                  {file.name}
                </li>
              ))}
          </ul>

          {state.root && state.root.name}

          {state.image && (
            <div className={modalContentsStyles.grid}>
              <label className={modalContentsStyles.text}>Preview:</label>
              <img
                src={state.image}
                className={modalContentsStyles.preview}
                ref={image}
              />
            </div>
          )}

          <div className={modalContentsStyles.text}>{state.error}</div>

          <section className={modalContentsStyles.buttons}>
            <button className={buttonStyle.btn} onClick={props.onClose}>
              Cancel
            </button>
            <button
              className={buttonStyle.btn}
              disabled={!state.image}
              onClick={onImport}
            >
              Open
            </button>
          </section>
        </>
      )}
    </>
  );
}
