import { ChangeEvent, useState } from "react";
import styles from "./palette.module.css";
import { PALETTE, paletteLabel } from "../modal/palette-limit";
import { Color } from "../color/color";
import lockIcon from "../assets/lock.png"

type PaletteState = {
  history: Color[];
};

export function Palette(props: {
  color: Color;
  onColorChange: (color: Color) => void;
  palette: Color[];
  limit: PALETTE;
  locked: boolean;
}) {
  const [state, setState] = useState<PaletteState>({
    history: [],
  });

  const setColor = (color: Color) => {
    if (props.locked && (!props.palette.includes(color) && !state.history.includes(color))) {
      return;
    }
    const history = [props.color, ...state.history];
    setState({ ...state, history: Color.dedupe(history) });
    props.onColorChange(color.limit(props.limit));
  };

  const updateColor = (e: ChangeEvent<HTMLInputElement>) => {
    setColor(Color.fromHex(e.target.value));
  };

  return (
    <div className={styles.window}>
      <div className={styles.active}>
        <input
          type="color"
          aria-label={`Current color`}
          onChange={updateColor}
          value={props.color.hex}
          className={styles.input}
        />
        {props.limit !== PALETTE.FULL && <div className={styles.limited}>{paletteLabel(props.limit)}</div>}
      </div>
      <div className={styles.history}>
        {state.history.map((color) => (
          <button
            className={styles.colorChip}
            style={{ color: color.hex, backgroundColor: color.hex }}
            onClick={() => setColor(color)}
            key={color.hex}
          >
            {color.hex}
          </button>
        ))}

        {props.palette.map((color) => (
          <button
            className={styles.colorChip}
            style={{ color: color.hex, backgroundColor: color.hex }}
            onClick={() => setColor(color)}
            key={color.hex}
          >
            {color.hex}
          </button>
        ))}
      </div>

      {props.locked && <div className={styles.locked}><img src={lockIcon} alt="Palette locked" /></div>}
    </div>
  );
}
