import { createEffect, createRoot } from "solid-js";

import type { PluginFactory } from "../createPluginBus";
import type { CursorPluginMessageBus } from "./cursor";

const DEFAULT_UNFOCUSED_ALPHA = 0.1 as const;
const DEFAULT_FOCUSED_ALPHA = 1 as const;
const DEFAULT_REBUILD_PATHS = false as const;

/**
 * Target a series by its label.
 */
type SeriesByLabel = {
  /**
   * The label of the series.
   */
  readonly label: string;
  readonly index?: never;
  readonly zeroIndex?: never;
};

/**
 * Target a series by its uPlot index.
 */
type SeriesByIndex = {
  readonly label?: never;
  /**
   * The index of the y-series as according to uPlot.
   *
   * For example, if we have 3 y-series, they would have the following uPlot-based indices:
   * - 1
   * - 2
   * - 3
   *
   * Note that the x-series is not included in this indexing (which starts at index 0 within uPlot).
   */
  readonly index: number;
  readonly zeroIndex?: never;
};

/**
 * Target a series by its zero-based index.
 */
type SeriesByZeroIndex = {
  readonly label?: never;
  readonly index?: never;
  /**
   * The zero-based index of the series.
   *
   * This is the index of the y-series if we were to treat them with zero-based indexing.
   *
   * For example, if we have 3 y-series, they would have the following zero-based indices:
   * - 0
   * - 1
   * - 2
   *
   * Note that the x-series is not included in this zero-based indexing.
   */
  readonly zeroIndex: number;
};

/**
 * Defines how to target a specific series for focusing.
 * Can target by label, uPlot index, or zero-based index.
 */
export type SeriesFocusTarget = SeriesByLabel | SeriesByIndex | SeriesByZeroIndex;

/**
 * Message structure for focus series plugin communication via the plugin bus.
 */
export type FocusSeriesPluginMessage = {
  /**
   * The id of the source that triggered the focus series event.
   */
  readonly sourceId: string;

  /**
   * The list of target series to focus.
   */
  readonly targets: SeriesFocusTarget[];
};

/**
 * The message bus interface for the focus series plugin.
 * Defines the structure of focus series data shared between plugins.
 */
export type FocusSeriesPluginMessageBus = {
  /**
   * Focus series plugin message containing source and target information.
   */
  focusSeries?: FocusSeriesPluginMessage;
};

/**
 * Configuration options for the focus series plugin.
 */
export type FocusSeriesPluginOptions = {
  /**
   * The vertical distance in pixels required to focus a series.
   * If the cursor's Y position is within this threshold of a Y value, that series is considered focused.
   *
   * @default 5
   */
  readonly pxThreshold?: number;

  /**
   * The alpha value to set for unfocused series.
   *
   * @default 0.1
   */
  readonly unfocusedAlpha?: number;

  /**
   * The alpha value to set for focused series.
   *
   * @default 1
   */
  readonly focusedAlpha?: number;

  /**
   * Whether to rebuild the paths of the series during redraw.
   * When set to `false`, uPlot will use the cached Path2D objects for the series.
   *
   * @default false
   */
  readonly rebuildPaths?: boolean;
};

type SeriesFocusRedrawOptions = {
  readonly unfocusedAlpha?: number;
  readonly focusedAlpha?: number;
  readonly rebuildPaths?: boolean;
  readonly focusTargets?: SeriesFocusTarget[];
};

const seriesFocusRedraw = (u: uPlot, options: SeriesFocusRedrawOptions = {}) => {
  const {
    unfocusedAlpha = DEFAULT_UNFOCUSED_ALPHA,
    focusedAlpha = DEFAULT_FOCUSED_ALPHA,
    rebuildPaths = DEFAULT_REBUILD_PATHS,
    focusTargets,
  } = options;

  for (let i = 1; i < u.series.length; i++) {
    const s = u.series[i]!;

    if (!focusTargets || !focusTargets.length) {
      s.alpha = 1; // restore alpha of all series
      continue;
    }

    const target = focusTargets.find((t) => {
      if ("label" in t) return t.label === s.label;
      if ("zeroIndex" in t) return t.zeroIndex === i - 1;
      if ("index" in t) return t.index === i;
    });

    s.alpha = target ? focusedAlpha : unfocusedAlpha;
  }

  u.redraw(rebuildPaths);
};

/**
 * Creates a focus series plugin that visually highlights series based on cursor proximity.
 *
 * This plugin dims non-focused series and highlights the series closest to the cursor position.
 * When the cursor is within the specified pixel threshold of a series data point, that series
 * becomes focused while others are dimmed.
 *
 * **Features:**
 * - Automatic series focusing based on cursor proximity
 * - Configurable pixel threshold for focus detection
 * - Cross-chart focus synchronization via plugin bus
 * - Smooth visual feedback with alpha transparency
 * - Support for targeting series by label, index, or zero-based index
 *
 * **Requirements:**
 * - Requires the cursor plugin to be active for position tracking
 * - Needs a plugin bus for cursor data communication
 *
 * **Usage:**
 * ```typescript
 * import { createPluginBus } from '@dschz/solid-uplot';
 * import { cursor, focusSeries, type CursorPluginMessageBus, type FocusSeriesPluginMessageBus } from '@dschz/solid-uplot/plugins';
 *
 * const bus = createPluginBus<CursorPluginMessageBus & FocusSeriesPluginMessageBus>();
 *
 * <SolidUplot
 *   // ... other props
 *   plugins={[cursor(), focusSeries({ pxThreshold: 10 })]}
 *   pluginBus={bus}
 * />
 * ```
 *
 * @param options - Configuration options for focus behavior
 * @returns A plugin factory function that creates the focus series plugin instance
 */
export const focusSeries = (
  options: FocusSeriesPluginOptions = {},
): PluginFactory<CursorPluginMessageBus & FocusSeriesPluginMessageBus> => {
  return ({ bus }) => {
    if (!bus) {
      console.warn("[solid-uplot]: A plugin bus is required for the focusSeries plugin");
      return { hooks: {} };
    }

    const {
      pxThreshold = 5,
      unfocusedAlpha = DEFAULT_UNFOCUSED_ALPHA,
      focusedAlpha = DEFAULT_FOCUSED_ALPHA,
      rebuildPaths = DEFAULT_REBUILD_PATHS,
    } = options;

    let dispose: () => void;
    let pointerLeave: () => void;

    return {
      hooks: {
        ready: (u) => {
          pointerLeave = () => {
            bus.setData("focusSeries", undefined);
          };

          /**
           * This microtask is to cover the edge case where a user may initialize the bus state with
           * data (i.e. from the url on browser refresh). For some reason, even though the plugin
           * ready lifecycle event is called after the uPlot chart has been created, the chart does
           * not seem to apply the focus series state unless we delay it via a microtask.
           *
           * We eagerly do this action of reading the focusSeries bus state once and only once.
           * The rest is driven by Solid's reactivity system inside of the `createRoot` block below.
           */
          queueMicrotask(() => {
            if (bus.data.focusSeries) {
              seriesFocusRedraw(u, {
                unfocusedAlpha,
                focusedAlpha,
                rebuildPaths,
                focusTargets: bus.data.focusSeries.targets,
              });
            }
          });

          u.over.addEventListener("pointerleave", pointerLeave);

          dispose = createRoot((dispose) => {
            createEffect(() => {
              const cursor = bus.data.cursor;
              const focus = bus.data.focusSeries;

              if (cursor?.sourceId !== u.root.id) {
                seriesFocusRedraw(u, {
                  unfocusedAlpha,
                  focusedAlpha,
                  rebuildPaths,
                  focusTargets: focus?.targets,
                });
              }
            });

            return dispose;
          });
        },
        setCursor: (u) => {
          const cursor = bus.data.cursor;
          const chartCursor = cursor?.state[u.root.id];

          // Do nothing if this chart instance is not the source of the focus.
          if (!cursor || !chartCursor || cursor.sourceId !== u.root.id) return;

          const focusTargets: SeriesFocusTarget[] = [];

          for (let i = 1; i < u.series.length; i++) {
            const s = u.series[i]!;
            const yVals = u.data[i];
            const val = yVals?.[chartCursor.idx];

            if (!s.show || !yVals || val == null) continue;

            const yPos = u.valToPos(val, s.scale!);
            const dist = Math.abs(yPos - chartCursor.position.top);

            if (dist <= pxThreshold) {
              if (s.label != null) {
                focusTargets.push({ label: s.label as string });
              } else {
                focusTargets.push({ index: i });
              }
            }
          }

          seriesFocusRedraw(u, {
            unfocusedAlpha,
            focusedAlpha,
            rebuildPaths,
            focusTargets,
          });

          bus.setData("focusSeries", {
            sourceId: u.root.id,
            targets: focusTargets,
          });
        },
        destroy: (u: uPlot) => {
          dispose();
          u.over.removeEventListener("pointerleave", pointerLeave);
        },
      },
    };
  };
};
