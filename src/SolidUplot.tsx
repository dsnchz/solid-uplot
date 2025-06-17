import "uplot/dist/uPlot.min.css";

import { mergeRefs, Ref } from "@solid-primitives/refs";
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

import type { SolidUplotPluginBus, UplotPluginFactory, VoidStruct } from "./createPluginBus";
import { createCursorMovePlugin, type OnCursorMoveParams } from "./eventPlugins";
import { getSeriesData, type SeriesDatum } from "./utils/getSeriesData";

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
     * When true:
     * - Chart uses width/height props for initial render
     * - Then automatically adapts to container size changes
     * - If no width/height provided, uses sensible defaults (600x300)
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

  const classes = () => (local.class ? `solid-uplot ${local.class}` : "solid-uplot");

  return (
    <div
      id="solid-uplot-root"
      ref={mergeRefs(local.ref, (el) => (container = el))}
      class={classes()}
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
    >
      {local.children}
    </div>
  );
};
