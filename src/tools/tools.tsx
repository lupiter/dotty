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

export enum TOOL {
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

type ToolProps = {
  canUndo: boolean;
  canRedo: boolean;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomFit: () => void;
  undo: () => void;
  redo: () => void;
  tool: TOOL;
  onToolChange: (tool: TOOL) => void;
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

  const toolName = useId();

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
              checked={props.tool === tool.value}
              onChange={() => props.onToolChange(tool.value)}
            />
            <label
              htmlFor={tool.id}
              className={`${styles.radioButton} ${
                props.tool === tool.value && styles.active
              }`}
            >
              <img
                src={tool.icon}
                className={styles.pixelIcon}
                alt={tool.label}
                title={tool.label}
              />
            </label>
          </span>
        ))}
      </fieldset>

      <div className={styles.actions}>
        <button
          className={styles.iconButton}
          disabled={!props.canUndo}
          onClick={props.undo}
        >
          <img src={undoIcon} alt="Undo" className={styles.pixelIcon} />
        </button>
        <button
          className={styles.iconButton}
          disabled={!props.canRedo}
          onClick={props.redo}
        >
          <img src={redoIcon} alt="Redo" className={styles.pixelIcon} />
        </button>
        <button
          className={`${styles.iconButton} ${styles.largerDevice}`}
          aria-label="zoom out"
          onClick={props.zoomOut}
        >
          <img src={zoomOutIcon} alt="-" className={styles.pixelIcon} />
        </button>
        <button
          className={`${styles.iconButton} ${styles.largerDevice}`}
          aria-label="zoom in"
          onClick={props.zoomIn}
        >
          <img src={zoomInIcon} alt="+" className={styles.pixelIcon} />
        </button>
        <button
          className={`${styles.iconButton} ${styles.mediumDevice}`}
          aria-label="zoom to fit"
          onClick={props.zoomFit}
        >
          <img src={zoomFitIcon} alt="=" className={styles.pixelIcon} />
        </button>
      </div>
    </div>
  );
}
