import { expect, test, vi } from "vitest";
import { CanvasController, CanvasProps, CanvasState } from "./canvas-controler";

test("pan zoom", () => {
  const state: CanvasState = {
    mousedown: true,
    scale: 1.0,
    backgroundSize: 1.0,
  };
  const callback = vi.fn();
  const onPanChange = vi.fn();
  const touch: React.Touch = {screenX: 0, screenY: 0, idetifier: "touch", target: vi.fn(), clientX: 0, clientY: 0, pageX: 0, pageY: 0}
  const touches: React.TouchList = {
    length: 1,
    item: vi.fn(),
    identifiedTouch: vi.fn(),
    1: touch,
  }
  CanvasController.panZoom(state, callback, onPanChange, touches);
  expect(onPanChange).toHaveBeenCalledOnce();
  expect(onPanChange).toHaveBeenCalledWith(0)
  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith({
    mousedown: true,
    scale: 1.0,
    backgroundSize: 1.0,
    lastTouch: touches,
    initialTouch: touches,
  });
});