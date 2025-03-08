import { RefObject } from "react";
import { Point } from "../color/geometry";
import { CanvasProps, CanvasManager, CanvasState } from "./canvas-manager";
import { TOOL } from "../tools/tools";
import { PIXEL_SHAPE } from "../modal/view-options";

export class CanvasController {
  private props: CanvasProps;
  private state: CanvasState;
  private setState: React.Dispatch<React.SetStateAction<CanvasState>>;
  private canvasRef: RefObject<HTMLCanvasElement | null>;
  private moveCanvasRef: RefObject<HTMLCanvasElement | null>;
  private lastTool: RefObject<TOOL>;

  constructor(
    props: CanvasProps,
    state: CanvasState,
    setState: React.Dispatch<React.SetStateAction<CanvasState>>,
    canvasRef: RefObject<HTMLCanvasElement | null>,
    moveCanvasRef: RefObject<HTMLCanvasElement | null>,
    lastTool: RefObject<TOOL>
  ) {
    this.props = props;
    this.state = state;
    this.setState = setState;
    this.canvasRef = canvasRef;
    this.moveCanvasRef = moveCanvasRef;
    this.lastTool = lastTool;

    // Bind methods to ensure correct 'this' context
    this.init = this.init.bind(this);
    this.undoTick = this.undoTick.bind(this);
    this.adjustPointForPixelShape = this.adjustPointForPixelShape.bind(this);
    this.onStart = this.onStart.bind(this);
    this.onMouseStart = this.onMouseStart.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onEnd = this.onEnd.bind(this);
    this.onMouseEnd = this.onMouseEnd.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.resumeMoving = this.resumeMoving.bind(this);
    this.continueMoving = this.continueMoving.bind(this);
    this.pauseMoving = this.pauseMoving.bind(this);
    this.onMoveTouchStart = this.onMoveTouchStart.bind(this);
    this.onMoveTouchMove = this.onMoveTouchMove.bind(this);
    this.onMoveMouseStart = this.onMoveMouseStart.bind(this);
    this.onMoveMouseMove = this.onMoveMouseMove.bind(this);
  }

  init() {
    if (this.props.tool === TOOL.MOVE) {
      CanvasManager.startMove(
        this.state,
        this.setState,
        this.canvasRef.current!,
        this.moveCanvasRef.current?.getContext("2d")!
      );
    } else if (this.lastTool.current === TOOL.MOVE) {
      CanvasManager.applyMove(this.state, this.props, this.canvasRef.current!);
      CanvasManager.stopMove(this.state, this.setState);
    }
    this.lastTool.current = this.props.tool;

    CanvasManager.paintData(
      this.props,
      this.props.data,
      this.canvasRef.current?.getContext("2d")!
    );
  }

  private undoTick() {
    const data = this.canvasRef.current?.toDataURL();
    if (data) {
      this.props.onUndoTick(data);
    }
  }

  private adjustPointForPixelShape(point: Point): Point {
    if (this.props.pixelShape === PIXEL_SHAPE.SQUARE) {
      return point;
    }
    return {y: point.y, x: point.x/1.333};
  }

  private onStart(offset: Point) {
    if (!this.props.data) {
      this.undoTick();
    }
    this.setState({ ...this.state, mousedown: true });
    CanvasManager.paint(this.props, this.canvasRef.current?.getContext("2d")!, this.adjustPointForPixelShape(offset));
  }

  onMouseStart(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    this.onStart({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
  }

  onTouchStart(e: React.TouchEvent<HTMLCanvasElement>) {
    if (e.touches.length > 2) {
      return;
    } else if (e.touches.length >= 2) {
      CanvasManager.panZoom(this.state, this.setState, this.props.onPanChange, e.touches);
    } else {
      const touch = e.touches[0];
      const box = this.canvasRef.current?.getBoundingClientRect()!;
      this.onStart({
        x: touch.clientX - box.x,
        y: touch.clientY - box.y,
      });
    }
  }

  private onMove(offset: Point) {
    if (!this.state.mousedown) {
      return;
    }
    const ctx = this.canvasRef.current?.getContext("2d");
    CanvasManager.paint(this.props, ctx!, this.adjustPointForPixelShape(offset));
  }

  onMouseMove(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    e.preventDefault();
    this.onMove({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
  }

  onTouchMove(e: React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault();
    this.setState({ ...this.state, lastTouch: e.touches });
    if (this.state.initialPanZoomTouch) {
      CanvasManager.panZoom(this.state, this.setState, this.props.onPanChange, e.touches);
      return;
    }
    const last = e.touches[e.touches.length - 1];
    const box = this.canvasRef.current?.getBoundingClientRect()!;
    this.onMove({ x: last.clientX - box.x, y: last.clientY - box.y });
  }

  private onEnd(offset?: Point) {
    this.setState({ ...this.state, mousedown: false });
    CanvasManager.stopPanZoom(this.state, this.setState, this.props);
    const ctx = this.canvasRef.current?.getContext("2d");

    if (this.props.tool === TOOL.DROPPER && offset) {
      CanvasManager.pickColor(this.props, this.adjustPointForPixelShape(offset), ctx!);
    }

    this.undoTick();
  }

  onMouseEnd(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    this.onEnd({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
  }

  onTouchEnd() {
    if (!this.state.lastTouch) {
      this.onEnd();
      return;
    }
    const last = this.state.lastTouch[this.state.lastTouch?.length - 1];
    const box = this.canvasRef.current?.getBoundingClientRect()!;
    this.onEnd({ x: last.clientX - box.x, y: last.clientY - box.y });
  }

  private resumeMoving(point: Point) {
    const x = Math.floor(point.x / this.props.zoom);
    const y = Math.floor(point.y / this.props.zoom);
    this.setState({ ...this.state, mousedown: true, moveOrigin: { x, y } });
  }

  private continueMoving(point: Point) {
    if (!this.state.mousedown) {
      return;
    }
    CanvasManager.move(
      this.state,
      this.setState,
      { x: point.x / this.props.zoom, y: point.y / this.props.zoom },
      this.state.moveOrigin
    );
  }

  pauseMoving() {
    this.setState({ ...this.state, mousedown: false });
  }

  onMoveTouchStart(e: React.TouchEvent<HTMLCanvasElement>) {
    const touch = e.touches[0];
    const box = this.moveCanvasRef.current?.getBoundingClientRect()!;
    this.resumeMoving({ x: touch.clientX - box.x, y: touch.clientY - box.y });
  }

  onMoveTouchMove(e: React.TouchEvent<HTMLCanvasElement>) {
    const touch = e.touches[e.touches.length - 1];
    const box = this.moveCanvasRef.current?.getBoundingClientRect()!;
    this.continueMoving({ x: touch.clientX - box.x, y: touch.clientY - box.y });
  }

  onMoveMouseStart(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    this.resumeMoving({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
  }

  onMoveMouseMove(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    this.continueMoving({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
  }
} 