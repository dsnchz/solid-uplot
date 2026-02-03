import { describe, expect, test } from "vitest";

import { getCursorData } from "../getCursorData";

// Helper to create a minimal uPlot-like object
function makeUPlot({
  idx = 0 as number | undefined | null,
  xValues = [10, 20, 30],
  left = 5,
  top = 10,
  show = true,
  drag = undefined as uPlot.Cursor.Drag | undefined,
  focus = undefined as uPlot.Cursor.Focus | undefined,
  hover = undefined as uPlot.Cursor.Hover | undefined,
  id = "plot-1",
} = {}) {
  return {
    data: [xValues],
    root: { id },
    cursor: {
      idx,
      left,
      top,
      show,
      drag,
      focus,
      hover,
    },
  } as unknown as uPlot;
}

describe("UTIL: getCursorData", () => {
  test("returns undefined if idx is null", () => {
    const u = makeUPlot({ idx: null });
    expect(getCursorData(u)).toBeUndefined();
  });

  test("returns undefined if xValues is missing", () => {
    const u = makeUPlot();
    // @ts-expect-error purposely breaking the type
    u.data = [];
    expect(getCursorData(u)).toBeUndefined();
  });

  test("returns undefined if idx is out of bounds", () => {
    const u = makeUPlot({ idx: 10, xValues: [1, 2, 3] });
    expect(getCursorData(u)).toBeUndefined();
  });

  test("returns correct CursorData for valid input", () => {
    const u = makeUPlot({
      idx: 1,
      xValues: [100, 200, 300],
      left: 15,
      top: 25,
      show: true,
      id: "plot-xyz",
    });
    const result = getCursorData(u);
    expect(result).toEqual({
      plotId: "plot-xyz",
      idx: 1,
      xValue: 200,
      visible: true,
      position: { left: 15, top: 25 },
    });
  });

  test("defaults position to 0 if left/top are falsy", () => {
    const u = makeUPlot({ left: 0, top: 0 });
    const result = getCursorData(u);
    expect(result?.position).toEqual({ left: 0, top: 0 });
  });

  test("visible is false if cursor.show is falsy", () => {
    const u = makeUPlot({ show: false });
    const result = getCursorData(u);
    expect(result?.visible).toBe(false);
  });
});
