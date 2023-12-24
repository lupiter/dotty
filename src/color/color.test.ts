import { expect, test } from "vitest";
import { Color } from "./color";

const red = Color.fromHex("#ff0000");
const redAgain = Color.fromHex("#ff0000");

test("deduplicates same colours", () => {
  expect(Color.dedupe([red, redAgain]).length).toBe(1);
});

test("when color is the same hex value, reconises inclusion", () => {
  expect(Color.includes([red], redAgain)).toBeTruthy();
});

