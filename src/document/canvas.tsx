import { createRef, useEffect, useRef, useState } from "react";
import styles from "./canvas.module.css";
import { Point } from "../color/geometry";
import { CanvasProps, CanvasController, CanvasState } from "./canvas-controler";
import { TOOL } from "../tools/tools";

export function Canvas(props: CanvasProps) {
  const [state, setState] = useState<CanvasState>({
    mousedown: false,
    scale: 1.0,
    backgroundSize: 1.0,
  });
  const canvasRef = createRef<HTMLCanvasElement>();
  const moveCanvasRef = createRef<HTMLCanvasElement>();
  const lastTool = useRef<TOOL>(props.tool);

  useEffect(() => {
    if (props.tool === TOOL.MOVE) {
      CanvasController.startMove(
        state,
        setState,
        canvasRef.current!,
        moveCanvasRef.current?.getContext("2d")!
      );
    } else if (lastTool.current === TOOL.MOVE) {
      CanvasController.applyMove(state, props, canvasRef.current!);
      CanvasController.stopMove(state, setState);
    }
    lastTool.current = props.tool;
  }, [props.tool]);

  useEffect(() => {
    CanvasController.paintData(
      props,
      props.data,
      canvasRef.current?.getContext("2d")!
    );
  }, [props.data]);

  const undoTick = () => {
    const data = canvasRef.current?.toDataURL();
    if (data) {
      props.onUndoTick(data);
    }
  };

  const onStart = (offset: Point) => {
    if (!props.data) {
      undoTick();
    }
    setState({ ...state, mousedown: true });
    CanvasController.paint(props, canvasRef.current?.getContext("2d")!, offset);
  };

  const onMouseStart = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    onStart({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
  };

  const onTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 2) {
      // What are you trying to do??
      return;
    } else if (e.touches.length === 2) {
      CanvasController.panZoom(state, setState, props.onPanChange, e.touches);
    } else {
      const touch = e.touches[0];
      const box = canvasRef.current?.getBoundingClientRect()!;
      onStart({
        x: touch.clientX - box.x,
        y: touch.clientY - box.y,
      });
    }
  };

  const onMove = (offset: Point) => {
    if (!state.mousedown) {
      return;
    }
    const ctx = canvasRef.current?.getContext("2d");
    CanvasController.paint(props, ctx!, offset);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    e.preventDefault();
    onMove({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
  };

  const onTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setState({ ...state, lastTouch: e.touches });
    const last = e.touches[e.touches.length - 1];
    const box = canvasRef.current?.getBoundingClientRect()!;
    onMove({ x: last.clientX - box.x, y: last.clientY - box.y });
  };

  const onEnd = (offset?: Point) => {
    setState({ ...state, mousedown: false });

    CanvasController.stopPanZoom(state, setState, props);
    const ctx = canvasRef.current?.getContext("2d");

    if (props.tool === TOOL.DROPPER && offset) {
      CanvasController.pickColor(props, offset, ctx!);
    }

    undoTick();
  };

  const onMouseEnd = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    onEnd({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
  };

  const onTouchEnd = () => {
    if (!state.lastTouch) {
      onEnd();
      return;
    }
    const last = state.lastTouch[state.lastTouch?.length - 1];
    const box = canvasRef.current?.getBoundingClientRect()!;
    onEnd({ x: last.clientX - box.x, y: last.clientY - box.y });
  };

  // Moving

  const resumeMoving = (point: Point) => {
    const x = Math.floor(point.x / props.zoom);
    const y = Math.floor(point.y / props.zoom);
    setState({ ...state, mousedown: true, moveOrigin: { x, y } });
  };
  const continueMoving = (point: Point) => {
    if (!state.mousedown) {
      return;
    }
    CanvasController.move(
      state,
      setState,
      { x: point.x / props.zoom, y: point.y / props.zoom },
      state.moveOrigin
    );
  };
  const pauseMoving = () => {
    setState({ ...state, mousedown: false });
  };
  const onMoveTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = e.touches[0];
    const box = moveCanvasRef.current?.getBoundingClientRect()!;
    resumeMoving({ x: touch.clientX - box.x, y: touch.clientY - box.y });
  };
  const onMoveTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = e.touches[e.touches.length - 1];
    const box = moveCanvasRef.current?.getBoundingClientRect()!;
    continueMoving({ x: touch.clientX - box.x, y: touch.clientY - box.y });
  };
  const onMoveMouseStart = (
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    resumeMoving({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
  };
  const onMoveMouseMove = (
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    continueMoving({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
  };

  // Inline Styles

  const translate = `${props.pan.x}px ${props.pan.y}px`;
  const scale = `${state.scale}`;
  const height = `${props.size.height * props.zoom}px`;
  const width = `${props.size.width * props.zoom}px`;
  const backgroundSize = `${props.zoom * 2}px`;
  const moveTranslate =
    state.translate &&
    `${state.translate.x * props.zoom}px ${state.translate.y * props.zoom}px`;

  return (
    <>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        width={props.size.width}
        height={props.size.height}
        onMouseDown={onMouseStart}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseEnd}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ translate, scale, height, width, backgroundSize }}
      />

      {props.tool === TOOL.MOVE && (
        <canvas
          ref={moveCanvasRef}
          className={styles.moveCanvas}
          width={props.size.width}
          height={props.size.height}
          onTouchStart={onMoveTouchStart}
          onTouchMove={onMoveTouchMove} // may need passive = false here
          onTouchEnd={pauseMoving}
          onMouseDown={onMoveMouseStart}
          onMouseMove={onMoveMouseMove}
          onMouseUp={pauseMoving}
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
