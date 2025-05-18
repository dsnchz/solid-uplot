import { AutoSizer } from "@dschz/solid-auto-sizer";
import { type Component, createSignal } from "solid-js";
import uPlot from "uplot";

import { SolidUplot } from "../../src/SolidUplot";

const generateData = (): uPlot.AlignedData => {
  const length = 20;
  const x = Array.from({ length }, (_, i) => i);
  const y1 = Array.from({ length }, () => Math.random() * 100 + 50);
  const y2 = Array.from({ length }, () => Math.random() * 80 + 30);

  return [x, y1, y2];
};

const CHART_STYLE = {
  border: "1px solid red",
} as const;

export const DynamicResize: Component = () => {
  const [data] = createSignal(generateData());

  // Fixed Size controls
  const [fixedWidth, setFixedWidth] = createSignal(400);
  const [fixedHeight, setFixedHeight] = createSignal(250);

  // AutoSizer controls
  const [autoSizerWidth, setAutoSizerWidth] = createSignal(600);
  const [autoSizerHeight, setAutoSizerHeight] = createSignal(400);

  return (
    <div class="container mx-auto max-w-6xl p-8">
      <div class="mb-8 flex items-center justify-between">
        <h1 class="text-3xl font-bold">Chart Sizing Patterns</h1>
        <a
          href="https://github.com/dsnchz/solid-uplot/blob/main/playground/pages/DynamicResize.tsx"
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
        There are two fundamental approaches to chart sizing: <strong>self-sizing</strong> where the
        chart controls its own dimensions, and <strong>container-driven</strong> where external
        components provide the dimensions. Each has different use cases and trade-offs.
      </p>

      {/* Pattern 1: Self-Sizing Charts */}
      <div class="mb-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 class="mb-4 text-xl font-semibold">Pattern 1: Self-Sizing Charts</h2>
        <p class="mb-4 text-gray-600">
          Charts control their own dimensions through props or internal ResizeObserver.
        </p>

        <div class="space-y-6">
          {/* Fixed Size */}
          <div>
            <h3 class="mb-2 text-lg font-medium">Fixed Size</h3>
            <p class="mb-3 text-sm text-gray-600">
              Chart has explicit width/height props. Adjust the controls below to change the chart
              size directly.
            </p>

            {/* Fixed Size Controls */}
            <div class="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Chart Width: {fixedWidth()}px
                </label>
                <input
                  type="range"
                  min="200"
                  max="600"
                  step="50"
                  value={fixedWidth()}
                  onInput={(e) => setFixedWidth(Number(e.currentTarget.value))}
                  class="w-full"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Chart Height: {fixedHeight()}px
                </label>
                <input
                  type="range"
                  min="150"
                  max="400"
                  step="50"
                  value={fixedHeight()}
                  onInput={(e) => setFixedHeight(Number(e.currentTarget.value))}
                  class="w-full"
                />
              </div>
            </div>

            <div class="border-2 border-dashed border-gray-300 p-4 overflow-auto">
              <SolidUplot
                data={data()}
                width={fixedWidth()}
                height={fixedHeight()}
                style={CHART_STYLE}
                series={[
                  {},
                  { label: "Fixed Chart", stroke: "#3b82f6", width: 2 },
                  { label: "Series B", stroke: "#10b981", width: 2 },
                ]}
                scales={{ x: { time: false } }}
              />
            </div>
          </div>

          {/* Auto Resize */}
          <div>
            <h3 class="mb-2 text-lg font-medium">Auto Resize (ResizeObserver)</h3>
            <p class="mb-3 text-sm text-gray-600">
              Chart uses ResizeObserver to automatically fill its container. This feature is enabled
              via the <code class="bg-gray-100 px-1 rounded text-xs">autoResize</code> prop. Try
              resizing your browser window to see it adapt. No manual controls needed - the chart
              responds automatically to container size changes.
            </p>
            <div class="border-2 border-dashed border-blue-300 p-4">
              <SolidUplot
                data={data()}
                autoResize
                series={[
                  {},
                  { label: "Auto Resize", stroke: "#8b5cf6", width: 2 },
                  { label: "Series B", stroke: "#f59e0b", width: 2 },
                ]}
                scales={{ x: { time: false } }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pattern 2: Container-Driven Sizing */}
      <div class="mb-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 class="mb-4 text-xl font-semibold">Pattern 2: Container-Driven Sizing</h2>
        <p class="mb-4 text-gray-600">
          External components measure container size and provide dimensions to charts via render
          props.
        </p>

        <div class="space-y-6">
          {/* AutoSizer Pattern */}
          <div>
            <h3 class="mb-2 text-lg font-medium">AutoSizer Pattern</h3>
            <p class="mb-3 text-sm text-gray-600">
              AutoSizer measures the container and provides width/height to the chart via render
              prop. Adjust the container size below.
            </p>

            {/* AutoSizer Controls */}
            <div class="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Container Width: {autoSizerWidth()}px
                </label>
                <input
                  type="range"
                  min="300"
                  max="800"
                  step="50"
                  value={autoSizerWidth()}
                  onInput={(e) => setAutoSizerWidth(Number(e.currentTarget.value))}
                  class="w-full"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Container Height: {autoSizerHeight()}px
                </label>
                <input
                  type="range"
                  min="200"
                  max="500"
                  step="50"
                  value={autoSizerHeight()}
                  onInput={(e) => setAutoSizerHeight(Number(e.currentTarget.value))}
                  class="w-full"
                />
              </div>
            </div>

            <div
              class="border-2 border-dashed border-green-300 p-4"
              style={{
                width: `${autoSizerWidth()}px`,
                height: `${autoSizerHeight()}px`,
              }}
            >
              <AutoSizer>
                {({ width, height }) => (
                  <SolidUplot
                    data={data()}
                    width={width}
                    height={height}
                    style={CHART_STYLE}
                    series={[
                      {},
                      { label: "AutoSizer", stroke: "#ef4444", width: 2 },
                      { label: "Series B", stroke: "#06b6d4", width: 2 },
                    ]}
                    scales={{ x: { time: false } }}
                  />
                )}
              </AutoSizer>
            </div>
          </div>

          {/* Manual Resize with CSS resize */}
          <div>
            <h3 class="mb-2 text-lg font-medium">Manual Resize (CSS resize)</h3>
            <p class="mb-3 text-sm text-gray-600">
              Try dragging the bottom-right corner to manually resize the container. The chart
              adapts automatically.
            </p>
            <div
              class="border-2 border-dashed border-indigo-300 p-4 overflow-auto"
              style={{
                width: "400px",
                height: "300px",
                resize: "both",
                "min-width": "200px",
                "min-height": "150px",
                "max-width": "800px",
                "max-height": "600px",
              }}
            >
              <AutoSizer>
                {({ width, height }) => {
                  console.log("width", width, "height", height);

                  return (
                    <SolidUplot
                      data={data()}
                      width={width}
                      height={height}
                      //  style={CHART_STYLE}
                      series={[
                        {},
                        { label: "Resizable", stroke: "#6366f1", width: 2 },
                        { label: "Series B", stroke: "#ec4899", width: 2 },
                      ]}
                      scales={{ x: { time: false } }}
                    />
                  );
                }}
              </AutoSizer>
            </div>
            <p class="mt-2 text-xs text-gray-500">
              💡 Look for the resize handle in the bottom-right corner
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div class="rounded-lg border border-gray-200 bg-white p-6">
        <h2 class="mb-4 text-xl font-semibold">Pattern Comparison</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="text-left py-2 px-3">Aspect</th>
                <th class="text-left py-2 px-3">Self-Sizing (autoResize)</th>
                <th class="text-left py-2 px-3">Container-Driven (AutoSizer)</th>
              </tr>
            </thead>
            <tbody class="text-gray-600">
              <tr class="border-b border-gray-100">
                <td class="py-2 px-3 font-medium">API Complexity</td>
                <td class="py-2 px-3">
                  Simple: <code class="bg-gray-100 px-1 rounded">autoResize={true}</code>
                </td>
                <td class="py-2 px-3">More complex: Render prop pattern</td>
              </tr>
              <tr class="border-b border-gray-100">
                <td class="py-2 px-3 font-medium">Performance</td>
                <td class="py-2 px-3">One ResizeObserver per chart</td>
                <td class="py-2 px-3">One ResizeObserver per AutoSizer</td>
              </tr>
              <tr class="border-b border-gray-100">
                <td class="py-2 px-3 font-medium">Flexibility</td>
                <td class="py-2 px-3">Limited to chart sizing</td>
                <td class="py-2 px-3">Size data can be shared/reused</td>
              </tr>
              <tr class="border-b border-gray-100">
                <td class="py-2 px-3 font-medium">Grid Layout Compatibility</td>
                <td class="py-2 px-3">Good: Chart fills container</td>
                <td class="py-2 px-3">Excellent: Explicit size control</td>
              </tr>
              <tr class="border-b border-gray-100">
                <td class="py-2 px-3 font-medium">Manual Resize</td>
                <td class="py-2 px-3">✅ Works perfectly with CSS resize property</td>
                <td class="py-2 px-3">✅ Also works with CSS resize property</td>
              </tr>
              <tr class="border-b border-gray-100">
                <td class="py-2 px-3 font-medium">Use Case</td>
                <td class="py-2 px-3">Simple responsive charts</td>
                <td class="py-2 px-3">Complex layouts, shared sizing logic</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Code Examples */}
      <div class="mt-8 space-y-6">
        <div class="rounded-lg border border-gray-200 bg-white p-6">
          <h3 class="mb-3 text-lg font-semibold">Code Examples</h3>

          <div class="space-y-4">
            <div>
              <h4 class="mb-2 font-medium">Self-Sizing (autoResize)</h4>
              <pre class="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                {`<div style={{ width: '100%', height: '400px' }}>
  <SolidUplot autoResize={true} data={data} />
</div>`}
              </pre>
            </div>

            <div>
              <h4 class="mb-2 font-medium">Container-Driven (AutoSizer)</h4>
              <pre class="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                {`<div style={{ width: '100%', height: '400px' }}>
   <AutoSizer>
     {({ width, height }) => (
       <SolidUplot width={width} height={height} data={data} />
     )}
   </AutoSizer>
 </div>`}
              </pre>
            </div>

            <div>
              <h4 class="mb-2 font-medium">Manual Resize (CSS resize + AutoSizer)</h4>
              <pre class="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                {`<div style={{ 
   width: '400px', 
   height: '300px',
   resize: 'both',
   overflow: 'auto',
   minWidth: '200px',
   minHeight: '150px'
 }}>
   <AutoSizer>
     {({ width, height }) => (
       <SolidUplot width={width} height={height} data={data} />
     )}
   </AutoSizer>
 </div>`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
