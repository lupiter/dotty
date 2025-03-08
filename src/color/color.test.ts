import { describe, expect, test } from "vitest";
import { Color } from "./color";

const red = Color.fromHex("#ff0000");
const redAgain = Color.fromHex("#ff0000");

describe("from hex", () => {
  test("blue", () => {
    const color = Color.fromHex("#001020");
    expect(color.r).toEqual(0);
    expect(color.g).toEqual(16);
    expect(color.b).toEqual(32);
    expect(color.a).toEqual(255);
  });

  test("invalid hex throws error", () => {
    expect(() => Color.fromHex("not-a-hex")).toThrow();
    expect(() => Color.fromHex("#xyz")).toThrow();
  });

  test("handles shorthand hex", () => {
    const color = Color.fromHex("#f00");
    expect(color.hex).toEqual("#ff0000");
  });

  test("case insensitive", () => {
    const upper = Color.fromHex("#FF0000");
    const lower = Color.fromHex("#ff0000");
    expect(Color.includes([upper], lower)).toBeTruthy();
  });
});

describe("from hex, with alpha", () => {
  test("blue", () => {
    const color = Color.fromHexWithAlpha("#00102030");
    expect(color.r).toEqual(0);
    expect(color.g).toEqual(16);
    expect(color.b).toEqual(32);
    expect(color.a).toEqual(48);
  });

  test("invalid hex with alpha throws error", () => {
    expect(() => Color.fromHexWithAlpha("not-a-hex")).toThrow();
    expect(() => Color.fromHexWithAlpha("#xyz123")).toThrow();
  });

  test("handles full transparency", () => {
    const transparent = Color.fromHexWithAlpha("#ff000000");
    expect(transparent.a).toEqual(0);
  });
});

describe("from pixel", () => {
  test("values", () => {
    const color = Color.fromPixel(new Uint8ClampedArray([1, 2, 3, 4]));
    expect(color.r).toEqual(1);
    expect(color.g).toEqual(2);
    expect(color.b).toEqual(3);
    expect(color.a).toEqual(4);
  });

  test("handles empty array", () => {
    expect(() => Color.fromPixel(new Uint8ClampedArray([]))).toThrow();
  });

  test("handles incomplete array", () => {
    expect(() => Color.fromPixel(new Uint8ClampedArray([1, 2, 3]))).toThrow();
  });

  test("clamps values", () => {
    const color = Color.fromPixel(new Uint8ClampedArray([256, -1, 300, 400]));
    expect(color.r).toEqual(255);
    expect(color.g).toEqual(0);
    expect(color.b).toEqual(255);
    expect(color.a).toEqual(255);
  });
});

describe("to hex", () => {
  test("with from hex first", () => {
    expect(Color.fromHex("#012345").hex).toEqual("#012345");
    expect(Color.fromHex("#abcdef").hex).toEqual("#abcdef");
  });

  test("with from hex first, with alpha", () => {
    expect(Color.fromHexWithAlpha("#01234567").hexWithAlpha).toEqual("#01234567");
    expect(Color.fromHexWithAlpha("#abcdef01").hexWithAlpha).toEqual("#abcdef01");
  });

  test("pads single digit values", () => {
    const color = new Color(0, 0, 1, 255);
    expect(color.hex).toEqual("#000001");
  });

  test("converts to lowercase hex", () => {
    const color = Color.fromHex("#ABCDEF");
    expect(color.hex).toEqual("#abcdef");
  });
});

describe("dedupe", () => {
  test("deduplicates same colours", () => {
    expect(Color.dedupe([red, redAgain]).length).toBe(1);
  });

  test("handles empty array", () => {
    expect(Color.dedupe([])).toHaveLength(0);
  });

  test("preserves order after deduplication", () => {
    const blue = Color.fromHex("#0000ff");
    const colors = [red, blue, redAgain];
    const deduped = Color.dedupe(colors);
    expect(deduped).toHaveLength(2);
    expect(deduped[0]).toBe(red);
    expect(deduped[1]).toBe(blue);
  });

  test("deduplicates multiple duplicates", () => {
    const colors = [red, redAgain, red, redAgain, red];
    expect(Color.dedupe(colors)).toHaveLength(1);
  });
});

describe("includes", () => {
  test("when color is the same hex value, reconises inclusion", () => {
    expect(Color.includes([red], redAgain)).toBeTruthy();
  });

  test("returns false for different colors", () => {
    const blue = Color.fromHex("#0000ff");
    expect(Color.includes([red], blue)).toBeFalsy();
  });

  test("handles empty array", () => {
    expect(Color.includes([], red)).toBeFalsy();
  });

  test("matches colors with different alpha values", () => {
    const transparent = Color.fromHexWithAlpha("#ff000080");
    const opaque = Color.fromHex("#ff0000");
    expect(Color.includes([transparent], opaque)).toBeTruthy();
  });
});

describe("equality", () => {
  test("same rgb values are equal", () => {
    const color1 = new Color(100, 150, 200, 255);
    const color2 = new Color(100, 150, 200, 255);
    expect(color1).toEqual(color2);
  });

  test("different rgb values are not equal", () => {
    const color1 = new Color(100, 150, 200, 255);
    const color2 = new Color(100, 150, 201, 255);
    expect(color1).not.toEqual(color2);
  });
});

describe("color limits", () => {
  test("constructor clamps values", () => {
    const color = new Color(300, -10, 1000, -255);
    expect(color.r).toEqual(255);
    expect(color.g).toEqual(0);
    expect(color.b).toEqual(255);
    expect(color.a).toEqual(0);
  });
});
