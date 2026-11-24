import type { Owner } from "solid-js";
import { createStore, type SetStoreFunction, type Store } from "solid-js/store";

import type { CursorPluginMessageBus } from "./cursor";

/**
 * Base constraint for plugin bus data structures.
 * @internal Not exported from the package; consumers write `Record<string, unknown>`.
 */
export type VoidStruct = Record<string, unknown>;

/**
 * A SolidUplot plugin bus: a Solid store shared by the plugins of one or more charts.
 * `setData` is Solid's store setter: `bus.setData("myPlugin", { value: 1 })`.
 *
 * Every bus carries the built-in cursor state (`data.cursor`, see {@link CursorPluginMessageBus})
 * on top of `T`.
 *
 * @template T - Your plugins' message types, e.g. `FocusSeriesPluginMessageBus & MyPluginMessageBus`
 */
export type SolidUplotPluginBus<T extends VoidStruct = VoidStruct> = {
  readonly data: Store<T & CursorPluginMessageBus>;
  readonly setData: SetStoreFunction<T & CursorPluginMessageBus>;
};

/**
 * Creates a reactive store shared across SolidUplot plugins.
 *
 * This store acts as a message bus, allowing plugins to publish and subscribe to typed
 * messages based on agreed-upon keys (e.g., `tooltip`, `highlight`). It is seeded with the
 * built-in cursor state, so `bus.data.cursor` is always defined.
 *
 * A chart without a `pluginBus` prop creates its own bus. Create one yourself to share it
 * between charts (synced tooltips and focus) or to read and write it from outside a chart.
 *
 * @template T - Your plugins' message types
 * @param initialData - Initial data for the plugin bus
 * @returns A reactive store with data and setData functions
 *
 * @example
 * ```tsx
 * type MyBusData = {
 *   tooltip?: { x: number; y: number; visible: boolean };
 *   highlight?: { seriesIndex: number };
 * };
 *
 * const bus = createPluginBus<MyBusData>();
 * ```
 */
export const createPluginBus = <T extends VoidStruct = VoidStruct>(
  initialData: Omit<T, keyof CursorPluginMessageBus> & Partial<CursorPluginMessageBus> = {} as T,
): SolidUplotPluginBus<T> => {
  const [data, setData] = createStore<T & CursorPluginMessageBus>({
    cursor: { state: {} },
    ...initialData,
  } as T & CursorPluginMessageBus);
  return { data, setData };
};

/**
 * Context object passed to plugin factory functions
 *
 * @template T - The type of the plugin bus data structure
 */
export type UplotPluginFactoryContext<T extends VoidStruct = VoidStruct> = {
  /**
   * The plugin bus: the `pluginBus` prop, or the chart's own bus when none is passed.
   * Always defined, and `bus.data.cursor` always holds the built-in cursor state.
   */
  readonly bus: SolidUplotPluginBus<T>;
  /**
   * The reactive owner of the `SolidUplot` component. Mount a plugin's Solid UI under it —
   * `runWithOwner(owner ?? null, () => render(() => <Ui />, u.over))` — so the UI sees the
   * app's context (`useContext`).
   */
  readonly owner?: Owner | null;
};

/**
 * Factory function type for creating uPlot plugins with access to the SolidUplot plugin bus
 *
 * This allows plugins to communicate with each other and share state reactively through
 * the SolidJS store system. Plugin factories receive a context object containing the
 * plugin bus and return a standard uPlot plugin.
 *
 * When authoring plugins for public consumption, follow this pattern:
 * 1. Define your plugin's message type
 * 2. Define your plugin's message bus type
 * 3. Export your plugin factory with proper type constraints
 *
 * Every chart tracks the cursor before any plugin runs, so a plugin can read
 * `bus.data.cursor.state[u.root.id]` without adding anything to its bus type.
 *
 * @template T - The type of the plugin bus data structure for type-safe communication
 *
 * @param ctx - Context object containing the plugin bus and other shared resources
 * @returns A standard uPlot plugin object with hooks
 *
 * @example
 * ```tsx
 * import type { UplotPluginFactory } from '@dschz/solid-uplot';
 *
 * // 1. Define your plugin's message type
 * export type MyPluginMessage = {
 *   value: number;
 *   timestamp: number;
 * };
 *
 * // 2. Define your plugin's message bus type
 * export type MyPluginMessageBus = {
 *   myPlugin?: MyPluginMessage;
 * };
 *
 * // 3. Export your plugin factory with proper type constraints
 * export const myPlugin = (options = {}): UplotPluginFactory<MyPluginMessageBus> => {
 *   return ({ bus }) => ({
 *     hooks: {
 *       ready: (u) => {
 *         // Initialize plugin state
 *         bus.setData("myPlugin", { value: 0, timestamp: Date.now() });
 *       },
 *       setCursor: (u) => {
 *         // The built-in cursor state is always there
 *         const cursor = bus.data.cursor.state[u.root.id];
 *         if (cursor) console.log(cursor.xValue);
 *       },
 *       destroy: (u) => {
 *         bus.setData("myPlugin", undefined);
 *       },
 *     },
 *   });
 * };
 *
 * // No bus needed for a single chart; pass one to share it between charts
 * <SolidUplot data={data} series={series} plugins={[myPlugin()]} />
 * ```
 *
 * @see {@link https://github.com/leeoniya/uPlot/tree/master/docs#plugins} uPlot Plugin Documentation
 */
export type UplotPluginFactory<T extends VoidStruct = VoidStruct> = (
  ctx: UplotPluginFactoryContext<T>,
) => uPlot.Plugin;
