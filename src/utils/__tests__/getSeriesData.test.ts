import uPlot from "uplot";
import { describe, expect, test } from "vitest";

import { getSeriesData } from "../getSeriesData";

describe("UTIL: getSeriesData", () => {
  test("returns correct series data for basic uPlot config", () => {
    const u = new uPlot({
      data: [
        [1, 2, 3],
        [4, 5, 6],
      ],
      width: 100,
      height: 100,
      series: [
        {}, // x
        { label: "A", stroke: "red", fill: "pink", width: 2, dash: [1, 2], scale: "y", show: true },
        {
          label: "B",
          stroke: "blue",
          fill: "lightblue",
          width: 1,
          dash: [3, 4],
          scale: "y2",
          show: false,
        },
      ],
    });

    const result = getSeriesData(u);
    expect(result).toEqual([
      {
        idx: 0,
        seriesIdx: 1,
        label: "A",
        stroke: "red",
        fill: "pink",
        width: 2,
        dash: [1, 2],
        scale: "y",
        visible: true,
      },
      {
        idx: 1,
        seriesIdx: 2,
        label: "B",
        stroke: "blue",
        fill: "lightblue",
        width: 1,
        dash: [3, 4],
        scale: "y2",
        visible: false,
      },
    ]);
  });

  test("handles missing optional fields and uses defaults", () => {
    const u = new uPlot({
      data: [
        [1, 2, 3],
        [4, 5, 6],
      ],
      width: 100,
      height: 100,
      series: [
        {}, // x
        { label: "Series 1" }, // minimal config
      ],
    });

    const result = getSeriesData(u);
    const sData = result[0]!;

    expect(sData.label).toBe("Series 1");
    expect(sData.stroke).toBe("#000");
    expect(sData.fill).toBe("transparent");
    expect(sData.visible).toBe(true);
  });

  test("applies labelTransform if provided", () => {
    const u = new uPlot({
      data: [
        [1, 2, 3],
        [4, 5, 6],
      ],
      width: 100,
      height: 100,
      series: [{}, { label: "foo" }],
    });

    const result = getSeriesData(u, { labelTransform: (label) => `X-${label}` });
    expect(result[0]!.label).toBe("X-foo");
  });

  test("calls stroke/fill if they are functions", () => {
    const u = new uPlot({
      data: [
        [1, 2, 3],
        [4, 5, 6],
      ],
      width: 100,
      height: 100,
      series: [
        {},
        {
          label: "func",
          stroke: () => "green",
          fill: () => "yellow",
        },
      ],
    });

    const result = getSeriesData(u);
    expect(result[0]!.stroke).toBe("green");
    expect(result[0]!.fill).toBe("yellow");
  });
});
