import { type Component, createSignal } from "solid-js";
import uPlot from "uplot";

import { SolidUplot } from "../../src/SolidUplot";

const generateData = (): uPlot.AlignedData => {
  const length = 10;
  const x = Array.from({ length }, (_, i) => i);
  const y = Array.from({ length }, () => Math.random() * 100);
  return [x, y];
};

/**
 * Regression test page for the infinite height growth bug fix.
 * This page is NOT linked in the sidebar - access via direct URL only.
 *
 * Previously, when autoResize was enabled in an unconstrained container (no explicit height),
 * the chart would enter a feedback loop where it kept growing indefinitely.
 *
 * The fix uses `flex: 1 1 0` with `min-height: 0` on the chart container, which prevents
 * the chart from forcing parent height growth while still filling available space.
 *
 * Both scenarios below should now maintain stable heights.
 */
export const ResizeBugTest: Component = () => {
  const [data] = createSignal(generateData());

  return (
    <div class="p-8">
      <h1 class="mb-4 text-2xl font-bold">Resize Regression Test Page</h1>
      <p class="mb-8 text-gray-600">
        This page verifies the fix for the infinite height growth bug when using autoResize. Both
        scenarios below should maintain stable heights. Access via direct URL only.
      </p>

      {/* Previously Bug Case: Unconstrained container - now fixed */}
      <section class="mb-8">
        <h2 class="mb-2 text-lg font-semibold text-blue-700">
          Unconstrained Container (Previously Buggy - Now Fixed)
        </h2>
        <p class="mb-2 text-sm text-blue-600">
          This container has no height constraint. Previously this caused infinite growth, but the
          fix prevents the chart from forcing parent height growth.
        </p>
        <div data-testid="unconstrained-container">
          <SolidUplot
            autoResize
            data={data()}
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

      {/* Safe Case: Constrained container */}
      <section>
        <h2 class="mb-2 text-lg font-semibold text-green-700">Constrained Container</h2>
        <p class="mb-2 text-sm text-green-600">
          This container has explicit height (400px) - autoResize fills the available space
          correctly.
        </p>
        <div
          data-testid="constrained-container"
          style={{ height: "400px", border: "2px dashed #22c55e" }}
        >
          <SolidUplot
            autoResize
            data={data()}
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
  );
};
