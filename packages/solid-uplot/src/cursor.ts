import type uPlot from "uplot";

import type { SolidUplotPluginBus, VoidStruct } from "./createPluginBus";
import { type CursorData, getCursorData } from "./utils/getCursorData";

/**
 * The cursor state every SolidUplot chart publishes on its plugin bus.
 *
 * Cursor tracking is built into the chart: it is always on, runs before every other plugin,
 * and writes this message to `bus.data.cursor`, so any plugin — built in or your own — can
 * read the cursor position.
 */
export type CursorPluginMessage = {
  /**
   * The id of the chart the pointer is currently over, or `undefined` when it is over none
   * of the charts sharing this bus.
   */
  readonly sourceId?: string;
  /**
   * Cursor data for each chart on this bus, keyed by chart id. `undefined` when the cursor
   * is not over a data point of that chart.
   */
  readonly state: {
    [plotId: string]: CursorData | undefined;
  };
};

/**
 * The cursor slice of every plugin bus. `createPluginBus` seeds it, so `bus.data.cursor` is
 * always defined.
 */
export type CursorPluginMessageBus = {
  cursor: CursorPluginMessage;
};

/**
 * Built-in cursor tracking, installed first on every chart by `SolidUplot`.
 * @internal
 */
export const createCursorPlugin = <T extends VoidStruct>(
  pluginBus: SolidUplotPluginBus<T>,
): uPlot.Plugin => {
  // Solid 1's path setters can't resolve keys on the generic `T & CursorPluginMessageBus`;
  // this plugin only touches the cursor slice, so narrow to the base bus type.
  const bus = pluginBus as unknown as SolidUplotPluginBus;

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
        // Give `cursor.state` a fresh object (merging into `cursor` replaces `state`; a setter
        // at the `state` path would merge into it). After a data update the cursor index can
        // be unchanged while the values under it changed, and readers (e.g. a hovered
        // tooltip) must re-read `u.data`.
        bus.setData("cursor", (cursor) => ({
          state: { ...cursor.state, [u.root.id]: getCursorData(u) },
        }));
      },

      destroy: (u: uPlot) => {
        bus.setData("cursor", "state", u.root.id, undefined);

        u.over.removeEventListener("pointerenter", pointerEnter);
        u.over.removeEventListener("pointerleave", pointerLeave);
      },
    },
  };
};
