import { expect, type Page, test } from "@playwright/test";

// ============================================================================
// HELPERS
// ============================================================================

const TOOLTIP_OFFSET = 8; // Matches TOOLTIP_OFFSET_X / TOOLTIP_OFFSET_Y in tooltip.tsx

/**
 * Tolerance in pixels for position assertions.
 * We allow some slack because uPlot snaps the cursor to data points,
 * so the actual cursor position may differ slightly from where we hovered.
 */
const POSITION_TOLERANCE = 30;

/**
 * Get the u-over canvas element (the chart's interactive overlay area)
 * within a given test section.
 */
function getChartOverlay(page: Page, sectionTestId: string) {
  return page.getByTestId(sectionTestId).locator(".u-over");
}

/**
 * Hover over the chart overlay at a relative position and wait for the tooltip to appear.
 */
async function hoverChartAndWaitForTooltip(
  page: Page,
  sectionTestId: string,
  tooltipId: string,
  position: { x: number; y: number },
) {
  const overlay = getChartOverlay(page, sectionTestId);
  const overlayBox = await overlay.boundingBox();
  expect(overlayBox).not.toBeNull();

  await page.mouse.move(overlayBox!.x + position.x, overlayBox!.y + position.y);

  const tooltip = page.locator(`#${tooltipId}`);
  await tooltip.waitFor({ state: "visible", timeout: 5000 });

  return { overlay: overlayBox!, tooltip };
}

// ============================================================================
// TESTS
// ============================================================================

test.describe("Tooltip Positioning", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/test-tooltip");
    await page.waitForSelector(".u-wrap");
  });

  // -------------------------------------------------------------------------
  // ABSOLUTE POSITIONING (default)
  // -------------------------------------------------------------------------
  test.describe("Absolute Positioning", () => {
    test("tooltip appears near cursor on hover", async ({ page }) => {
      const hoverX = 200;
      const hoverY = 100;

      const { overlay, tooltip } = await hoverChartAndWaitForTooltip(
        page,
        "absolute-chart-section",
        "test-tooltip-absolute",
        { x: hoverX, y: hoverY },
      );

      const tooltipBox = await tooltip.boundingBox();
      expect(tooltipBox).not.toBeNull();

      // The hover point in viewport coordinates
      const hoverViewportX = overlay.x + hoverX;
      const hoverViewportY = overlay.y + hoverY;

      // With placement "top-right", tooltip should be:
      // - To the RIGHT of cursor: tooltip.left ≈ cursorX + OFFSET
      // - ABOVE cursor: tooltip.bottom ≈ cursorY - OFFSET
      // Allow tolerance since uPlot snaps cursor to nearest data point
      expect(tooltipBox!.x).toBeGreaterThan(hoverViewportX - POSITION_TOLERANCE);
      expect(tooltipBox!.x).toBeLessThan(hoverViewportX + tooltipBox!.width + POSITION_TOLERANCE);
      expect(tooltipBox!.y).toBeGreaterThan(
        hoverViewportY - tooltipBox!.height - POSITION_TOLERANCE,
      );
      expect(tooltipBox!.y).toBeLessThan(hoverViewportY + POSITION_TOLERANCE);
    });

    test("tooltip position is relative to chart, not offset by container document position", async ({
      page,
    }) => {
      // This is the KEY test that catches the bug.
      // The chart is wrapped with 100px top padding and 80px left padding,
      // so its container is NOT at the document origin.
      //
      // With the bug: tooltip uses document-absolute coordinates but renders
      // inside a position:relative container, causing a double-offset.
      // The tooltip would appear ~100px too far down and ~80px too far right.

      const hoverX = 150;
      // Use a Y position far enough from the top so the tooltip doesn't flip
      const hoverY = 200;

      const { overlay, tooltip } = await hoverChartAndWaitForTooltip(
        page,
        "absolute-chart-section",
        "test-tooltip-absolute",
        { x: hoverX, y: hoverY },
      );

      const tooltipBox = await tooltip.boundingBox();
      expect(tooltipBox).not.toBeNull();

      const hoverViewportX = overlay.x + hoverX;
      const hoverViewportY = overlay.y + hoverY;

      // With placement "top-right":
      // Tooltip left edge should be near (cursorViewportX + 8)
      // Tooltip bottom edge should be near (cursorViewportY - 8)
      //
      // With the bug, the tooltip's actual viewport position would be offset
      // by the container's document position (roughly +80px X, +100px Y on top
      // of where it should be), pushing it far from the cursor.
      //
      // We assert the tooltip's left edge is within a reasonable range of
      // where "top-right" placement should put it.
      const expectedTooltipLeft = hoverViewportX + TOOLTIP_OFFSET;
      expect(tooltipBox!.x).toBeGreaterThan(expectedTooltipLeft - POSITION_TOLERANCE);
      expect(tooltipBox!.x).toBeLessThan(expectedTooltipLeft + POSITION_TOLERANCE);

      // Verify Y-axis: tooltip should be near the cursor vertically.
      // Note: on first render, tooltipRoot.offsetHeight may be 0,
      // causing the tooltip to appear slightly below ideal "top" placement.
      // We verify the tooltip is reasonably close to the cursor, not offset
      // by the container's document position (which would be 100+ px off).
      expect(tooltipBox!.y).toBeGreaterThan(
        hoverViewportY - tooltipBox!.height - POSITION_TOLERANCE,
      );
      expect(tooltipBox!.y).toBeLessThan(hoverViewportY + POSITION_TOLERANCE);
    });

    test("tooltip follows cursor as it moves across chart", async ({ page }) => {
      const overlay = getChartOverlay(page, "absolute-chart-section");
      const overlayBox = await overlay.boundingBox();
      expect(overlayBox).not.toBeNull();

      // Hover at position A
      const posA = { x: 100, y: 100 };
      await page.mouse.move(overlayBox!.x + posA.x, overlayBox!.y + posA.y);
      const tooltip = page.locator("#test-tooltip-absolute");
      await tooltip.waitFor({ state: "visible", timeout: 5000 });
      const boxA = await tooltip.boundingBox();
      expect(boxA).not.toBeNull();

      // Move to position B (150px to the right)
      const deltaX = 150;
      const posB = { x: posA.x + deltaX, y: posA.y };
      await page.mouse.move(overlayBox!.x + posB.x, overlayBox!.y + posB.y);

      // Wait a frame for the tooltip to update
      await page.waitForTimeout(100);

      const boxB = await tooltip.boundingBox();
      expect(boxB).not.toBeNull();

      // Tooltip should have moved roughly in the same direction as the cursor.
      // It won't be exactly deltaX because uPlot snaps to data points,
      // but it should have moved to the right.
      expect(boxB!.x).toBeGreaterThan(boxA!.x);
    });
  });

  // -------------------------------------------------------------------------
  // FIXED POSITIONING (dialog)
  // -------------------------------------------------------------------------
  test.describe("Fixed Positioning (Dialog)", () => {
    test("tooltip appears near cursor in dialog", async ({ page }) => {
      // Open the dialog
      await page.getByTestId("open-dialog-btn").click();
      await page.waitForSelector("#test-tooltip-fixed", { state: "hidden" }).catch(() => {});
      // Wait for the chart inside dialog to render
      const dialogChart = page.getByTestId("fixed-chart-container").locator(".u-over");
      await dialogChart.waitFor({ state: "visible", timeout: 5000 });

      const overlayBox = await dialogChart.boundingBox();
      expect(overlayBox).not.toBeNull();

      // Hover over center of chart
      const hoverX = Math.floor(overlayBox!.width / 2);
      const hoverY = Math.floor(overlayBox!.height / 2);
      await page.mouse.move(overlayBox!.x + hoverX, overlayBox!.y + hoverY);

      const tooltip = page.locator("#test-tooltip-fixed");
      await tooltip.waitFor({ state: "visible", timeout: 5000 });

      const tooltipBox = await tooltip.boundingBox();
      expect(tooltipBox).not.toBeNull();

      const hoverViewportX = overlayBox!.x + hoverX;
      const hoverViewportY = overlayBox!.y + hoverY;

      // Tooltip should be near the cursor in viewport coordinates
      expect(tooltipBox!.x).toBeGreaterThan(hoverViewportX - POSITION_TOLERANCE);
      expect(tooltipBox!.x).toBeLessThan(hoverViewportX + tooltipBox!.width + POSITION_TOLERANCE);
      expect(tooltipBox!.y).toBeGreaterThan(
        hoverViewportY - tooltipBox!.height - POSITION_TOLERANCE,
      );
      expect(tooltipBox!.y).toBeLessThan(hoverViewportY + POSITION_TOLERANCE);
    });

    test("tooltip uses fixed positioning in dialog", async ({ page }) => {
      // Open the dialog
      await page.getByTestId("open-dialog-btn").click();
      const dialogChart = page.getByTestId("fixed-chart-container").locator(".u-over");
      await dialogChart.waitFor({ state: "visible", timeout: 5000 });

      const overlayBox = await dialogChart.boundingBox();
      expect(overlayBox).not.toBeNull();

      // Hover to show tooltip
      await page.mouse.move(
        overlayBox!.x + Math.floor(overlayBox!.width / 2),
        overlayBox!.y + Math.floor(overlayBox!.height / 2),
      );

      const tooltip = page.locator("#test-tooltip-fixed");
      await tooltip.waitFor({ state: "visible", timeout: 5000 });

      // Verify fixed positioning
      const position = await tooltip.evaluate((el) => getComputedStyle(el).position);
      expect(position).toBe("fixed");
    });
  });

  // -------------------------------------------------------------------------
  // CLEANUP
  // -------------------------------------------------------------------------
  test("tooltip disappears when cursor leaves chart", async ({ page }) => {
    const overlay = getChartOverlay(page, "absolute-chart-section");
    const overlayBox = await overlay.boundingBox();
    expect(overlayBox).not.toBeNull();

    // Hover to show tooltip
    await page.mouse.move(overlayBox!.x + 200, overlayBox!.y + 100);
    const tooltip = page.locator("#test-tooltip-absolute");
    await tooltip.waitFor({ state: "visible", timeout: 5000 });

    // Move cursor far away from the chart
    await page.mouse.move(0, 0);

    // Tooltip should disappear
    await expect(async () => {
      const isVisible = await tooltip.isVisible();
      expect(isVisible).toBe(false);
    }).toPass({ timeout: 5000 });
  });
});
