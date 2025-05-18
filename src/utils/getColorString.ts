/**
 * Utility to get a color string from uPlot stroke or fill values
 *
 * @param fillOrStroke - The uPlot series fill or stroke value
 * @param fallback - The fallback color string
 * @returns The color string
 */
export const getColorString = (
  fillOrStroke?: string | CanvasGradient | CanvasPattern,
  fallback = "#888",
): string => {
  return typeof fillOrStroke === "string" ? fillOrStroke : fallback;
};
