import "uplot/dist/uPlot.min.css";

import {
  createEffect,
  createMemo,
  createUniqueId,
  type JSX,
  mergeProps,
  onCleanup,
  type ParentProps,
  splitProps,
  untrack,
} from "solid-js";
import uPlot from "uplot";

import type { PluginFactory, SolidUplotPluginBus, VoidStruct } from "./createPluginBus";
import { getSeriesData, type SeriesDatum } from "./utils/getSeriesData";

/** Placement options for children components relative to the chart */
type ChildrenPlacement = "top" | "bottom";

/**
 * A SolidJS-compatible uPlot plugin that can be either a standard uPlot plugin
 * or a factory function that creates a plugin with access to the plugin bus
 *
 * @template T - The type of the plugin bus data structure
 */
export type SolidUplotPlugin<T extends VoidStruct = VoidStruct> = uPlot.Plugin | PluginFactory<T>;

/**
 * Configuration options for the SolidUplot component, extending uPlot.Options
 * with SolidJS-specific enhancements
 *
 * @template T - The type of the plugin bus data structure
 */
export type SolidUplotOptions<T extends VoidStruct = VoidStruct> = Omit<
  uPlot.Options,
  "plugins" | "width" | "height"
> & {
  /** Chart width in pixels */
  readonly width?: number;
  /** Chart height in pixels */
  readonly height?: number;
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
 * Props for the SolidUplot component
 *
 * @template T - The type of the plugin bus data structure
 */
type SolidUplotProps<T extends VoidStruct = VoidStruct> = SolidUplotOptions<T> & {
  /** Ref callback to access the chart container element */
  readonly ref?: (el: HTMLDivElement) => void;
  /** Callback fired when the uPlot instance is created */
  readonly onCreate?: (u: uPlot, meta: OnCreateMeta) => void;
  /**
   * Whether to reset scales when chart data is updated
   * @default true
   */
  readonly resetScales?: boolean;
  /** CSS styles for the chart container (position is managed internally) */
  readonly style?: Omit<JSX.CSSProperties, "position">;
  /**
   * Where to place children components relative to the chart
   * @default "top"
   */
  readonly childrenPlacement?: ChildrenPlacement;
  /**
   * Enable automatic resizing to fit container.
   *
   * When true:
   * - Chart uses width/height props for initial render
   * - Then automatically adapts to container size changes
   * - If no width/height provided, uses sensible defaults (600x300)
   *
   * @default false
   */
  readonly autoResize?: boolean;
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
 * <SolidUplot
 *   data={chartData}
 *   height={400}
 *   autoResize
 *   series={[
 *     {},
 *     { label: "Series 1", stroke: "red" }
 *   ]}
 *   onCreate={(chart) => console.log("Chart created:", chart)}
 * />
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
    "autoResize",
    "onCreate",
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
    return system.plugins.map((plugin) =>
      typeof plugin === "function" ? plugin({ bus: system.pluginBus }) : plugin,
    );
  });

  createEffect(() => {
    const getInitialSize = () => {
      if (local.autoResize) {
        // For autoResize, use container dimensions or fallback
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
    const initialData = untrack(() => updateableOptions.data);

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

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          chart.setSize({ width: Math.floor(width), height: Math.floor(height) });
        }
      });

      resizeObserver.observe(container);

      onCleanup(() => {
        resizeObserver.disconnect();
      });
    });

    createEffect(() => {
      chart.setData(updateableOptions.data, updateableOptions.resetScales);
    });

    onCleanup(() => {
      chart.destroy();
    });
  });

  return (
    <div
      id="solid-uplot-root"
      style={{
        display: "flex",
        "flex-direction": local.childrenPlacement === "top" ? "column" : "column-reverse",
        // When autoResize is enabled, fill the parent container
        ...(local.autoResize && {
          width: "100%",
          height: "100%",
          "min-width": "0",
          "min-height": "0",
        }),
        ...local.style,
      }}
      ref={(el) => {
        container = el;
        local.ref?.(el);
      }}
    >
      {local.children}
    </div>
  );
};
