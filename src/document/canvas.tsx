import { createRef, useEffect, useState } from "react";
import styles from "./document.module.css";
import { Point } from "./geometry";
import { CanvasProps, CanvasController, CanvasState } from "./canvas-controler";
import { TOOL } from "../tools/tools";

export function Canvas(props: CanvasProps) {
  const [state, setState] = useState<CanvasState>({
    mousedown: false,
    pan: { x: 0, y: 0 },
    scale: 1.0,
    backgroundSize: 1.0,
  });
  const canvasRef = createRef<HTMLCanvasElement>();
  const moveCanvasRef = createRef<HTMLCanvasElement>();

  useEffect(() => {
    if (props.tool === TOOL.MOVE) {
      CanvasController.startMove(
        state,
        setState,
        canvasRef.current!,
        moveCanvasRef.current?.getContext("2d")!
      );
    }
  }, [props.tool]);

  const undoTick = () => {
    // todo
  };

  const onStart = (offset: Point) => {
    undoTick();
    setState({ ...state, mousedown: true });
    CanvasController.paint(
      state,
      setState,
      props,
      canvasRef.current?.getContext("2d")!,
      offset
    );
  };

  const onMouseStart = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    onStart({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
  };

  const onTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 2) {
      // What are you trying to do??
      return;
    } else if (e.touches.length === 2) {
      undoTick();
      CanvasController.panZoom(state, setState, e.touches);
    } else {
      const touch = e.touches[0];
      const box = canvasRef.current?.getBoundingClientRect()!;
      onStart({
        x: touch.clientX - box.x,
        y: touch.clientY - box.y,
      });
    }
  };

  const onEnd = (offset: Point) => {
    setState({ ...state, mousedown: false });

    CanvasController.stopPanZoom(state, setState, props);
    const ctx = canvasRef.current?.getContext("2d");

    if (props.tool === TOOL.DROPPER) {
      CanvasController.pickColor(props, offset, ctx!);
    } else if (props.tool === TOOL.MOVE) {
      const data = canvasRef.current!.toDataURL();
      CanvasController.paintData(props, data, ctx!, {
        x: state.pan.x / props.zoom,
        y: state.pan.y / props.zoom,
      });
      setState({ ...state, pan: { x: 0, y: 0 }, moveOrigin: undefined });
    }

    CanvasController.save(canvasRef.current!);
  };

  const onMouseEnd = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    onEnd({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
  };

  const onTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const last = e.touches[e.touches.length - 1];
    const box = canvasRef.current?.getBoundingClientRect()!;
    onEnd({ x: last.clientX - box.x, y: last.clientY - box.y });
  };

  const resumeMoving = (point: Point) => {
    console.log("canvas: resume moving");
    const x = Math.floor(point.x / props.zoom);
    const y = Math.floor(point.y / props.zoom);
    setState({ ...state, mousedown: true, moveOrigin: { x, y } });
    if (props.tool !== TOOL.MOVE) {
      CanvasController.stopMove(
        state,
        setState,
        props,
        canvasRef.current?.getContext("2d")!,
        point
      );
    }
  };
  const continueMoving = (point: Point) => {
    if (!state.mousedown) {
      return;
    }
    if (props.tool !== TOOL.MOVE) {
      CanvasController.stopMove(
        state,
        setState,
        props,
        canvasRef.current?.getContext("2d")!,
        point
      );
    }
    CanvasController.paint(
      state,
      setState,
      props,
      canvasRef.current?.getContext("2d")!,
      point
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

  const translate = `${state.pan.x}px ${state.pan.y}px`;
  const scale = `${state.scale}`;
  const height = `${props.size.height * props.zoom}px`;
  const width = `${props.size.width * props.zoom}px`;
  const backgroundSize = `${props.zoom * 2}px`;

  return (
    <>
      {props.tool === TOOL.MOVE && (
        <canvas
          ref={moveCanvasRef}
          className={styles.canvas}
          width={props.size.width}
          height={props.size.height}
          onTouchStart={onMoveTouchStart}
          onTouchMove={onMoveTouchMove} // may need passive = false here
          onTouchEnd={pauseMoving}
          onMouseDown={onMoveMouseStart}
          onMouseMove={onMoveMouseMove}
          onMouseUp={pauseMoving}
          style={{ translate, scale, height, width, backgroundSize }}
        />
      )}
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        width={props.size.width}
        height={props.size.height}
        onMouseDown={onMouseStart}
        onTouchStart={onTouchStart}
        onMouseUp={onMouseEnd}
        onTouchEnd={onTouchEnd}
        style={{ translate, scale, height, width, backgroundSize }}
      />
    </>
  );
}
