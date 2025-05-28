import { type Component, type JSX, mergeProps, splitProps } from "solid-js";
import { render } from "solid-js/web";
import uPlot from "uplot";

import type { SolidUplotPluginBus, UplotPluginFactory } from "../createPluginBus";
import { getSeriesData, type SeriesDatum } from "../utils/getSeriesData";
import type { CursorPluginMessageBus } from "./cursor";
import type { FocusSeriesPluginMessageBus } from "./focusSeries";

/**
 * Simple legend placement options - only top corners to avoid axis conflicts
 */
export type LegendPlacement = "top-left" | "top-right";

/**
 * Props passed to the custom legend SolidJS component.
 *
 * The legend plugin automatically provides these props to your custom component, ensuring it always
 * receives the latest series data from the chart via the plugin bus system. This creates a reactive
 * data flow where series data changes immediately trigger legend updates with fresh data information.
 */
export type LegendProps = {
  readonly u: uPlot;
  readonly seriesData: SeriesDatum[];
  readonly bus: SolidUplotPluginBus<CursorPluginMessageBus & FocusSeriesPluginMessageBus>;
};

type LegendRootProps = {
  /**
   * HTML id attribute for the legend root
   * @default "solid-uplot-legend-root"
   */
  readonly id?: string;
  /**
   * CSS class name for the legend root
   */
  readonly class?: string;
  /**
   * Inline styles for the legend root
   */
  readonly style?: JSX.CSSProperties;
  /**
   * The z-index of the legend root
   * @default 10
   */
  readonly zIndex?: number;
};

type LegendConfigOptions = {
  /**
   * Legend placement within the chart area
   * @default "top-left"
   */
  readonly placement?: LegendPlacement;
  /**
   * Pixel offset from the chart edges
   * @default 8
   */
  readonly pxOffset?: number;
};

type LegendPluginOptions = LegendRootProps & LegendConfigOptions;

/**
 * Creates a simple, opinionated legend plugin that displays custom legend content
 * overlaid on the chart's drawing area.
 *
 * **Design Philosophy:**
 * - Opinionated positioning: only top-left or top-right corners
 * - Size-constrained: legend cannot exceed chart drawing area dimensions
 * - Layout-agnostic: user controls internal layout and styling
 * - Non-interfering: designed to work harmoniously with chart interactions
 *
 * **Features:**
 * - Positioned within u.over element (chart drawing area)
 * - Automatic size constraints to prevent overflow
 * - Scroll handling for overflowing content
 * - Plugin bus integration for reactive updates
 *
 * @param Component - SolidJS component to render as the legend content
 * @param options - Configuration options for legend behavior and styling
 * @returns A plugin factory function that creates the legend plugin instance
 */
export const legend = (
  Component: Component<LegendProps>,
  options: LegendPluginOptions = {},
): UplotPluginFactory<CursorPluginMessageBus & FocusSeriesPluginMessageBus> => {
  return ({ bus }) => {
    if (!bus) {
      console.warn("[solid-uplot]: A plugin bus is required for the Legend plugin");
      return { hooks: {} };
    }

    let legendRoot!: HTMLDivElement;
    let dispose!: () => void;

    return {
      hooks: {
        ready: (u: uPlot) => {
          const seriesData = getSeriesData(u);

          const LegendRoot = () => {
            const _options = mergeProps(
              {
                placement: "top-left" as LegendPlacement,
                pxOffset: 8,
                id: "solid-uplot-legend-root",
                zIndex: 10,
              },
              options,
            );

            const [legendOptions, containerProps] = splitProps(_options, ["placement", "pxOffset"]);

            const containerStyle = () => {
              const overRect = u.over.getBoundingClientRect();
              const offset = legendOptions.pxOffset;

              return {
                position: "absolute" as const,
                [legendOptions.placement === "top-left" ? "left" : "right"]: `${offset}px`,
                top: `${offset}px`,
                "max-width": `${overRect.width - offset * 2}px`,
                "max-height": `${overRect.height - offset * 2}px`,
                "z-index": containerProps.zIndex,
                "pointer-events": "auto" as const,
                overflow: "auto" as const,
                ...containerProps.style,
              };
            };

            return (
              <div
                ref={legendRoot}
                id={containerProps.id}
                class={containerProps.class}
                role="group"
                aria-label="Chart legend"
                style={containerStyle()}
              >
                <Component u={u} seriesData={seriesData} bus={bus} />
              </div>
            );
          };

          dispose = render(() => <LegendRoot />, u.over);
        },
        destroy: () => {
          dispose();
          legendRoot?.remove();
        },
      },
    };
  };
};
