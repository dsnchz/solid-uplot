import { type Component, For } from "solid-js";

import { createPluginBus, SolidUplot } from "../../src";
import {
  cursor,
  type CursorPluginMessageBus,
  focusSeries,
  type FocusSeriesPluginMessageBus,
  legend,
  tooltip,
} from "../../src/plugins";
import type { CursorData, SeriesDatum } from "../../src/utils";

const bus = createPluginBus<CursorPluginMessageBus & FocusSeriesPluginMessageBus>();

const CustomTooltip: Component<{ u: uPlot; cursor: CursorData; seriesData: SeriesDatum[] }> = (
  props,
) => {
  return (
    <div class="rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
      <div class="mb-1 text-sm font-medium">X: {props.cursor.idx}</div>
      <For each={props.seriesData}>
        {(series) => {
          const value = () => props.u.data[series.seriesIdx]?.[props.cursor.idx];
          return (
            <div class="flex items-center gap-2">
              <div
                class="h-2 w-2 rounded-full"
                style={{ "background-color": series.stroke as string }}
              />
              <span class="text-sm">
                {series.label}: {value()}
              </span>
            </div>
          );
        }}
      </For>
    </div>
  );
};

const CustomLegend: Component<{ seriesData: SeriesDatum[] }> = (props) => {
  return (
    <div class="flex items-center gap-4 rounded-md bg-white/90 px-3 py-2 text-sm backdrop-blur-sm">
      <For each={props.seriesData}>
        {(series) => (
          <div class="flex items-center gap-2">
            <div
              class="h-3 w-3 rounded-full"
              style={{ "background-color": series.stroke as string }}
            />
            <span class="font-medium text-gray-700">{series.label}</span>
          </div>
        )}
      </For>
    </div>
  );
};

export const PluginShowcase: Component = () => {
  return (
    <SolidUplot
      data={[
        [0, 1, 2, 3], // x values
        [10, 20, 30, 40], // y values for series 1
        [15, 25, 35, 45], // y values for series 2
      ]}
      width={500}
      height={300}
      scales={{
        x: {
          time: false,
        },
      }}
      series={[
        {},
        {
          label: "Series 1",
          stroke: "#1f77b4",
        },
        {
          label: "Series 2",
          stroke: "#ff7f0e",
        },
      ]}
      plugins={[
        cursor(),
        tooltip(CustomTooltip),
        focusSeries({ pxThreshold: 5 }),
        legend(CustomLegend, { placement: "top-left" }),
      ]}
      pluginBus={bus}
    />
  );
};
