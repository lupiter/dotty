import { ChangeEvent, useState } from "react";
import styles from "./palette.module.css";

type PaletteState = {
  history: string[];
};

export function Palette(props: {color: string, onColorChange: (color: string) => void}) {
  const [state, setState] = useState<PaletteState>({
    history: ["#ffffff", "#ff0000", "#00ff00", "#0000ff"],
  });

  const setColor = (color: string) => {
    const history = new Set([props.color, ...state.history]);
    setState({ ...state, history: [...history] });
    props.onColorChange(color);
  };

  const updateColor = (e: ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value);
  };

  return (
    <div className={styles.window}>
      <div className={styles.active}>
        <input
          type="color"
          aria-label="Color"
          onChange={updateColor}
          value={props.color}
          className={styles.input}
        />
      </div>
      <div className={styles.history}>
        {state.history.map((color) => (
          <button
            className={styles.colorChip}
            style={{ color: color, backgroundColor: color }}
            onClick={() => setColor(color)}
            key={color}
          >
            {color}
          </button>
        ))}
      </div>
    </div>
  );
}
