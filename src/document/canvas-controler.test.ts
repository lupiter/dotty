import { describe, expect, test, vi } from "vitest";
import { CanvasController, CanvasProps, CanvasState } from "./canvas-controler";
import { Point } from "../color/geometry";
import { TOOL } from "../tools/tools";
import { Color } from "../color/color";
import { PIXEL_SHAPE } from "../modal/view-options";
import { sample } from "./sample-canvas-data";

const arrayOf = (
  color: Color,
  width: number,
  height: number
): Uint8ClampedArray => {
  return new Uint8ClampedArray(
    Array(width * height * 4).fill(0).map((_, i) => [color.r, color.g, color.b, color.a][i % 4])
  );
};

const join = (
  a: Uint8ClampedArray,
  b: Uint8ClampedArray
): Uint8ClampedArray => {
  return new Uint8ClampedArray([...a, ...b]);
};

describe("flood", () => {
  test("2x2", () => {
    const props: CanvasProps = {
      size: { width: 2, height: 2 },
      tool: TOOL.BUCKET,
      color: new Color(0, 0, 0, 255),
      setScroll: () => {},
      onColorChange: () => {},
      zoom: 1,
      pan: { x: 0, y: 0 },
      onPanChange: () => {},
      onZoomChange: () => {},
      onUndoTick: () => {},
      data: "",
      pixelShape: PIXEL_SHAPE.SQUARE,
    };
    const point = { x: 0, y: 0 };
    const data = CanvasController.floodFill(
      props,
      point,
      arrayOf(new Color(255, 255, 255, 255), 2, 2)
    );
    expect(data).toEqual(arrayOf(new Color(0, 0, 0, 255), 2, 2));
  });

  test("2x8", () => {
    const props: CanvasProps = {
      size: { width: 2, height: 8 },
      tool: TOOL.BUCKET,
      color: new Color(0, 0, 0, 255),
      setScroll: () => {},
      onColorChange: () => {},
      zoom: 1,
      pan: { x: 0, y: 0 },
      onPanChange: () => {},
      onZoomChange: () => {},
      onUndoTick: () => {},
      data: "",
      pixelShape: PIXEL_SHAPE.SQUARE,
    };
    const point = { x: 0, y: 0 };
    const data = CanvasController.floodFill(
      props,
      point,
      arrayOf(new Color(255, 255, 255, 255), 2, 8)
    );
    expect(data).toEqual(arrayOf(new Color(0, 0, 0, 255), 2, 8));
  });

  test("24x80", () => {
    const props: CanvasProps = {
      size: { width: 24, height: 80 },
      tool: TOOL.BUCKET,
      color: new Color(0, 0, 0, 255),
      setScroll: () => {},
      onColorChange: () => {},
      zoom: 1,
      pan: { x: 0, y: 0 },
      onPanChange: () => {},
      onZoomChange: () => {},
      onUndoTick: () => {},
      data: "",
      pixelShape: PIXEL_SHAPE.SQUARE,
    };
    const point = { x: 20, y: 70 };
    const data = CanvasController.floodFill(
      props,
      point,
      arrayOf(new Color(255, 255, 255, 255), 24, 80)
    );
    expect(data).toEqual(arrayOf(new Color(0, 0, 0, 255), 24, 80));
  });

  test("24x80, divided", () => {
    const props: CanvasProps = {
      size: { width: 24, height: 80 },
      tool: TOOL.BUCKET,
      color: new Color(0, 0, 0, 255),
      setScroll: () => {},
      onColorChange: () => {},
      zoom: 1,
      pan: { x: 0, y: 0 },
      onPanChange: () => {},
      onZoomChange: () => {},
      onUndoTick: () => {},
      data: "",
      pixelShape: PIXEL_SHAPE.SQUARE,
    };
    const point = { x: 20, y: 70 };
    const data = CanvasController.floodFill(
      props,
      point,
      join(
        arrayOf(new Color(255, 255, 255, 255), 24, 40),
        arrayOf(new Color(255, 0, 0, 255), 24, 40)
      )
    );
    expect(data).toEqual(join(arrayOf(new Color(255, 255, 255, 255), 24, 40), arrayOf(new Color(0, 0, 0, 255), 24, 40)));
  });

  test("24x40, sample", () => {
    const props: CanvasProps = {
      size: { width: 24, height: 40 },
      tool: TOOL.BUCKET,
      color: new Color(0, 0, 0, 255),
      setScroll: () => {},
      onColorChange: () => {},
      zoom: 1,
      pan: { x: 0, y: 0 },
      onPanChange: () => {},
      onZoomChange: () => {},
      onUndoTick: () => {},
      data: "",
      pixelShape: PIXEL_SHAPE.SQUARE,
    };
    const point = { x: 23, y: 39 };


    const data = CanvasController.floodFill(
      props,
      point,
      new Uint8ClampedArray(sample)
    );
    expect(data.length).toEqual(sample.length);
    const expected = join(new Uint8ClampedArray(sample.slice(0, 24 * 24 * 4)), arrayOf(new Color(0, 0, 0, 255), 24, 40));
    expect(data.slice(0, 3264)).toEqual(expected.slice(0, 3264));
    expect(data.slice(3264, 3270)).toEqual(expected.slice(3264, 3270));
  });
});

describe("flood fill edge cases", () => {
  test("fill with same color should return unchanged array", () => {
    const props: CanvasProps = {
      size: { width: 2, height: 2 },
      tool: TOOL.BUCKET,
      color: new Color(255, 255, 255, 255),  // Same color as target
      setScroll: () => {},
      onColorChange: () => {},
      zoom: 1,
      pan: { x: 0, y: 0 },
      onPanChange: () => {},
      onZoomChange: () => {},
      onUndoTick: () => {},
      data: "",
      pixelShape: PIXEL_SHAPE.SQUARE,
    };
    const point = { x: 0, y: 0 };
    const originalData = arrayOf(new Color(255, 255, 255, 255), 2, 2);
    const data = CanvasController.floodFill(props, point, originalData);
    expect(data).toEqual(originalData);
  });

  test("fill with boundaries", () => {
    const props: CanvasProps = {
      size: { width: 4, height: 4 },
      tool: TOOL.BUCKET,
      color: new Color(0, 0, 0, 255),
      setScroll: () => {},
      onColorChange: () => {},
      zoom: 1,
      pan: { x: 0, y: 0 },
      onPanChange: () => {},
      onZoomChange: () => {},
      onUndoTick: () => {},
      data: "",
      pixelShape: PIXEL_SHAPE.SQUARE,
    };
    // Create a boundary pattern:
    // W W W W
    // W B B W  
    // W B B W
    // W W W W
    const whiteColor = new Color(255, 255, 255, 255);
    const blackColor = new Color(0, 0, 0, 255);
    const data = new Uint8ClampedArray(4 * 4 * 4);
    // Fill all white first
    const whiteData = arrayOf(whiteColor, 4, 4);
    data.set(whiteData);
    // Set middle black square
    const point = { x: 1, y: 1 };
    for (let y = 1; y <= 2; y++) {
      for (let x = 1; x <= 2; x++) {
        const pos = (y * 4 + x) * 4;
        data[pos] = blackColor.r;
        data[pos + 1] = blackColor.g;
        data[pos + 2] = blackColor.b;
        data[pos + 3] = blackColor.a;
      }
    }
    
    // Fill from corner - should not affect black square
    const fillPoint = { x: 0, y: 0 };
    const result = CanvasController.floodFill(props, fillPoint, data);
    
    // Verify black square remains unchanged
    for (let y = 1; y <= 2; y++) {
      for (let x = 1; x <= 2; x++) {
        const pos = (y * 4 + x) * 4;
        expect(result[pos]).toBe(blackColor.r);
        expect(result[pos + 1]).toBe(blackColor.g);
        expect(result[pos + 2]).toBe(blackColor.b);
        expect(result[pos + 3]).toBe(blackColor.a);
      }
    }
  });
});

describe("move", () => {
  test("zero to ten", () => {
    const state: CanvasState = {
      mousedown: true,
      scale: 1.0,
      backgroundSize: 1.0,
    };
    const point: Point = { x: 10, y: 10 };
    const origin: Point = { x: 0, y: 0 };
    const callback = vi.fn();
    CanvasController.move(state, callback, point, origin);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({
      mousedown: true,
      scale: 1.0,
      backgroundSize: 1.0,
      translate: {
        x: 10,
        y: 10,
      },
    });
  });

  test("ten to zero", () => {
    const state: CanvasState = {
      mousedown: true,
      scale: 1.0,
      backgroundSize: 1.0,
    };
    const point: Point = { x: 0, y: 0 };
    const origin: Point = { x: 10, y: 10 };
    const callback = vi.fn();
    CanvasController.move(state, callback, point, origin);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({
      mousedown: true,
      scale: 1.0,
      backgroundSize: 1.0,
      translate: {
        x: -10,
        y: -10,
      },
    });
  });

  test("zero to twenty in two steps", () => {
    const state: CanvasState = {
      mousedown: true,
      scale: 1.0,
      backgroundSize: 1.0,
      translate: {
        x: 10,
        y: 10,
      },
      moveOrigin: {
        x: 0,
        y: 0,
      },
    };
    const point: Point = { x: 10, y: 10 };
    const origin: Point = { x: 0, y: 0 };
    const callback = vi.fn();
    CanvasController.move(state, callback, point, origin);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({
      mousedown: true,
      scale: 1.0,
      backgroundSize: 1.0,
      moveOrigin: {
        x: 0,
        y: 0,
      },
      translate: {
        x: 20,
        y: 20,
      },
    });
  });
});

describe("paint operations", () => {
  test("pencil tool with sub-pixel precision", () => {
    const props: CanvasProps = {
      size: { width: 2, height: 2 },
      tool: TOOL.PENCIL,
      color: new Color(0, 0, 0, 255),
      setScroll: () => {},
      onColorChange: () => {},
      zoom: 1,
      pan: { x: 0, y: 0 },
      onPanChange: () => {},
      onZoomChange: () => {},
      onUndoTick: () => {},
      data: "",
      pixelShape: PIXEL_SHAPE.SQUARE,
    };
    
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 2;
    const ctx = canvas.getContext('2d')!;
    const mockFillRect = vi.spyOn(ctx, 'fillRect');
    
    // Should paint when in middle of pixel
    CanvasController.paint(props, ctx, { x: 0.5, y: 0.5 });
    expect(mockFillRect).toHaveBeenCalledTimes(1);
    
    mockFillRect.mockClear();
    
    // Should not paint when near edge of pixel
    CanvasController.paint(props, ctx, { x: 0.1, y: 0.1 });
    expect(mockFillRect).not.toHaveBeenCalled();
  });

  test("eraser tool", () => {
    const props: CanvasProps = {
      size: { width: 2, height: 2 },
      tool: TOOL.ERASER,
      color: new Color(0, 0, 0, 255),
      setScroll: () => {},
      onColorChange: () => {},
      zoom: 2, // Test with zoom
      pan: { x: 0, y: 0 },
      onPanChange: () => {},
      onZoomChange: () => {},
      onUndoTick: () => {},
      data: "",
      pixelShape: PIXEL_SHAPE.SQUARE,
    };
    
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 2;
    const ctx = canvas.getContext('2d')!;
    const mockClearRect = vi.spyOn(ctx, 'clearRect');
    
    CanvasController.paint(props, ctx, { x: 3, y: 3 }); // With zoom=2, should clear at (1,1)
    expect(mockClearRect).toHaveBeenCalledWith(1, 1, 1, 1);
  });
});

describe("pan zoom operations", () => {
  test("pan zoom with scale change", () => {
    const state: CanvasState = {
      mousedown: true,
      scale: 1.0,
      backgroundSize: 1.0,
      initialPanZoomTouch: createTouchList([
        { identifier: 1, pageX: 0, pageY: 0 },
        { identifier: 2, pageX: 100, pageY: 0 }
      ]),
    };
    
    const setState = vi.fn();
    const onPanChange = vi.fn();
    
    // Simulate pinch out - fingers moving apart
    const newTouches = createTouchList([
      { identifier: 1, pageX: -50, pageY: 0 },
      { identifier: 2, pageX: 150, pageY: 0 }
    ]);
    
    CanvasController.panZoom(state, setState, onPanChange, newTouches);
    
    expect(setState).toHaveBeenCalledWith(expect.objectContaining({
      scale: expect.any(Number),
      lastTouch: newTouches
    }));
    expect(onPanChange).toHaveBeenCalled();
  });

  test("stop pan zoom should reset state", () => {
    const state: CanvasState = {
      mousedown: true,
      scale: 2.0,
      backgroundSize: 1.0,
      initialPanZoomTouch: createTouchList([
        { identifier: 1, pageX: 0, pageY: 0 },
        { identifier: 2, pageX: 100, pageY: 0 }
      ]),
      lastTouch: createTouchList([
        { identifier: 1, pageX: 50, pageY: 50 },
        { identifier: 2, pageX: 150, pageY: 50 }
      ])
    };
    
    const setState = vi.fn();
    const props: CanvasProps = {
      size: { width: 100, height: 100 },
      tool: TOOL.PEN,
      color: new Color(0, 0, 0, 255),
      setScroll: vi.fn(),
      onColorChange: vi.fn(),
      zoom: 1,
      pan: { x: 0, y: 0 },
      onPanChange: vi.fn(),
      onZoomChange: vi.fn(),
      onUndoTick: vi.fn(),
      data: "",
      pixelShape: PIXEL_SHAPE.SQUARE,
    };
    
    CanvasController.stopPanZoom(state, setState, props);
    
    expect(setState).toHaveBeenCalledWith(expect.objectContaining({
      scale: 1.0,
      lastTouch: undefined,
      initialPanZoomTouch: undefined
    }));
  });
});

function createTouchList(touches: Array<{identifier: number, pageX: number, pageY: number}>): React.TouchList {
  return {
    item: (index: number) => ({
      ...touches[index],
      screenX: touches[index].pageX,
      screenY: touches[index].pageY,
      clientX: touches[index].pageX,
      clientY: touches[index].pageY,
    }),
    identifiedTouch: (id: number) => {
      const touch = touches.find(t => t.identifier === id);
      return touch ? {
        ...touch,
        screenX: touch.pageX,
        screenY: touch.pageY,
        clientX: touch.pageX,
        clientY: touch.pageY,
      } : undefined;
    },
    ...touches.map(t => ({
      ...t,
      screenX: t.pageX,
      screenY: t.pageY,
      clientX: t.pageX,
      clientY: t.pageY,
    }))
  } as unknown as React.TouchList;
}
