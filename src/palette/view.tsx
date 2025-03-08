import { ChangeEvent } from "react";
import styles from "./palette.module.css";
import { PALETTE, paletteLabel } from "../modal/palette-limit";
import { Color } from "../color/color";
import lockIcon from "../assets/lock.png";
import { PaletteModel } from "./model";
import { PaletteController } from "./controller";

interface PaletteProps {
  color: Color;
  onColorChange: (color: Color) => void;
  palette: Color[];
  limit: PALETTE;
  locked: boolean;
  model: PaletteModel;
  controller: PaletteController;
}

export function PaletteView(props: PaletteProps) {
  const updateColor = (e: ChangeEvent<HTMLInputElement>) => {
    props.controller.handleInputChange(
      e,
      props.locked,
      props.palette,
      props.limit,
      props.onColorChange
    );
  };

  const handleColorClick = (color: Color) => {
    props.controller.handleColorChange(
      color,
      props.locked,
      props.palette,
      props.limit,
      props.onColorChange
    );
  };

  return (
    <div className={styles.window}>
      <div className={styles.active}>
        <input
          type="color"
          aria-label="Current color"
          onChange={updateColor}
          value={props.color.hex}
          className={styles.input}
        />
        {props.limit !== PALETTE.FULL && (
          <div className={styles.limited}>{paletteLabel(props.limit)}</div>
        )}
      </div>
      <div className={styles.chips}>
        {props.model.getHistory().length > 0 && (
          <div className={styles.history}>
            {props.model.getHistory().map((color) => (
              <button
                className={styles.colorChip}
                style={{ color: color.hex, backgroundColor: color.hex }}
                onClick={() => handleColorClick(color)}
                key={color.hex}
              >
                {color.hex}
              </button>
            ))}
          </div>
        )}

        <div className={styles.history}>
          {props.palette.map((color) => (
            <button
              className={styles.colorChip}
              style={{ color: color.hex, backgroundColor: color.hex }}
              onClick={() => handleColorClick(color)}
              key={color.hex}
            >
              {color.hex}
            </button>
          ))}
        </div>
      </div>

      {props.locked && (
        <div className={styles.locked}>
          <img src={lockIcon} alt="Palette locked" />
        </div>
      )}
    </div>
  );
} 