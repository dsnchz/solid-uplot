import { AutoSizer } from "@dschz/solid-auto-sizer";
import { SolidUplot } from "@dschz/solid-uplot";
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
  const [shortData] = createSignal(generateData(10));

  // Fixed Size controls
  const [fixedWidth, setFixedWidth] = createSignal(400);
  const [fixedHeight, setFixedHeight] = createSignal(250);

  // AutoSizer controls
  const [autoSizerWidth, setAutoSizerWidth] = createSignal(600);
  const [autoSizerHeight, setAutoSizerHeight] = createSignal(400);

  return (
    <div class="container mx-auto max-w-6xl p-8">
      <h1 class="mb-8 text-3xl font-bold">Resize Test Fixtures</h1>

      {/* ================================================================
          Pattern 1: Self-Sizing Charts
          ================================================================ */}
      <div class="mb-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 class="mb-4 text-xl font-semibold">Pattern 1: Self-Sizing Charts</h2>

        <div class="space-y-6">
          {/* Fixed Size */}
          <div>
            <h3 class="mb-2 text-lg font-medium">Fixed Size</h3>
            <p class="mb-3 text-sm text-gray-600">
              Verifies chart renders at explicit width/height and updates reactively when props
              change.
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
            <div class="overflow-auto border-2 border-dashed border-gray-300 p-4">
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
              Verifies chart fills its sized container (400px height) via ResizeObserver and
              responds to viewport changes.
            </p>
            <div class="border-2 border-dashed border-blue-300 p-4" style={{ height: "400px" }}>
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

      {/* ================================================================
          Pattern 2: Container-Driven Sizing
          ================================================================ */}
      <div class="mb-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 class="mb-4 text-xl font-semibold">Pattern 2: Container-Driven Sizing</h2>

        <div class="space-y-6">
          {/* AutoSizer Pattern */}
          <div>
            <h3 class="mb-2 text-lg font-medium">AutoSizer Pattern</h3>
            <p class="mb-3 text-sm text-gray-600">
              Verifies container-driven sizing where AutoSizer measures the parent and passes
              dimensions to the chart.
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
              Verifies chart adapts when the user manually drags a CSS resize: both container.
            </p>
            <div
              class="overflow-auto border-2 border-dashed border-indigo-300 p-4"
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
          </div>
        </div>
      </div>

      {/* ================================================================
          Auto Resize Constraints
          ================================================================ */}
      <div class="rounded-lg border border-gray-200 bg-white p-6">
        <h2 class="mb-2 text-xl font-semibold">Auto Resize Constraints</h2>
        <p class="mb-4 text-sm text-gray-600">
          Tests autoResize behavior under different container constraints. Unconstrained containers
          result in a 0px chart (with a dev warning), while constrained containers fill correctly.
        </p>

        <div class="space-y-6">
          {/* Unconstrained container */}
          <section>
            <h3 class="mb-2 text-lg font-semibold text-blue-700">Unconstrained Container</h3>
            <p class="mb-3 text-sm text-gray-600">
              Verifies autoResize in a container with no explicit height does not cause infinite
              growth. The chart renders at 0px height (expected) while the child content remains
              visible.
            </p>
            <div data-testid="unconstrained-container">
              <SolidUplot
                autoResize
                data={shortData()}
                series={[{}, { label: "Series", stroke: "#3b82f6", width: 2 }]}
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
          </section>

          {/* Constrained container */}
          <section>
            <h3 class="mb-2 text-lg font-semibold text-green-700">Constrained Container</h3>
            <p class="mb-3 text-sm text-gray-600">
              Verifies autoResize in a container with a fixed height fills the space correctly.
            </p>
            <div
              data-testid="constrained-container"
              style={{ height: "400px", border: "2px dashed #22c55e" }}
            >
              <SolidUplot
                autoResize
                data={shortData()}
                series={[{}, { label: "Series", stroke: "#22c55e", width: 2 }]}
                scales={{ x: { time: false } }}
                childrenPlacement="top"
              >
                <div
                  style={{
                    height: "50px",
                    background: "#dcfce7",
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
          </section>
        </div>
      </div>
    </div>
  );
};
