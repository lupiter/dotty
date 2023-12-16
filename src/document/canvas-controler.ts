import { TOOL } from "../tools/tools";
import { Point, Geometry, Size } from "./geometry";
import { ArtMaths } from "./maths";

export type CanvasProps = {
  size: Size;
  tool: TOOL;
  color: string;
  setScroll: (scroll: Point) => void;
  onColorChange: (color: string) => void;
  zoom: number;
  pan: Point;
  onPanChange: (pan: Point) => void;
  onZoomChange: (zoom: number) => void;
};

export type CanvasState = {
  initialTouch?: React.TouchList;
  lastTouch?: React.TouchList;
  mousedown: boolean;
  scale: number;
  moveOrigin?: Point;
  translate?: Point;
  backgroundSize: number;
};

export type SetCanvasState = React.Dispatch<React.SetStateAction<CanvasState>>;

export class CanvasController {
  static panZoom(
    state: CanvasState,
    setState: SetCanvasState,
    props: CanvasProps,
    touches: React.TouchList
  ) {
    const initial = state.initialTouch ? state.initialTouch : touches;
    const { pan, spread } = Geometry.panAndSpread(initial, touches);
    console.log(`pan: ${pan.x},${pan.y} spread: ${spread}`);
    setState({
      ...state,
      lastTouch: touches,
      scale: spread,
      initialTouch: initial,
    });
    props.onPanChange(pan)
  }

  static stopPanZoom(
    state: CanvasState,
    setState: SetCanvasState,
    props: CanvasProps
  ) {
    if (state.initialTouch && state.lastTouch) {
      const { pan, spread } = Geometry.panAndSpread(
        state.initialTouch,
        state.lastTouch
      );
      console.log("canvas: onstop", pan, spread, props.pan, state.scale);
      props.setScroll(pan);
      props.onPanChange(pan);

      setState({
        ...state,
        scale: 1.0,
        lastTouch: undefined,
        initialTouch: undefined,
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
        ArtMaths.pixelToColor(ctx.getImageData(x, y, 1, 1).data)
      );
    }
  }

  static floodFill(
    props: CanvasProps,
    point: Point,
    ctx: CanvasRenderingContext2D
  ) {
    // Credit: Tom Cantwell https://cantwell-tom.medium.com/flood-fill-and-line-tool-for-html-canvas-65e08e31aec6
    let image = ctx.getImageData(0, 0, props.size.height, props.size.width);
    let imageData = image.data;

    let start = (point.y * props.size.width + point.x) * 4;
    let pixel = imageData.slice(start, start + 16);
    // exit if color is the same
    let color = ArtMaths.pixelToColor(pixel);
    let newColor = ArtMaths.colorToPixel(props.color);
    if (props.color === color) {
      return;
    }

    const matchStartColor = (pixelPos: number) => {
      let col = ArtMaths.pixelToColor(
        imageData.slice(pixelPos, pixelPos + 16)
      );
      return col === color;
    };
    const colorPixel = (pixelPos: number) => {
      imageData[pixelPos] = newColor.r;
      imageData[pixelPos + 1] = newColor.g;
      imageData[pixelPos + 2] = newColor.b;
      imageData[pixelPos + 3] = newColor.a;
    };

    let pixelStack = [point];
    let width = props.size.width;
    let height = props.size.height;
    let reachLeft: boolean;
    let reachRight: boolean;
    while(pixelStack.length > 0 && pixelStack.length <= (props.size.width * props.size.height)) {
      const newPos = pixelStack.pop()!;
      let x = newPos.x;
      let y = newPos.y; // get current pixel position
      let pixelPos = (y * width + x) * 4;
      // Go up as long as the color matches and are inside the canvas
      while (y >= 0 && matchStartColor(pixelPos)) {
        y--;
        pixelPos -= width * 4;
      }
      // Don't overextend
      pixelPos += width * 4;
      y++;
      reachLeft = false;
      reachRight = false;

      // Go down as long as the color matches and in inside the canvas
      while (y < height && matchStartColor(pixelPos)) {
        colorPixel(pixelPos);
        if (x > 0) {
          if (matchStartColor(pixelPos - 4)) {
            if (!reachLeft) {
              //Add pixel to stack
              pixelStack.push({x: x - 1, y});
              reachLeft = true;
            }
          } else if (reachLeft) {
            reachLeft = false;
          }
        }
        if (x < width - 1) {
          if (matchStartColor(pixelPos + 4)) {
            if (!reachRight) {
              // Add pixel to stack
              pixelStack.push({x: x + 1, y});
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
    ctx.putImageData(new ImageData(imageData, image.width), 0, 0);
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

  static stopMove(
    state: CanvasState,
    setState: SetCanvasState,
    props: CanvasProps,
    ctx: CanvasRenderingContext2D,
    point: Point
  ) {
    console.log("canvas: cancel move");
    setState({ ...state, translate: undefined, moveOrigin: undefined });
    this.paint(state, setState, props, ctx, point);
  }

  static move(
    state: CanvasState,
    setState: SetCanvasState,
    props: CanvasProps,
    point: Point,
    origin: Point = { x: 0, y: 0 }
  ) {
    console.log("canvas: move", point.x, point.y);
    let zoom = props.zoom;
    if (state.translate && (state.translate.x != 0 || state.translate.y != 0)) {
      const expected = {
        x: Math.floor((point.x - origin.x) * zoom + state.translate.x),
        y: Math.floor((point.y - origin.y) * zoom + state.translate.y),
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
          x: Math.floor((point.x - origin.x) * zoom),
          y: Math.floor((point.y - origin.y) * zoom),
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
    img.src = data;
    const width = props.size.width;
    const height = props.size.height;

    img.onload = function () {
      ctx.beginPath();
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, at.x, at.y, width, height);
      ctx.closePath();
      URL.revokeObjectURL(img.src);
    };
  }

  static save(canvas: HTMLCanvasElement) {
    localStorage.setItem("canvas", canvas.toDataURL());
  }

  static paint(
    state: CanvasState,
    setState: SetCanvasState,
    props: CanvasProps,
    ctx: CanvasRenderingContext2D,
    offset: Point
  ) {
    const x = Math.floor(offset.x / props.zoom);
    const y = Math.floor(offset.y / props.zoom);
    const fillStyle = props.color;
    // console.log(drawMode, fillStyle);
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
      this.floodFill(props, { x, y }, ctx);
    } else if (props.tool === TOOL.MOVE) {
      this.move(state, setState, props, { x, y });
    } else {
      // ignore other tools
    }
    ctx.closePath();
  }
}
