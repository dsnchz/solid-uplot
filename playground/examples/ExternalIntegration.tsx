import { type Component, For } from "solid-js";

import { createPluginBus, SolidUplot } from "../../src";
import {
  cursor,
  type CursorPluginMessageBus,
  focusSeries,
  type FocusSeriesPluginMessageBus,
} from "../../src/plugins";

const bus = createPluginBus<CursorPluginMessageBus & FocusSeriesPluginMessageBus>();

const DataGrid: Component<{
  bus: ReturnType<typeof createPluginBus<FocusSeriesPluginMessageBus>>;
}> = (props) => {
  const series = [
    { label: "Series 1", color: "#1f77b4" },
    { label: "Series 2", color: "#ff7f0e" },
  ];

  return (
    <div class="mb-4">
      <table class="w-full border-collapse">
        <thead>
          <tr>
            <th class="border border-gray-200 bg-gray-50 px-4 py-2">Series</th>
            <th class="border border-gray-200 bg-gray-50 px-4 py-2">X: 0</th>
            <th class="border border-gray-200 bg-gray-50 px-4 py-2">X: 1</th>
            <th class="border border-gray-200 bg-gray-50 px-4 py-2">X: 2</th>
            <th class="border border-gray-200 bg-gray-50 px-4 py-2">X: 3</th>
          </tr>
        </thead>
        <tbody>
          <For each={series}>
            {(s) => (
              <tr
                class="hover:bg-gray-50"
                onMouseEnter={() =>
                  props.bus.setData("focusSeries", {
                    sourceId: "data-grid",
                    targets: [{ label: s.label }],
                  })
                }
                onMouseLeave={() => props.bus.setData("focusSeries", undefined)}
              >
                <td class="border border-gray-200 px-4 py-2">
                  <div class="flex items-center gap-2">
                    <div class="h-2 w-2 rounded-full" style={{ "background-color": s.color }} />
                    <span>{s.label}</span>
                  </div>
                </td>
                <td class="border border-gray-200 px-4 py-2">{s.label === "Series 1" ? 10 : 15}</td>
                <td class="border border-gray-200 px-4 py-2">{s.label === "Series 1" ? 20 : 25}</td>
                <td class="border border-gray-200 px-4 py-2">{s.label === "Series 1" ? 30 : 35}</td>
                <td class="border border-gray-200 px-4 py-2">{s.label === "Series 1" ? 40 : 45}</td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
};

export const ExternalIntegration: Component = () => {
  return (
    <div>
      <DataGrid bus={bus} />
      <SolidUplot
        data={[
          [0, 1, 2, 3], // x values
          [10, 20, 30, 40], // y values for series 1
          [15, 25, 35, 45], // y values for series 2
        ]}
        width={600}
        height={400}
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
        plugins={[cursor(), focusSeries()]}
        pluginBus={bus}
      />
    </div>
  );
};
