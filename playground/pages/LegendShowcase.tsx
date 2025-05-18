import { type Component, For } from "solid-js";

import { createPluginBus, SolidUplot } from "../../src";
import {
  cursor,
  type CursorPluginMessageBus,
  focusSeries,
  type FocusSeriesPluginMessageBus,
  legend,
  type LegendProps,
  tooltip,
  type TooltipProps,
} from "../../src/plugins";

const bus = createPluginBus<CursorPluginMessageBus & FocusSeriesPluginMessageBus>();

/**
 * Compact legend that shows series in a horizontal layout
 */
const CompactLegend: Component<LegendProps> = (props) => {
  return (
    <div class="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur-sm">
      <For each={props.seriesData}>
        {(series) => (
          <div class="flex items-center gap-1.5">
            <div
              class="h-2 w-2 rounded-full"
              style={{
                "background-color": series.stroke as string,
              }}
            />
            <span class="text-xs font-medium text-gray-700">{series.label}</span>
          </div>
        )}
      </For>
    </div>
  );
};

/**
 * Detailed legend with larger indicators and more spacing
 */
const DetailedLegend: Component<LegendProps> = (props) => {
  return (
    <div class="space-y-2 rounded-lg border border-gray-200 bg-white p-4 shadow-md">
      <div class="text-sm font-semibold text-gray-800">Series</div>
      <For each={props.seriesData}>
        {(series) => (
          <div class="flex items-center gap-3">
            <div
              class="h-3 w-3 rounded-full border border-gray-300"
              style={{
                "background-color": series.stroke as string,
              }}
            />
            <span class="text-sm font-medium text-gray-700">{series.label}</span>
          </div>
        )}
      </For>
    </div>
  );
};

/**
 * Minimal legend that stays out of the way during chart interactions
 */
const MinimalLegend: Component<LegendProps> = (props) => {
  // Check if tooltip is visible to provide subtle visual feedback
  const isTooltipVisible = () => {
    const cursorData = props.bus.data.cursor?.state[props.u.root.id];
    return Boolean(cursorData);
  };

  return (
    <div
      class="rounded-md border border-gray-200 bg-white/90 px-2 py-1 shadow-sm backdrop-blur-sm transition-opacity duration-200"
      style={{
        opacity: isTooltipVisible() ? 0.6 : 1,
      }}
    >
      <div class="flex flex-wrap items-center gap-2">
        <For each={props.seriesData}>
          {(series) => (
            <div class="flex items-center gap-1">
              <div
                class="h-2 w-2 rounded-full"
                style={{
                  "background-color": series.stroke as string,
                }}
              />
              <span class="text-xs text-gray-700">{series.label}</span>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};

/**
 * Simple tooltip for the examples
 */
const SimpleTooltip: Component<TooltipProps> = (props) => {
  return (
    <div class="rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
      <div class="mb-1 text-sm font-medium">Index: {props.cursor.idx}</div>
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

// Sample data for all charts
const sampleData = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], // x values
  [10, 20, 30, 40, 35, 25, 45, 55, 50, 60], // Revenue
  [15, 25, 35, 45, 40, 30, 50, 60, 55, 65], // Users
  [8, 12, 18, 22, 28, 32, 38, 42, 48, 52], // Orders
  [5, 8, 12, 15, 18, 22, 25, 28, 32, 35], // Conversions
] as uPlot.AlignedData;

const sampleSeries = [
  {},
  { label: "Revenue", stroke: "#1f77b4", width: 2 },
  { label: "Users", stroke: "#ff7f0e", width: 2 },
  { label: "Orders", stroke: "#2ca02c", width: 2 },
  { label: "Conversions", stroke: "#d62728", width: 2 },
];

export const LegendShowcasePage: Component = () => {
  return (
    <div class="container mx-auto max-w-6xl p-8">
      <div class="mb-8 flex items-center justify-between">
        <h1 class="text-3xl font-bold">Legend Plugin Showcase</h1>
        <a
          href="https://github.com/dsnchz/solid-uplot/blob/main/playground/pages/LegendShowcase.tsx"
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

      <p class="mb-8 text-gray-600">
        The legend plugin provides a flexible system for rendering custom legend components with
        various placement options. This page demonstrates different legend styles that work
        harmoniously with chart interactions without interfering with data exploration.
      </p>

      <div class="space-y-12">
        {/* Compact Legend Example */}
        <section>
          <h2 class="mb-4 text-2xl font-semibold">Compact Horizontal Legend</h2>
          <p class="mb-4 text-gray-600">
            A space-efficient legend that displays series horizontally with minimal visual
            footprint. Perfect for dashboards where space is at a premium.
          </p>
          <div class="rounded-lg border border-gray-200 bg-white p-4">
            <SolidUplot
              autoResize
              data={sampleData}
              height={300}
              scales={{ x: { time: false } }}
              series={sampleSeries}
              plugins={[
                cursor(),
                tooltip(SimpleTooltip),
                focusSeries({ pxThreshold: 15 }),
                legend(CompactLegend, { placement: "top-left" }),
              ]}
              pluginBus={bus}
            />
          </div>
        </section>

        {/* Detailed Legend Example */}
        <section>
          <h2 class="mb-4 text-2xl font-semibold">Detailed Vertical Legend</h2>
          <p class="mb-4 text-gray-600">
            A more spacious legend with larger indicators and clear labeling. Ideal when you have
            sufficient space and want maximum readability.
          </p>
          <div class="rounded-lg border border-gray-200 bg-white p-4">
            <SolidUplot
              autoResize
              data={sampleData}
              height={300}
              scales={{ x: { time: false } }}
              series={sampleSeries}
              plugins={[
                cursor(),
                tooltip(SimpleTooltip),
                focusSeries({ pxThreshold: 15 }),
                legend(DetailedLegend, { placement: "top-right" }),
              ]}
              pluginBus={bus}
            />
          </div>
        </section>

        {/* Minimal Legend Example */}
        <section>
          <h2 class="mb-4 text-2xl font-semibold">Minimal Interactive Legend</h2>
          <p class="mb-4 text-gray-600">
            A clean, minimal legend that stays out of the way during chart interactions. Provides
            subtle visual feedback when tooltips are active without interfering with data
            exploration.
          </p>
          <div class="rounded-lg border border-gray-200 bg-white p-4">
            <SolidUplot
              autoResize
              data={sampleData}
              height={300}
              scales={{ x: { time: false } }}
              series={sampleSeries}
              plugins={[
                cursor(),
                tooltip(SimpleTooltip),
                focusSeries({ pxThreshold: 15 }),
                legend(MinimalLegend, {
                  placement: "top-left",
                }),
              ]}
              pluginBus={bus}
            />
          </div>
        </section>
      </div>

      <div class="mt-12 rounded-lg border border-blue-200 bg-blue-50 p-6">
        <h3 class="mb-2 text-lg font-semibold text-blue-900">Legend Plugin Features</h3>
        <ul class="space-y-2 text-blue-800">
          <li class="flex items-start gap-2">
            <span class="mt-1 text-blue-600">•</span>
            <span>
              <strong>Custom Components:</strong> Render any SolidJS component as a legend
            </span>
          </li>
          <li class="flex items-start gap-2">
            <span class="mt-1 text-blue-600">•</span>
            <span>
              <strong>Flexible Placement:</strong> Position legends at top-left or top-right
            </span>
          </li>
          <li class="flex items-start gap-2">
            <span class="mt-1 text-blue-600">•</span>
            <span>
              <strong>Smart Interactions:</strong> Legends can react to chart state and provide
              visual feedback without interfering with data exploration
            </span>
          </li>
          <li class="flex items-start gap-2">
            <span class="mt-1 text-blue-600">•</span>
            <span>
              <strong>Plugin Bus Access:</strong> Legend components can read from and react to other
              plugins
            </span>
          </li>
          <li class="flex items-start gap-2">
            <span class="mt-1 text-blue-600">•</span>
            <span>
              <strong>Automatic Sizing:</strong> Legends are constrained within the chart canvas
              area
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};
