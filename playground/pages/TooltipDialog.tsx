import { type Component, createEffect, createSignal, For, Show } from "solid-js";

import { createPluginBus, SolidUplot } from "../../src";
import { cursor, type CursorPluginMessageBus, tooltip, type TooltipProps } from "../../src/plugins";

const bus1 = createPluginBus<CursorPluginMessageBus>();
const bus2 = createPluginBus<CursorPluginMessageBus>();

const CustomTooltip: Component<TooltipProps> = (props) => {
  return (
    <div class="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
      <div class="mb-2 border-b border-gray-100 pb-2 text-xs font-semibold text-gray-500">
        Data Point {props.cursor.idx}
      </div>
      <For each={props.seriesData}>
        {(series) => {
          const value = () => props.u.data[series.seriesIdx]?.[props.cursor.idx];
          return (
            <div class="flex items-center gap-2 py-1">
              <div
                class="h-2.5 w-2.5 rounded-full"
                style={{ "background-color": series.stroke as string }}
              />
              <span class="text-sm font-medium text-gray-700">{series.label}:</span>
              <span class="text-sm text-gray-900">{value()?.toFixed(2)}</span>
            </div>
          );
        }}
      </For>
    </div>
  );
};

const chartData = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [10, 20, 15, 25, 30, 28, 35, 40, 38, 45],
  [15, 18, 22, 20, 25, 30, 28, 35, 40, 42],
  [8, 12, 10, 15, 18, 16, 20, 22, 25, 28],
];

const chartSeries = [
  {},
  {
    label: "Revenue",
    stroke: "#3b82f6",
    fill: "rgba(59, 130, 246, 0.1)",
    width: 2,
  },
  {
    label: "Users",
    stroke: "#10b981",
    fill: "rgba(16, 185, 129, 0.1)",
    width: 2,
  },
  {
    label: "Orders",
    stroke: "#f59e0b",
    fill: "rgba(245, 158, 11, 0.1)",
    width: 2,
  },
];

export const TooltipDialogPage: Component = () => {
  const [dialogOpen, setDialogOpen] = createSignal(false);
  let dialogRef: HTMLDialogElement | undefined;

  createEffect(() => {
    if (dialogRef) {
      if (dialogOpen()) {
        dialogRef.showModal();
      } else {
        dialogRef.close();
      }
    }
  });

  return (
    <div class="container mx-auto max-w-6xl p-8">
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold">Tooltip in Dialog</h1>
          <p class="mt-2 text-gray-600">Testing tooltip positioning in different contexts</p>
        </div>
        <a
          href="https://github.com/dsnchz/solid-uplot/blob/main/playground/pages/TooltipDialog.tsx"
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

      <div class="space-y-8">
        <section class="rounded-lg border border-purple-100 bg-purple-50 p-6">
          <h3 class="mb-2 text-lg font-semibold text-purple-900">Testing Instructions</h3>
          <ul class="space-y-2 text-sm text-purple-800">
            <li class="flex gap-2">
              <span class="text-purple-600">1.</span>
              <span>
                <strong>Chart on Main Page (absolute positioning):</strong> Scroll down and hover
                over the chart. The tooltip should correctly position relative to the cursor and
                flip at viewport edges.
              </span>
            </li>
            <li class="flex gap-2">
              <span class="text-purple-600">2.</span>
              <span>
                <strong>Chart in Dialog (fixed positioning):</strong> Open the dialog and hover. The
                tooltip should not clip at dialog edges and should extend beyond them.
              </span>
            </li>
            <li class="flex gap-2">
              <span class="text-purple-600">3.</span>
              <span>
                <strong>Scroll test:</strong> Scroll the page vertically and test tooltips near the
                top/bottom edges. Both should flip correctly based on viewport bounds.
              </span>
            </li>
          </ul>
        </section>

        <section>
          <h2 class="mb-4 text-xl font-semibold text-gray-900">
            Chart on Main Page (Absolute Positioning)
          </h2>
          <p class="mb-4 text-sm text-gray-600">
            This chart uses <code class="rounded bg-gray-100 px-1 py-0.5">fixed: false</code>{" "}
            (default). The tooltip uses absolute positioning with document coordinates. Scroll the
            page and hover near edges to test overflow adjustment.
          </p>
          <div class="rounded-lg border border-gray-200 bg-white p-4">
            <SolidUplot
              autoResize
              data={chartData}
              height={400}
              scales={{
                x: {
                  time: false,
                },
              }}
              series={chartSeries}
              plugins={[cursor(), tooltip(CustomTooltip, { placement: "top-right" })]}
              pluginBus={bus1}
            />
          </div>
        </section>

        <section class="h-96 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8">
          <div class="flex h-full items-center justify-center">
            <div class="text-center">
              <svg
                class="mx-auto h-16 w-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                />
              </svg>
              <h3 class="mt-4 text-lg font-semibold text-gray-700">Spacer for Scrolling Test</h3>
              <p class="mt-2 text-sm text-gray-500">
                This section adds vertical space to enable scrolling. Scroll up and down to test
                tooltip positioning at different scroll positions.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 class="mb-4 text-xl font-semibold text-gray-900">
            Chart in Dialog Element (Fixed Positioning)
          </h2>
          <p class="mb-4 text-sm text-gray-600">
            This chart uses <code class="rounded bg-gray-100 px-1 py-0.5">fixed: true</code>. The
            tooltip uses fixed positioning with viewport coordinates, allowing it to escape the
            dialog's clipping boundaries. Click the button to open the dialog and test.
          </p>
          <button
            onClick={() => setDialogOpen(true)}
            class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Open Dialog with Chart
          </button>

          <dialog
            ref={dialogRef}
            onClose={() => setDialogOpen(false)}
            class="rounded-lg p-0 shadow-xl backdrop:bg-black backdrop:bg-opacity-50"
            style={{
              width: "90vw",
              "max-width": "800px",
            }}
          >
            <div class="flex flex-col">
              <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h3 class="text-lg font-semibold text-gray-900">Chart in Dialog</h3>
                <button
                  onClick={() => setDialogOpen(false)}
                  class="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Close dialog"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div class="p-6">
                <p class="mb-4 text-sm text-gray-600">
                  Hover over the chart and move the cursor near the edges of the dialog. The tooltip
                  should extend beyond the dialog boundaries without clipping. It should still flip
                  based on viewport edges, not dialog edges.
                </p>
                <Show when={dialogOpen()}>
                  <div class="rounded-lg border border-gray-200 bg-white p-4">
                    <SolidUplot
                      autoResize
                      data={chartData}
                      height={400}
                      scales={{
                        x: {
                          time: false,
                        },
                      }}
                      series={chartSeries}
                      plugins={[
                        cursor(),
                        tooltip(CustomTooltip, { placement: "top-right", fixed: true }),
                      ]}
                      pluginBus={bus2}
                    />
                  </div>
                </Show>
              </div>
              <div class="border-t border-gray-200 bg-gray-50 px-6 py-4">
                <button
                  onClick={() => setDialogOpen(false)}
                  class="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </dialog>
        </section>

        <section class="h-96 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8">
          <div class="flex h-full items-center justify-center">
            <div class="text-center">
              <svg
                class="mx-auto h-16 w-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
              <h3 class="mt-4 text-lg font-semibold text-gray-700">Additional Scroll Space</h3>
              <p class="mt-2 text-sm text-gray-500">
                More vertical space to test scrolling behavior. Try opening the dialog while
                scrolled down.
              </p>
            </div>
          </div>
        </section>

        <section class="rounded-lg border border-blue-100 bg-blue-50 p-6">
          <h3 class="mb-2 text-lg font-semibold text-blue-900">Expected Behavior</h3>
          <ul class="space-y-2 text-sm text-blue-800">
            <li class="flex gap-2">
              <span class="text-blue-600">•</span>
              <span>
                <strong>Absolute positioning (main page):</strong> Tooltips position relative to
                document and flip at viewport edges. Works correctly with page scrolling.
              </span>
            </li>
            <li class="flex gap-2">
              <span class="text-blue-600">•</span>
              <span>
                <strong>Fixed positioning (dialog):</strong> Tooltips use viewport coordinates,
                escape dialog clipping, and flip at viewport edges.
              </span>
            </li>
            <li class="flex gap-2">
              <span class="text-blue-600">•</span>
              <span>
                <strong>Scroll independence:</strong> Both positioning modes work correctly at any
                scroll position.
              </span>
            </li>
            <li class="flex gap-2">
              <span class="text-blue-600">•</span>
              <span>
                <strong>No clipping:</strong> Fixed tooltips extend beyond dialog boundaries without
                being cut off.
              </span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};
