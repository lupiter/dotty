import { About } from "../modal/about";
import { ModalMaker } from "../modal/modal-content";
import { DottyState, SetDottyState } from "../state";
import { TOOL } from "../tools/tools";

export function keyboardShortcut(
  e: KeyboardEvent,
  state: DottyState,
  setState: SetDottyState,
  onSave: () => void,
  undo: () => void,
  redo: () => void,
  zoomIn: () => void,
  zoomOut: () => void,
  zoomFit: () => void,
  ExportModal: ModalMaker,
  OpenModal: ModalMaker,
  NewModal: ModalMaker,
) {
  if (e.metaKey || e.ctrlKey) {
    switch (e.key) {
      case "E":
      case "e":
        setState({ ...state, ModalContent: ExportModal });
        e.preventDefault();
        break;
      case "S":
      case "s":
        onSave();
        e.preventDefault();
        break;
      case "O":
      case "o":
        setState({ ...state, ModalContent: OpenModal });
        e.preventDefault();
        break;
      case "N":
      case "n":
        setState({ ...state, ModalContent: NewModal });
        e.preventDefault();
        break;
      case "?":
        setState({ ...state, ModalContent: About });
        e.preventDefault();
        break;
      case "z":
        if (!e.shiftKey) {
          undo();
        } else {
          redo();
        }
        e.preventDefault();
        break;
      case "Z":
        redo();
        e.preventDefault();
        break;
      case "=":
        if (!e.shiftKey) {
          zoomIn();
        } else {
          zoomFit();
        }
        e.preventDefault();
        break;
      case "+":
        zoomFit();
        e.preventDefault();
        break;
      case "-":
        zoomOut();
        e.preventDefault();
    }
  } else {
    switch (e.key) {
      case "b":
        setState({ ...state, tool: TOOL.PENCIL });
        break;
      case "e":
        setState({ ...state, tool: TOOL.ERASER });
        break;
      case "g":
        setState({ ...state, tool: TOOL.BUCKET });
        break;
      case "i":
        setState({ ...state, tool: TOOL.DROPPER });
        break;
      case "p":
        setState({ ...state, tool: TOOL.PEN });
        break;
    }
  }
}
