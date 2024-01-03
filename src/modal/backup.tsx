import modalContentsStyles from "./modal-contents.module.css";
import buttonStyle from "../button/button.module.css";
import { ModalContentProps } from "./modal-content";
import { useEffect, useState } from "react";
import { FilePreview, getFiles } from "../file-management/file-management";
import * as JSZip from "jszip";

type BackupState = {
  zip?: string;
  files?: FilePreview[],
};

export function Backup(props: ModalContentProps) {
  const [state, setState] = useState<BackupState>({ });
  const available = navigator.storage !== undefined;

  useEffect(() => {
    async function setFiles() {
      const files = await getFiles();
      const zipper = new JSZip();
      files.forEach(file => {
        zipper.file(file.meta.name, file.preview.split("base64,")[1], {base64: true});
      })
      const archive = await zipper.generateAsync({type: "base64"});
    
      setState({
        ...state,
        files: files,
        zip: "data:application/zip;base64," + archive,
      });
    }
    if (!state.zip) {
      setFiles();
    }
  }, []);

  return (
    <>
      {available === false && (
        <>
          <p>
            We're unable to use local storage on this device, browser, or
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
        <>
        <ul className={modalContentsStyles.selectFile}>
          {state.files &&
            state.files.map((file) => (
              <li
                className={`${modalContentsStyles.selectItem}`}
                key={file.meta.name}
              >
                <img
                  src={file.preview}
                  alt=""
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
          <a href={state.zip} className={buttonStyle.btn} disabled={!state.zip}>
            Backup All
          </a>
        </section>
      </>
      )}
    </>
  );
}
