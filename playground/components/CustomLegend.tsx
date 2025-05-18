import { For } from "solid-js";

import type { LegendProps } from "../../src/plugins";
import { getColorString } from "../../src/utils";

export const CustomLegend = (props: LegendProps) => {
  const focusedLabels = () =>
    props.bus.data.focusSeries?.targets
      ?.filter((t): t is { label: string } => "label" in t)
      .map((t) => t.label) ?? [];

  return (
    <div class="flex flex-wrap w-full bg-white shadow-md rounded-md p-2 border text-sm space-y-1">
      <For each={props.seriesData}>
        {(series) => (
          <div
            class="flex items-center gap-2"
            style={{
              opacity: focusedLabels().length
                ? focusedLabels().includes(series.label)
                  ? 1
                  : 0.4
                : 1,
            }}
          >
            <div
              class="w-3 h-3 rounded-full"
              style={{ "background-color": getColorString(series.stroke) }}
            />
            <span>{series.label}</span>
          </div>
        )}
      </For>
    </div>
  );
};
