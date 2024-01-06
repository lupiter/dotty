import { describe, expect, test, vi } from "vitest";
import { CanvasController, CanvasState } from "./canvas-controler";
import { Point } from "../color/geometry";

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
