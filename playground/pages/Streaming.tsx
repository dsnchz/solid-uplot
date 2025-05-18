import { createEffect, createSignal, onCleanup } from "solid-js";
import uPlot from "uplot";

import { createPluginBus, SolidUplot } from "../../src";
import {
  cursor,
  type CursorPluginMessageBus,
  focusSeries,
  type FocusSeriesPluginMessageBus,
  tooltip,
} from "../../src/plugins";
import { Tooltip } from "../components/Tooltip";

// Initial data setup
const MAX_POINTS = 100;
const INITIAL_DATA1: uPlot.AlignedData = [
  Array.from({ length: MAX_POINTS }, (_, i) => i), // x-values (time)
  Array(MAX_POINTS).fill(0), // series 1
  Array(MAX_POINTS).fill(0), // series 2
  Array(MAX_POINTS).fill(0), // series 3
];

// Chart options
const chartOptions1: uPlot.Options = {
  width: 800,
  height: 400,
  series: [
    {}, // x-axis
    { label: "Sine Wave", stroke: "#1f77b4" },
    { label: "Random Walk", stroke: "#ff7f0e" },
    { label: "Sawtooth", stroke: "#2ca02c" },
  ],
  axes: [
    {
      label: "Time",
    },
    {
      label: "Value",
    },
  ],
  scales: {
    x: {
      time: false,
    },
  },
  legend: {
    show: true,
    live: false,
    isolate: true,
  },
  cursor: {
    sync: {
      key: "streaming-sync",
    },
  },
};

export const Streaming = () => {
  const [data1, setData1] = createSignal(INITIAL_DATA1);
  const [currentOptions1] = createSignal(chartOptions1);

  // Shared plugin bus for all charts
  const pluginBus = createPluginBus<CursorPluginMessageBus & FocusSeriesPluginMessageBus>({
    cursor: {
      sourceId: undefined,
      state: {
        "streaming-chart-1": undefined,
        "streaming-chart-2": undefined,
      },
    },
  });

  const plugins = [cursor(), focusSeries()];

  // Streaming data generation for first chart
  createEffect(() => {
    let frameId: number;
    let sawtoothValue = 0;

    const updateData = (_timestamp: number) => {
      setData1((prev) => {
        const [xData, yData1, yData2, yData3] = prev.map((arr) => [...arr]) as [
          number[],
          number[],
          number[],
          number[],
        ];

        // Shift all data left
        xData.shift();
        yData1.shift();
        yData2.shift();
        yData3.shift();

        // Add new points
        const lastX = xData[xData.length - 1] ?? 0;
        xData.push(lastX + 1);

        // Sine wave
        yData1.push(Math.sin(lastX * 0.1) * 50 + 50);

        // Random walk
        const lastY2 = yData2[yData2.length - 1] ?? 0;
        yData2.push(lastY2 + (Math.random() - 0.5) * 10);

        // Sawtooth
        sawtoothValue = (sawtoothValue + 5) % 100;
        yData3.push(sawtoothValue);

        const newData: [number[], number[], number[], number[]] = [xData, yData1, yData2, yData3];
        return newData;
      });

      frameId = requestAnimationFrame(updateData);
    };

    frameId = requestAnimationFrame(updateData);

    onCleanup(() => {
      cancelAnimationFrame(frameId);
    });
  });

  return (
    <div class="container mx-auto max-w-4xl p-8">
      <div class="mb-8 flex items-center justify-between">
        <h1 class="text-3xl font-bold">Streaming Charts</h1>
        <a
          href="https://github.com/dsnchz/solid-uplot/blob/main/playground/pages/Streaming.tsx"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
        >
          <svg class="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
              clip-rule="evenodd"
            />
          </svg>
          View Source on GitHub
        </a>
      </div>
      <p class="mb-8 text-gray-600">
        This example demonstrates tooltip content updating with real-time streaming data.
      </p>

      <div class="grid gap-8">
        <div>
          <SolidUplot
            id="streaming-chart-1"
            title="Real-time Streaming Data"
            width={currentOptions1().width}
            height={currentOptions1().height}
            series={currentOptions1().series}
            axes={currentOptions1().axes}
            scales={currentOptions1().scales}
            data={data1()}
            pluginBus={pluginBus}
            plugins={[...plugins, tooltip(Tooltip)]}
          />
        </div>
      </div>
    </div>
  );
};
