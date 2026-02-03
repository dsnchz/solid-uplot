import { describe, expect, test } from "vitest";

import { getColorString } from "../getColorString";

describe("UTIL: getColorString", () => {
  test("returns the string if fillOrStroke is a string", () => {
    expect(getColorString("#123456")).toBe("#123456");
    expect(getColorString("red")).toBe("red");
  });

  test("returns the fallback if fillOrStroke is undefined", () => {
    expect(getColorString(undefined)).toBe("#888");
  });

  test("returns the fallback if fillOrStroke is a CanvasGradient", () => {
    // Mock a CanvasGradient object
    const gradient = {} as CanvasGradient;
    expect(getColorString(gradient, "#abc")).toBe("#abc");
  });

  test("returns the fallback if fillOrStroke is a CanvasPattern", () => {
    // Mock a CanvasPattern object
    const pattern = {} as CanvasPattern;
    expect(getColorString(pattern, "#def")).toBe("#def");
  });

  test("returns custom fallback if provided and input is not a string", () => {
    expect(getColorString(undefined, "#000")).toBe("#000");
    expect(getColorString({} as CanvasGradient, "#fff")).toBe("#fff");
  });
});
