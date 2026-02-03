type CursorPosition = {
  /**
   * The cursor position left offset in CSS pixels (relative to plotting area)
   */
  readonly left: number;
  /**
   * The cursor position top offset in CSS pixels (relative to plotting area)
   */
  readonly top: number;
};

/**
 * The cursor index data for a given uPlot instance.
 */
export type CursorData = {
  /**
   * The id of the plot instance that the cursor message originates from.
   */
  readonly plotId: string;
  /**
   * The closest x-axis data index to cursor (closestIdx)
   */
  readonly idx: number;
  /**
   * The x-axis value of the cursor idx.
   */
  readonly xValue: number;
  /**
   * The position of the cursor.
   */
  readonly position: CursorPosition;
  /**
   * The visibility of the cursor.
   */
  readonly visible: boolean;
};

/**
 * Get the cursor index data for a given uPlot instance.
 *
 * @param u - The uPlot instance.
 * @returns The cursor data.
 */
export const getCursorData = (u: uPlot) => {
  const idx = u.cursor.idx;
  const xValues = u.data[0];

  const isValid = idx != null && xValues && idx < xValues.length;

  return !isValid
    ? undefined
    : ({
        plotId: u.root.id,
        idx,
        xValue: xValues[idx]!,
        visible: Boolean(u.cursor.show),
        position: { left: u.cursor.left || 0, top: u.cursor.top || 0 },
      } as CursorData);
};
