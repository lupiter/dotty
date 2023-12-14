import "./Dotty.css";
import { MenuBar } from "./menubar/menubar";
import { Document } from "./document/document";
import { TOOL, Tools } from "./tools/tools";
import { Palette } from "./palette/palette";
import { useState } from "react";
import { Modal } from "./modal/modal";
import { UndoManager, UndoState } from "./document/undo-manager";
import { Canvas } from "./document/canvas";
import { Point, Size } from "./document/geometry";

type DottyState = {
  ModalContent?: (props: { onClose: () => void }) => JSX.Element;
  undo: UndoState;
  tool: TOOL;
  color: string;
  zoom: number;
  size: Size;
  innerSize: Size;
  documentScroll: Point;
};

function Dotty() {
  const [state, setState] = useState<DottyState>({
    undo: { future: [], past: [], current: "" },
    tool: TOOL.PEN,
    color: "#000000",
    zoom: 1.0,
    size: { width: 16, height: 16 },
    innerSize: {width: 16, height: 16},
    documentScroll: { x: 0, y: 0 },
  });

  const onDownload = () => {};
  const onClear = () => {};
  const onPaletteChange = (palette: string) => {};
  const onPaletteClear = () => {};
  const onPaletteLockChange = (value: boolean) => {};
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
    console.log(
      `canvas: zoom reset; wrapper offset w: ${this.wrapper.offsetWidth} h ${this.wrapper.offsetHeight}; document w: ${this.document.width} h: ${this.document.height}`
    );
    if (this.wrapper.offsetWidth < this.wrapper.offsetHeight) {
      zoom =
        Math.round((this.wrapper.offsetWidth / this.document.width) * 10) / 10;
    } else {
      zoom =
        Math.round((this.wrapper.offsetHeight / this.document.height) * 10) /
        10;
    }
    if (zoom < 0.1) {
      zoom = 0.1;
    }
    this.canvas.style.translate = "";
    this.translate = { x: 0, y: 0 };
    setState({ ...state, zoom });
  };
  const onZoomChange = (zoom: number) => {
    setState({ ...state, zoom });
  };
  const onModalClose = () => {
    setState({ ...state, ModalContent: undefined });
  };
  const modalOpen = (
    ModalContent: (props: { onClose: () => void }) => JSX.Element
  ) => {
    setState({ ...state, ModalContent });
  };

  const onColorChange = (color: string) => {
    setState({ ...state, color });
  };

  const onToolChange = (tool: TOOL) => {
    setState({ ...state, tool });
  };

  const setScroll = (scroll: Point, size: Size) => {
    setState({
      ...state,
      documentScroll: scroll,
      innerSize: size,
    });
  };

  const canUndo = UndoManager.canUndo(state.undo);
  const canRedo = UndoManager.canRedo(state.undo);

  return (
    <>
      {state.ModalContent && (
        <Modal onClose={onModalClose}>
          <state.ModalContent onClose={onModalClose} />
        </Modal>
      )}
      <MenuBar
        onClear={onClear}
        onDownload={onDownload}
        undo={undo}
        redo={redo}
        onPaletteChange={onPaletteChange}
        canRedo={canRedo}
        canUndo={canUndo}
        onPaletteClear={onPaletteClear}
        onPaletteLockChange={onPaletteLockChange}
        paletteLocked={true}
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        zoomFit={zoomFit}
        modalOpen={modalOpen}
      />
      <Document
        active={state.ModalContent !== undefined}
        size={state.size}
        scroll={state.documentScroll}
      >
        <Canvas
          size={state.size}
          color={state.color}
          tool={state.tool}
          setScroll={setScroll}
          onColorChange={onColorChange}
          zoom={state.zoom}
          onZoomChange={onZoomChange}
        />
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
      <Palette onColorChange={onColorChange} color={state.color} />
    </>
  );
}

export default Dotty;
