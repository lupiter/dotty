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
});

describe("from hex, with alpha", () => {
  test("blue", () => {
    const color = Color.fromHexWithAlpha("#00102030");
    expect(color.r).toEqual(0);
    expect(color.g).toEqual(16);
    expect(color.b).toEqual(32);
    expect(color.a).toEqual(48);
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
});

describe("dedupe", () => {
  test("deduplicates same colours", () => {
    expect(Color.dedupe([red, redAgain]).length).toBe(1);
  });
});

describe("includes", () => {
  test("when color is the same hex value, reconises inclusion", () => {
    expect(Color.includes([red], redAgain)).toBeTruthy();
  });
});
