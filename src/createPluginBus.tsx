import { createStore, type SetStoreFunction, type Store } from "solid-js/store";

export type VoidStruct = Record<string, unknown>;

type PluginStore<T> = {
  readonly data: Store<T>;
  readonly setData: SetStoreFunction<T>;
};

/**
 * Represents a reactive store shared across SolidUplot plugins.
 *
 * This store acts as a message bus, allowing plugins to publish and
 * subscribe to typed messages based on agreed-upon keys (e.g., `tooltip`, `highlight`).
 */
export const createPluginBus = <T extends VoidStruct = VoidStruct>(
  initialData: T = {} as T,
): PluginStore<T> => {
  const [data, setData] = createStore<T>(initialData);
  return { data, setData };
};

export type SolidUplotPluginBus<T extends VoidStruct = VoidStruct> = ReturnType<
  typeof createPluginBus<T>
>;

export type PluginFactoryContext<T extends VoidStruct = VoidStruct> = {
  readonly bus?: SolidUplotPluginBus<T>;
};

export type PluginFactory<T extends VoidStruct = VoidStruct> = (
  ctx: PluginFactoryContext<T>,
) => uPlot.Plugin;
