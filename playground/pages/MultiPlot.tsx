import { type Component, For } from "solid-js";

import { createPluginBus, SolidUplot } from "../../src";
import {
  cursor,
  type CursorPluginMessageBus,
  focusSeries,
  type FocusSeriesPluginMessageBus,
  tooltip,
  type TooltipProps,
} from "../../src/plugins";
import type { SeriesDatum } from "../../src/utils";

const bus = createPluginBus<CursorPluginMessageBus & FocusSeriesPluginMessageBus>();

/**
 * Shared tooltip component for all synchronized charts.
 * Demonstrates how the same tooltip component can be reused across multiple charts
 * while maintaining focus series highlighting through the plugin bus system.
 */
const SyncedTooltip: Component<TooltipProps> = (props) => {
  const focusedSeries = () => props.focusedSeries?.targets || [];

  const isSeriesFocused = (series: SeriesDatum) => {
    return focusedSeries().some((target) => {
      if ("label" in target) return target.label === series.label;
      if ("index" in target) return target.index === series.seriesIdx;
      return target.zeroIndex === series.idx;
    });
  };

  return (
    <div class="rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
      <div class="mb-1 text-sm font-medium">X: {props.cursor.idx}</div>
      <For each={props.seriesData}>
        {(series) => {
          const value = () => props.u.data[series.seriesIdx]?.[props.cursor.idx];
          const isFocused = () => isSeriesFocused(series);

          return (
            <div
              class="flex items-center gap-2 transition-all duration-150"
              style={{
                opacity: focusedSeries().length > 0 ? (isFocused() ? 1 : 0.4) : 1,
                transform: isFocused() ? "scale(1.05)" : "scale(1)",
              }}
            >
              <div
                class="h-2 w-2 rounded-full transition-all duration-150"
                style={{
                  "background-color": series.stroke as string,
                  "box-shadow": isFocused() ? `0 0 4px ${series.stroke}` : "none",
                }}
              />
              <span
                class="text-sm transition-all duration-150"
                style={{
                  "font-weight": isFocused() ? "600" : "400",
                }}
              >
                {series.label}: {value()}
              </span>
            </div>
          );
        }}
      </For>
    </div>
  );
};

export const MultiPlotPage: Component = () => {
  const syncKey = "multi-plot-sync";
  const plugins = [cursor(), tooltip(SyncedTooltip), focusSeries({ pxThreshold: 10 })];

  return (
    <div class="container mx-auto max-w-6xl p-4">
      <div class="mb-4 flex items-center justify-between">
        <h1 class="text-3xl font-bold">Multiple Synchronized Plots</h1>
        <a
          href="https://github.com/dsnchz/solid-uplot/blob/main/playground/pages/MultiPlot.tsx"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
        >
          <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
              clip-rule="evenodd"
            />
          </svg>
          View Source on GitHub
        </a>
      </div>
      <p class="mb-4 text-gray-600">
        This example demonstrates multiple synchronized charts using SolidUplot's plugin system
        combined with uPlot's built-in cursor synchronization.
      </p>
      <p class="mb-8 text-gray-600">
        All charts share the same plugin bus for focus series coordination and use uPlot's cursor
        sync to maintain synchronized cursor positions across all charts. Hover over any chart to
        see the synchronized interactions.
      </p>

      <div class="grid gap-6 md:grid-cols-2">
        <div class="rounded-lg border border-gray-200 bg-white p-4">
          <h2 class="mb-4 text-xl font-semibold">Revenue & Users</h2>
          <SolidUplot
            data={[
              [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], // x values
              [10, 20, 30, 40, 35, 45, 55, 65, 60, 70], // Revenue (normalized)
              [15, 25, 35, 45, 40, 50, 60, 70, 65, 75], // Users (normalized)
            ]}
            width={500}
            height={350}
            scales={{
              x: { time: false },
              y: { range: [0, 100] },
            }}
            series={[
              {},
              { label: "Revenue", stroke: "#1f77b4", width: 2 },
              { label: "Users", stroke: "#ff7f0e", width: 2 },
            ]}
            cursor={{ sync: { key: syncKey } }}
            plugins={plugins}
            pluginBus={bus}
          />
        </div>

        <div class="rounded-lg border border-gray-200 bg-white p-4">
          <h2 class="mb-4 text-xl font-semibold">Orders & Conversions</h2>
          <SolidUplot
            data={[
              [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], // x values
              [20, 25, 30, 35, 32, 40, 45, 50, 48, 55], // Orders
              [5, 8, 12, 15, 14, 18, 22, 25, 24, 28], // Conversions
            ]}
            width={500}
            height={350}
            scales={{
              x: { time: false },
              y: { range: [0, 100] },
            }}
            series={[
              {},
              { label: "Orders", stroke: "#2ca02c", width: 2 },
              { label: "Conversions", stroke: "#d62728", width: 2 },
            ]}
            cursor={{ sync: { key: syncKey } }}
            plugins={plugins}
            pluginBus={bus}
          />
        </div>

        <div class="rounded-lg border border-gray-200 bg-white p-4">
          <h2 class="mb-4 text-xl font-semibold">Sessions & Page Views</h2>
          <SolidUplot
            data={[
              [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], // x values
              [25, 30, 40, 50, 45, 55, 65, 75, 70, 80], // Sessions (normalized)
              [20, 35, 45, 55, 50, 60, 70, 80, 75, 85], // Page Views (normalized)
            ]}
            width={500}
            height={350}
            scales={{
              x: { time: false },
              y: { range: [0, 100] },
            }}
            series={[
              {},
              { label: "Sessions", stroke: "#9467bd", width: 2 },
              { label: "Page Views", stroke: "#8c564b", width: 2 },
            ]}
            cursor={{ sync: { key: syncKey } }}
            plugins={plugins}
            pluginBus={bus}
          />
        </div>

        <div class="rounded-lg border border-gray-200 bg-white p-4">
          <h2 class="mb-4 text-xl font-semibold">Signups & Downloads</h2>
          <SolidUplot
            data={[
              [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], // x values
              [10, 15, 20, 25, 22, 30, 35, 40, 38, 45], // Signups
              [25, 30, 40, 50, 45, 60, 70, 80, 75, 90], // Downloads
            ]}
            width={500}
            height={350}
            scales={{
              x: { time: false },
              y: { range: [0, 100] },
            }}
            series={[
              {},
              { label: "Signups", stroke: "#e377c2", width: 2 },
              { label: "Downloads", stroke: "#7f7f7f", width: 2 },
            ]}
            cursor={{ sync: { key: syncKey } }}
            plugins={plugins}
            pluginBus={bus}
          />
        </div>
      </div>

      <div class="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 class="mb-4 text-lg font-semibold">Synchronization Features</h3>
        <ul class="space-y-2 text-gray-700">
          <li class="flex items-center gap-2">
            <div class="h-2 w-2 rounded-full bg-blue-500" />
            <span>
              <strong>Cursor Sync:</strong> uPlot's built-in cursor synchronization keeps all chart
              cursors aligned
            </span>
          </li>
          <li class="flex items-center gap-2">
            <div class="h-2 w-2 rounded-full bg-green-500" />
            <span>
              <strong>Focus Series:</strong> Shared plugin bus coordinates series highlighting
              across all charts
            </span>
          </li>
          <li class="flex items-center gap-2">
            <div class="h-2 w-2 rounded-full bg-purple-500" />
            <span>
              <strong>Tooltips:</strong> Each chart shows contextual data with focus-aware styling
            </span>
          </li>
          <li class="flex items-center gap-2">
            <div class="h-2 w-2 rounded-full bg-orange-500" />
            <span>
              <strong>Plugin Bus:</strong> Type-safe communication enables coordinated interactions
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};
