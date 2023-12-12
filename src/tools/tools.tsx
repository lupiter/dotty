import penIcon from "../assets/tools/pen.png";
import bucketIcon from "../assets/tools/bucket.png";
import dropperIcon from "../assets/tools/dropper.png";
import eraserIcon from "../assets/tools/eraser.png";
import moveIcon from "../assets/tools/move.png";
import pencilIcon from "../assets/tools/pencil.png";
import redoIcon from "../assets/tools/redo.png";
import undoIcon from "../assets/tools/undo.png";
import zoomFitIcon from "../assets/tools/zoom-fit.png";
import zoomInIcon from "../assets/tools/zoom-in.png";
import zoomOutIcon from "../assets/tools/zoom-out.png";
import styles from "./tools.module.css";
import { useId, useState } from "react";

enum TOOL {
  PENCIL,
  PEN,
  BUCKET,
  ERASER,
  DROPPER,
  MOVE,
}

type ToolType = {
  label: string;
  icon: string;
  value: TOOL;
  id: string;
};

type ToolState = {
  active: TOOL;
};

type ToolProps = {
  canUndo: boolean;
  canRedo: boolean;
};

export function Tools(props: ToolProps) {
  const TOOLS: ToolType[] = [
    { label: "Pen, hotkey P", icon: penIcon, value: TOOL.PEN, id: useId() },
    {
      label: "Pencil, hotkey B",
      icon: pencilIcon,
      value: TOOL.PENCIL,
      id: useId(),
    },
    {
      label: "Bucket, hotkey G",
      icon: bucketIcon,
      value: TOOL.BUCKET,
      id: useId(),
    },
    {
      label: "Eraser, hotkey E",
      icon: eraserIcon,
      value: TOOL.ERASER,
      id: useId(),
    },
    {
      label: "Eyedropper, hotkey I",
      icon: dropperIcon,
      value: TOOL.DROPPER,
      id: useId(),
    },
    { label: "Move, hotkey M", icon: moveIcon, value: TOOL.MOVE, id: useId() },
  ];

  const [state, setState] = useState<ToolState>({ active: TOOL.PEN });
  const toolName = useId();

  const changeTool = (tool: TOOL) => {
    setState({ active: tool });
  };

  return (
    <div className={styles.window}>
      <fieldset className={styles.tools}>
        {TOOLS.map((tool) => (
          <span key={tool.value}>
            <input
              id={tool.id}
              className={styles.a11y}
              type="radio"
              name={toolName}
              value={tool.value}
              checked={state.active === tool.value}
              onChange={() => changeTool(tool.value)}
            />
            <label htmlFor={tool.id} className={`${styles.radioButton} ${state.active === tool.value && styles.active}`}>
              <img
                src={tool.icon}
                className={styles.pixelIcon}
                alt={tool.label}
              />
            </label>
          </span>
        ))}
      </fieldset>

      <div className={styles.actions}>
        <button className={styles.iconButton} disabled={!props.canUndo}>
          <img src={undoIcon} alt="Undo" className={styles.pixelIcon} />
        </button>
        <button className={styles.iconButton} disabled={!props.canRedo}>
          <img src={redoIcon} alt="Redo" className={styles.pixelIcon} />
        </button>
        <button className={styles.iconButton} aria-label="zoom out">
          <img src={zoomOutIcon} alt="-" className={styles.pixelIcon} />
        </button>
        <button className={styles.iconButton} aria-label="zoom in">
          <img src={zoomInIcon} alt="+" className={styles.pixelIcon} />
        </button>
        <button className={styles.iconButton} aria-label="zoom to fit">
          <img src={zoomFitIcon} alt="=" className={styles.pixelIcon} />
        </button>
      </div>
    </div>
  );
}
