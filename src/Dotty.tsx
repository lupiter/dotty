import "./Dotty.css";
import { MenuBar } from "./menubar/menubar";

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
      {/* <Document />
      <Tools />
      <Palette /> */}
    </>
  );
}

export default Dotty;
