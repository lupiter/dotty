import { ModalContentProps } from "./modal-content";
import modalContentsStyles from "./modal-contents.module.css";
import buttonStyle from "../button/button.module.css";
import { useEffect, useRef, useState } from "react";
import { Size } from "../color/geometry";
import { FilePreview, getFiles } from "../file-management/file-management";

type OpenState = {
  files?: FilePreview[];
  error?: string;
  selected?: FilePreview;
};

export function Open(
  props: ModalContentProps & {
    onOpen: (data: string, size: Size, title: string) => void;
  }
) {
  const [state, setState] = useState<OpenState>({});
  const image = useRef<HTMLImageElement>(null);

  useEffect(() => {
    async function setFiles() {
      const files = await getFiles();
      setState({
        ...state,
        files,
        selected: files[0],
      });
    }
    if (!state.files) {
      setFiles();
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
