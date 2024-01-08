import { describe, expect, test } from "vitest";
import { Geometry } from "./geometry";

class FakeTarget implements EventTarget {
  addEventListener(
    _type: string,
    _callback: EventListenerOrEventListenerObject | null,
    _options?: boolean | AddEventListenerOptions | undefined
  ): void {
    throw new Error("Method not implemented: addEventListener.");
  }
  dispatchEvent(_event: Event): boolean {
    throw new Error("Method not implemented: dispatchEvent.");
  }
  removeEventListener(
    _type: string,
    _callback: EventListenerOrEventListenerObject | null,
    _options?: boolean | EventListenerOptions | undefined
  ): void {
    throw new Error("Method not implemented: removeEventListener.");
  }
}

class FakeTouch implements React.Touch {
  target: EventTarget = new FakeTarget();
  public screenX: number;
  public screenY: number;
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;

  constructor(public identifier: number, x: number, y: number) {
    this.screenX = x;
    this.clientX = x;
    this.pageX = x;
    this.screenY = y;
    this.clientY = y;
    this.pageY = y;
  }
}

const fakeTouchList = (touches: FakeTouch[]): React.TouchList => {
  const touchList: React.TouchList = {
    length: touches.length,
    item: (i: number) => touches[i],
    identifiedTouch: (i: number) => touches[i],
  };
  for (let i = 0; i < touches.length; i++) {
    touchList[i] = touches[i];
  }
  return touchList;
};

describe("midpoint", () => {
  test("one touch: that point", () => {
    expect(
      Geometry.midpoint(fakeTouchList([new FakeTouch(0, 1, 2)]))
    ).toStrictEqual({ x: 1, y: 2 });
  });

  test("two touches diagonally", () => {
    expect(
      Geometry.midpoint(
        fakeTouchList([new FakeTouch(0, 2, 2), new FakeTouch(1, 0, 0)])
      )
    ).toStrictEqual({ x: 1, y: 1 });
  });

  test("four touches in a square", () => {
    expect(
      Geometry.midpoint(
        fakeTouchList([
          new FakeTouch(0, 2, 2),
          new FakeTouch(1, 0, 0),
          new FakeTouch(2, 0, 2),
          new FakeTouch(3, 2, 0),
        ])
      )
    ).toStrictEqual({ x: 1, y: 1 });
  });
});

describe("distance", () => {
  test("one touch: zero", () => {
    expect(
      Geometry.distance(fakeTouchList([new FakeTouch(0, 1, 2)]))
    ).toStrictEqual(0);
  });

  test("two touch: horizontal", () => {
    expect(
      Geometry.distance(
        fakeTouchList([new FakeTouch(0, 0, 0), new FakeTouch(0, 5, 0)])
      )
    ).toStrictEqual(5);
  });

  test("two touch: vertical", () => {
    expect(
      Geometry.distance(
        fakeTouchList([new FakeTouch(0, 0, 0), new FakeTouch(0, 0, 5)])
      )
    ).toStrictEqual(5);
  });

  test("two touch: diagonal", () => {
    expect(
      Geometry.distance(
        fakeTouchList([new FakeTouch(0, 0, 0), new FakeTouch(0, 5, 5)])
      )
    ).toStrictEqual(Math.sqrt(50));
  });

  test("three touch: ignore extras", () => {
    expect(
      Geometry.distance(
        fakeTouchList([
          new FakeTouch(0, 0, 0),
          new FakeTouch(0, 5, 0),
          new FakeTouch(0, 5, 5),
        ])
      )
    ).toStrictEqual(5);
  });
});

describe("pan and spread", () => {
  test("no movement", () => {
    expect(
      Geometry.panAndSpread(
        fakeTouchList([new FakeTouch(0, 0, 0)]),
        fakeTouchList([new FakeTouch(0, 0, 0)])
      )
    ).toStrictEqual({ spread: 1, pan: { x: 0, y: 0 } });
  });

  test("zoom", () => {
    expect(
      Geometry.panAndSpread(
        fakeTouchList([new FakeTouch(0, 0, 0), new FakeTouch(1, 0, 1)]),
        fakeTouchList([new FakeTouch(0, 0, -5), new FakeTouch(1, 0, 6)])
      )
    ).toStrictEqual({ spread: 1.1, pan: { x: 0, y: 0 } });
  });

  test("pan", () => {
    expect(
      Geometry.panAndSpread(
        fakeTouchList([new FakeTouch(0, 0, 0), new FakeTouch(1, 0, 1)]),
        fakeTouchList([new FakeTouch(0, 0, 5), new FakeTouch(1, 0, 6)])
      )
    ).toStrictEqual({ spread: 1, pan: { x: 0, y: 5 } });
  });
});
