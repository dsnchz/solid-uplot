import { AutoSizer } from "@dschz/solid-auto-sizer";
import { type Component, createSignal, For } from "solid-js";
import uPlot from "uplot";

import { SolidUplot } from "../../src/SolidUplot";

// Sample child component for testing placement
const PlacementChild: Component<{ label: string; color: string }> = (props) => {
  return (
    <div
      style={{
        background: props.color,
        color: "white",
        padding: "12px 16px",
        "border-radius": "6px",
        "font-size": "14px",
        "font-weight": "500",
        "text-align": "center",
        "min-width": "120px",
      }}
    >
      {props.label}
    </div>
  );
};

type ChildrenPlacement = "top" | "bottom";

export const ChildrenPlacementPlayground: Component = () => {
  const [placement, setPlacement] = createSignal<ChildrenPlacement>("top");
  const [chartData] = createSignal<uPlot.AlignedData>([
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [10, 25, 15, 30, 20, 35, 25, 40, 30, 45],
    [15, 20, 25, 20, 30, 25, 35, 30, 40, 35],
  ]);

  const placementOptions: { value: ChildrenPlacement; label: string; color: string }[] = [
    { value: "top", label: "Top Placement", color: "#3b82f6" },
    { value: "bottom", label: "Bottom Placement", color: "#10b981" },
  ];

  return (
    <div class="container mx-auto max-w-6xl p-8">
      <div class="mb-8 flex items-center justify-between">
        <h1 class="text-3xl font-bold">Children Placement Test</h1>
        <a
          href="https://github.com/dsnchz/solid-uplot/blob/main/playground/pages/ChildrenPlacement.tsx"
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
        This page demonstrates the children placement system in SolidUplot. Children can be
        positioned above or below the chart using flex layout.
      </p>

      <div class="mb-8 space-y-6">
        <div>
          <h3 class="mb-4 text-lg font-semibold">Placement Controls</h3>
          <div class="flex flex-wrap gap-3">
            <For each={placementOptions}>
              {(option) => (
                <button
                  onClick={() => setPlacement(option.value)}
                  class={`rounded px-4 py-2 text-white font-medium transition-all ${
                    placement() === option.value
                      ? "ring-2 ring-offset-2 ring-gray-400"
                      : "hover:opacity-80"
                  }`}
                  style={{ "background-color": option.color }}
                >
                  {option.label}
                </button>
              )}
            </For>
          </div>
        </div>

        <div class="rounded-lg bg-blue-50 p-4">
          <h4 class="font-medium text-blue-900 mb-2">Current Configuration:</h4>
          <div class="text-sm text-blue-800">
            <div>
              Children Placement: <span class="font-mono">{placement()}</span>
            </div>
            <div>
              Layout Direction:{" "}
              <span class="font-mono">{placement() === "top" ? "column" : "column-reverse"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Size Example */}
      <div class="mb-8 rounded-lg border border-gray-200 bg-white p-6">
        <h3 class="mb-4 text-lg font-semibold">Fixed Size with Children</h3>
        <p class="mb-4 text-gray-600">
          Chart with explicit dimensions. This is the safest approach when using children placement.
        </p>
        <SolidUplot
          data={chartData()}
          width={600}
          height={350}
          title="Fixed Size + Children"
          childrenPlacement={placement()}
          series={[
            {},
            { label: "Series A", stroke: "#3b82f6", width: 2 },
            { label: "Series B", stroke: "#10b981", width: 2 },
          ]}
          scales={{
            x: { time: false },
          }}
          axes={[{ label: "X Axis" }, { label: "Y Axis" }]}
        >
          {/* Sibling children that use flex layout */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              "align-items": "center",
              "justify-content": "center",
              padding: "16px",
              "flex-wrap": "wrap",
            }}
          >
            <PlacementChild
              label="Child Component 1"
              color={placementOptions.find((p) => p.value === placement())?.color || "#666"}
            />
            <PlacementChild label="Child Component 2" color="#6b7280" />
            <div
              style={{
                padding: "8px 12px",
                background: "#f3f4f6",
                "border-radius": "4px",
                "font-size": "12px",
                color: "#374151",
              }}
            >
              Placement: {placement()}
            </div>
          </div>
        </SolidUplot>
      </div>

      {/* AutoSizer Example */}
      <div class="mb-8 rounded-lg border border-gray-200 bg-white p-6">
        <h3 class="mb-4 text-lg font-semibold">
          AutoSizer with Children (Recommended for Responsive)
        </h3>
        <p class="mb-4 text-gray-600">
          When you need responsive sizing with children, use AutoSizer to calculate dimensions
          properly. The container has a fixed height to prevent infinite growth.
        </p>
        <div style={{ height: "450px", border: "2px dashed #e5e7eb", padding: "16px" }}>
          <AutoSizer>
            {({ width, height }) => {
              // Reserve space for children (estimated 80px for children)
              const childrenHeight = 80;
              const chartHeight = height - childrenHeight;

              return (
                <SolidUplot
                  data={chartData()}
                  width={width}
                  height={chartHeight}
                  title="AutoSizer + Children"
                  childrenPlacement={placement()}
                  series={[
                    {},
                    { label: "Series A", stroke: "#ef4444", width: 2 },
                    { label: "Series B", stroke: "#f59e0b", width: 2 },
                  ]}
                  scales={{
                    x: { time: false },
                  }}
                  axes={[{ label: "X Axis" }, { label: "Y Axis" }]}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      "align-items": "center",
                      "justify-content": "center",
                      padding: "16px",
                      "flex-wrap": "wrap",
                    }}
                  >
                    <PlacementChild
                      label="Responsive Child 1"
                      color={placementOptions.find((p) => p.value === placement())?.color || "#666"}
                    />
                    <PlacementChild label="Responsive Child 2" color="#6b7280" />
                    <div
                      style={{
                        padding: "8px 12px",
                        background: "#f3f4f6",
                        "border-radius": "4px",
                        "font-size": "12px",
                        color: "#374151",
                      }}
                    >
                      Size: {width}x{chartHeight}
                    </div>
                  </div>
                </SolidUplot>
              );
            }}
          </AutoSizer>
        </div>
      </div>

      {/* Warning Example */}
      <div class="mb-8 rounded-lg border border-red-200 bg-red-50 p-6">
        <h3 class="mb-4 text-lg font-semibold text-red-800">
          ⚠️ What NOT to Do: autoResize with Children
        </h3>
        <p class="mb-4 text-red-700">
          <strong>
            Never use <code class="bg-red-100 px-1 rounded text-xs">autoResize</code> with children
            placement in unconstrained containers.
          </strong>
          This creates an infinite growth loop where the chart and container keep growing
          indefinitely.
        </p>
        <div class="bg-red-100 p-4 rounded">
          <h4 class="font-medium text-red-800 mb-2">Why this happens:</h4>
          <ol class="list-decimal pl-5 space-y-1 text-red-700 text-sm">
            <li>
              Chart with <code>autoResize</code> tries to fill its container
            </li>
            <li>Container grows to accommodate chart + children</li>
            <li>Chart detects larger container and grows again</li>
            <li>Infinite loop continues...</li>
          </ol>
        </div>
        <pre class="mt-4 bg-red-100 p-3 rounded text-sm text-red-800 overflow-x-auto">
          {`// ❌ DON'T DO THIS - Causes infinite growth
<div> {/* No height constraint */}
  <SolidUplot autoResize childrenPlacement="top">
    <div>Children add to container height</div>
  </SolidUplot>
</div>`}
        </pre>
      </div>

      <div class="mt-8 space-y-4 text-sm text-gray-600">
        <h3 class="font-semibold text-base text-gray-900">Sizing Strategy Guide:</h3>

        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-lg border border-gray-200 p-4">
            <h4 class="font-medium text-gray-900 mb-2">✅ Fixed Size (Recommended)</h4>
            <ul class="list-disc pl-5 space-y-1">
              <li>
                Explicit <code class="bg-gray-100 px-1 rounded text-xs">width</code> and{" "}
                <code class="bg-gray-100 px-1 rounded text-xs">height</code> props
              </li>
              <li>Predictable, stable layout</li>
              <li>No risk of infinite growth</li>
              <li>Best for most use cases with children</li>
            </ul>
          </div>

          <div class="rounded-lg border border-gray-200 p-4">
            <h4 class="font-medium text-gray-900 mb-2">✅ AutoSizer (Advanced Responsive)</h4>
            <ul class="list-disc pl-5 space-y-1">
              <li>Container with fixed height constraint</li>
              <li>Calculate chart dimensions manually</li>
              <li>Reserve space for children</li>
              <li>Full responsive control</li>
            </ul>
          </div>
        </div>

        <div class="rounded-lg border border-red-200 bg-red-50 p-4">
          <h4 class="font-medium text-red-800 mb-2">❌ Never Use: autoResize with Children</h4>
          <ul class="list-disc pl-5 space-y-1 text-red-700">
            <li>Creates infinite growth loops</li>
            <li>Unpredictable layout behavior</li>
            <li>Performance issues</li>
            <li>Use AutoSizer pattern instead</li>
          </ul>
        </div>

        <div class="rounded-lg border border-gray-200 p-4">
          <h4 class="font-medium text-gray-900 mb-2">How Children Placement Works:</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li>Children are siblings to the uPlot chart</li>
            <li>Uses CSS flexbox for layout positioning</li>
            <li>
              Supports top and bottom placement via{" "}
              <code class="bg-gray-100 px-1 rounded text-xs">childrenPlacement</code> prop
            </li>
            <li>Container automatically adjusts to accommodate children</li>
            <li>Perfect for controls, legends, or supplementary content</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
