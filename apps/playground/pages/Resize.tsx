import { AutoSizer } from "@dschz/solid-auto-sizer";
import { SolidUplot } from "@dschz/solid-uplot";
import { createElementSize } from "@solid-primitives/resize-observer";
import { type Component, createSignal } from "solid-js";
import uPlot from "uplot";

const generateData = (length: number = 20): uPlot.AlignedData => {
  const x = Array.from({ length }, (_, i) => i);
  const y1 = Array.from({ length }, () => Math.random() * 100 + 50);
  const y2 = Array.from({ length }, () => Math.random() * 80 + 30);
  return [x, y1, y2];
};

const CHART_STYLE = {
  border: "1px solid red",
} as const;

export const Resize: Component = () => {
  const [data] = createSignal(generateData());

  // Fixed Size controls
  const [fixedWidth, setFixedWidth] = createSignal(400);
  const [fixedHeight, setFixedHeight] = createSignal(250);

  // AutoSizer controls
  const [autoSizerWidth, setAutoSizerWidth] = createSignal(600);
  const [autoSizerHeight, setAutoSizerHeight] = createSignal(400);

  // createElementSize controls
  const [elementSizeWidth, setElementSizeWidth] = createSignal(600);
  const [elementSizeHeight, setElementSizeHeight] = createSignal(400);
  let elementSizeContainer!: HTMLDivElement;
  const elementSize = createElementSize(() => elementSizeContainer);

  return (
    <div class="container mx-auto max-w-6xl p-8">
      <h1 class="mb-4 text-3xl font-bold">Chart Sizing Patterns</h1>

      {/* Summary */}
      <div class="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
        <p class="mb-3 text-gray-700">
          SolidUplot supports several approaches to chart sizing, each suited to different layout
          scenarios. Understanding when to use each pattern will help you build responsive,
          well-behaved chart layouts.
        </p>
        <ul class="list-inside list-disc space-y-1 text-sm text-gray-600">
          <li>
            <strong>Fixed Size</strong> — Pass explicit{" "}
            <code class="rounded bg-blue-100 px-1">width</code> and{" "}
            <code class="rounded bg-blue-100 px-1">height</code> props. The chart renders at exactly
            those dimensions and re-renders when they change.
          </li>
          <li>
            <strong>Auto Resize</strong> — Set the{" "}
            <code class="rounded bg-blue-100 px-1">autoResize</code> prop. The chart uses a
            ResizeObserver to automatically fill its container. The container must have defined
            dimensions (explicit height/width, flex layout, grid layout, etc.).
          </li>
          <li>
            <strong>Container-Driven</strong> — Measure the parent container and pass dimensions to
            the chart explicitly. Use <code class="rounded bg-blue-100 px-1">{"<AutoSizer>"}</code>{" "}
            for a render prop approach, or{" "}
            <code class="rounded bg-blue-100 px-1">createElementSize</code> for a ref-based
            primitive without a wrapper component.
          </li>
          <li>
            <strong>Manual Resize</strong> — Combine{" "}
            <code class="rounded bg-blue-100 px-1">{"<AutoSizer>"}</code> with a CSS{" "}
            <code class="rounded bg-blue-100 px-1">resize: both</code> container to let users drag
            to resize the chart interactively.
          </li>
        </ul>
      </div>

      {/* Fixed Size */}
      <div class="mb-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 class="mb-4 text-xl font-semibold">Fixed Size</h2>
        <p class="mb-3 text-sm text-gray-600">
          Chart has explicit width/height props. Adjust the controls below to change the chart size
          directly.
        </p>

        <div class="mb-4 grid max-w-md grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
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
            <label class="mb-2 block text-sm font-medium text-gray-700">
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

        <div class="mb-4 overflow-auto border-2 border-dashed border-gray-300 p-4">
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

        <pre class="overflow-x-auto rounded bg-gray-50 p-3 text-sm">
          {`<SolidUplot
  width={400}
  height={250}
  data={data}
  series={series}
/>`}
        </pre>
      </div>

      {/* Auto Resize */}
      <div class="mb-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 class="mb-4 text-xl font-semibold">Auto Resize</h2>
        <p class="mb-3 text-sm text-gray-600">
          Chart uses a ResizeObserver to automatically fill its container. Enable this via the{" "}
          <code class="rounded bg-gray-100 px-1 text-xs">autoResize</code> prop. The container must
          have defined dimensions — the chart fills whatever space it provides.
        </p>
        <p class="mb-4 text-sm text-gray-600">
          When <code class="rounded bg-gray-100 px-1 text-xs">autoResize</code> is enabled, the{" "}
          <code class="rounded bg-gray-100 px-1 text-xs">width</code> and{" "}
          <code class="rounded bg-gray-100 px-1 text-xs">height</code> props are ignored. The chart
          dimensions are determined entirely by the container.
        </p>

        <div class="space-y-6">
          {/* Sized Container */}
          <div>
            <h3 class="mb-2 text-lg font-medium">Sized Container</h3>
            <p class="mb-3 text-sm text-gray-600">
              The container below has an explicit height (400px). The chart fills the available
              space, including accounting for child content placed above it. Try resizing your
              browser window to see the width adapt.
            </p>

            <div
              class="mb-4 border-2 border-dashed border-blue-300 p-4"
              style={{ height: "400px" }}
            >
              <SolidUplot
                autoResize
                data={data()}
                style={CHART_STYLE}
                series={[
                  {},
                  { label: "Auto Resize", stroke: "#8b5cf6", width: 2 },
                  { label: "Series B", stroke: "#f59e0b", width: 2 },
                ]}
                scales={{ x: { time: false } }}
                childrenPlacement="top"
              >
                <div
                  style={{
                    height: "50px",
                    background: "#dbeafe",
                    padding: "8px",
                    display: "flex",
                    "align-items": "center",
                    "justify-content": "center",
                  }}
                >
                  Child content that adds height
                </div>
              </SolidUplot>
            </div>

            <pre class="overflow-x-auto rounded bg-gray-50 p-3 text-sm">
              {`<div style={{ height: '400px' }}>
  <SolidUplot autoResize data={data} series={series} />
</div>`}
            </pre>
          </div>

          {/* Unsized Container */}
          <div>
            <h3 class="mb-2 text-lg font-medium">Unsized Container</h3>
            <p class="mb-3 text-sm text-gray-600">
              The container below has <strong>no explicit height</strong>. Notice how the child
              content bar is visible but the chart itself has collapsed to 0px.
            </p>

            <div class="mb-4 border-2 border-dashed border-blue-300 p-4">
              <SolidUplot
                autoResize
                data={data()}
                style={CHART_STYLE}
                series={[
                  {},
                  { label: "Collapsed", stroke: "#8b5cf6", width: 2 },
                  { label: "Series B", stroke: "#f59e0b", width: 2 },
                ]}
                scales={{ x: { time: false } }}
                childrenPlacement="top"
              >
                <div
                  style={{
                    height: "50px",
                    background: "#fef3c7",
                    padding: "8px",
                    display: "flex",
                    "align-items": "center",
                    "justify-content": "center",
                  }}
                >
                  Child content is visible, but the chart below is 0px
                </div>
              </SolidUplot>
            </div>

            <div class="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">
              <p class="mb-2 font-medium text-amber-800">Why did the chart collapse?</p>
              <p class="mb-2 text-amber-700">
                <code class="rounded bg-amber-100 px-1 text-xs">autoResize</code> means "fill the
                container." If the container has no defined height, the chart has no height to fill
                — so it collapses to 0px. In development mode, a console warning is logged to help
                identify this issue.
              </p>
              <p class="text-amber-700">
                <strong>Fix:</strong> Give the container an explicit height (e.g.{" "}
                <code class="rounded bg-amber-100 px-1 text-xs">height: 400px</code>), or place it
                within a flex/grid layout that provides height. See the{" "}
                <a href="/dashboard-layout" class="font-medium text-amber-900 underline">
                  Dashboard Layout
                </a>{" "}
                page for a realistic example using flexbox.
              </p>
            </div>

            <pre class="overflow-x-auto rounded bg-gray-50 p-3 text-sm">
              {`{/* Container has no height — chart collapses to 0px */}
<div>
  <SolidUplot autoResize data={data} series={series} />
</div>`}
            </pre>
          </div>
        </div>
      </div>

      {/* Container-Driven Sizing */}
      <div class="mb-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 class="mb-4 text-xl font-semibold">Container-Driven Sizing</h2>
        <p class="mb-4 text-gray-600">
          External components measure container size and provide dimensions to charts. Two
          approaches are demonstrated below:{" "}
          <code class="rounded bg-gray-100 px-1 text-xs">{"<AutoSizer>"}</code> from{" "}
          <a
            href="https://www.npmjs.com/package/@dschz/solid-auto-sizer"
            target="_blank"
            rel="noopener noreferrer"
            class="text-blue-600 underline"
          >
            @dschz/solid-auto-sizer
          </a>{" "}
          uses a render prop pattern, while{" "}
          <code class="rounded bg-gray-100 px-1 text-xs">createElementSize</code> from{" "}
          <a
            href="https://www.npmjs.com/package/@solid-primitives/resize-observer"
            target="_blank"
            rel="noopener noreferrer"
            class="text-blue-600 underline"
          >
            @solid-primitives/resize-observer
          </a>{" "}
          provides reactive dimensions via a ref without a wrapper component.
        </p>

        <div class="space-y-6">
          {/* AutoSizer */}
          <div>
            <h3 class="mb-2 text-lg font-medium">AutoSizer</h3>
            <p class="mb-3 text-sm text-gray-600">
              Wraps the chart in a measuring container and provides width/height via render prop.
              AutoSizer measures the <strong>content area</strong> of its parent (excluding padding
              and border), so the chart fits perfectly. Adjust the container size below.
            </p>

            <div class="mb-4 grid max-w-md grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700">
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
                <label class="mb-2 block text-sm font-medium text-gray-700">
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
              class="mb-4 border-2 border-dashed border-green-300 p-4"
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

            <pre class="overflow-x-auto rounded bg-gray-50 p-3 text-sm">
              {`<div style={{ width: '100%', height: '400px' }}>
  <AutoSizer>
    {({ width, height }) => (
      <SolidUplot width={width} height={height} data={data} />
    )}
  </AutoSizer>
</div>`}
            </pre>
          </div>

          {/* createElementSize */}
          <div>
            <h3 class="mb-2 text-lg font-medium">createElementSize</h3>
            <p class="mb-3 text-sm text-gray-600">
              Observes a container via ref and returns reactive dimensions — no wrapper component
              needed. Since <code class="rounded bg-gray-100 px-1 text-xs">createElementSize</code>{" "}
              uses <code class="rounded bg-gray-100 px-1 text-xs">getBoundingClientRect()</code>{" "}
              (which measures the <strong>border box</strong> including padding), the ref should
              point to an inner element with no padding or border. Adjust the container size below.
            </p>

            <div class="mb-4 grid max-w-md grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700">
                  Container Width: {elementSizeWidth()}px
                </label>
                <input
                  type="range"
                  min="300"
                  max="800"
                  step="50"
                  value={elementSizeWidth()}
                  onInput={(e) => setElementSizeWidth(Number(e.currentTarget.value))}
                  class="w-full"
                />
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700">
                  Container Height: {elementSizeHeight()}px
                </label>
                <input
                  type="range"
                  min="200"
                  max="500"
                  step="50"
                  value={elementSizeHeight()}
                  onInput={(e) => setElementSizeHeight(Number(e.currentTarget.value))}
                  class="w-full"
                />
              </div>
            </div>

            <div
              class="mb-4 border-2 border-dashed border-green-300 p-4"
              style={{
                width: `${elementSizeWidth()}px`,
                height: `${elementSizeHeight()}px`,
              }}
            >
              <div ref={elementSizeContainer} style={{ width: "100%", height: "100%" }}>
                <SolidUplot
                  data={data()}
                  width={elementSize.width ?? 0}
                  height={elementSize.height ?? 0}
                  style={CHART_STYLE}
                  series={[
                    {},
                    { label: "ElementSize", stroke: "#f59e0b", width: 2 },
                    { label: "Series B", stroke: "#a855f7", width: 2 },
                  ]}
                  scales={{ x: { time: false } }}
                />
              </div>
            </div>

            <pre class="overflow-x-auto rounded bg-gray-50 p-3 text-sm">
              {`import { createElementSize } from "@solid-primitives/resize-observer";

let container!: HTMLDivElement;
const size = createElementSize(() => container);

<div style={{ width: '100%', height: '400px' }}>
  {/* Ref targets an inner div with no padding/border */}
  <div ref={container} style={{ width: '100%', height: '100%' }}>
    <SolidUplot
      width={size.width ?? 0}
      height={size.height ?? 0}
      data={data}
    />
  </div>
</div>`}
            </pre>
          </div>
        </div>
      </div>

      {/* Manual Resize */}
      <div class="mb-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 class="mb-4 text-xl font-semibold">Manual Resize</h2>
        <p class="mb-3 text-sm text-gray-600">
          Drag the bottom-right corner to manually resize the container. The chart adapts
          automatically via AutoSizer.
        </p>
        <div
          class="mb-4 overflow-auto border-2 border-dashed border-indigo-300 p-4"
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
            {({ width, height }) => (
              <SolidUplot
                data={data()}
                width={width}
                height={height}
                series={[
                  {},
                  { label: "Resizable", stroke: "#6366f1", width: 2 },
                  { label: "Series B", stroke: "#ec4899", width: 2 },
                ]}
                scales={{ x: { time: false } }}
              />
            )}
          </AutoSizer>
        </div>

        <pre class="overflow-x-auto rounded bg-gray-50 p-3 text-sm">
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

      {/* Comparison Table */}
      <div class="rounded-lg border border-gray-200 bg-white p-6">
        <h2 class="mb-4 text-xl font-semibold">Pattern Comparison</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="px-3 py-2 text-left">Aspect</th>
                <th class="px-3 py-2 text-left">Self-Sizing (autoResize)</th>
                <th class="px-3 py-2 text-left">Container-Driven</th>
              </tr>
            </thead>
            <tbody class="text-gray-600">
              <tr class="border-b border-gray-100">
                <td class="px-3 py-2 font-medium">API Complexity</td>
                <td class="px-3 py-2">
                  Simple: <code class="rounded bg-gray-100 px-1">{"autoResize={true}"}</code>
                </td>
                <td class="px-3 py-2">More complex: Render prop pattern</td>
              </tr>
              <tr class="border-b border-gray-100">
                <td class="px-3 py-2 font-medium">Performance</td>
                <td class="px-3 py-2">One ResizeObserver per chart</td>
                <td class="px-3 py-2">One ResizeObserver per AutoSizer</td>
              </tr>
              <tr class="border-b border-gray-100">
                <td class="px-3 py-2 font-medium">Flexibility</td>
                <td class="px-3 py-2">Limited to chart sizing</td>
                <td class="px-3 py-2">Size data can be shared/reused</td>
              </tr>
              <tr class="border-b border-gray-100">
                <td class="px-3 py-2 font-medium">Grid Layout Compatibility</td>
                <td class="px-3 py-2">Good: Chart fills container</td>
                <td class="px-3 py-2">Excellent: Explicit size control</td>
              </tr>
              <tr class="border-b border-gray-100">
                <td class="px-3 py-2 font-medium">Manual Resize</td>
                <td class="px-3 py-2">Works with CSS resize property</td>
                <td class="px-3 py-2">Also works with CSS resize property</td>
              </tr>
              <tr class="border-b border-gray-100">
                <td class="px-3 py-2 font-medium">DOM Overhead</td>
                <td class="px-3 py-2">None</td>
                <td class="px-3 py-2">
                  AutoSizer adds a wrapper <code class="rounded bg-gray-100 px-1">{"<div>"}</code>;
                  createElementSize does not
                </td>
              </tr>
              <tr class="border-b border-gray-100">
                <td class="px-3 py-2 font-medium">Use Case</td>
                <td class="px-3 py-2">Simple responsive charts</td>
                <td class="px-3 py-2">Complex layouts, shared sizing logic</td>
              </tr>
              <tr class="border-b border-gray-100">
                <td class="px-3 py-2 font-medium">Options</td>
                <td class="px-3 py-2">Built-in (single prop)</td>
                <td class="px-3 py-2">
                  AutoSizer (render prop) or createElementSize (ref-based primitive)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
