import { expect, type Locator, type Page, test } from "@playwright/test";

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get the canvas dimensions from a uPlot chart within a container
 */
async function getChartCanvasDimensions(container: Locator) {
  const canvas = container.locator(".u-wrap canvas").first();
  await canvas.waitFor({ state: "visible" });

  const width = await canvas.getAttribute("width");
  const height = await canvas.getAttribute("height");

  return {
    width: Number(width),
    height: Number(height),
  };
}

/**
 * Set a range slider to a specific value and trigger input event
 */
async function setSliderValue(slider: Locator, value: number) {
  await slider.fill(String(value));
}

/**
 * Get a section container by its heading text
 */
function getSection(page: Page, headingText: string) {
  return page.locator(`h3:has-text("${headingText}")`).locator("..");
}

// ============================================================================
// TESTS
// ============================================================================

test.describe("SolidUplot Resize Behaviors", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/test-resize");
    // Wait for at least one chart to render
    await page.waitForSelector(".u-wrap");
  });

  // ---------------------------------------------------------------------------
  // PATTERN 1: FIXED SIZE
  // ---------------------------------------------------------------------------
  test.describe("Pattern 1: Fixed Size", () => {
    test("renders chart at initial dimensions (400x250)", async ({ page }) => {
      const section = getSection(page, "Fixed Size");
      const { width, height } = await getChartCanvasDimensions(section);

      expect(width).toBe(400);
      expect(height).toBe(250);
    });

    test("updates chart width when slider changes", async ({ page }) => {
      const section = getSection(page, "Fixed Size");

      // Find the width slider - it's the first range input in the Fixed Size section
      const widthSlider = section.locator('input[type="range"]').first();
      await setSliderValue(widthSlider, 600);

      // Wait for reactive update and verify
      await expect(async () => {
        const { width } = await getChartCanvasDimensions(section);
        expect(width).toBe(600);
      }).toPass({ timeout: 5000 });
    });

    test("updates chart height when slider changes", async ({ page }) => {
      const section = getSection(page, "Fixed Size");

      // Find the height slider - it's the second range input in the Fixed Size section
      const heightSlider = section.locator('input[type="range"]').nth(1);
      await setSliderValue(heightSlider, 400);

      // Wait for reactive update and verify
      await expect(async () => {
        const { height } = await getChartCanvasDimensions(section);
        expect(height).toBe(400);
      }).toPass({ timeout: 5000 });
    });

    test("handles multiple rapid dimension changes", async ({ page }) => {
      const section = getSection(page, "Fixed Size");
      const widthSlider = section.locator('input[type="range"]').first();

      // Rapid changes
      await setSliderValue(widthSlider, 300);
      await setSliderValue(widthSlider, 500);
      await setSliderValue(widthSlider, 250);
      await setSliderValue(widthSlider, 550);

      // Final state should be 550
      await expect(async () => {
        const { width } = await getChartCanvasDimensions(section);
        expect(width).toBe(550);
      }).toPass({ timeout: 5000 });
    });
  });

  // ---------------------------------------------------------------------------
  // PATTERN 1: AUTO RESIZE (ResizeObserver)
  // ---------------------------------------------------------------------------
  test.describe("Pattern 1: Auto Resize (ResizeObserver)", () => {
    test("chart container has auto-resize styles", async ({ page }) => {
      const section = getSection(page, "Auto Resize");
      const chartContainer = section.locator(".solid-uplot");

      // When autoResize is enabled, these styles should be applied
      await expect(chartContainer).toHaveCSS("width", /\d+px/);
      await expect(chartContainer).toHaveCSS("height", /\d+px/);
      await expect(chartContainer).toHaveCSS("min-width", "0px");
      await expect(chartContainer).toHaveCSS("min-height", "0px");
    });

    test("chart renders and fills available space", async ({ page }) => {
      const section = getSection(page, "Auto Resize");
      const { width, height } = await getChartCanvasDimensions(section);

      // Chart should have rendered with positive dimensions
      expect(width).toBeGreaterThan(0);
      expect(height).toBeGreaterThan(0);
    });

    test("chart resizes when viewport changes", async ({ page }) => {
      const section = getSection(page, "Auto Resize");

      // Get initial dimensions
      const initialDims = await getChartCanvasDimensions(section);

      // Resize viewport to a smaller width
      await page.setViewportSize({ width: 800, height: 600 });

      // Wait for resize and verify dimensions changed
      await expect(async () => {
        const newDims = await getChartCanvasDimensions(section);
        // Width should be different after viewport resize
        expect(newDims.width).not.toBe(initialDims.width);
      }).toPass({ timeout: 5000 });
    });
  });

  // ---------------------------------------------------------------------------
  // PATTERN 2: CONTAINER-DRIVEN (AutoSizer)
  // ---------------------------------------------------------------------------
  test.describe("Pattern 2: Container-Driven (AutoSizer)", () => {
    test("renders at initial container dimensions", async ({ page }) => {
      const section = getSection(page, "AutoSizer Pattern");
      const { width, height } = await getChartCanvasDimensions(section);

      // Container starts at 600x400, minus padding (p-4 = 32px total)
      // Chart should be close to these values
      expect(width).toBeGreaterThan(500);
      expect(width).toBeLessThanOrEqual(600);
      expect(height).toBeGreaterThan(300);
      expect(height).toBeLessThanOrEqual(400);
    });

    test("updates when container width slider changes", async ({ page }) => {
      const section = getSection(page, "AutoSizer Pattern");

      // Find the container width slider in this section
      const widthSlider = section.locator('input[type="range"]').first();
      await setSliderValue(widthSlider, 800);

      // Wait for AutoSizer to detect change and update chart
      await expect(async () => {
        const { width } = await getChartCanvasDimensions(section);
        // Should be close to 800 minus padding
        expect(width).toBeGreaterThan(700);
      }).toPass({ timeout: 5000 });
    });

    test("updates when container height slider changes", async ({ page }) => {
      const section = getSection(page, "AutoSizer Pattern");

      // Find the container height slider in this section
      const heightSlider = section.locator('input[type="range"]').nth(1);
      await setSliderValue(heightSlider, 500);

      // Wait for AutoSizer to detect change and update chart
      await expect(async () => {
        const { height } = await getChartCanvasDimensions(section);
        // Should be close to 500 minus padding
        expect(height).toBeGreaterThan(400);
      }).toPass({ timeout: 5000 });
    });

    test("chart dimensions stay in sync with container", async ({ page }) => {
      const section = getSection(page, "AutoSizer Pattern");

      // Get the container with the green dashed border
      const container = section.locator(".border-dashed.border-green-300");
      const containerBox = await container.boundingBox();

      const { width, height } = await getChartCanvasDimensions(section);

      // Chart should match container dimensions (accounting for padding)
      // Container has p-4 (16px padding on each side = 32px total)
      expect(width).toBeCloseTo(containerBox!.width - 32, -1);
      expect(height).toBeCloseTo(containerBox!.height - 32, -1);
    });
  });

  // ---------------------------------------------------------------------------
  // PATTERN 2: MANUAL RESIZE (CSS resize)
  // ---------------------------------------------------------------------------
  test.describe("Pattern 2: Manual Resize (CSS resize)", () => {
    test("container has resize: both style", async ({ page }) => {
      const section = getSection(page, "Manual Resize");
      const container = section.locator(".border-dashed.border-indigo-300");

      await expect(container).toHaveCSS("resize", "both");
    });

    test("container has initial dimensions (400x300)", async ({ page }) => {
      const section = getSection(page, "Manual Resize");
      const container = section.locator(".border-dashed.border-indigo-300");

      await expect(container).toHaveCSS("width", "400px");
      await expect(container).toHaveCSS("height", "300px");
    });

    test("container respects min-width constraint", async ({ page }) => {
      const section = getSection(page, "Manual Resize");
      const container = section.locator(".border-dashed.border-indigo-300");

      await expect(container).toHaveCSS("min-width", "200px");
    });

    test("container respects min-height constraint", async ({ page }) => {
      const section = getSection(page, "Manual Resize");
      const container = section.locator(".border-dashed.border-indigo-300");

      await expect(container).toHaveCSS("min-height", "150px");
    });

    test("container respects max-width constraint", async ({ page }) => {
      const section = getSection(page, "Manual Resize");
      const container = section.locator(".border-dashed.border-indigo-300");

      await expect(container).toHaveCSS("max-width", "800px");
    });

    test("container respects max-height constraint", async ({ page }) => {
      const section = getSection(page, "Manual Resize");
      const container = section.locator(".border-dashed.border-indigo-300");

      await expect(container).toHaveCSS("max-height", "600px");
    });
  });
});
