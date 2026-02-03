import { createPluginBus, SolidUplot } from "@dschz/solid-uplot";
import {
  cursor,
  type CursorPluginMessageBus,
  tooltip,
  type TooltipProps,
} from "@dschz/solid-uplot/plugins";
import { type Component, createEffect, createSignal, For, Show } from "solid-js";

const bus1 = createPluginBus<CursorPluginMessageBus>();
const bus2 = createPluginBus<CursorPluginMessageBus>();

/**
 * Minimal tooltip component with known dimensions for predictable E2E assertions.
 */
const TestTooltip: Component<TooltipProps> = (props) => {
  return (
    <div
      data-testid="tooltip-content"
      style={{
        width: "150px",
        height: "80px",
        background: "white",
        border: "1px solid #ccc",
        padding: "8px",
        "border-radius": "4px",
        "box-shadow": "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ "font-weight": "bold", "margin-bottom": "4px" }}>Point {props.cursor.idx}</div>
      <For each={props.seriesData}>
        {(series) => {
          const value = () => props.u.data[series.seriesIdx]?.[props.cursor.idx];
          return (
            <div style={{ "font-size": "12px" }}>
              {series.label}: {value()?.toFixed(1)}
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
];

const chartSeries = [
  {},
  { label: "Series A", stroke: "#3b82f6", width: 2 },
  { label: "Series B", stroke: "#10b981", width: 2 },
];

/**
 * E2E test page for tooltip positioning.
 * NOT linked in sidebar - access via /tooltip-test only.
 *
 * The chart is intentionally offset from the viewport origin (via padding)
 * so that E2E tests can detect the difference between document-absolute
 * and container-relative positioning.
 */
export const Tooltip: Component = () => {
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
    <div style={{ padding: "100px 80px" }}>
      {/* Absolute positioning chart */}
      <section data-testid="absolute-chart-section">
        <h2 style={{ "margin-bottom": "8px" }}>Absolute Positioning</h2>
        <div
          data-testid="absolute-chart-container"
          style={{
            width: "600px",
            height: "400px",
            border: "1px solid #e5e7eb",
          }}
        >
          <SolidUplot
            autoResize
            data={chartData}
            height={400}
            scales={{ x: { time: false } }}
            series={chartSeries}
            plugins={[
              cursor(),
              tooltip(TestTooltip, {
                id: "test-tooltip-absolute",
                placement: "top-right",
              }),
            ]}
            pluginBus={bus1}
          />
        </div>
      </section>

      {/* Fixed positioning chart in dialog */}
      <section data-testid="fixed-chart-section" style={{ "margin-top": "40px" }}>
        <h2 style={{ "margin-bottom": "8px" }}>Fixed Positioning (Dialog)</h2>
        <button type="button" data-testid="open-dialog-btn" onClick={() => setDialogOpen(true)}>
          Open Dialog
        </button>

        <dialog
          ref={dialogRef}
          onClose={() => setDialogOpen(false)}
          style={{
            width: "700px",
            "max-width": "90vw",
            padding: "0",
            border: "1px solid #e5e7eb",
            "border-radius": "8px",
          }}
        >
          <div style={{ padding: "16px" }}>
            <div
              style={{
                display: "flex",
                "justify-content": "space-between",
                "align-items": "center",
                "margin-bottom": "16px",
              }}
            >
              <h3>Chart in Dialog</h3>
              <button
                type="button"
                data-testid="close-dialog-btn"
                onClick={() => setDialogOpen(false)}
              >
                Close
              </button>
            </div>
            <Show when={dialogOpen()}>
              <div
                data-testid="fixed-chart-container"
                style={{
                  height: "300px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <SolidUplot
                  autoResize
                  data={chartData}
                  height={300}
                  scales={{ x: { time: false } }}
                  series={chartSeries}
                  plugins={[
                    cursor(),
                    tooltip(TestTooltip, {
                      id: "test-tooltip-fixed",
                      placement: "top-right",
                      fixed: true,
                    }),
                  ]}
                  pluginBus={bus2}
                />
              </div>
            </Show>
          </div>
        </dialog>
      </section>
    </div>
  );
};
