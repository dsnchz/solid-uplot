import { expect, test } from "@playwright/test";

/**
 * Tests for the infinite height growth bug fix when using autoResize.
 *
 * Previously, when autoResize was enabled and the parent container had no explicit
 * height constraint, a feedback loop occurred causing infinite height growth.
 *
 * The fix uses `flex: 1 1 0` with `min-height: 0` on the chart container, which
 * prevents the chart from forcing parent height growth while still filling
 * available space.
 *
 * Both constrained and unconstrained containers should now maintain stable heights.
 */
test.describe("Infinite Height Growth Bug (Fixed)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/test-resize");
    // Wait for charts to render
    await page.waitForSelector(".u-wrap");
  });

  test("unconstrained container with autoResize maintains stable height", async ({ page }) => {
    const container = page.getByTestId("unconstrained-container");

    // Get initial height after first render
    const initialHeight = await container.evaluate((el) => el.getBoundingClientRect().height);

    // Initial height should be reasonable (not zero, not huge)
    expect(initialHeight).toBeGreaterThan(0);

    // Wait to ensure no growth occurs
    await page.waitForTimeout(1000);

    // Get final height
    const finalHeight = await container.evaluate((el) => el.getBoundingClientRect().height);

    // Assert: height should NOT have grown significantly
    // Allow 50% tolerance for initial render adjustments, but no infinite growth
    expect(finalHeight).toBeLessThanOrEqual(initialHeight * 1.5);
  });

  test("constrained container with autoResize maintains stable height", async ({ page }) => {
    const container = page.getByTestId("constrained-container");

    // Get initial height (should be 400px as set in the container style)
    const initialHeight = await container.evaluate((el) => el.getBoundingClientRect().height);

    // Verify initial height is the constrained value
    expect(initialHeight).toBe(400);

    // Wait to ensure no unexpected growth
    await page.waitForTimeout(1000);

    // Get final height
    const finalHeight = await container.evaluate((el) => el.getBoundingClientRect().height);

    // Assert: height should remain stable at 400px
    expect(finalHeight).toBe(400);
  });
});
