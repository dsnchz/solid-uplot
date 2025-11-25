import { type Component, type JSX, mergeProps, Show, splitProps } from "solid-js";
import { render } from "solid-js/web";
import uPlot from "uplot";

import type { UplotPluginFactory } from "../createPluginBus";
import type { CursorData } from "../utils/getCursorData";
import { getSeriesData, type SeriesDatum } from "../utils/getSeriesData";
import type { CursorPluginMessageBus } from "./cursor";
import type { FocusSeriesPluginMessageBus } from "./focusSeries";
import type { FocusSeriesPluginMessage } from "./focusSeries";

/**
 * Defines the preferred placement of the tooltip relative to the cursor position.
 */
export type TooltipCursorPlacement = "top-left" | "top-right" | "bottom-left" | "bottom-right";

/**
 * Props passed to the custom tooltip SolidJS component.
 *
 * The tooltip plugin automatically provides these props to your custom component,
 * ensuring it always receives the latest cursor data from the cursor plugin via
 * the plugin bus system. This creates a reactive data flow where cursor movements
 * immediately trigger tooltip updates with fresh position and data information.
 */
export type TooltipProps = {
  /** The uPlot instance for accessing chart configuration and data */
  readonly u: uPlot;
  /**
   * Current cursor data including position and data index, automatically updated
   * by the cursor plugin and passed via the plugin bus system
   */
  readonly cursor: CursorData;
  /** Array of series metadata for all series in the chart */
  readonly seriesData: SeriesDatum[];
  /**
   * Optional focus series data from the focusSeries plugin.
   *
   * This is automatically updated by the focusSeries plugin and passed via the plugin bus system.
   * You can use this to determine if a series is focused and apply different styling for content
   * in your tooltip component.
   */
  readonly focusedSeries?: FocusSeriesPluginMessage;
};

/**
 * Container styling and accessibility props for the tooltip wrapper.
 */
type TooltipRootProps = {
  /**
   * HTML id attribute for the tooltip root
   *
   * @default "solid-uplot-tooltip-root"
   */
  readonly id?: string;
  /**
   * CSS class name for the tooltip root
   *
   * @default undefined
   */
  readonly class?: string;
  /**
   * Inline styles for the tooltip root
   *
   * @default {}
   */
  readonly style?: JSX.CSSProperties;
  /**
   * The z-index of the tooltip root
   * @default 20
   */
  readonly zIndex?: number;
};

/**
 * Configuration options for tooltip behavior.
 */
type TooltipConfigOptions = {
  /**
   * Preferred corner of the tooltip (relative to the cursor)
   * @default "top-left"
   */
  readonly placement?: TooltipCursorPlacement;
  /**
   * Use fixed positioning for the tooltip. Set to true when the chart is in a
   * fixed positioning context (like a dialog or modal) to prevent tooltip clipping.
   * @default false
   */
  readonly fixed?: boolean;
  /**
   * Optional callback to process or modify the calculated tooltip position.
   * Receives the calculated position and placement preference, and should return a position object with the same structure.
   * Use this to implement custom positioning logic or constraints.
   *
   * @param position - The calculated position with left and top coordinates
   * @param placement - The placement preference that was used for calculation
   * @returns Modified position object with left and top coordinates
   *
   * @example
   * ```ts
   * onPositionCalculated: (position, placement) => ({
   *   left: Math.max(0, position.left), // Prevent negative positioning
   *   top: placement.includes('top') ? position.top - 5 : position.top + 10
   * })
   * ```
   */
  readonly onPositionCalculated?: (
    position: { left: number; top: number },
    placement: TooltipCursorPlacement,
  ) => {
    left: number;
    top: number;
  };
};

const TOOLTIP_OFFSET_X = 8;
const TOOLTIP_OFFSET_Y = 8;

const getTooltipPosition = (
  placement: TooltipCursorPlacement,
  left: number,
  top: number,
  tooltipWidth: number,
  tooltipHeight: number,
  isFixed = false,
): { left: number; top: number } => {
  const baseX = placement.includes("left")
    ? left - tooltipWidth - TOOLTIP_OFFSET_X
    : left + TOOLTIP_OFFSET_X;
  const baseY = placement.includes("top")
    ? top - tooltipHeight - TOOLTIP_OFFSET_Y
    : top + TOOLTIP_OFFSET_Y;

  // For fixed positioning, coordinates are already viewport-relative
  // For absolute positioning, convert document coordinates to viewport-relative
  const viewportX = isFixed ? baseX : baseX - window.scrollX;
  const viewportY = isFixed ? baseY : baseY - window.scrollY;

  const overflowsLeft = viewportX < 0;
  const overflowsRight = viewportX + tooltipWidth > window.innerWidth;
  const overflowsTop = viewportY < 0;
  const overflowsBottom = viewportY + tooltipHeight > window.innerHeight;

  let flipX = false;
  let flipY = false;

  if (placement.includes("left") && overflowsLeft) flipX = true;
  if (placement.includes("right") && overflowsRight) flipX = true;
  if (placement.includes("top") && overflowsTop) flipY = true;
  if (placement.includes("bottom") && overflowsBottom) flipY = true;

  // Adjust directions AFTER flips
  const finalX =
    flipX && placement.includes("left")
      ? left + TOOLTIP_OFFSET_X // was left-aligned, flip to right
      : flipX && placement.includes("right")
        ? left - tooltipWidth - TOOLTIP_OFFSET_X // was right-aligned, flip to left
        : baseX;

  const finalY =
    flipY && placement.includes("top")
      ? top + TOOLTIP_OFFSET_Y // was top-aligned, flip to bottom
      : flipY && placement.includes("bottom")
        ? top - tooltipHeight - TOOLTIP_OFFSET_Y // was bottom-aligned, flip to top
        : baseY;

  return {
    left: finalX,
    top: finalY,
  };
};

/**
 * Combined options for the tooltip plugin including container props and behavior config.
 */
export type TooltipPluginOptions = TooltipRootProps & TooltipConfigOptions;

/**
 * Creates a tooltip plugin that displays custom content when hovering over charts.
 *
 * This plugin renders a custom SolidJS component as a tooltip that follows the cursor
 * and displays contextual information about the data point being hovered.
 *
 * **Features:**
 * - Custom SolidJS component rendering
 * - Automatic positioning with edge detection and flipping
 * - Scroll-aware positioning that works with page scrolling
 * - Configurable placement preferences
 * - Position callback for custom positioning logic or overrides
 * - Accessible tooltip with proper ARIA attributes
 * - Automatic cleanup and memory management
 *
 * **Requirements:**
 * - Requires the cursor plugin to be active for position tracking
 * - Needs a plugin bus for cursor data communication
 *
 * **Usage:**
 * ```typescript
 * import { createPluginBus } from '@dschz/solid-uplot';
 * import { cursor, tooltip, type CursorPluginMessageBus, type TooltipProps } from '@dschz/solid-uplot/plugins';
 * import type { Component } from 'solid-js';
 *
 * const bus = createPluginBus<CursorPluginMessageBus>();
 *
 * // Custom tooltip component MUST accept TooltipProps
 * const MyTooltip: Component<TooltipProps> = (props) => {
 *   const xDate = () => new Date(props.cursor.xValue * 1000).toLocaleDateString();
 *
 *   return (
 *     <div style={{
 *       background: "white", border: "1px solid #ccc", padding: "8px",
 *       "border-radius": "4px", "box-shadow": "0 2px 4px rgba(0,0,0,0.1)"
 *     }}>
 *       <div style={{ "font-weight": "bold", "margin-bottom": "8px" }}>
 *         {xDate()}
 *       </div>
 *       <For each={props.seriesData}>
 *         {(series) => {
 *           // Fetch data value using series index and cursor position
 *           const value = () => props.u.data[series.seriesIdx]?.[props.cursor.idx];
 *
 *           return (
 *             <Show when={series.visible}>
 *               <div style={{ display: "flex", "align-items": "center", "margin-bottom": "4px" }}>
 *                 <div style={{
 *                   width: "10px", height: "10px", "border-radius": "50%",
 *                   "background-color": series.stroke, "margin-right": "6px"
 *                 }} />
 *                 <span style={{ color: series.stroke }}>
 *                   {series.label}: {value()?.toFixed(2)}
 *                 </span>
 *               </div>
 *             </Show>
 *           );
 *         }}
 *       </For>
 *     </div>
 *   );
 * };
 *
 * <SolidUplot
 *   // ... other props
 *   plugins={[cursor(), tooltip(MyTooltip, { placement: "top-right" })]}
 *   pluginBus={bus}
 * />
 * ```
 *
 * **Custom Tooltip Component Requirements:**
 * - Must accept `TooltipProps` as props type (exported from '@dschz/solid-uplot/plugins')
 * - Must be a valid SolidJS Component
 * - Receives: `u` (uPlot instance), `cursor` (position/data), `seriesData` (series metadata)
 * - Use `props.u.data[series.seriesIdx][props.cursor.idx]` to fetch data values
 *
 * @param Component - SolidJS component to render as the tooltip content
 * @param options - Configuration options for tooltip behavior and styling
 * @returns A plugin factory function that creates the tooltip plugin instance
 */
export const tooltip = (
  Component: Component<TooltipProps>,
  options: TooltipPluginOptions = {},
): UplotPluginFactory<CursorPluginMessageBus & FocusSeriesPluginMessageBus> => {
  return ({ bus }) => {
    if (!bus) {
      console.warn("[solid-uplot]: A plugin bus is required for the tooltip plugin");
      return { hooks: {} };
    }

    let tooltipRoot!: HTMLDivElement;
    let dispose!: () => void;

    return {
      hooks: {
        ready: (u: uPlot) => {
          const seriesData = getSeriesData(u);

          const TooltipRoot = () => {
            const _options = mergeProps(
              {
                placement: "top-left" as TooltipCursorPlacement,
                fixed: false,
                id: "solid-uplot-tooltip-root",
                style: {},
                zIndex: 20,
              },
              options,
            );

            const chartCursorData = () => bus.data.cursor?.state[u.root.id];

            const [tooltipOptions, containerProps] = splitProps(_options, [
              "placement",
              "fixed",
              "onPositionCalculated",
            ]);

            return (
              <Show when={chartCursorData()}>
                {(cursor) => {
                  const position = () => {
                    const overRect = u.over.getBoundingClientRect();
                    const tooltipWidth = tooltipRoot.offsetWidth ?? 0;
                    const tooltipHeight = tooltipRoot.offsetHeight ?? 0;

                    // Calculate cursor position in viewport coordinates
                    const cursorLeft = overRect.left + cursor().position.left;
                    const cursorTop = overRect.top + cursor().position.top;

                    // For fixed positioning, use viewport coordinates
                    // For absolute positioning, convert to document coordinates
                    const absoluteLeft = tooltipOptions.fixed
                      ? cursorLeft
                      : cursorLeft + window.scrollX;
                    const absoluteTop = tooltipOptions.fixed
                      ? cursorTop
                      : cursorTop + window.scrollY;

                    const calculatedPosition = getTooltipPosition(
                      tooltipOptions.placement,
                      absoluteLeft,
                      absoluteTop,
                      tooltipWidth,
                      tooltipHeight,
                      tooltipOptions.fixed,
                    );

                    // Allow user to override or modify the calculated position
                    return tooltipOptions.onPositionCalculated
                      ? tooltipOptions.onPositionCalculated(
                          calculatedPosition,
                          tooltipOptions.placement,
                        )
                      : calculatedPosition;
                  };

                  return (
                    <div
                      ref={tooltipRoot}
                      id={containerProps.id}
                      class={containerProps.class}
                      role="tooltip"
                      aria-label="Chart tooltip"
                      style={{
                        position: tooltipOptions.fixed ? "fixed" : "absolute",
                        "z-index": containerProps.zIndex,
                        "pointer-events": "none",
                        left: `${position().left}px`,
                        top: `${position().top}px`,
                        ...containerProps.style,
                      }}
                    >
                      <Component
                        u={u}
                        seriesData={seriesData}
                        cursor={cursor()}
                        focusedSeries={bus.data.focusSeries}
                      />
                    </div>
                  );
                }}
              </Show>
            );
          };

          dispose = render(() => <TooltipRoot />, u.root);
        },
        destroy: () => {
          dispose();
          tooltipRoot?.remove();
        },
      },
    };
  };
};
