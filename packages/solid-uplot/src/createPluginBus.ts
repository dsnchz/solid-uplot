import { createStore, type SetStoreFunction, type Store } from "solid-js/store";

/** Base constraint for plugin bus data structures */
export type VoidStruct = Record<string, unknown>;

/**
 * Internal type representing the plugin store structure
 * @internal
 */
type PluginStore<T> = {
  readonly data: Store<T>;
  readonly setData: SetStoreFunction<T>;
};

/**
 * Creates a reactive store shared across SolidUplot plugins.
 *
 * This store acts as a message bus, allowing plugins to publish and
 * subscribe to typed messages based on agreed-upon keys (e.g., `tooltip`, `highlight`).
 *
 * @template T - The type of the plugin bus data structure
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
  initialData: T = {} as T,
): PluginStore<T> => {
  const [data, setData] = createStore<T>(initialData);
  return { data, setData };
};

/**
 * Type representing a SolidUplot plugin bus instance
 *
 * @template T - The type of the plugin bus data structure
 */
export type SolidUplotPluginBus<T extends VoidStruct = VoidStruct> = ReturnType<
  typeof createPluginBus<T>
>;

/**
 * Context object passed to plugin factory functions
 *
 * @template T - The type of the plugin bus data structure
 */
export type UplotPluginFactoryContext<T extends VoidStruct = VoidStruct> = {
  /** The plugin communication bus for sharing data between plugins */
  readonly bus?: SolidUplotPluginBus<T>;
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
 * 4. Include bus validation and warning messages
 *
 * @template T - The type of the plugin bus data structure for type-safe communication
 *
 * @param ctx - Context object containing the plugin bus and other shared resources
 * @returns A standard uPlot plugin object with hooks
 *
 * @example
 * ```tsx
 * import type { UplotPluginFactory } from '@dschz/solid-uplot';
 * import type { CursorPluginMessageBus } from '@dschz/solid-uplot/plugins';
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
 * export const myPlugin = (
 *   options = {},
 * ): UplotPluginFactory<CursorPluginMessageBus & MyPluginMessageBus> => {
 *   return ({ bus }) => {
 *     // 4. Include bus validation and warning
 *     if (!bus) {
 *       console.warn("[my-plugin]: A plugin bus is required");
 *       return { hooks: {} };
 *     }
 *
 *     return {
 *       hooks: {
 *         ready: (u) => {
 *           // Initialize plugin state
 *           bus.setData("myPlugin", {
 *             value: 0,
 *             timestamp: Date.now(),
 *           });
 *         },
 *         setData: (u) => {
 *           // Update plugin state reactively
 *           bus.setData("myPlugin", "value", (prev) => prev + 1);
 *         },
 *       },
 *     };
 *   };
 * };
 *
 * // Usage with proper typing
 * const bus = createPluginBus<CursorPluginMessageBus & MyPluginMessageBus>();
 *
 * <SolidUplot
 *   data={data}
 *   pluginBus={bus}
 *   plugins={[cursor(), myPlugin()]}
 * />
 * ```
 *
 * @see {@link https://github.com/leeoniya/uPlot/tree/master/docs#plugins} uPlot Plugin Documentation
 */
export type UplotPluginFactory<T extends VoidStruct = VoidStruct> = (
  ctx: UplotPluginFactoryContext<T>,
) => uPlot.Plugin;
