import type uPlot from "uplot";

import type { UplotPluginFactory } from "../createPluginBus";
import { type CursorData, getCursorData } from "../utils/getCursorData";

/**
 * Message structure for cursor plugin communication via the plugin bus.
 */
export type CursorPluginMessage = {
  /**
   * The ID of the plot instance that originated this cursor message.
   * Used to identify which chart is the source of cursor updates.
   */
  readonly sourceId?: string;
  /**
   * State object containing cursor data for each plot instance.
   * Key is the plot ID, value is the cursor data for that plot.
   */
  readonly state: {
    [plotId: string]: CursorData | undefined;
  };
};

/**
 * The message bus interface for the cursor plugin.
 * Defines the structure of cursor-related data shared between plugins.
 */
export type CursorPluginMessageBus = {
  /**
   * Cursor plugin message containing state and source information.
   */
  cursor?: CursorPluginMessage;
};

/**
 * Creates a cursor plugin that tracks and shares cursor position and state across charts.
 *
 * This plugin enables cursor synchronization between multiple charts and provides
 * cursor data to other plugins (like tooltips) via the plugin bus system.
 *
 * **Features:**
 * - Tracks cursor position and x-series data indices
 * - Transmits cursor data via plugin bus for cross-plugin synchronization
 *
 * **Usage:**
 * ```typescript
 * import { createPluginBus } from '@dschz/solid-uplot';
 * import { cursor, type CursorPluginMessageBus } from '@dschz/solid-uplot/plugins';
 *
 * const bus = createPluginBus<CursorPluginMessageBus>();
 *
 * <SolidUplot
 *   // ... other props
 *   plugins={[cursor()]}
 *   pluginBus={bus}
 * />
 * ```
 *
 * **Plugin Bus Data:**
 * The plugin populates `bus.data.cursor` with:
 * - `sourceId`: ID of the chart that last updated the cursor
 * - `state[plotId]`: Cursor data for each chart instance
 *
 * See {@link CursorPluginMessage} for the complete data structure.
 *
 * @returns A plugin factory function that creates the cursor plugin instance
 *
 * @example
 * ```typescript
 * // Use with other plugins that depend on cursor data
 * const plugins = [
 *   cursor(),
 *   tooltip(MyTooltipComponent),
 *   focusSeries()
 * ];
 * ```
 */
export const cursor = (): UplotPluginFactory<CursorPluginMessageBus> => {
  return ({ bus }) => {
    if (!bus) {
      console.warn("[solid-uplot]: A plugin bus is required for the cursor plugin");
      return { hooks: {} };
    }

    // Initialize cursor state in the plugin bus
    bus.setData("cursor", {
      state: {},
    });

    let pointerEnter: () => void;
    let pointerLeave: () => void;

    return {
      hooks: {
        ready: (u: uPlot) => {
          pointerEnter = () => {
            bus.setData("cursor", { sourceId: u.root.id });
          };

          pointerLeave = () => {
            bus.setData("cursor", { sourceId: undefined });
          };

          u.over.addEventListener("pointerenter", pointerEnter);
          u.over.addEventListener("pointerleave", pointerLeave);
        },

        setCursor: (u: uPlot) => {
          bus.setData("cursor", "state", u.root.id, getCursorData(u));
        },

        setData: (u: uPlot) => {
          /**
           * We have to update the cursor store in this manner in order for changes to be recognized
           * after a chart data dynamically updates (e.g. streaming data).
           */
          bus.setData("cursor", (prev) => ({
            ...(prev ?? {}),
            state: {
              ...(prev?.state ?? {}),
              [u.root.id]: getCursorData(u),
            },
          }));
        },

        destroy: (u: uPlot) => {
          // Remove cursor state for this chart
          bus.setData("cursor", "state", u.root.id, undefined);

          // Clean up event listeners
          u.over.removeEventListener("pointerenter", pointerEnter);
          u.over.removeEventListener("pointerleave", pointerLeave);
        },
      },
    };
  };
};
