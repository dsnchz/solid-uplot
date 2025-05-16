import type { JSX } from "solid-js";
import { createSignal, onCleanup, Show } from "solid-js";
import { render } from "solid-js/web";
import uPlot from "uplot";

type Position = {
  /**
   * The left position of the cursor.
   */
  readonly left: number;
  /**
   * The top position of the cursor.
   */
  readonly top: number;
};

type SeriesData = {
  /**
   * The index of the series.
   */
  readonly seriesIdx: number;
  /**
   * The value of the series.
   */
  readonly value: number | null;
  readonly color: string;
  readonly label: string;
};

export type uPlotCursorData = {
  /**
   * The index of the cursor.
   */
  readonly idx: number;
  /**
   * The position of the cursor.
   */
  readonly position: Position;
  /**
   * The x value of the cursor.
   */
  readonly xValue: number;
  /**
   * The series data of the cursor.
   */
  readonly seriesData: SeriesData[];
};

export function tooltipPlugin(
  TooltipComponent: (props: uPlotCursorData) => JSX.Element,
): uPlot.Plugin {
  const [tooltipData, setTooltipData] = createSignal<uPlotCursorData | null>(null);

  return {
    hooks: {
      ready: (u: uPlot) => {
        const el = document.createElement("div");
        u.root.appendChild(el);

        const TooltipRenderer = () => (
          <Show when={tooltipData()}>{(d) => <TooltipComponent {...d()} />}</Show>
        );

        render(() => <TooltipRenderer />, el);

        onCleanup(() => el.remove());
      },
      setCursor: (u: uPlot) => {
        const idx = u.cursor.idx;
        const xValues = u.data[0];

        if (idx == null || !xValues || idx >= xValues.length) {
          setTooltipData(null);
          return;
        }

        const seriesData = u.series.slice(1).map((series, i) => {
          const val = u.data[i + 1]?.[idx] ?? null;

          const color =
            typeof series.stroke === "string"
              ? series.stroke
              : Array.isArray(series.stroke)
                ? series.stroke[0] || "#000"
                : "#000";

          return {
            seriesIdx: i + 1,
            value: val,
            color,
            label: series.label?.toString() || `Series ${i + 1}`,
          };
        });

        setTooltipData({
          idx,
          position: {
            left: u.cursor.left || 0,
            top: u.cursor.top || 0,
          },
          xValue: xValues[idx]!,
          seriesData,
        });
      },
    },
  };
}
