/**
 * Summary data for a given series.
 */
export type SeriesDatum = {
  /** The index of the series if you were treating this as a zero-indexed array */
  readonly idx: number;

  /** The index of the series in the uPlot instance */
  readonly seriesIdx: number;

  /** The display label of the series */
  readonly label: string;

  /** The series stroke color */
  readonly stroke: string | CanvasGradient | CanvasPattern;

  /** The fill color */
  readonly fill: string | CanvasGradient | CanvasPattern;

  /** The stroke width of the series line */
  readonly width?: number;

  /** The dash pattern used for the line */
  readonly dash?: number[];

  /** The name of the associated scale (e.g. "y", "y2") */
  readonly scale?: string;

  /** Whether the series is shown */
  readonly visible?: boolean;
};

type GetSeriesDataOptions = {
  /** The function to transform the series label */
  readonly labelTransform?: (label?: string | HTMLElement) => string;
};

/**
 * Get the y-series data for a given uPlot instance.
 *
 * @param u - The uPlot instance.
 * @param options - The options for the series data.
 * @returns The series data.
 */
export const getSeriesData = (u: uPlot, options: GetSeriesDataOptions = {}): SeriesDatum[] => {
  const series: SeriesDatum[] = [];

  for (let i = 1; i < u.series.length; i++) {
    const s = u.series[i]!;

    // istanbul ignore next -- @preserve
    const stroke = typeof s.stroke === "function" ? s.stroke(u, i) : s.stroke;

    // istanbul ignore next -- @preserve
    const fill = typeof s.fill === "function" ? s.fill(u, i) : s.fill;

    // istanbul ignore next -- @preserve
    const label = options.labelTransform?.(s.label) || s.label?.toString() || `Series ${i}`;

    series.push({
      idx: i - 1,
      seriesIdx: i,
      label,
      stroke: stroke ?? "#000",
      fill: fill ?? "transparent",
      width: s.width,
      dash: s.dash,
      scale: s.scale,
      visible: Boolean(s.show),
    });
  }

  return series;
};
