import "@testing-library/jest-dom/vitest";

import { Path2D } from "path2d";
import { vi } from "vitest";

window.matchMedia = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

Object.defineProperty(window, "Path2D", {
  value: Path2D,
  writable: false,
  configurable: true,
});
