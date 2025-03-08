import { JSX } from "react";
import { Color } from "./color/color";
import { Point, Size } from "./color/geometry";
import { UndoState } from "./document/undo-manager";
import { PALETTE } from "./modal/palette-limit";
import { PIXEL_SHAPE } from "./modal/view-options";
import { TOOL } from "./tools/tools";


export type SetDottyState = React.Dispatch<React.SetStateAction<DottyState>>;

export type DottyState = {
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
  pixelShape: PIXEL_SHAPE;
};