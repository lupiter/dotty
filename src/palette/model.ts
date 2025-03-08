import { Color } from "../color/color";

export interface PaletteState {
  history: Color[];
}

export class PaletteModel {
  private state: PaletteState;
  
  constructor() {
    this.state = {
      history: []
    };
  }

  getHistory(): Color[] {
    return this.state.history;
  }

  updateHistory(currentColor: Color): void {
    const history = [currentColor, ...this.state.history];
    this.state.history = Color.dedupe(history);
  }

  canAddColor(color: Color, locked: boolean, palette: Color[]): boolean {
    if (!locked) return true;
    return palette.includes(color) || this.state.history.includes(color);
  }
} 