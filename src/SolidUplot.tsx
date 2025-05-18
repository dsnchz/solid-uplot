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

type ChildrenPlacement = "top" | "bottom";

export type SolidUplotPlugin<T extends VoidStruct = VoidStruct> = uPlot.Plugin | PluginFactory<T>;

export type SolidUplotOptions<T extends VoidStruct = VoidStruct> = Omit<
  uPlot.Options,
  "plugins" | "width" | "height"
> & {
  readonly width?: number;
  readonly height?: number;
  readonly pluginBus?: SolidUplotPluginBus<T>;
  readonly plugins?: SolidUplotPlugin<T>[];
};

type OnCreateMeta = {
  readonly seriesData: SeriesDatum[];
};

type SolidUplotProps<T extends VoidStruct = VoidStruct> = SolidUplotOptions<T> & {
  /** The ref of the uPlot instance */
  readonly ref?: (el: HTMLDivElement) => void;
  /** Callback when uPlot instance is created */
  readonly onCreate?: (u: uPlot, meta: OnCreateMeta) => void;
  /** Apply scale reset on redraw triggered by updated plot data (default: `true`) */
  readonly resetScales?: boolean;
  /** The style of the uPlot instance container */
  readonly style?: Omit<JSX.CSSProperties, "position">;
  /** The placement of the children container. Defaults to "top" */
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
