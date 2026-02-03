import { SolidUplot } from "@dschz/solid-uplot";
import { type Component, createSignal, onCleanup } from "solid-js";
import uPlot from "uplot";

const generateData = (length: number = 50): uPlot.AlignedData => {
  const x = Array.from({ length }, (_, i) => i);
  const y1 = Array.from({ length }, () => Math.random() * 100 + 50);
  const y2 = Array.from({ length }, () => Math.random() * 80 + 30);
  const y3 = Array.from({ length }, () => Math.random() * 60 + 20);
  return [x, y1, y2, y3];
};

const StatCard: Component<{ label: string; value: string; trend: string; color: string }> = (
  props,
) => (
  <div class="rounded-lg border border-gray-200 bg-white p-4">
    <p class="text-sm text-gray-500">{props.label}</p>
    <p class="mt-1 text-2xl font-semibold text-gray-900">{props.value}</p>
    <p class={`mt-1 text-sm ${props.color}`}>{props.trend}</p>
  </div>
);

export const DashboardLayoutPage: Component = () => {
  const [data, setData] = createSignal(generateData());

  // Simulate data updates every 3 seconds
  const interval = setInterval(() => setData(generateData()), 3000);
  onCleanup(() => clearInterval(interval));

  return (
    <div class="flex h-full flex-col">
      {/* Page Header */}
      <div class="shrink-0 border-b border-gray-200 bg-white px-6 py-4">
        <h1 class="text-xl font-semibold text-gray-900">Dashboard Layout</h1>
        <p class="mt-1 text-sm text-gray-500">
          Demonstrates <code class="rounded bg-gray-100 px-1 text-xs">autoResize</code> in a
          realistic page layout. The chart fills all remaining vertical space below the stats row
          using flexbox. Try resizing the browser window or collapsing the sidebar to see it adapt.
        </p>
      </div>

      {/* Content Area — fills remaining space */}
      <div class="flex min-h-0 flex-1 flex-col gap-4 p-6">
        {/* Stats Row — fixed height */}
        <div class="grid shrink-0 grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Total Revenue" value="$45,231" trend="+20.1%" color="text-green-600" />
          <StatCard label="Active Users" value="2,350" trend="+15.3%" color="text-green-600" />
          <StatCard label="Conversion Rate" value="3.24%" trend="-2.1%" color="text-red-600" />
          <StatCard label="Avg. Session" value="4m 32s" trend="+8.7%" color="text-green-600" />
        </div>

        {/* Chart — fills remaining space */}
        <div class="min-h-0 flex-1 rounded-lg border border-gray-200 bg-white p-4">
          <SolidUplot
            autoResize
            data={data()}
            style={{ border: "1px solid #e5e7eb" }}
            series={[
              {},
              { label: "Revenue", stroke: "#3b82f6", width: 2 },
              { label: "Users", stroke: "#10b981", width: 2 },
              { label: "Sessions", stroke: "#f59e0b", width: 2 },
            ]}
            scales={{ x: { time: false } }}
          />
        </div>
      </div>

      {/* Code Snippet */}
      <div class="shrink-0 border-t border-gray-200 bg-gray-50 px-6 py-4">
        <details class="text-sm">
          <summary class="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
            View layout code
          </summary>
          <pre class="mt-2 overflow-x-auto rounded bg-gray-100 p-3 text-xs">
            {`{/* Page fills viewport via h-screen + flex on parent */}
<div class="flex h-full flex-col">
  {/* Fixed header */}
  <header class="shrink-0">...</header>

  {/* Content grows to fill remaining space */}
  <div class="flex min-h-0 flex-1 flex-col gap-4 p-6">
    {/* Stats row — fixed height */}
    <div class="grid shrink-0 grid-cols-4 gap-4">
      <StatCard />
      <StatCard />
    </div>

    {/* Chart fills remaining vertical space */}
    <div class="min-h-0 flex-1">
      <SolidUplot autoResize data={data} series={series} />
    </div>
  </div>
</div>`}
          </pre>
        </details>
      </div>
    </div>
  );
};
