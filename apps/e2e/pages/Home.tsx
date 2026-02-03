import { A } from "@solidjs/router";
import { type Component, For } from "solid-js";

const testPages = [
  { href: "/test-resize", label: "Resize" },
  { href: "/test-tooltip", label: "Tooltip" },
];

export const Home: Component = () => {
  return (
    <div style={{ padding: "2rem", "font-family": "system-ui, sans-serif" }}>
      <h1 style={{ "margin-bottom": "1rem" }}>E2E Test Pages</h1>
      <div style={{ display: "flex", "flex-direction": "column", gap: "0.5rem" }}>
        <For each={testPages}>
          {(page) => (
            <A href={page.href} style={{ color: "#3b82f6" }}>
              {page.label}
            </A>
          )}
        </For>
      </div>
    </div>
  );
};
