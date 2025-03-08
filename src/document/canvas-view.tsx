import { RefObject } from "react";
import styles from "./canvas.module.css";
import { Point } from "../color/geometry";
import { CanvasState } from "./canvas-manager";
import { TOOL } from "../tools/tools";
import { PIXEL_SHAPE } from "../modal/view-options";

interface CanvasViewProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  moveCanvasRef: RefObject<HTMLCanvasElement | null>;
  state: CanvasState;
  tool: TOOL;
  pan: Point;
  zoom: number;
  size: { width: number; height: number };
  pixelShape: PIXEL_SHAPE;
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => void;
  onMouseUp: (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => void;
  onTouchStart: (e: React.TouchEvent<HTMLCanvasElement>) => void;
  onTouchMove: (e: React.TouchEvent<HTMLCanvasElement>) => void;
  onTouchEnd: () => void;
  onMoveMouseStart?: (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => void;
  onMoveMouseMove?: (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => void;
  onMoveMouseUp?: () => void;
  onMoveTouchStart?: (e: React.TouchEvent<HTMLCanvasElement>) => void;
  onMoveTouchMove?: (e: React.TouchEvent<HTMLCanvasElement>) => void;
  onMoveTouchEnd?: () => void;
}

export function CanvasView(props: CanvasViewProps) {
  const translate = `${props.pan.x}px ${props.pan.y}px`;
  const scale = `${props.state.scale}`;
  const height = `${props.size.height * props.zoom}px`;
  const width = `${props.size.width * props.zoom * (props.pixelShape === PIXEL_SHAPE.SQUARE ? 1 : 1.333)}px`;
  const backgroundSize = `${props.zoom * 2 * (props.pixelShape === PIXEL_SHAPE.SQUARE ? 1 : 1.333)}px`;
  const moveTranslate =
    props.state.translate &&
    `${props.state.translate.x * props.zoom}px ${props.state.translate.y * props.zoom}px`;

  return (
    <>
      <canvas
        ref={props.canvasRef}
        className={styles.canvas}
        width={props.size.width}
        height={props.size.height}
        onMouseDown={props.onMouseDown}
        onMouseMove={props.onMouseMove}
        onMouseUp={props.onMouseUp}
        onTouchStart={props.onTouchStart}
        onTouchMove={props.onTouchMove}
        onTouchEnd={props.onTouchEnd}
        style={{ 
          translate, 
          scale, 
          height, 
          width, 
          backgroundSize
        }}
      />

      <div 
        className={`${styles.canvasOverlay} ${
          props.pixelShape === PIXEL_SHAPE.THREE_FOUR 
            ? styles.threeFourOverlay 
            : props.pixelShape === PIXEL_SHAPE.KNIT 
              ? styles.knitOverlay 
              : styles.squareOverlay
        }`}
        style={{
          width,
          height,
          backgroundSize,
        }}
      />

      {props.tool === TOOL.MOVE && (
        <canvas
          ref={props.moveCanvasRef}
          className={styles.moveCanvas}
          width={props.size.width}
          height={props.size.height}
          onTouchStart={props.onMoveTouchStart}
          onTouchMove={props.onMoveTouchMove}
          onTouchEnd={props.onMoveTouchEnd}
          onMouseDown={props.onMoveMouseStart}
          onMouseMove={props.onMoveMouseMove}
          onMouseUp={props.onMoveMouseUp}
          style={{
            translate: moveTranslate,
            scale,
            height,
            width,
            backgroundSize,
          }}
        />
      )}
    </>
  );
} 