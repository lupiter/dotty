import { MenuBar } from "./menubar/menubar";
import { Document } from "./document/document";
import { TOOL, Tools } from "./tools/tools";
import { Palette } from "./palette/palette";
import { useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "./modal/modal";
import { UndoManager, UndoState } from "./document/undo-manager";
import { Canvas } from "./document/canvas";
import { Point, Size } from "./color/geometry";
import styles from "./dotty.module.css";
import { Resize } from "./modal/resize";
import { ModalContentProps } from "./modal/modal-content";
import { Export } from "./modal/export";
import { New } from "./modal/new";
import { Import } from "./modal/import";
import { ImportPalette } from "./modal/import-palette";
import { PALETTE, PaletteLimit } from "./modal/palette-limit";
import { Color } from "./color/color";
import { Open } from "./modal/open";
import { FileWrieOperationMessage } from "./worker/messages";
import { SaveAs } from "./modal/save-as";
import FileWorker from "./worker/file.worker?worker";
import { About } from "./modal/about";

const fileWorker = new FileWorker();

type DottyState = {
  ModalContent?: (props: { onClose: () => void }) => JSX.Element;
  undo: UndoState;
  tool: TOOL;
  color: Color;
  title: string;
  zoom: number;
  size: Size;
  documentScroll: Point;
  pan: Point;
  palette: Color[];
  paletteLimit: PALETTE;
  paletteLocked: boolean;
  file?: FileSystemFileHandle;
};

function Dotty() {
  const [state, setState] = useState<DottyState>({
    undo: { future: [], past: [], current: "" },
    tool: TOOL.PEN,
    color: Color.fromHex("#000000"),
    zoom: 1.0,
    title: "My Cool Art",
    size: { width: 16, height: 16 },
    documentScroll: { x: 0, y: 0 },
    pan: { x: 0, y: 0 },
    palette: [
      Color.fromHex("#ffffff"),
      Color.fromHex("#ff0000"),
      Color.fromHex("#00ff00"),
      Color.fromHex("#0000ff"),
    ],
    paletteLimit: PALETTE.FULL,
    paletteLocked: false,
  });

  const wrapperRef = useRef<HTMLDivElement>(null);

  const onClear = () => {
    onUndoTick("");
  };
  const onPaletteClear = () => {
    setState({ ...state, palette: [] });
  };
  const onPaletteLockChange = (value: boolean) => {
    setState({ ...state, paletteLocked: value });
  };
  const undo = () => {
    const undone = UndoManager.undo(state.undo);
    setState({ ...state, undo: undone });
  };
  const redo = () => {
    const redone = UndoManager.redo(state.undo);
    setState({ ...state, undo: redone });
  };
  const zoomIn = () => {
    setState({ ...state, zoom: state.zoom + 3 });
  };
  const zoomOut = () => {
    setState({ ...state, zoom: state.zoom - 3 });
  };
  const zoomFit = () => {
    let zoom: number;
    const wrapper = wrapperRef.current;
    if (!wrapper) {
      return;
    }
    console.log(
      `canvas: zoom reset; wrapper offset w: ${wrapper.offsetWidth} h ${wrapper.offsetHeight}; document w: ${state.size.width} h: ${state.size.height}`
    );
    if (wrapper.offsetWidth < wrapper.offsetHeight) {
      zoom = Math.floor(wrapper.offsetWidth / state.size.width); // * 10) / 10;
    } else {
      zoom = Math.floor(wrapper.offsetHeight / state.size.height); // * 10) / 10;
    }
    if (zoom < 0.1) {
      zoom = 0.1;
    }
    setState({ ...state, zoom, pan: { x: 0, y: 0 } });
  };
  const onZoomChange = (zoom: number) => {
    setState({ ...state, zoom });
  };
  const onPanChange = (pan: Point) => {
    setState({ ...state, pan });
  };

  const onModalClose = () => {
    setState({ ...state, ModalContent: undefined });
  };
  const modalOpen = (
    ModalContent: (props: { onClose: () => void }) => JSX.Element
  ) => {
    setState({ ...state, ModalContent });
  };

  const onColorChange = (color: Color) => {
    setState({ ...state, color });
  };

  const onToolChange = (tool: TOOL) => {
    setState({ ...state, tool });
  };

  const setScroll = (scroll: Point) => {
    setState({
      ...state,
      documentScroll: scroll,
    });
  };

  const canUndo = UndoManager.canUndo(state.undo);
  const canRedo = UndoManager.canRedo(state.undo);

  const onUndoTick = (data: string) => {
    setState({ ...state, undo: UndoManager.tick(state.undo, data) });
  };

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (wrapper) {
      wrapper.scrollLeft = wrapper.scrollLeft - state.documentScroll.x;
      wrapper.scrollTop = wrapper.scrollTop - state.documentScroll.y;
    }
  }, [state.documentScroll]);

  useMemo(() => {
    // on first load, twice, attempt this timeout setting
    window.setTimeout(() => {
      zoomFit();
    });
  }, []);

  const onResize = (size: Size, data: string) => {
    setState({
      ...state,
      size,
      undo: { past: [], future: [], current: data },
      ModalContent: undefined,
    });
    zoomFit();
  };
  const ResizeModal = (modalProps: ModalContentProps): JSX.Element => {
    return (
      <Resize
        onClose={modalProps.onClose}
        onResize={onResize}
        data={state.undo.current}
        size={state.size}
      />
    );
  };

  const ExportModal = (modalProps: ModalContentProps): JSX.Element => {
    return (
      <Export
        onClose={modalProps.onClose}
        data={state.undo.current}
        size={state.size}
        title={state.title}
      />
    );
  };

  const onNew = async (size: Size, title: string) => {
    const root = await navigator.storage.getDirectory();
    const file = await root.getFileHandle(`${title}.png`, { create: true });
    setState({
      ...state,
      size,
      undo: { past: [], future: [], current: "" },
      ModalContent: undefined,
      title,
      documentScroll: { x: 0, y: 0 },
      pan: { x: 0, y: 0 },
      file,
    });
  };
  const NewModal = (modalProps: ModalContentProps): JSX.Element => {
    return <New onClose={modalProps.onClose} onNew={onNew} />;
  };

  const onImport = (data: string, size: Size, title: string) => {
    setState({
      ...state,
      size,
      undo: { past: [], future: [], current: data },
      ModalContent: undefined,
      title,
      documentScroll: { x: 0, y: 0 },
      pan: { x: 0, y: 0 },
    });
  };
  const ImportModal = (modalProps: ModalContentProps): JSX.Element => {
    return <Import onClose={modalProps.onClose} onImport={onImport} />;
  };

  const onImportPalette = (colors: Color[]) => {
    setState({
      ...state,
      ModalContent: undefined,
      palette: colors,
    });
  };
  const ImportPaletteModal = (modalProps: ModalContentProps): JSX.Element => {
    return (
      <ImportPalette onClose={modalProps.onClose} onImport={onImportPalette} />
    );
  };

  const onLimitPalette = (limit: PALETTE) => {
    setState({
      ...state,
      ModalContent: undefined,
      paletteLimit: limit,
    });
  };
  const PaletteLimitModal = (modalProps: ModalContentProps): JSX.Element => {
    return (
      <PaletteLimit
        onClose={modalProps.onClose}
        onChange={onLimitPalette}
        limit={state.paletteLimit}
      />
    );
  };

  const onOpen = (data: string, size: Size, title: string) => {
    setState({
      ...state,
      size,
      undo: { past: [], future: [], current: data },
      ModalContent: undefined,
      title,
      documentScroll: { x: 0, y: 0 },
      pan: { x: 0, y: 0 },
    });
  };
  const OpenModal = (modalProps: ModalContentProps): JSX.Element => {
    return <Open onClose={modalProps.onClose} onOpen={onOpen} />;
  };

  const onSaveAs = async (title: string) => {
    const root = await navigator.storage.getDirectory();
    const file = await root.getFileHandle(`${title}.png`, { create: true });
    setState({
      ...state,
      ModalContent: undefined,
      title,
      file,
    });
    onSave(file);
  };
  const SaveAsModal = (modalProps: ModalContentProps): JSX.Element => {
    return (
      <SaveAs
        onClose={modalProps.onClose}
        title={state.title}
        onSaveAs={onSaveAs}
      />
    );
  };

  const onSave = async (file?: FileSystemFileHandle) => {
    const theFile = file ? file : state.file;
    if (theFile) {
      const operation: FileWrieOperationMessage = {
        file: theFile.name,
        data: state.undo.current,
      };
      fileWorker.postMessage(JSON.stringify(operation));
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
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
          setState({...state, tool: TOOL.PENCIL});
          break;
        case "e":
          setState({...state, tool: TOOL.ERASER});
          break;
        case "g":
          setState({...state, tool: TOOL.BUCKET});
          break;
        case "i":
          setState({...state, tool: TOOL.DROPPER});
          break;
        case "p":
          setState({...state, tool: TOOL.PEN});
          break;
      }
    }
  };

  useEffect(() => {
    document.onkeyup = onKeyUp;
  });

  return (
    <div className={styles.root}>
      {state.ModalContent && (
        <Modal onClose={onModalClose}>
          <state.ModalContent onClose={onModalClose} />
        </Modal>
      )}
      <MenuBar
        onClear={onClear}
        undo={undo}
        redo={redo}
        canRedo={canRedo}
        canUndo={canUndo}
        onPaletteClear={onPaletteClear}
        onPaletteLockChange={onPaletteLockChange}
        paletteLocked={state.paletteLocked}
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        zoomFit={zoomFit}
        modalOpen={modalOpen}
        openModal={state.ModalContent !== undefined}
        ResizeModal={ResizeModal}
        ExportModal={ExportModal}
        NewModal={NewModal}
        ImportModal={ImportModal}
        ImportPaletteModal={ImportPaletteModal}
        PaletteLimitModal={PaletteLimitModal}
        OpenModal={OpenModal}
        SaveAsModal={SaveAsModal}
        save={onSave}
      />
      <Document
        active={state.ModalContent === undefined}
        size={state.size}
        title={state.title}
      >
        <div className={styles.wrapper} ref={wrapperRef}>
          <div className={styles.inner}>
            <Canvas
              size={state.size}
              color={state.color}
              tool={state.tool}
              setScroll={setScroll}
              onColorChange={onColorChange}
              zoom={state.zoom}
              onZoomChange={onZoomChange}
              pan={state.pan}
              onPanChange={onPanChange}
              onUndoTick={onUndoTick}
              data={state.undo.current}
            />
          </div>
        </div>
      </Document>
      <Tools
        canUndo={canUndo}
        canRedo={canRedo}
        undo={undo}
        redo={redo}
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        zoomFit={zoomFit}
        onToolChange={onToolChange}
        tool={state.tool}
      />
      <Palette
        onColorChange={onColorChange}
        color={state.color}
        palette={state.palette}
        limit={state.paletteLimit}
        locked={state.paletteLocked}
      />
    </div>
  );
}

export default Dotty;
