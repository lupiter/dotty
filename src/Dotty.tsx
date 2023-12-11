import "./Dotty.css";
import { MenuBar } from "./menubar/menubar";
import { Document } from "./document/document";
import { Tools } from "./tools/tools";

function Dotty() {
  const onDownload = () => {};
  const onClear = () => {};
  const onPaletteChange = (palette: string) => {};
  const onPaletteClear = () => {};
  const onPaletteLockChange = (value: boolean) => {};
  const undo = () => {};
  const redo = () => {};
  const zoomIn = () => {};
  const zoomOut = () => {};
  const zoomFit = () => {};

  return (
    <>
      <MenuBar
        onClear={onClear}
        onDownload={onDownload}
        undo={undo}
        redo={redo}
        onPaletteChange={onPaletteChange}
        canRedo={false}
        canUndo={true}
        onPaletteClear={onPaletteClear}
        onPaletteLockChange={onPaletteLockChange}
        paletteLocked={true}
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        zoomFit={zoomFit}
      />
      <Document active={true} />
      <Tools />
      {/* 
      <Palette /> */}
    </>
  );
}

export default Dotty;
