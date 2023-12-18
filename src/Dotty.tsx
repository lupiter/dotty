import { MenuBar } from "./menubar/menubar";
import { Document } from "./document/document";
import { TOOL, Tools } from "./tools/tools";
import { Palette } from "./palette/palette";
import { useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "./modal/modal";
import { UndoManager, UndoState } from "./document/undo-manager";
import { Canvas } from "./document/canvas";
import { Point, Size } from "./document/geometry";
import styles from "./dotty.module.css";
import { RESIZE_FROM, Resize } from "./modal/resize";
import { ModalContentProps } from "./modal/modal-content";

type DottyState = {
  ModalContent?: (props: { onClose: () => void }) => JSX.Element;
  undo: UndoState;
  tool: TOOL;
  color: string;
  zoom: number;
  size: Size;
  documentScroll: Point;
  pan: Point;
};

function Dotty() {
  const [state, setState] = useState<DottyState>({
    undo: { future: [], past: [], current: "" },
    tool: TOOL.PEN,
    color: "#000000ff",
    zoom: 1.0,
    size: { width: 16, height: 16 },
    documentScroll: { x: 0, y: 0 },
    pan: { x: 0, y: 0 },
  });

  const wrapperRef = useRef<HTMLDivElement>(null);

  const onDownload = () => {};
  const onClear = () => {
    onUndoTick("");
  };
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

  const onColorChange = (color: string) => {
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

  const onResize = (from: RESIZE_FROM, size: Size) => {
    let point: Point;
    switch (from) {
      case RESIZE_FROM.TOP_LEFT:
        point = { x: 0, y: 0 };
        break;
      case RESIZE_FROM.TOP_RIGHT:
        point = { x: size.width - state.size.width, y: 0 };
        break;
      case RESIZE_FROM.BOTTOM_LEFT:
        point = { x: 0, y: size.height - state.size.height };
        break;
      case RESIZE_FROM.BOTTOM_RIGHT:
        point = {
          x: size.width - state.size.width,
          y: (size.height = state.size.height),
        };
        break;
      case RESIZE_FROM.CENTER:
        point = {
          x: (size.width - state.size.width) / 2,
          y: (size.height - state.size.height) / 2,
        };
        break;
    }

    const img = new Image();
    img.src = state.undo.current;
    const tmpCanvas = document.createElement('canvas');
    const ctx = tmpCanvas.getContext('2d')!;

    img.onload = function () {
      ctx.beginPath();
      ctx.drawImage(img, point.x, point.y, state.size.width, state.size.height);
      ctx.closePath();
      URL.revokeObjectURL(img.src);
      const data = tmpCanvas.toDataURL();
      setState({ ...state, size, undo: { past: [], future: [], current: data }})
    };
  };
  const ResizeModal = (modalProps: ModalContentProps) => {
    <Resize onClose={modalProps.onClose} onResize={onResize} />;
  };

  const onExport = () => {};
  const ExportModal = (modalProps: ModalContentProps) => {
    <Resize onClose={modalProps.onClose} onResize={onExport} />;
  };

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
        openModal={state.ModalContent !== undefined}
        ResizeModal={ResizeModal}
        ExportModal={ExportModal}
      />
      <Document active={state.ModalContent === undefined} size={state.size}>
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
      <Palette onColorChange={onColorChange} color={state.color} />
    </>
  );
}

export default Dotty;
