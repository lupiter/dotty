import { ChangeEvent, useState } from "react";
import styles from "./palette.module.css";

type PaletteState = {
  history: string[];
};

export function Palette(props: {
  color: string;
  onColorChange: (color: string) => void;
  palette: string[];
}) {
  const [state, setState] = useState<PaletteState>({
    history: [],
  });

  const setColor = (color: string) => {
    const history = new Set([props.color, ...state.history]);
    setState({ ...state, history: [...history] });
    props.onColorChange(color);
  };

  const updateColor = (e: ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value + "ff");
  };

  const value = props.color.slice(0, 7);

  return (
    <div className={styles.window}>
      <div className={styles.active}>
        <input
          type="color"
          aria-label="Color"
          onChange={updateColor}
          value={value}
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

        {props.palette.map((color) => (
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
