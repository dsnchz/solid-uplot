<p align="center">
  <img src="https://assets.solidjs.com/banner?project=solid-uplot&type=Ecosystem&background=tiles" alt="@dschz/solid-uplot banner" />
</p>

# @dschz/solid-uplot

[![SolidJS](https://img.shields.io/badge/SolidJS-≥1.6.0-2c4f7c?logo=solid&logoColor=c8c9cb)](https://www.solidjs.com)
[![uPlot](https://img.shields.io/badge/uPlot-%3E%3D1.6.32-orange)](https://github.com/leeoniya/uPlot)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue)](https://www.typescriptlang.org)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@dschz/solid-uplot)](https://bundlephobia.com/package/@dschz/solid-uplot)
[![npm](https://img.shields.io/npm/v/@dschz/solid-uplot)](https://www.npmjs.com/package/@dschz/solid-uplot)

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

## 📁 Package Structure

This package provides three main export paths for different functionality:

### `@dschz/solid-uplot`

Core components and plugin system:

```tsx
import { SolidUplot, createPluginBus } from "@dschz/solid-uplot";
import type { PluginFactory, SolidUplotPluginBus } from "@dschz/solid-uplot";
```

### `@dschz/solid-uplot/plugins`

This export path provides four plugins (three of which can be considered primitives).

- `cursor`: transmits cursor position data
- `focusSeries`: transmits which series are visually emphasized
- `tooltip`: plugin that allows you to present a custom JSX tooltip around the cursor
- `legend`: plugin that allows you to present a custom JSX component as your legend over the canvas drawing area.

```tsx
import { cursor, tooltip, legend, focusSeries } from "@dschz/solid-uplot/plugins";
import type {
  CursorPluginMessageBus,
  FocusSeriesPluginMessageBus,
  TooltipProps,
  LegendProps,
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
import type { SeriesDatum, CursorData } from "@dschz/solid-uplot/utils";
```

## 🚀 Quick Start

```tsx
import { SolidUplot, createPluginBus } from "@dschz/solid-uplot";
import { cursor, tooltip, legend } from "@dschz/solid-uplot/plugins";
import type { CursorPluginMessageBus, TooltipProps, LegendProps } from "@dschz/solid-uplot/plugins";

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
  const bus = createPluginBus<CursorPluginMessageBus>();

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
      plugins={[
        cursor(),
        tooltip(MyTooltip),
        legend(MyLegend, { placement: "top-right", pxOffset: 12 }),
      ]}
      pluginBus={bus}
    />
  );
};
```

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

## 🔌 Enhanced Plugin System

The cornerstone feature of `SolidUplot` is its refined plugin system that enables extensible functionality and inter-plugin communication through a reactive message bus.

### Plugin Bus Architecture

The Plugin Bus System enables plugins to communicate with each other and external components through a reactive store. This architecture provides:

- **Type-safe communication**: All plugin messages are fully typed
- **Reactive updates**: Changes in plugin state automatically trigger updates
- **Decoupled components**: Plugins can interact without direct dependencies
- **Extensible**: Easy to add new plugins that integrate with existing ones

### Built-in Plugins

#### Cursor Plugin

Tracks cursor position and interaction state across charts:

```tsx
import { cursor } from "@dschz/solid-uplot/plugins";
import type { CursorPluginMessageBus } from "@dschz/solid-uplot/plugins";

const cursorPlugin = cursor();
```

The cursor plugin provides cursor position data that other plugins can consume through the bus.

#### Focus Series Plugin

Highlights series based on cursor proximity:

```tsx
import { focusSeries } from "@dschz/solid-uplot/plugins";
import type { FocusSeriesPluginMessageBus } from "@dschz/solid-uplot/plugins";

const focusPlugin = focusSeries({
  pxThreshold: 15, // Distance threshold for focusing (default: 15)
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
  const cursorVisible = () => props.bus.data.cursor?.state[props.u.root.id]?.visible;

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

When using multiple plugins, ensure type safety by properly typing the plugin bus:

```tsx
import { createPluginBus } from "@dschz/solid-uplot";
import type {
  CursorPluginMessageBus,
  FocusSeriesPluginMessageBus,
} from "@dschz/solid-uplot/plugins";

// Create a bus that includes all plugin message types
const bus = createPluginBus<CursorPluginMessageBus & FocusSeriesPluginMessageBus>();

const MyChart = () => {
  return (
    <SolidUplot
      data={data}
      pluginBus={bus}
      plugins={[cursor(), focusSeries(), tooltip(MyTooltip), legend(MyLegend)]}
    />
  );
};
```

### Creating Custom Plugins

The plugin system is open to extension. When authoring plugins for public consumption, follow this pattern:

```tsx
import type { PluginFactory } from "@dschz/solid-uplot";
import type { CursorPluginMessageBus } from "@dschz/solid-uplot/plugins";

// 1. Define your plugin's message type
export type MyPluginMessage = {
  value: number;
  timestamp: number;
};

// 2. Define your plugin's message bus
export type MyPluginMessageBus = {
  myPlugin?: MyPluginMessage;
};

// 3. Export your plugin factory
export const myPlugin = (
  options = {},
): PluginFactory<CursorPluginMessageBus & MyPluginMessageBus> => {
  return ({ bus }) => {
    if (!bus) {
      console.warn("[my-plugin]: A plugin bus is required");
      return { hooks: {} };
    }

    return {
      hooks: {
        ready: (u) => {
          // Initialize plugin state
          bus.setData("myPlugin", {
            value: 0,
            timestamp: Date.now(),
          });
        },
        setData: (u) => {
          // Update plugin state
          bus.setData("myPlugin", "value", (prev) => prev + 1);
        },
      },
    };
  };
};
```

### External Component Integration

The plugin bus enables powerful integrations between charts and external components:

```tsx
import { createPluginBus } from "@dschz/solid-uplot";
import type { FocusSeriesPluginMessageBus } from "@dschz/solid-uplot/plugins";

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
      <SolidUplot data={data} pluginBus={bus} plugins={[focusSeries()]} />
    </div>
  );
};
```

## 🔧 API Reference

### SolidUplot Component

```tsx
type SolidUplotProps<T extends VoidStruct = VoidStruct> = {
  // Chart data (required)
  data: uPlot.AlignedData;

  // Chart dimensions
  width?: number; // default: 600
  height?: number; // default: 300

  // Responsive sizing
  autoResize?: boolean; // default: false

  // Plugin configuration
  plugins?: SolidUplotPlugin<T>[];
  pluginBus?: SolidUplotPluginBus<T>;

  // Chart options (all uPlot.Options except plugins, width, height)
  series?: uPlot.Series[];
  scales?: uPlot.Scales;
  axes?: uPlot.Axis[];
  // ... other uPlot options

  // Chart behavior
  resetScales?: boolean; // default: true

  // Callbacks
  onCreate?: (u: uPlot, meta: { seriesData: SeriesDatum[] }) => void;

  // Container styling
  style?: JSX.CSSProperties;
  class?: string;
  id?: string;
  ref?: (el: HTMLDivElement) => void;

  // Children placement
  childrenPlacement?: "top" | "bottom"; // default: "top"
};
```

### Plugin Bus

```tsx
type SolidUplotPluginBus<T extends VoidStruct = VoidStruct> = {
  data: T;
  setData: <K extends keyof T>(key: K, value: T[K]) => void;
  setData: <K extends keyof T, P extends keyof T[K]>(
    key: K,
    path: P,
    value: T[K][P]
  ) => void;
};

// Create a plugin bus
const createPluginBus = <T extends VoidStruct = VoidStruct>(
  initialData?: Partial<T>
): SolidUplotPluginBus<T>;
```

### Built-in Plugin Options

```tsx
// Cursor Plugin
const cursor = (): PluginFactory<CursorPluginMessageBus>;

// Focus Series Plugin
const focusSeries = (options?: {
  pxThreshold?: number; // default: 15
}): PluginFactory<CursorPluginMessageBus & FocusSeriesPluginMessageBus>;

// Tooltip Plugin
const tooltip = (
  Component: Component<TooltipProps>,
  options?: {
    placement?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    id?: string;
    class?: string;
    style?: JSX.CSSProperties;
    zIndex?: number; // default: 20
  }
): PluginFactory<CursorPluginMessageBus & FocusSeriesPluginMessageBus>;

// Legend Plugin
const legend = (
  Component: Component<LegendProps>,
  options?: {
    placement?: "top-left" | "top-right"; // default: "top-left"
    pxOffset?: number; // default: 8
    id?: string;
    class?: string;
    style?: JSX.CSSProperties;
    zIndex?: number; // default: 10
  }
): PluginFactory<CursorPluginMessageBus & FocusSeriesPluginMessageBus>;
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
import { SolidUplot, createPluginBus } from "@dschz/solid-uplot";
import { cursor, tooltip, legend, focusSeries } from "@dschz/solid-uplot/plugins";
import type {
  CursorPluginMessageBus,
  FocusSeriesPluginMessageBus,
  TooltipProps,
  LegendProps,
} from "@dschz/solid-uplot/plugins";

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
  const cursorVisible = () => props.bus.data.cursor?.state[props.u.root.id]?.visible;

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

const FullFeaturedChart = () => {
  const bus = createPluginBus<CursorPluginMessageBus & FocusSeriesPluginMessageBus>();

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
        cursor(),
        focusSeries({ pxThreshold: 20 }),
        tooltip(MyTooltip, { placement: "top-right" }),
        legend(MyLegend, { placement: "top-left", pxOffset: 12 }),
      ]}
      pluginBus={bus}
    />
  );
};
```

### Responsive Chart

```tsx
const ResponsiveChart = () => {
  return (
    <div style={{ width: "100%", height: "400px", border: "1px solid #ccc" }}>
      <SolidUplot
        autoResize={true}
        data={data}
        series={series}
        plugins={[cursor(), tooltip(MyTooltip)]}
      />
    </div>
  );
};
```

### External Integration

```tsx
const Dashboard = () => {
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
      <SolidUplot data={data} plugins={[focusSeries()]} pluginBus={bus} />
    </div>
  );
};
```

## 🎮 Interactive Playground

This library includes a comprehensive playground application that demonstrates all features and provides interactive examples. The playground showcases:

- **Basic Charts**: Simple line charts with different configurations
- **Plugin Examples**: All built-in plugins working together
- **Legend Showcase**: Various legend patterns and interactions
- **Responsive Sizing**: Auto-resize and manual sizing examples
- **Custom Plugins**: Examples of creating your own plugins
- **External Integration**: Charts interacting with external components

### Running the Playground Locally

To explore the playground and see the library in action:

```bash
# Clone the repository
git clone https://github.com/dsnchz/solid-uplot.git
cd solid-uplot

# Install dependencies
npm install
# or
pnpm install
# or
yarn install
# or
bun install

# Start the playground development server
npm run start
# or
pnpm start
# or
yarn start
# or
bun start
```

The playground will be available at `http://localhost:3000` and includes:

- **Live code examples** with syntax highlighting
- **Interactive demos** you can modify in real-time
- **Performance comparisons** between different configurations
- **Best practices** and common patterns
- **Plugin development examples** with step-by-step guides

The playground source code also serves as a comprehensive reference for implementing various chart patterns and plugin combinations.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT
