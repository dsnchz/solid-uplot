import uPlot from "uplot";

/**
 * Returns the indices where a new calendar day (in UTC) begins within the given x-values series.
 *
 * This uses `toISOString().split("T")[0]` to derive a "YYYY-MM-DD" key.
 *
 * @param u - The uPlot instance.
 * @returns The indices where a new calendar day begins.
 */
export function getNewCalendarDayIndices(u: uPlot): number[] {
  const xValues = u.data[0];

  if (!xValues || !xValues.length) return [];

  const seen = new Set<string>();
  const indices: number[] = [];

  for (let i = 0; i < xValues.length; i++) {
    const ts = xValues[i]!;

    const date = new Date(ts);
    const dayString = date.toISOString().split("T")[0]!; // "YYYY-MM-DD" in UTC

    if (!seen.has(dayString)) {
      seen.add(dayString);
      indices.push(i);
    }
  }

  return indices;
}
