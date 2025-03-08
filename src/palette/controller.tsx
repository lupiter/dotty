import { ChangeEvent } from "react";
import { Color } from "../color/color";
import { PALETTE } from "../modal/palette-limit";
import { PaletteModel } from "./model";

export class PaletteController {
  private model: PaletteModel;

  constructor(model: PaletteModel) {
    this.model = model;
  }

  handleColorChange(
    color: Color,
    locked: boolean,
    palette: Color[],
    limit: PALETTE,
    onColorChange: (color: Color) => void
  ): void {
    if (!this.model.canAddColor(color, locked, palette)) {
      return;
    }
    this.model.updateHistory(color);
    onColorChange(color.limit(limit));
  }

  handleInputChange(
    e: ChangeEvent<HTMLInputElement>,
    locked: boolean,
    palette: Color[],
    limit: PALETTE,
    onColorChange: (color: Color) => void
  ): void {
    try {
      const color = Color.fromHex(e.target.value);
      this.handleColorChange(color, locked, palette, limit, onColorChange);
    } catch (error) {
      // Silently handle invalid color inputs
      console.debug('Invalid color input:', e.target.value);
    }
  }
} 