import { AutoSizer } from "@dschz/solid-auto-sizer";
import { SolidUplot } from "@dschz/solid-uplot";
import { type Component, createSignal, For } from "solid-js";
import uPlot from "uplot";

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

  const childrenContent = (labelPrefix: string) => (
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
        label={`${labelPrefix} Child 1`}
        color={placementOptions.find((p) => p.value === placement())?.color || "#666"}
      />
      <PlacementChild label={`${labelPrefix} Child 2`} color="#6b7280" />
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
  );

  return (
    <div class="container mx-auto max-w-6xl p-8">
      <h1 class="mb-4 text-3xl font-bold">Children Placement</h1>
      <p class="mb-8 text-gray-600">
        Children can be positioned above or below the chart using the{" "}
        <code class="rounded bg-gray-100 px-1 text-xs">childrenPlacement</code> prop. The component
        uses flexbox internally — children are siblings to the chart canvas, and the placement prop
        controls the flex direction.
      </p>

      {/* Placement Controls */}
      <div class="mb-8 space-y-6">
        <div>
          <h3 class="mb-4 text-lg font-semibold">Placement Controls</h3>
          <div class="flex flex-wrap gap-3">
            <For each={placementOptions}>
              {(option) => (
                <button
                  type="button"
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
          <h4 class="mb-2 font-medium text-blue-900">Current Configuration:</h4>
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
          Chart with explicit dimensions. Children are positioned via flexbox, but the chart size is
          fixed regardless of the children's height.
        </p>
        <SolidUplot
          data={chartData()}
          width={600}
          height={350}
          childrenPlacement={placement()}
          series={[
            {},
            { label: "Series A", stroke: "#3b82f6", width: 2 },
            { label: "Series B", stroke: "#10b981", width: 2 },
          ]}
          scales={{ x: { time: false } }}
        >
          {childrenContent("Fixed")}
        </SolidUplot>

        <pre class="mt-4 overflow-x-auto rounded bg-gray-50 p-3 text-sm">
          {`<SolidUplot
  width={600}
  height={350}
  childrenPlacement="${placement()}"
  data={data}
  series={series}
>
  <div>Children appear ${placement() === "top" ? "above" : "below"} the chart</div>
</SolidUplot>`}
        </pre>
      </div>

      {/* Auto Resize Example */}
      <div class="mb-8 rounded-lg border border-gray-200 bg-white p-6">
        <h3 class="mb-4 text-lg font-semibold">
          Auto Resize with Children (Recommended for Responsive)
        </h3>
        <p class="mb-4 text-gray-600">
          The simplest responsive approach. Children take their natural height, and the chart
          automatically fills the remaining space via flexbox. No manual height calculations needed
          — just ensure the container has defined dimensions.
        </p>
        <div class="border-2 border-dashed border-blue-300 p-4" style={{ height: "450px" }}>
          <SolidUplot
            autoResize
            data={chartData()}
            childrenPlacement={placement()}
            series={[
              {},
              { label: "Series A", stroke: "#8b5cf6", width: 2 },
              { label: "Series B", stroke: "#f59e0b", width: 2 },
            ]}
            scales={{ x: { time: false } }}
          >
            {childrenContent("Auto")}
          </SolidUplot>
        </div>

        <pre class="mt-4 overflow-x-auto rounded bg-gray-50 p-3 text-sm">
          {`<div style={{ height: '450px' }}>
  <SolidUplot
    autoResize
    childrenPlacement="${placement()}"
    data={data}
    series={series}
  >
    <div>Children take natural height, chart fills the rest</div>
  </SolidUplot>
</div>`}
        </pre>
      </div>

      {/* AutoSizer Example */}
      <div class="mb-8 rounded-lg border border-gray-200 bg-white p-6">
        <h3 class="mb-4 text-lg font-semibold">AutoSizer with Children (Explicit Control)</h3>
        <p class="mb-4 text-gray-600">
          When you need explicit control over dimensions — for example, to share size data across
          multiple children or to manually reserve space — use AutoSizer. You calculate the chart
          height by subtracting the children's estimated height from the container height.
        </p>
        <div class="border-2 border-dashed border-green-300 p-4" style={{ height: "450px" }}>
          <AutoSizer>
            {({ width, height }) => {
              // Reserve space for children (estimated 80px)
              const childrenHeight = 80;
              const chartHeight = height - childrenHeight;

              return (
                <SolidUplot
                  data={chartData()}
                  width={width}
                  height={chartHeight}
                  childrenPlacement={placement()}
                  series={[
                    {},
                    { label: "Series A", stroke: "#ef4444", width: 2 },
                    { label: "Series B", stroke: "#06b6d4", width: 2 },
                  ]}
                  scales={{ x: { time: false } }}
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
                      label="Sized Child 1"
                      color={placementOptions.find((p) => p.value === placement())?.color || "#666"}
                    />
                    <PlacementChild label="Sized Child 2" color="#6b7280" />
                    <div
                      style={{
                        padding: "8px 12px",
                        background: "#f3f4f6",
                        "border-radius": "4px",
                        "font-size": "12px",
                        color: "#374151",
                      }}
                    >
                      Chart: {width}x{chartHeight}
                    </div>
                  </div>
                </SolidUplot>
              );
            }}
          </AutoSizer>
        </div>

        <pre class="mt-4 overflow-x-auto rounded bg-gray-50 p-3 text-sm">
          {`<div style={{ height: '450px' }}>
  <AutoSizer>
    {({ width, height }) => {
      const childrenHeight = 80;
      const chartHeight = height - childrenHeight;
      return (
        <SolidUplot
          width={width}
          height={chartHeight}
          childrenPlacement="${placement()}"
          data={data}
          series={series}
        >
          <div>Children with explicit size budget</div>
        </SolidUplot>
      );
    }}
  </AutoSizer>
</div>`}
        </pre>
      </div>

      {/* Sizing Strategy Guide */}
      <div class="mt-8 space-y-4 text-sm text-gray-600">
        <h3 class="text-base font-semibold text-gray-900">Sizing Strategy Guide</h3>

        <div class="grid gap-4 md:grid-cols-3">
          <div class="rounded-lg border border-gray-200 p-4">
            <h4 class="mb-2 font-medium text-gray-900">Fixed Size</h4>
            <ul class="list-disc space-y-1 pl-5">
              <li>
                Explicit <code class="rounded bg-gray-100 px-1 text-xs">width</code> and{" "}
                <code class="rounded bg-gray-100 px-1 text-xs">height</code> props
              </li>
              <li>Predictable, stable layout</li>
              <li>Chart size independent of children</li>
              <li>Best when dimensions are known upfront</li>
            </ul>
          </div>

          <div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h4 class="mb-2 font-medium text-blue-900">
              autoResize <span class="text-xs font-normal text-blue-600">(Recommended)</span>
            </h4>
            <ul class="list-disc space-y-1 pl-5 text-blue-800">
              <li>Simplest responsive approach</li>
              <li>Children handled automatically via flex</li>
              <li>Container must have defined dimensions</li>
              <li>No manual height calculations</li>
            </ul>
          </div>

          <div class="rounded-lg border border-gray-200 p-4">
            <h4 class="mb-2 font-medium text-gray-900">AutoSizer</h4>
            <ul class="list-disc space-y-1 pl-5">
              <li>Full control over dimensions</li>
              <li>Manual height budgeting for children</li>
              <li>Useful when sharing size data</li>
              <li>More complex but more flexible</li>
            </ul>
          </div>
        </div>

        <div class="rounded-lg border border-gray-200 p-4">
          <h4 class="mb-2 font-medium text-gray-900">How Children Placement Works</h4>
          <ul class="list-disc space-y-1 pl-5">
            <li>Children are siblings to the uPlot chart canvas inside a flex container</li>
            <li>
              <code class="rounded bg-gray-100 px-1 text-xs">childrenPlacement="top"</code> uses{" "}
              <code class="rounded bg-gray-100 px-1 text-xs">flex-direction: column</code> —
              children render above the chart
            </li>
            <li>
              <code class="rounded bg-gray-100 px-1 text-xs">childrenPlacement="bottom"</code> uses{" "}
              <code class="rounded bg-gray-100 px-1 text-xs">flex-direction: column-reverse</code> —
              children render below the chart
            </li>
            <li>
              With <code class="rounded bg-gray-100 px-1 text-xs">autoResize</code>, the chart div
              has <code class="rounded bg-gray-100 px-1 text-xs">flex: 1 1 0</code> — it fills
              whatever space remains after the children
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
