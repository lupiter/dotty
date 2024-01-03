import { ModalContentProps } from "./modal-content";
import modalContentsStyles from "./modal-contents.module.css";
import buttonStyle from "../button/button.module.css";
import { useEffect, useRef, useState } from "react";
import { Size } from "../color/geometry";

type OpenState = {
  root?: FileSystemDirectoryHandle;
  files?: FilePreview[];
  error?: string;
  selected?: FilePreview;
};

type FilePreview = {
  meta: FileSystemFileHandle;
  preview: string;
};

export function Open(
  props: ModalContentProps & {
    onOpen: (data: string, size: Size, title: string) => void;
  }
) {
  const [state, setState] = useState<OpenState>({ });
  const image = useRef<HTMLImageElement>(null);

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
      const files: FilePreview[] = [];
      for await (const handle of root.values()) {
        if (handle.kind === "file") {
          const file = handle as FileSystemFileHandle;
          files.push({
            meta: file,
            preview: await readFile(await file.getFile()),
          });
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
        });
      }
    }
    if (!state.root) {
      setRoot();
    }
  }, []);

  const onSelect = async (file: FilePreview) => {
    setState({
      ...state,
      selected: file,
    });
  };

  const onImport = () => {
    if (
      image.current &&
      state.selected &&
      state.selected.preview &&
      state.selected.meta.name
    ) {
      props.onOpen(
        state.selected.preview,
        {
          width: image.current.naturalWidth,
          height: image.current.naturalHeight,
        },
        state.selected?.meta.name.split(".png")[0]
      );
    }
  };
  const available = navigator.storage !== undefined;

  return (
    <>
      {available === false && (
        <>
          <p>
            We're unable to use local storage on this device, browser, or
            domain. Please use File &gt; Import instead.
          </p>

          <section className={modalContentsStyles.buttons}>
            <button className={buttonStyle.btn} onClick={props.onClose}>
              Close
            </button>
          </section>
        </>
      )}

      {available === true && (
        <>
          <ul className={modalContentsStyles.selectFile}>
            {state.files &&
              state.files.map((file) => (
                <li
                  onClick={() => onSelect(file)}
                  className={`${modalContentsStyles.selectItem} ${
                    state.selected &&
                    file.meta.name === state.selected.meta.name &&
                    modalContentsStyles.selected
                  }`}
                  key={file.meta.name}
                  aria-selected={
                    state.selected &&
                    file.meta.name === state.selected.meta.name
                  }
                >
                  <img
                    src={file.preview}
                    alt=""
                    ref={
                      state.selected &&
                      file.meta.name === state.selected.meta.name
                        ? image
                        : undefined
                    }
                  />
                  <span className={modalContentsStyles.label}>
                    {file.meta.name}
                  </span>
                </li>
              ))}
          </ul>

          {state.files?.length === 0 && (
            <div className={modalContentsStyles.text}>
              No available files. If this is surprising, you might have cleaned
              your browser cache recently.
            </div>
          )}

          <section className={modalContentsStyles.buttons}>
            <button className={buttonStyle.btn} onClick={props.onClose}>
              Cancel
            </button>
            <button className={buttonStyle.btn} onClick={onImport}>
              Open
            </button>
          </section>
        </>
      )}
    </>
  );
}
