import { useEffect, useRef, useState } from "react";
import { CanvasProps, CanvasState } from "./canvas-manager";
import { TOOL } from "../tools/tools";
import { CanvasView } from "./canvas-view";
import { CanvasController } from "./canvas-controller";

export function Canvas(props: CanvasProps) {
  const [state, setState] = useState<CanvasState>({
    mousedown: false,
    scale: 1.0,
    backgroundSize: 1.0,
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const moveCanvasRef = useRef<HTMLCanvasElement>(null);
  const lastTool = useRef<TOOL>(props.tool);
  const controllerRef = useRef<CanvasController | null>(null);

  // Initialize controller if not already created
  if (!controllerRef.current) {
    controllerRef.current = new CanvasController(
      props,
      state,
      setState,
      canvasRef,
      moveCanvasRef,
      lastTool
    );
  }

  // Update controller props when they change
  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.init();
    }
  }, [props.tool, props.data]);

  return (
    <CanvasView
      canvasRef={canvasRef}
      moveCanvasRef={moveCanvasRef}
      state={state}
      tool={props.tool}
      pan={props.pan}
      zoom={props.zoom}
      size={props.size}
      pixelShape={props.pixelShape}
      onMouseDown={controllerRef.current!.onMouseStart}
      onMouseMove={controllerRef.current!.onMouseMove}
      onMouseUp={controllerRef.current!.onMouseEnd}
      onTouchStart={controllerRef.current!.onTouchStart}
      onTouchMove={controllerRef.current!.onTouchMove}
      onTouchEnd={controllerRef.current!.onTouchEnd}
      onMoveMouseStart={controllerRef.current!.onMoveMouseStart}
      onMoveMouseMove={controllerRef.current!.onMoveMouseMove}
      onMoveMouseUp={controllerRef.current!.pauseMoving}
      onMoveTouchStart={controllerRef.current!.onMoveTouchStart}
      onMoveTouchMove={controllerRef.current!.onMoveTouchMove}
      onMoveTouchEnd={controllerRef.current!.pauseMoving}
    />
  );
}
