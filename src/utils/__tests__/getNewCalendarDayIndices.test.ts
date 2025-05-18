import uPlot from "uplot";
import { describe, expect, test } from "vitest";

import { getNewCalendarDayIndices } from "../getNewCalendarDayIndices";

describe("UTIL: getNewCalendarDayIndices", () => {
  test("returns an empty array if the x-values are empty", () => {
    const u = new uPlot({
      data: [],
      width: 100,
      height: 100,
      series: [{ label: "Test" }],
      scales: {
        x: {
          time: true,
        },
      },
    });

    expect(getNewCalendarDayIndices(u)).toEqual([]);
  });

  test("returns the correct indices", () => {
    // Using timestamps for March 1st, 2nd, and 3rd, 2024
    // Each day has multiple data points
    const timestamps = [
      1709251200000, // March 1st 00:00:00
      1709254800000, // March 1st 01:00:00
      1709258400000, // March 1st 02:00:00
      1709337600000, // March 2nd 00:00:00
      1709341200000, // March 2nd 01:00:00
      1709344800000, // March 2nd 02:00:00
      1709424000000, // March 3rd 00:00:00
      1709427600000, // March 3rd 01:00:00
      1709431200000, // March 3rd 02:00:00
    ];

    const u = new uPlot({
      data: [timestamps],
      width: 100,
      height: 100,
      series: [{ label: "Test" }],
      scales: {
        x: {
          time: true,
        },
      },
    });

    expect(getNewCalendarDayIndices(u)).toEqual([0, 3, 6]);
  });
});
