import { TOOL } from "../tools/tools";
import { Point, Geometry, Size, PointSet } from "../color/geometry";
import { Color } from "../color/color";
import { PIXEL_SHAPE } from "../modal/view-options";

export type CanvasProps = {
  size: Size;
  tool: TOOL;
  color: Color;
  setScroll: (scroll: Point) => void;
  onColorChange: (color: Color) => void;
  zoom: number;
  pan: Point;
  onPanChange: (pan: Point) => void;
  onZoomChange: (zoom: number) => void;
  onUndoTick: (data: string) => void;
  data: string;
  pixelShape: PIXEL_SHAPE;
};

export type CanvasState = {
  initialPanZoomTouch?: React.TouchList;
  lastTouch?: React.TouchList;
  mousedown: boolean;
  scale: number;
  moveOrigin?: Point;
  translate?: Point;
  backgroundSize: number;
};

export const SINGLE_TRANSPARENT_PIXEL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

export type SetCanvasState = React.Dispatch<React.SetStateAction<CanvasState>>;

export class CanvasManager {
  static panZoom(
    state: CanvasState,
    setState: SetCanvasState,
    onPanChange: CanvasProps["onPanChange"],
    touches: React.TouchList
  ) {
    const initial = state.initialPanZoomTouch ? state.initialPanZoomTouch : touches;
    const { pan, spread } = Geometry.panAndSpread(initial, touches);
    setState({
      ...state,
      lastTouch: touches,
      scale: spread,
      initialPanZoomTouch: initial,
    });
    onPanChange(pan);
  }

  static stopPanZoom(
    state: CanvasState,
    setState: SetCanvasState,
    props: CanvasProps
  ) {
    if (state.initialPanZoomTouch && state.lastTouch) {
      const { pan, spread } = Geometry.panAndSpread(
        state.initialPanZoomTouch,
        state.lastTouch
      );
      // console.log("canvas: onstop", pan, spread, props.pan, state.scale);
      props.setScroll(pan);
      props.onPanChange(pan);

      setState({
        ...state,
        scale: 1.0,
        lastTouch: undefined,
        initialPanZoomTouch: undefined,
      });

      props.onZoomChange(props.zoom * spread);
    }
  }

  static pickColor(
    props: CanvasProps,
    offset: Point,
    ctx: CanvasRenderingContext2D
  ) {
    if (ctx) {
      const x = Math.floor(offset.x / props.zoom);
      const y = Math.floor(offset.y / props.zoom);
      props.onColorChange(
        Color.fromPixel(ctx.getImageData(x, y, 1, 1).data)
      );
    }
  }

  static floodFill(
    props: CanvasProps,
    point: Point,
    imageData: Uint8ClampedArray,
  ): Uint8ClampedArray {
    console.log('flood fill', point, props);
    // Credit: Tom Cantwell https://cantwell-tom.medium.com/flood-fill-and-line-tool-for-html-canvas-65e08e31aec6

    let start = (point.y * props.size.width + point.x) * 4;
    let pixel = imageData.slice(start, start + 16);
    // exit if color is the same
    let color = Color.fromPixel(pixel);
    if (props.color.hexWithAlpha === color.hexWithAlpha) {
      console.log(`shorcut, ${color.hexWithAlpha} already matches ${props.color.hexWithAlpha}`);
      return imageData;
    } else {
      console.log(`fill! ${color.hexWithAlpha} to ${props.color.hexWithAlpha}`);
    }

    const matchStartColor = (pixelPos: number, data: Uint8ClampedArray) => {
      let col = Color.fromPixel(data.slice(pixelPos, pixelPos + 16));
      return col.hexWithAlpha === color.hexWithAlpha;
    };
    const colorPixel = (data: Uint8ClampedArray, pixelPos: number, color: Color) => {
      data[pixelPos] = color.r;
      data[pixelPos + 1] = color.g;
      data[pixelPos + 2] = color.b;
      data[pixelPos + 3] = color.a;
    };

    let pixelStack = new PointSet([point]);
    let width = props.size.width;
    let height = props.size.height;
    let reachLeft: boolean;
    let reachRight: boolean;
    while (
      pixelStack.size > 0 &&
      pixelStack.size <= props.size.width * props.size.height
    ) {
      const newPos = pixelStack.pop()!;
      let x = newPos.x;
      let y = newPos.y; // get current pixel position
      let pixelPos = (y * width + x) * 4;
      // Go up as long as the color matches and are inside the canvas
      while (y >= 0 && matchStartColor(pixelPos, imageData)) {
        y--;
        pixelPos -= width * 4;
      }
      // Don't overextend
      pixelPos += width * 4;
      y++;
      reachLeft = false;
      reachRight = false;

      // Go down as long as the color matches and in inside the canvas
      while (y < height && matchStartColor(pixelPos, imageData)) {
        colorPixel(imageData, pixelPos, props.color);
        if (x > 0) {
          if (matchStartColor(pixelPos - 4, imageData)) {
            if (!reachLeft) {
              //Add pixel to stack
              pixelStack.add({ x: x - 1, y });
              reachLeft = true;
            }
          } else if (reachLeft) {
            reachLeft = false;
          }
        }
        if (x < width - 1) {
          if (matchStartColor(pixelPos + 4, imageData)) {
            if (!reachRight) {
              // Add pixel to stack
              pixelStack.add({ x: x + 1, y });
              reachRight = true;
            }
          } else if (reachRight) {
            reachRight = false;
          }
        }
        y++;
        pixelPos += width * 4;
      }
    }

    // render floodFill result
    return imageData;
  }

  static startMove(
    state: CanvasState,
    setState: SetCanvasState,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ) {
    console.log("canvas: start moving");
    setState({
      ...state,
      moveOrigin: { x: 0, y: 0 },
      translate: { x: 0, y: 0 },
    });
    ctx.beginPath();
    ctx.drawImage(canvas, 0, 0);
    ctx.closePath();
  }

  static applyMove(
    state: CanvasState,
    props: CanvasProps,
    canvas: HTMLCanvasElement
  ) {
    console.log("canvas: finish and apply move");
    const data = canvas.toDataURL();
    if (state.translate) {
      this.paintData(props, data, canvas.getContext("2d")!, state.translate);
    }
  }

  static stopMove(state: CanvasState, setState: SetCanvasState) {
    console.log("canvas: cancel move");
    setState({ ...state, translate: undefined, moveOrigin: undefined });
  }

  static move(
    state: CanvasState,
    setState: SetCanvasState,
    point: Point,
    origin: Point = { x: 0, y: 0 }
  ) {
    console.log("canvas: move", point, origin);
    if (state.translate && (state.translate.x != 0 || state.translate.y != 0)) {
      const expected = {
        x: Math.floor(point.x - origin.x + state.translate.x),
        y: Math.floor(point.y - origin.y + state.translate.y),
      };
      console.log(
        `expected: ${expected.x},${expected.y} current: ${state.translate.x},${
          state.translate.y
        } origin: ${state.moveOrigin!.x},${state.moveOrigin!.y}`
      );
      if (expected.x != state.translate.x || expected.y != state.translate.y) {
        setState({ ...state, translate: expected });
      }
    } else {
      setState({
        ...state,
        translate: {
          x: Math.floor(point.x - origin.x),
          y: Math.floor(point.y - origin.y),
        },
      });
    }
  }

  static paintData(
    props: CanvasProps,
    data: string,
    ctx: CanvasRenderingContext2D,
    at: Point = { x: 0, y: 0 }
  ) {
    const img = new Image();
    if (data === "") {
      img.src = SINGLE_TRANSPARENT_PIXEL;
    } else {
      img.src = data;
    }
    const width = props.size.width;
    const height = props.size.height;

    img.onload = function () {
      ctx.beginPath();
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, at.x, at.y, width, height);
      ctx.closePath();
      URL.revokeObjectURL(img.src);
    };

    img.onerror = function (e) {
      console.warn('sad data', e, data);
    }
  }

  static paint(
    props: CanvasProps,
    ctx: CanvasRenderingContext2D,
    offset: Point
  ) {
    const x = Math.floor(offset.x / props.zoom);
    const y = Math.floor(offset.y / props.zoom);
    const fillStyle = props.color.hex;
    // console.log(props.tool, fillStyle, {x, y});
    ctx.beginPath();
    if (props.tool === TOOL.PEN) {
      ctx.fillStyle = fillStyle;
      ctx.fillRect(x, y, 1, 1);
    } else if (props.tool === TOOL.ERASER) {
      ctx.clearRect(x, y, 1, 1);
    } else if (props.tool === TOOL.PENCIL) {
      let remainX = offset.x / props.zoom - x;
      let remainY = offset.y / props.zoom - y;
      if (remainX > 0.2 && remainY > 0.2 && remainX < 0.8 && remainY < 0.8) {
        ctx.fillStyle = fillStyle;
        ctx.fillRect(x, y, 1, 1);
      }
    } else if (props.tool === TOOL.BUCKET) {
      const image = ctx.getImageData(0, 0, props.size.width, props.size.height);
      const imageData = this.floodFill(props, { x, y }, image.data);
      ctx.putImageData(new ImageData(imageData, props.size.width, props.size.height), 0, 0);
    } else {
      // ignore other tools
    }
    ctx.closePath();
  }
}
