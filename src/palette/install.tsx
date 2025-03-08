import { PaletteModel } from "./model";
import { PaletteController } from "./controller";
import { PaletteView } from "./view";
import { Color } from "../color/color";
import { PALETTE } from "../modal/palette-limit";

export interface PaletteProps {
  color: Color;
  onColorChange: (color: Color) => void;
  palette: Color[];
  limit: PALETTE;
  locked: boolean;
}

export function installPalette(props: PaletteProps) {
  // Create singleton instances
  const model = new PaletteModel();
  const controller = new PaletteController(model);

  // Return the configured component
  return (
    <PaletteView
      {...props}
      model={model}
      controller={controller}
    />
  );
}
