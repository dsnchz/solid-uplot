import "uplot/dist/uPlot.min.css";

import {
  createEffect,
  type JSX,
  mergeProps,
  onCleanup,
  type ParentProps,
  splitProps,
  untrack,
} from "solid-js";
import uPlot from "uplot";

type SolidUplotProps = uPlot.Options & {
  /** The ref of the uPlot instance */
  readonly ref?: (el: HTMLDivElement) => void;
  /** The id of the uPlot instance */
  readonly id?: string;
  /** The class name of the uPlot instance */
  readonly class?: string;
  /** Callback when uPlot instance is created */
  readonly onCreate?: (u: uPlot, container: HTMLDivElement) => void;
  /** Apply scale reset on redraw triggered by updated plot data (default: `true`) */
  readonly resetScales?: boolean;
  /** The style of the uPlot instance container */
  readonly style?: JSX.CSSProperties;
};

export const SolidUplot = (props: ParentProps<SolidUplotProps>): JSX.Element => {
  let container!: HTMLDivElement;
  const [local, options] = splitProps(props, [
    "class",
    "children",
    "id",
    "onCreate",
    "style",
    "ref",
  ]);

  const _options = mergeProps({ data: [] as uPlot.AlignedData, resetScales: true }, options);
  const [updateableOptions, newChartOptions] = splitProps(_options, [
    "data",
    "width",
    "height",
    "resetScales",
  ]);

  const size = () => ({ width: updateableOptions.width, height: updateableOptions.height });

  createEffect(() => {
    const initialSize = untrack(size);
    const initialData = untrack(() => updateableOptions.data);
    const chart = new uPlot({ ...newChartOptions, ...initialSize }, initialData, container);

    local.onCreate?.(chart, container);

    createEffect(() => {
      chart.setSize(size());
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
      ref={(el) => {
        container = el;
        local.ref?.(el);
      }}
      id={local.id}
      class={local.class}
      style={local.style}
    >
      {local.children}
    </div>
  );
};
