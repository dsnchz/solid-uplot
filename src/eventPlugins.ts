import { type CursorData, getCursorData, getSeriesData, type SeriesDatum } from "./utils";

export type OnCursorMoveParams = {
  /** The uPlot instance */
  readonly u: uPlot;
  /** The cursor data */
  readonly cursor: CursorData;
  /** Array of series data extracted from the chart configuration */
  readonly seriesData: SeriesDatum[];
};

/**
 * Internal plugin factory for cursor move detection
 * @internal
 */
export const createCursorMovePlugin = (
  onCursorMove: (params: OnCursorMoveParams) => void,
): uPlot.Plugin => {
  return {
    hooks: {
      setCursor: (u: uPlot) => {
        const cursor = getCursorData(u);
        if (!cursor) return;
        onCursorMove?.({ u, cursor, seriesData: getSeriesData(u) });
      },
    },
  };
};
