import "uplot/dist/uPlot.min.css";

import {
  createEffect,
  createMemo,
  createUniqueId,
  type JSX,
  mergeProps,
  onCleanup,
  type ParentProps,
  type Ref,
  splitProps,
  untrack,
} from "solid-js";
import uPlot from "uplot";

import type { SolidUplotPluginBus, UplotPluginFactory, VoidStruct } from "./createPluginBus";
import { createCursorMovePlugin, type OnCursorMoveParams } from "./eventPlugins";
import { getSeriesData, type SeriesDatum } from "./utils/getSeriesData";

const __DEV__ = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = globalThis as any;
    return g.process?.env?.NODE_ENV !== "production";
  } catch {
    return false;
  }
})();

/** Placement options for children components relative to the chart */
type ChildrenPlacement = "top" | "bottom";

/**
 * A SolidJS-compatible uPlot plugin that can be either a standard uPlot plugin
 * or a factory function that creates a plugin with access to the plugin bus
 *
 * @template T - The type of the plugin bus data structure
 */
export type SolidUplotPlugin<T extends VoidStruct = VoidStruct> =
  | uPlot.Plugin
  | UplotPluginFactory<T>;

/**
 * Configuration options for the SolidUplot component, extending uPlot.Options
 * with SolidJS-specific enhancements
 *
 * @template T - The type of the plugin bus data structure
 */
export type SolidUplotOptions<T extends VoidStruct = VoidStruct> = Omit<
  uPlot.Options,
  "plugins" | "width" | "height" | "data"
> & {
  /**
   * Chart width in pixels.
   *
   * Used as a fixed dimension when `autoResize` is disabled.
   * Ignored when `autoResize` is enabled — the chart fills its
   * container's width automatically.
   *
   * @default 600
   */
  readonly width?: number;
  /**
   * Chart height in pixels.
   *
   * Used as a fixed dimension when `autoResize` is disabled.
   * Ignored when `autoResize` is enabled — the chart fills its
   * container's height automatically.
   *
   * @default 300
   */
  readonly height?: number;
  /** Chart data - accepts AlignedData or number[][] */
  readonly data?: uPlot.AlignedData | number[][];
  /** Plugin communication bus for coordinating between plugins */
  readonly pluginBus?: SolidUplotPluginBus<T>;
  /** Array of plugins to apply to the chart */
  readonly plugins?: SolidUplotPlugin<T>[];
};

/**
 * Metadata provided to the onCreate callback when the chart is initialized
 */
type OnCreateMeta = {
  /** Array of series data extracted from the chart configuration */
  readonly seriesData: SeriesDatum[];
};

/**
 * Events that can be passed to the SolidUplot component
 */
type SolidUplotEvents = {
  /** Callback fired when the uPlot instance is created */
  readonly onCreate?: (u: uPlot, meta: OnCreateMeta) => void;
  /** Callback fired when the cursor moves */
  readonly onCursorMove?: (params: OnCursorMoveParams) => void;
};

/**
 * Props for the SolidUplot component
 *
 * @template T - The type of the plugin bus data structure
 */
type SolidUplotProps<T extends VoidStruct = VoidStruct> = SolidUplotOptions<T> &
  SolidUplotEvents & {
    /** Class name for the chart container */
    readonly class?: string;

    /** CSS styles for the chart container (position is managed internally) */
    readonly style?: Omit<JSX.CSSProperties, "position">;

    /** Ref callback to access the chart container element */
    readonly ref?: Ref<HTMLDivElement>;

    /**
     * Enable automatic resizing to fit container.
     *
     * When enabled, the chart uses a ResizeObserver to continuously
     * match its container's dimensions. The `width` and `height` props
     * are ignored — the chart fills whatever space its container provides.
     *
     * The container **must** have defined dimensions (explicit height/width,
     * flex layout, grid layout, etc.). If the container has no height, the
     * chart will render at 0px and a development-mode warning will be logged.
     *
     * @default false
     */
    readonly autoResize?: boolean;

    /**
     * Whether to reset scales when chart data is updated
     * @default true
     */
    readonly resetScales?: boolean;
    /**
     * Where to place children components relative to the chart
     * @default "top"
     */
    readonly childrenPlacement?: ChildrenPlacement;
  };

/**
 * A SolidJS wrapper component for uPlot charts with enhanced features
 *
 * This component provides:
 * - Reactive data updates
 * - Plugin system with communication bus
 * - Automatic resizing capabilities
 * - Flexible children placement
 * - TypeScript support with generics
 *
 * @template T - The type of the plugin bus data structure for type-safe plugin communication
 *
 * @param props - Component props extending uPlot options with SolidJS enhancements
 * @returns JSX element containing the chart and any children components
 *
 * @example
 * ```tsx
 * // Fixed size
 * <SolidUplot
 *   data={chartData}
 *   width={600}
 *   height={400}
 *   series={[{}, { label: "Series 1", stroke: "red" }]}
 * />
 *
 * // Auto resize (container must have dimensions)
 * <div style={{ height: "400px" }}>
 *   <SolidUplot
 *     data={chartData}
 *     autoResize
 *     series={[{}, { label: "Series 1", stroke: "red" }]}
 *   />
 * </div>
 * ```
 */
export const SolidUplot = <T extends VoidStruct = VoidStruct>(
  props: ParentProps<SolidUplotProps<T>>,
): JSX.Element => {
  let container!: HTMLDivElement;

  const _props = mergeProps(
    {
      id: createUniqueId(),
      childrenPlacement: "top" as ChildrenPlacement,
      width: 600,
      height: 300,
      autoResize: false,
      data: [] as uPlot.AlignedData,
      resetScales: true,
      plugins: [] as SolidUplotPlugin<T>[],
      legend: {
        show: false,
      },
    },
    props,
  );

  const [local, options] = splitProps(_props, [
    "children",
    "childrenPlacement",
    "class",
    "autoResize",
    "onCreate",
    "onCursorMove",
    "style",
    "ref",
  ]);

  const [updateableOptions, newChartOptions] = splitProps(options, [
    "data",
    "width",
    "height",
    "resetScales",
  ]);

  const [system, chartOptions] = splitProps(newChartOptions, ["pluginBus", "plugins"]);

  const size = () => ({ width: updateableOptions.width, height: updateableOptions.height });

  const chartPlugins = createMemo(() => {
    const plugins = system.plugins.map((plugin) =>
      typeof plugin === "function" ? plugin({ bus: system.pluginBus }) : plugin,
    );

    // Add internal cursor move plugin if callback is provided
    if (local.onCursorMove) {
      plugins.push(createCursorMovePlugin(local.onCursorMove));
    }

    return plugins;
  });

  createEffect(() => {
    const getInitialSize = () => {
      if (local.autoResize) {
        // For autoResize, use container dimensions if available.
        // Fallback to 600x300 for initial uPlot construction only —
        // the ResizeObserver will immediately correct to actual size.
        const rect = container.getBoundingClientRect();
        return {
          width: rect.width > 0 ? Math.floor(rect.width) : 600,
          height: rect.height > 0 ? Math.floor(rect.height) : 300,
        };
      }
      // For manual sizing, use props
      return untrack(size);
    };

    const initialSize = getInitialSize();
    const initialData = untrack(() => updateableOptions.data) as uPlot.AlignedData;

    const chart = new uPlot(
      {
        ...chartOptions,
        ...initialSize,
        plugins: chartPlugins(),
      },
      initialData,
      container,
    );

    local.onCreate?.(chart, { seriesData: getSeriesData(chart) });

    createEffect(() => {
      if (local.autoResize) return;
      chart.setSize(size());
    });

    createEffect(() => {
      if (!local.autoResize) return;

      let hasWarnedZeroHeight = false;

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;

          if (!hasWarnedZeroHeight && height === 0 && __DEV__) {
            hasWarnedZeroHeight = true;
            console.warn(
              "[SolidUplot] autoResize observed 0px height. " +
              "Ensure the parent container has an explicit height " +
              "or is within a flex/grid layout that provides height.",
            );
          }

          chart.setSize({ width: Math.floor(width), height: Math.floor(height) });
        }
      });

      resizeObserver.observe(container);

      onCleanup(() => {
        resizeObserver.disconnect();
      });
    });

    createEffect(() => {
      chart.setData(updateableOptions.data as uPlot.AlignedData, updateableOptions.resetScales);
    });

    onCleanup(() => {
      chart.destroy();
    });
  });

  const classes = () => (local.class ? `solid-uplot ${local.class}` : "solid-uplot");

  return (
    <div
      id="solid-uplot-root"
      ref={local.ref}
      class={classes()}
      style={{
        display: "flex",
        "flex-direction": local.childrenPlacement === "top" ? "column" : "column-reverse",
        // When autoResize is enabled, fill the parent container
        ...(local.autoResize && {
          width: "100%",
          height: "100%",
          "min-width": "0",
        }),
        ...local.style,
      }}
    >
      {local.children}
      <div
        ref={container}
        class="solid-uplot-chart"
        style={{
          position: "relative",
          // When autoResize is enabled, use flex to fill remaining space.
          // flex-basis: 0 prevents content from dictating size (fixes infinite height bug).
          // min-width/min-height: 0 allow the chart to shrink freely within
          // the flex container. The parent must provide dimensions — if it
          // doesn't, the chart collapses to 0px (with a dev-mode warning).
          ...(local.autoResize && {
            flex: "1 1 0",
            "min-height": "0",
            "min-width": "0",
          }),
        }}
      />
    </div>
  );
};
