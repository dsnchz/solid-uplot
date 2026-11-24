<p align="center">
  <img src="https://assets.solidjs.com/banner?project=solid-uplot&type=Ecosystem&background=tiles" alt="@dschz/solid-uplot banner" />
</p>

# @dschz/solid-uplot

[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![uPlot](https://img.shields.io/badge/uPlot-%3E%3D1.6.32-orange)](https://github.com/leeoniya/uPlot)
[![npm](https://img.shields.io/npm/v/@dschz/solid-uplot?color=blue)](https://www.npmjs.com/package/@dschz/solid-uplot)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@dschz/solid-uplot)](https://bundlephobia.com/package/@dschz/solid-uplot)
[![JSR](https://jsr.io/badges/@dschz/solid-uplot/score)](https://jsr.io/@dschz/solid-uplot)
[![CI](https://github.com/dsnchz/solid-uplot/actions/workflows/ci.yaml/badge.svg)](https://github.com/dsnchz/solid-uplot/actions/workflows/ci.yaml)
[![Discord](https://img.shields.io/badge/Discord-%235865F2.svg?logo=discord&logoColor=white)](https://discord.gg/6wkpXQCNn6)

> 💹 SolidJS wrapper for [uPlot](https://github.com/leeoniya/uPlot) — an ultra-fast, small footprint charting library for time-series data.

## ✨ Features

- ✅ Fully reactive SolidJS wrapper around uPlot
- 🔌 Plugin system support with inter-plugin communication
- 🎯 Fine-grained control over chart lifecycle
- 💡 Lightweight and fast
- 💻 TypeScript support out of the box
- 🎨 Built-in plugins for tooltips, legends, cursor tracking, and series focusing
- 📱 Responsive sizing support with auto-resize capabilities

## 📦 Installation

```bash
npm install solid-js uplot @dschz/solid-uplot
pnpm install solid-js uplot @dschz/solid-uplot
yarn install solid-js uplot @dschz/solid-uplot
bun install solid-js uplot @dschz/solid-uplot
```

## 🎮 Live Demo

This repo ships with a **live, running playground** — a full showcase of every feature in the library. It's the fastest way to see `solid-uplot` in action and explore real, working examples of charts, plugins, responsive sizing, and external integrations.

### Running the Playground

```bash
git clone https://github.com/dsnchz/solid-uplot.git
cd solid-uplot

# Install dependencies
bun install

# Start the playground
bun dev
```

The playground runs at `http://localhost:3000` and includes interactive demos for:

- All built-in plugins (tooltip, legend, focus series) on top of the built-in cursor tracking
- Responsive and auto-resize chart patterns
- Custom plugin development
- External component integration via the plugin bus

## 📁 Package Structure

This package provides three main export paths for different functionality:

### `@dschz/solid-uplot`

Core components and plugin system:

```tsx
import { SolidUplot, createPluginBus } from "@dschz/solid-uplot";
import type {
  ChildrenPlacement,
  CursorPluginMessage,
  CursorPluginMessageBus,
  OnCreateMeta,
  OnCursorMoveParams,
  SolidUplotOptions,
  SolidUplotPlugin,
  SolidUplotPluginBus,
  SolidUplotProps,
  UplotPluginFactory,
  UplotPluginFactoryContext,
} from "@dschz/solid-uplot";
```

### `@dschz/solid-uplot/plugins`

**Cursor tracking is built in.** Cursor position is the core primitive every chart plugin builds on, so `SolidUplot` installs it on every chart, ahead of all other plugins. Every plugin — built in or your own — can read `bus.data.cursor` (see [Built-in Cursor Tracking](#built-in-cursor-tracking)). There is no plugin to add; its message types (`CursorPluginMessage`, `CursorPluginMessageBus`) are exported from `@dschz/solid-uplot`.

This export path provides three plugins:

- `focusSeries`: transmits which series are visually emphasized
- `tooltip`: plugin that allows you to present a custom JSX tooltip around the cursor
- `legend`: plugin that allows you to present a custom JSX component as your legend over the canvas drawing area.

```tsx
import { tooltip, legend, focusSeries } from "@dschz/solid-uplot/plugins";
import type {
  FocusSeriesPluginMessage,
  FocusSeriesPluginMessageBus,
  FocusSeriesPluginOptions,
  SeriesFocusTarget,
  TooltipProps,
  TooltipPluginOptions,
  TooltipCursorPlacement,
  LegendProps,
  LegendPluginOptions,
  LegendPlacement,
} from "@dschz/solid-uplot/plugins";
```

### `@dschz/solid-uplot/utils`

Some convenience utility functions for getting certain bits of data from a `uPlot` instance (except for `getColorString` which translates a series' `stroke` or `fill` into a color value).

```tsx
import {
  getSeriesData,
  getCursorData,
  getColorString,
  getNewCalendarDayIndices,
} from "@dschz/solid-uplot/utils";
import type { SeriesDatum, CursorData, GetSeriesDataOptions } from "@dschz/solid-uplot/utils";
```

## 🚀 Quick Start

```tsx
import { SolidUplot } from "@dschz/solid-uplot";
import { tooltip, legend } from "@dschz/solid-uplot/plugins";
import type { TooltipProps, LegendProps } from "@dschz/solid-uplot/plugins";

// Create a tooltip component
const MyTooltip = (props: TooltipProps) => (
  <div style={{ background: "white", padding: "8px", border: "1px solid #ccc" }}>
    <div>X: {props.cursor.xValue}</div>
    <For each={props.seriesData}>
      {(series) => {
        const value = props.u.data[series.seriesIdx]?.[props.cursor.idx];
        return (
          <div>
            {series.label}: {value}
          </div>
        );
      }}
    </For>
  </div>
);

// Create a legend component
const MyLegend = (props: LegendProps) => (
  <div style={{ background: "rgba(255,255,255,0.9)", padding: "8px" }}>
    <For each={props.seriesData}>
      {(series) => (
        <div style={{ display: "flex", "align-items": "center", gap: "4px" }}>
          <div
            style={{
              width: "12px",
              height: "12px",
              background: series.stroke,
            }}
          />
          <span>{series.label}</span>
        </div>
      )}
    </For>
  </div>
);

const MyChart = () => {
  return (
    <SolidUplot
      data={[
        [0, 1, 2, 3], // x values
        [10, 20, 30, 40], // y values for series 1
        [15, 25, 35, 45], // y values for series 2
      ]}
      width={600}
      height={400}
      series={[
        {},
        { label: "Series 1", stroke: "#1f77b4" },
        { label: "Series 2", stroke: "#ff7f0e" },
      ]}
      plugins={[tooltip(MyTooltip), legend(MyLegend, { placement: "top-right", pxOffset: 12 })]}
    />
  );
};
```

No plugin bus and no cursor plugin needed: every chart tracks the cursor itself and gives its plugins a bus of its own. Create a bus with `createPluginBus()` only to share it between charts or with components outside the chart (see [Plugin Bus Architecture](#plugin-bus-architecture)).

## 📏 Responsive Sizing

For responsive charts that automatically adapt to container size changes, use the `autoResize` prop:

```tsx
<div style={{ width: "100%", height: "400px" }}>
  <SolidUplot
    autoResize={true}
    data={data}
    series={series}
    // Chart will automatically resize to fill the container
  />
</div>
```

For more advanced responsive patterns, you can pair this library with [@dschz/solid-auto-sizer](https://github.com/dsnchz/solid-auto-sizer):

```bash
npm install @dschz/solid-auto-sizer
pnpm install @dschz/solid-auto-sizer
yarn install @dschz/solid-auto-sizer
bun install @dschz/solid-auto-sizer
```

```tsx
import { AutoSizer } from "@dschz/solid-auto-sizer";

<AutoSizer>
  {({ width, height }) => <SolidUplot width={width} height={height} data={data} />}
</AutoSizer>;
```

Alternatively, you can use [`createElementSize`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/resize-observer) from `@solid-primitives/resize-observer` for a signal-based approach:

```bash
npm install @solid-primitives/resize-observer
```

```tsx
import { createElementSize } from "@solid-primitives/resize-observer";

const ResponsiveChart = () => {
  let container!: HTMLDivElement;
  const size = createElementSize(() => container);

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <div ref={container} style={{ width: "100%", height: "100%" }}>
        <SolidUplot data={data} width={size.width ?? 0} height={size.height ?? 0} series={series} />
      </div>
    </div>
  );
};
```

## 🔌 Enhanced Plugin System

The cornerstone feature of `SolidUplot` is its refined plugin system that enables extensible functionality and inter-plugin communication through a reactive message bus.

### Plugin Bus Architecture

The Plugin Bus System enables plugins to communicate with each other and external components through a reactive store. This architecture provides:

- **Type-safe communication**: All plugin messages are fully typed
- **Reactive updates**: Changes in plugin state automatically trigger updates
- **Decoupled components**: Plugins can interact without direct dependencies
- **Extensible**: Easy to add new plugins that integrate with existing ones

Every chart has a bus. A chart without a `pluginBus` prop creates its own, so plugins work on a single chart with no setup. Create one with `createPluginBus()` and pass it as `pluginBus` only to share plugin state between charts (mirrored focus, synced tooltips; see [Synced Charts](#synced-charts)) or to read and write it from components outside the chart (see [External Component Integration](#external-component-integration)).

### Built-in Cursor Tracking

Cursor position is the core primitive: tooltips, focus and your own plugins all need it. So it is not a plugin you add — `SolidUplot` installs cursor tracking on every chart, before any other plugin, and publishes it on the bus as `bus.data.cursor` (a `CursorPluginMessage`):

```tsx
bus.data.cursor.sourceId; // id of the chart the pointer is over (undefined when over none)
bus.data.cursor.state[chartId]; // CursorData for that chart (undefined when not over a point)
```

- `sourceId`: the id of the chart the pointer is currently over; `undefined` when it is over none of the charts sharing the bus.
- `state[plotId]`: the `CursorData` of each chart on the bus, keyed by chart id (`u.root.id`: the chart's `id` prop, or a generated one). `CursorData` holds `plotId`, `idx` (closest data index), `xValue`, `position` (`left`/`top` in CSS pixels, relative to the plotting area) and `visible`.

`bus.data.cursor` is always defined (`createPluginBus()` seeds it with `{ state: {} }`), and because cursor tracking runs first, a plugin's `setCursor` hook already sees the position for the event being handled:

```tsx
import type { UplotPluginFactory } from "@dschz/solid-uplot";

const logCursor: UplotPluginFactory = ({ bus }) => ({
  hooks: {
    setCursor: (u) => {
      const cursor = bus.data.cursor.state[u.root.id]; // CursorData | undefined
      if (cursor) console.log(cursor.idx, cursor.xValue, cursor.position);
    },
  },
});
```

### Built-in Plugins

#### Focus Series Plugin

Highlights series based on cursor proximity:

```tsx
import { focusSeries } from "@dschz/solid-uplot/plugins";
import type { FocusSeriesPluginMessageBus } from "@dschz/solid-uplot/plugins";

const focusPlugin = focusSeries({
  pxThreshold: 15, // Distance threshold for focusing (default: 5)
});
```

#### Tooltip Plugin

Renders custom tooltips with automatic positioning and overflow handling:

```tsx
import { tooltip } from "@dschz/solid-uplot/plugins";
import type { TooltipProps } from "@dschz/solid-uplot/plugins";

const MyTooltip: Component<TooltipProps> = (props) => {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #ccc",
        padding: "8px",
        "border-radius": "4px",
        "box-shadow": "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ "font-weight": "bold", "margin-bottom": "8px" }}>X: {props.cursor.xValue}</div>
      <For each={props.seriesData}>
        {(series) => {
          const value = () => props.u.data[series.seriesIdx]?.[props.cursor.idx];
          return (
            <Show when={series.visible}>
              <div style={{ display: "flex", "align-items": "center", "margin-bottom": "4px" }}>
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    "border-radius": "50%",
                    "background-color": series.stroke,
                    "margin-right": "6px",
                  }}
                />
                <span style={{ color: series.stroke }}>
                  {series.label}: {value()?.toFixed(2)}
                </span>
              </div>
            </Show>
          );
        }}
      </For>
    </div>
  );
};

const tooltipPlugin = tooltip(MyTooltip, {
  placement: "top-left", // "top-left" | "top-right" | "bottom-left" | "bottom-right"
  zIndex: 20,
});
```

#### Legend Plugin

Adds customizable legends with smart positioning and interactive features:

```tsx
import { legend } from "@dschz/solid-uplot/plugins";
import type { LegendProps } from "@dschz/solid-uplot/plugins";

const MyLegend: Component<LegendProps> = (props) => {
  // Access cursor data for interactive features
  const cursorVisible = () => props.bus.data.cursor.state[props.u.root.id]?.visible;

  return (
    <div
      style={{
        background: "white",
        border: "1px solid #ddd",
        "border-radius": "4px",
        padding: "8px",
        "box-shadow": "0 2px 4px rgba(0,0,0,0.1)",
        // Dim when tooltip is active
        opacity: cursorVisible() ? 0.6 : 1,
        transition: "opacity 200ms",
      }}
    >
      <div style={{ "font-weight": "bold", "margin-bottom": "8px" }}>Legend</div>
      <For each={props.seriesData}>
        {(series) => (
          <Show when={series.visible}>
            <div
              style={{
                display: "flex",
                "align-items": "center",
                gap: "6px",
                "margin-bottom": "4px",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  "background-color": series.stroke,
                  "border-radius": "2px",
                }}
              />
              <span style={{ "font-size": "14px" }}>{series.label}</span>
            </div>
          </Show>
        )}
      </For>
    </div>
  );
};

const legendPlugin = legend(MyLegend, {
  placement: "top-left", // "top-left" | "top-right"
  pxOffset: 8, // Distance from chart edges (default: 8)
  zIndex: 10,
});
```

**Legend Plugin Features:**

- **Simple positioning**: Only top-left or top-right corners to avoid axis conflicts
- **Size-constrained**: Legend cannot exceed chart drawing area dimensions
- **Layout-agnostic**: You control internal layout and styling
- **Non-interfering**: Designed to work harmoniously with chart interactions
- **Plugin bus integration**: Access cursor and focus data for smart interactions
- **Automatic cleanup**: Proper memory management and DOM cleanup

### Plugin Bus Type Safety

When you create a bus yourself (to share it), type it with the message types of the plugins that use it. The cursor state is always included, so it never needs to be listed:

```tsx
import { createPluginBus } from "@dschz/solid-uplot";
import type { FocusSeriesPluginMessageBus } from "@dschz/solid-uplot/plugins";

// Create a bus that includes all plugin message types (cursor state is built in)
const bus = createPluginBus<FocusSeriesPluginMessageBus>();

const MyChart = () => {
  return (
    <SolidUplot
      data={data}
      series={series}
      pluginBus={bus}
      plugins={[focusSeries(), tooltip(MyTooltip), legend(MyLegend)]}
    />
  );
};
```

### Creating Custom Plugins

The plugin system is open to extension. When authoring plugins for public consumption, follow this pattern:

```tsx
import type { UplotPluginFactory } from "@dschz/solid-uplot";

// 1. Define your plugin's message type
export type MyPluginMessage = {
  value: number;
  timestamp: number;
};

// 2. Define your plugin's message bus
export type MyPluginMessageBus = {
  myPlugin?: MyPluginMessage;
};

// 3. Export your plugin factory. Every chart passes a bus, and `bus.data.cursor` is
// always there, so the plugin needs no bus check and no cursor type.
export const myPlugin = (options = {}): UplotPluginFactory<MyPluginMessageBus> => {
  return ({ bus }) => ({
    hooks: {
      ready: () => {
        // Initialize plugin state
        bus.setData("myPlugin", { value: 0, timestamp: Date.now() });
      },
      setCursor: (u) => {
        // The built-in cursor state is current for this event
        const cursor = bus.data.cursor.state[u.root.id];
        if (!cursor) return;

        // Solid store path setters: derive a field from its previous value, or merge an object
        bus.setData("myPlugin", "value", (prev) => prev + 1);
        bus.setData("myPlugin", { timestamp: Date.now() });
      },
      destroy: () => {
        // Clear plugin state
        bus.setData("myPlugin", undefined);
      },
    },
  });
};
```

Use it like a built-in plugin; a single chart needs no bus: `<SolidUplot data={data} series={series} plugins={[myPlugin()]} />`. To read `bus.data.myPlugin` from outside the chart, create the bus with `createPluginBus<MyPluginMessageBus>()` and pass it as `pluginBus`.

### App Context in Plugin UI

Tooltip and legend components render under the `<SolidUplot>` component's owner, so `useContext` inside them sees your app's providers (theme, i18n, stores, ...) like any other child component.

Plugin factories receive that owner as `ctx.owner`. A custom plugin that mounts Solid UI renders it under the owner to get the same behavior:

```tsx
import { runWithOwner } from "solid-js";
import { render } from "solid-js/web";
import type { UplotPluginFactory } from "@dschz/solid-uplot";

export const overlay = (): UplotPluginFactory => {
  return ({ owner }) => {
    let dispose: (() => void) | undefined;

    return {
      hooks: {
        ready: (u) => {
          // <MyOverlay /> can call useContext and see the app's providers
          dispose = runWithOwner(owner ?? null, () => render(() => <MyOverlay />, u.over));
        },
        destroy: () => {
          dispose?.();
        },
      },
    };
  };
};
```

### External Component Integration

The plugin bus enables powerful integrations between charts and external components. When a component outside the chart reads or writes plugin state, create the bus yourself and pass it to both:

```tsx
import { createPluginBus } from "@dschz/solid-uplot";
import type { FocusSeriesPluginMessageBus } from "@dschz/solid-uplot/plugins";

// Created outside the chart so DataGrid can write to it
const bus = createPluginBus<FocusSeriesPluginMessageBus>();

// External component that can trigger series focus
const DataGrid = (props: { bus: typeof bus }) => {
  const handleRowHover = (seriesLabel: string) => {
    props.bus.setData("focusSeries", {
      sourceId: "data-grid",
      targets: [{ label: seriesLabel }],
    });
  };

  return <table>{/* Grid implementation */}</table>;
};

// Chart and grid interact through shared bus
const MyDashboard = () => {
  return (
    <div>
      <DataGrid bus={bus} />
      <SolidUplot data={data} series={series} pluginBus={bus} plugins={[focusSeries()]} />
    </div>
  );
};
```

## 🔧 API Reference

### SolidUplot Component

```tsx
type SolidUplotEvents = {
  /** Callback fired when the uPlot instance is created */
  readonly onCreate?: (u: uPlot, meta: OnCreateMeta) => void;
  /** Callback fired when the cursor moves */
  readonly onCursorMove?: (params: OnCursorMoveParams) => void;
};

// Main component props (extends all uPlot.Options except plugins, width, height)
type SolidUplotProps<T extends Record<string, unknown> = Record<string, unknown>> =
  SolidUplotOptions<T> &
    SolidUplotEvents & {
      // Ref callback to access the chart container element
      ref?: Ref<HTMLDivElement>;

      // CSS class name for the chart container (default: "solid-uplot")
      // Additional classes will be appended to the default class
      class?: string;

      // CSS styles for the chart container (position is managed internally)
      style?: Omit<JSX.CSSProperties, "position">;

      // Enable automatic resizing to fit container (default: false)
      autoResize?: boolean;

      // Whether to reset scales when chart data is updated (default: true)
      resetScales?: boolean;

      // Where to place children components relative to the chart (default: "top")
      childrenPlacement?: "top" | "bottom";
    };

// Configuration options extending uPlot.Options with SolidJS enhancements
type SolidUplotOptions<T extends Record<string, unknown> = Record<string, unknown>> = Omit<
  uPlot.Options,
  "plugins" | "width" | "height" | "data"
> & {
  // Chart dimensions
  width?: number; // default: 600
  height?: number; // default: 300

  // Chart data
  data?: uPlot.AlignedData | number[][];

  // Plugin configuration
  plugins?: SolidUplotPlugin<T>[];
  // Optional: omit it and the chart uses its own bus. Pass one to share plugin
  // state between charts or with components outside the chart.
  pluginBus?: SolidUplotPluginBus<T>;
};

// Plugin type (can be standard uPlot plugin or factory function)
type SolidUplotPlugin<T extends Record<string, unknown> = Record<string, unknown>> =
  | uPlot.Plugin
  | UplotPluginFactory<T>;
```

### Plugin Bus

```tsx
// Plugin bus: a Solid store. Every bus carries the built-in cursor state on top of T.
type SolidUplotPluginBus<T extends Record<string, unknown> = Record<string, unknown>> = {
  readonly data: Store<T & CursorPluginMessageBus>;
  readonly setData: SetStoreFunction<T & CursorPluginMessageBus>;
};

// Create a plugin bus (seeded with `cursor: { state: {} }`)
const createPluginBus: <T extends Record<string, unknown> = Record<string, unknown>>(
  initialData?: Omit<T, "cursor"> & Partial<CursorPluginMessageBus>,
) => SolidUplotPluginBus<T>;

// Built-in cursor state, at `bus.data.cursor`
type CursorPluginMessage = {
  sourceId?: string; // id of the chart the pointer is over
  state: { [plotId: string]: CursorData | undefined };
};

type CursorPluginMessageBus = { cursor: CursorPluginMessage };

// Context passed to every plugin factory
type UplotPluginFactoryContext<T extends Record<string, unknown> = Record<string, unknown>> = {
  // The `pluginBus` prop, or the chart's own bus when none is passed. Always defined.
  readonly bus: SolidUplotPluginBus<T>;
  // Owner of the <SolidUplot> component: mount plugin UI under it to see app context
  readonly owner?: Owner | null;
};

// Plugin factory: receives the context, returns a standard uPlot plugin
type UplotPluginFactory<T extends Record<string, unknown> = Record<string, unknown>> = (
  ctx: UplotPluginFactoryContext<T>,
) => uPlot.Plugin;
```

### Built-in Plugin Options

```tsx
// Focus Series Plugin
const focusSeries = (
  options?: FocusSeriesPluginOptions,
): UplotPluginFactory<FocusSeriesPluginMessageBus>;

type FocusSeriesPluginOptions = {
  pxThreshold?: number; // default: 5
  unfocusedAlpha?: number; // default: 0.1
  focusedAlpha?: number; // default: 1
  rebuildPaths?: boolean; // default: false
  // Extra redraw condition for the charts that are not the cursor source
  shouldRedrawOnBusUpdate?: (params: {
    u: uPlot;
    cursor: CursorPluginMessage;
    focusSeries: FocusSeriesPluginMessage | undefined;
  }) => boolean;
};

// Tooltip Plugin
const tooltip = (
  Component: Component<TooltipProps>,
  options?: TooltipPluginOptions,
): UplotPluginFactory<FocusSeriesPluginMessageBus>;

type TooltipCursorPlacement = "top-left" | "top-right" | "bottom-left" | "bottom-right";

type TooltipPluginOptions = {
  placement?: TooltipCursorPlacement; // default: "top-left"
  fixed?: boolean; // fixed positioning, for charts in dialogs/modals (default: false)
  onPositionCalculated?: (
    position: { left: number; top: number },
    placement: TooltipCursorPlacement,
  ) => { left: number; top: number };
  id?: string; // default: "solid-uplot-tooltip-root"
  class?: string;
  style?: JSX.CSSProperties;
  zIndex?: number; // default: 20
};

type TooltipProps = {
  u: uPlot;
  cursor: CursorData;
  seriesData: SeriesDatum[];
  focusedSeries?: FocusSeriesPluginMessage;
};

// Legend Plugin
const legend = (
  Component: Component<LegendProps>,
  options?: LegendPluginOptions,
): UplotPluginFactory<FocusSeriesPluginMessageBus>;

type LegendPlacement = "top-left" | "top-right";

type LegendPluginOptions = {
  placement?: LegendPlacement; // default: "top-left"
  pxOffset?: number; // default: 8
  id?: string; // default: "solid-uplot-legend-root"
  class?: string;
  style?: JSX.CSSProperties;
  zIndex?: number; // default: 10
};

type LegendProps = {
  u: uPlot;
  seriesData: SeriesDatum[];
  bus: SolidUplotPluginBus<FocusSeriesPluginMessageBus>;
};
```

## 📚 Examples

### Basic Chart

```tsx
import { SolidUplot } from "@dschz/solid-uplot";

const BasicChart = () => {
  return (
    <SolidUplot
      data={[
        [0, 1, 2, 3],
        [10, 20, 30, 40],
        [15, 25, 35, 45],
      ]}
      width={600}
      height={400}
      scales={{
        x: { time: false },
      }}
      series={[
        {},
        { label: "Series 1", stroke: "#1f77b4" },
        { label: "Series 2", stroke: "#ff7f0e" },
      ]}
    />
  );
};
```

### Chart with All Plugins

```tsx
import { SolidUplot } from "@dschz/solid-uplot";
import { tooltip, legend, focusSeries } from "@dschz/solid-uplot/plugins";
import type { TooltipProps, LegendProps } from "@dschz/solid-uplot/plugins";

const MyTooltip: Component<TooltipProps> = (props) => (
  <div style={{ background: "white", padding: "8px", border: "1px solid #ccc" }}>
    <div>Time: {new Date(props.cursor.xValue * 1000).toLocaleTimeString()}</div>
    <For each={props.seriesData}>
      {(series) => {
        const value = props.u.data[series.seriesIdx]?.[props.cursor.idx];
        return (
          <div style={{ color: series.stroke }}>
            {series.label}: {value?.toFixed(2)}
          </div>
        );
      }}
    </For>
  </div>
);

const MyLegend: Component<LegendProps> = (props) => {
  const cursorVisible = () => props.bus.data.cursor.state[props.u.root.id]?.visible;

  return (
    <div
      style={{
        background: "white",
        border: "1px solid #ddd",
        padding: "8px",
        opacity: cursorVisible() ? 0.6 : 1,
        transition: "opacity 200ms",
      }}
    >
      <For each={props.seriesData}>
        {(series) => (
          <div style={{ display: "flex", "align-items": "center", gap: "6px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                background: series.stroke,
              }}
            />
            <span>{series.label}</span>
          </div>
        )}
      </For>
    </div>
  );
};

// A single chart needs no plugin bus: it creates its own
const FullFeaturedChart = () => {
  return (
    <SolidUplot
      data={[
        [0, 1, 2, 3, 4, 5],
        [10, 20, 30, 40, 50, 60],
        [15, 25, 35, 45, 55, 65],
        [5, 15, 25, 35, 45, 55],
      ]}
      width={800}
      height={500}
      series={[
        {},
        { label: "Revenue", stroke: "#1f77b4" },
        { label: "Profit", stroke: "#ff7f0e" },
        { label: "Expenses", stroke: "#2ca02c" },
      ]}
      plugins={[
        focusSeries({ pxThreshold: 20 }),
        tooltip(MyTooltip, { placement: "top-right" }),
        legend(MyLegend, { placement: "top-left", pxOffset: 12 }),
      ]}
    />
  );
};
```

### Responsive Chart

```tsx
const ResponsiveChart = () => {
  return (
    <div style={{ width: "100%", height: "400px", border: "1px solid #ccc" }}>
      <SolidUplot autoResize={true} data={data} series={series} plugins={[tooltip(MyTooltip)]} />
    </div>
  );
};
```

### External Integration

```tsx
const Dashboard = () => {
  // Created by the app, not the chart, so the buttons below can write focus to it
  const bus = createPluginBus<FocusSeriesPluginMessageBus>();

  const handleSeriesToggle = (seriesLabel: string) => {
    bus.setData("focusSeries", {
      sourceId: "external-control",
      targets: [{ label: seriesLabel }],
    });
  };

  return (
    <div>
      <div>
        <button onClick={() => handleSeriesToggle("Series 1")}>Focus Series 1</button>
        <button onClick={() => handleSeriesToggle("Series 2")}>Focus Series 2</button>
      </div>
      <SolidUplot data={data} series={series} plugins={[focusSeries()]} pluginBus={bus} />
    </div>
  );
};
```

### Synced Charts

Charts that share a bus share plugin state: hovering one chart focuses the same series in all of them. Pair the shared bus with uPlot's cursor sync so every chart's cursor (and tooltip) follows along:

```tsx
import { SolidUplot, createPluginBus } from "@dschz/solid-uplot";
import { focusSeries, tooltip } from "@dschz/solid-uplot/plugins";
import type { FocusSeriesPluginMessageBus } from "@dschz/solid-uplot/plugins";

const SyncedCharts = () => {
  // One bus for both charts, so focus is mirrored across them
  const bus = createPluginBus<FocusSeriesPluginMessageBus>();
  const plugins = [focusSeries(), tooltip(MyTooltip)];
  const cursor = { sync: { key: "dashboard" } };

  return (
    <div>
      <SolidUplot
        data={cpuData}
        series={series}
        cursor={cursor}
        pluginBus={bus}
        plugins={plugins}
      />
      <SolidUplot
        data={memoryData}
        series={series}
        cursor={cursor}
        pluginBus={bus}
        plugins={plugins}
      />
    </div>
  );
};
```

## 🔄 Migrating from 0.5.x

**`cursor()` is gone: cursor tracking is built in.** Cursor position is the core primitive every other plugin reads, so `SolidUplot` now installs it on every chart, ahead of all other plugins, instead of relying on you to add it (and add it first).

- Delete `cursor()` from your `plugins` arrays; the import no longer exists.
- Import `CursorPluginMessage` / `CursorPluginMessageBus` from `@dschz/solid-uplot` (they were in `@dschz/solid-uplot/plugins`). You rarely need them: every bus type includes the cursor state, so `createPluginBus<CursorPluginMessageBus & FocusSeriesPluginMessageBus>()` becomes `createPluginBus<FocusSeriesPluginMessageBus>()`.
- `bus.data.cursor` is always defined; drop `?.` and `if (bus.data.cursor)` checks.
- `pluginBus` is optional: a chart without one uses its own, so `tooltip()`, `legend()` and `focusSeries()` work on a single chart with no bus. Keep passing a bus to share it between charts or with components outside the chart.
- Plugin factories always receive a bus (`ctx.bus` is no longer optional), so custom plugins can drop their `if (!bus)` guards. `SolidUplotPluginBus<T>` is a named type now (was `ReturnType<typeof createPluginBus<T>>`), and its `data` / `setData` are typed `T & CursorPluginMessageBus`.
- `FocusSeriesPluginOptions` is no longer generic: drop its type argument.

```tsx
// 0.5.x
const bus = createPluginBus<CursorPluginMessageBus & FocusSeriesPluginMessageBus>();
<SolidUplot
  data={data}
  series={series}
  pluginBus={bus}
  plugins={[cursor(), focusSeries(), tooltip(MyTooltip)]}
/>;

// 0.6.x: no cursor(), and a single chart needs no bus
<SolidUplot data={data} series={series} plugins={[focusSeries(), tooltip(MyTooltip)]} />;
```

**New in this release**: app context inside tooltip and legend components and `ctx.owner` for custom plugins (see [App Context in Plugin UI](#app-context-in-plugin-ui)), the exported props and plugin option types, and the `./plugins` and `./utils` entry points on JSR.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

Also check out the [Discord](https://discord.gg/6wkpXQCNn6) community.

## 📄 License

MIT
