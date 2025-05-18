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
import type { SeriesDatum } from "../../src/utils";

const bus = createPluginBus<CursorPluginMessageBus & FocusSeriesPluginMessageBus>();

/**
 * Simple legend component that displays all series with their colors and labels in a compact horizontal layout.
 * Automatically dims when the tooltip is visible by reading cursor data from the plugin bus.
 */
const SimpleLegend: Component<LegendProps> = (props) => {
  // Check if tooltip is visible by looking at cursor data from the bus
  const isTooltipVisible = () => {
    const cursorData = bus.data.cursor?.state[props.u.root.id];
    return cursorData?.visible ?? false;
  };

  return (
    <div
      class="flex flex-wrap items-center gap-3 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-md transition-opacity duration-200"
      style={{
        opacity: isTooltipVisible() ? 0.6 : 1,
      }}
    >
      <For each={props.seriesData}>
        {(series) => (
          <div class="flex items-center gap-1.5">
            <div
              class="h-2.5 w-2.5 rounded-full"
              style={{
                "background-color": series.stroke as string,
              }}
            />
            <span class="text-xs font-medium text-gray-800">{series.label}</span>
          </div>
        )}
      </For>
    </div>
  );
};

/**
 * Custom tooltip component that demonstrates reactive integration with the plugin bus system.
 *
 * This component automatically receives the latest cursor data from the cursor plugin and
 * focus series data from the focusSeries plugin via the TooltipProps interface. The plugins
 * continuously update the bus with position, data index, and focus information, which the
 * tooltip plugin then passes to this component.
 *
 * This creates a cohesive interactive experience where the tooltip emphasizes focused series
 * automatically without needing to access the plugin bus directly.
 *
 * @param props - Standard TooltipProps containing:
 *   - u: The uPlot instance for accessing chart data
 *   - cursor: Latest cursor data from the cursor plugin (position, data index, etc.)
 *   - seriesData: Metadata about all series in the chart
 *   - focusedSeries: Optional focus series data from the focusSeries plugin
 */
const CustomTooltip: Component<TooltipProps> = (props) => {
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
                  width: isFocused() ? "8px" : "8px",
                  height: isFocused() ? "8px" : "8px",
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

export const PluginsPage: Component = () => {
  return (
    <div class="container mx-auto max-w-4xl p-8">
      <div class="mb-8 flex items-center justify-between">
        <h1 class="text-3xl font-bold">Plugin System</h1>
        <a
          href="https://github.com/dsnchz/solid-uplot/blob/main/playground/pages/Plugins.tsx"
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
        The library provides four out-of-the-box plugins: <strong>cursor</strong>,{" "}
        <strong>focusSeries</strong>, <strong>tooltip</strong>, and <strong>legend</strong>. This
        example demonstrates all four plugins working together, powered by the plugin bus system, a
        cornerstone feature of SolidUplot that integrates the power of Solid's reactivity system
        with uPlot.
      </p>
      <p class="mb-8 text-gray-600">
        The plugin bus enables type-safe communication between plugins and external components,
        allowing them to share data reactively and create seamless interactions across the entire
        chart ecosystem.
      </p>

      <div class="rounded-lg border border-gray-200 bg-white p-4">
        <SolidUplot
          autoResize
          data={[
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], // x values
            [10, 20, 30, 40, 35, 25, 45, 55, 50, 60], // Revenue
            [15, 25, 35, 45, 40, 30, 50, 60, 55, 65], // Users
            [8, 12, 18, 22, 28, 32, 38, 42, 48, 52], // Orders
            [5, 8, 12, 15, 18, 22, 25, 28, 32, 35], // Conversions
            [20, 18, 25, 30, 28, 35, 40, 38, 45, 50], // Sessions
            [12, 15, 20, 25, 22, 28, 32, 35, 40, 45], // Page Views
            [3, 5, 8, 10, 12, 15, 18, 20, 25, 28], // Signups
            [7, 10, 14, 18, 16, 20, 24, 28, 32, 36], // Downloads
          ]}
          height={400}
          scales={{
            x: {
              time: false,
            },
          }}
          series={[
            {},
            {
              label: "Revenue",
              stroke: "#1f77b4",
              width: 2,
            },
            {
              label: "Users",
              stroke: "#ff7f0e",
              width: 2,
            },
            {
              label: "Orders",
              stroke: "#2ca02c",
              width: 2,
            },
            {
              label: "Conversions",
              stroke: "#d62728",
              width: 2,
            },
            {
              label: "Sessions",
              stroke: "#9467bd",
              width: 2,
            },
            {
              label: "Page Views",
              stroke: "#8c564b",
              width: 2,
            },
            {
              label: "Signups",
              stroke: "#e377c2",
              width: 2,
            },
            {
              label: "Downloads",
              stroke: "#7f7f7f",
              width: 2,
            },
          ]}
          plugins={[
            cursor(),
            tooltip(CustomTooltip),
            focusSeries({ pxThreshold: 15 }),
            legend(SimpleLegend, { placement: "top-left" }),
          ]}
          pluginBus={bus}
        />
      </div>

      <div class="mt-8 grid gap-8 md:grid-cols-2">
        <div class="rounded-lg border border-gray-200 bg-white p-6">
          <h2 class="mb-4 text-xl font-semibold">Cursor Plugin</h2>
          <p class="text-gray-600">
            Tracks cursor position and interaction state across the chart. Provides cursor data to
            other plugins.
          </p>
        </div>

        <div class="rounded-lg border border-gray-200 bg-white p-6">
          <h2 class="mb-4 text-xl font-semibold">Tooltip Plugin</h2>
          <p class="text-gray-600">
            Renders custom tooltip component with automatic positioning and overflow handling.
          </p>
        </div>

        <div class="rounded-lg border border-gray-200 bg-white p-6">
          <h2 class="mb-4 text-xl font-semibold">Focus Series Plugin</h2>
          <p class="text-gray-600">
            Highlights series based on cursor proximity, making it easier to track specific data
            points.
          </p>
        </div>

        <div class="rounded-lg border border-gray-200 bg-white p-6">
          <h2 class="mb-4 text-xl font-semibold">Legend Plugin</h2>
          <p class="text-gray-600">Renders custom legend component over the chart canvas area.</p>
        </div>
      </div>
    </div>
  );
};
