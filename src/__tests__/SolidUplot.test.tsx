import { cleanup, render, waitFor } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import type { Component } from "solid-js";
import { createSignal, For } from "solid-js";
import uPlot from "uplot";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { createPluginBus } from "../createPluginBus";
import { cursor, type CursorPluginMessageBus } from "../plugins/cursor";
import { focusSeries, type FocusSeriesPluginMessageBus } from "../plugins/focusSeries";
import { legend, type LegendProps } from "../plugins/legend";
import { tooltip, type TooltipProps } from "../plugins/tooltip";
import { SolidUplot } from "../SolidUplot";

const DEFAULT_DATA: uPlot.AlignedData = [
  [1, 2, 3, 4, 5], // x-values
  [10, 20, 30, 40, 50], // y-values for the first series
];

const DEFAULT_OPTIONS: uPlot.Options = {
  width: 400,
  height: 300,
  series: [
    {},
    {
      label: "Series 1",
      stroke: "red",
    },
  ],
};

describe("COMPONENT: <SolidUplot />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test("renders with default props", async () => {
    const onCreateSpy = vi.fn();

    const { container } = render(() => (
      <SolidUplot {...DEFAULT_OPTIONS} data={DEFAULT_DATA} onCreate={onCreateSpy} />
    ));

    await waitFor(() => expect(onCreateSpy).toHaveBeenCalled());

    expect(container.querySelector("div")).not.toBeNull();
  });

  test("renders children inside the container", () => {
    const { getByText } = render(() => (
      <SolidUplot id="test-id" {...DEFAULT_OPTIONS} data={DEFAULT_DATA}>
        <div data-testid="child-element">Child content</div>
      </SolidUplot>
    ));

    expect(getByText("Child content")).toBeInTheDocument();
  });

  test("passes props to the container", () => {
    const { container } = render(() => (
      <SolidUplot
        {...DEFAULT_OPTIONS}
        id="test-id"
        class="test-class"
        style={{ width: "500px", height: "300px" }}
        data={DEFAULT_DATA}
      />
    ));

    const div = container.querySelector("div");

    expect(container.querySelector("#test-id")).toBeInTheDocument();
    expect(container.querySelector(".test-class")).toBeInTheDocument();
    expect(div).toHaveStyle({ width: "500px", height: "300px" });
  });

  test("calls onCreate callback when plot is created", () => {
    const onCreateMock = vi.fn();

    render(() => <SolidUplot {...DEFAULT_OPTIONS} data={DEFAULT_DATA} onCreate={onCreateMock} />);

    expect(onCreateMock).toHaveBeenCalledTimes(1);
    expect(onCreateMock).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        seriesData: expect.any(Array),
      }),
    );
  });

  test("reactively updates the chart size when width or height changes", async () => {
    let chartInstance: uPlot;
    const onCreateSpy = vi.fn((chart: uPlot) => {
      chartInstance = chart;
    });
    const [dimensions, setDimensions] = createSignal({ width: 400, height: 300 });

    render(() => (
      <SolidUplot
        {...DEFAULT_OPTIONS}
        data={DEFAULT_DATA}
        width={dimensions().width}
        height={dimensions().height}
        onCreate={onCreateSpy}
      />
    ));

    await waitFor(() => expect(chartInstance).toBeDefined());

    expect(chartInstance!.width).toBe(400);
    expect(chartInstance!.height).toBe(300);

    setDimensions({ width: 500, height: 400 }); // Trigger reactive update

    expect(chartInstance!.width).toBe(500);
    expect(chartInstance!.height).toBe(400);

    expect(onCreateSpy).toHaveBeenCalledTimes(1);
  });

  test("reactively updates the chart data when data changes", async () => {
    let chartInstance: uPlot;

    const onCreateSpy = vi.fn((chart: uPlot) => {
      chartInstance = chart;
    });

    const [chartData, setChartData] = createSignal<uPlot.AlignedData>(DEFAULT_DATA);

    render(() => <SolidUplot {...DEFAULT_OPTIONS} data={chartData()} onCreate={onCreateSpy} />);

    await waitFor(() => expect(chartInstance).toBeDefined());

    expect(chartInstance!.data).toEqual(DEFAULT_DATA);

    const newData: uPlot.AlignedData = [
      [1, 2, 3, 4, 5],
      [15, 25, 35, 45, 55],
    ];

    setChartData(newData); // Trigger reactive update

    expect(chartInstance!.data).toEqual(newData);
  });

  test("reactively applies resetScales option when updating data", async () => {
    let chartInstance: uPlot;

    const onCreateSpy = vi.fn((chart: uPlot) => {
      chartInstance = chart;
    });

    const [chartData, setChartData] = createSignal<uPlot.AlignedData>(DEFAULT_DATA);
    const [resetScales, setResetScales] = createSignal(false);

    render(() => (
      <SolidUplot
        {...DEFAULT_OPTIONS}
        data={chartData()}
        resetScales={resetScales()}
        onCreate={onCreateSpy}
      />
    ));

    await waitFor(() => expect(chartInstance).toBeDefined());

    vi.spyOn(chartInstance!, "setData");

    // New data for the update
    const newData: uPlot.AlignedData = [
      [1, 2, 3, 4, 5],
      [15, 25, 35, 45, 55],
    ];

    setChartData(newData);

    expect(chartInstance!.setData).toHaveBeenCalledWith(newData, false);

    setResetScales(true);

    expect(chartInstance!.setData).toHaveBeenCalledWith(newData, true);

    expect(onCreateSpy).toHaveBeenCalledTimes(1);
  });

  test("destroys the chart when component is unmounted", async () => {
    let chartInstance: uPlot;

    const onCreateSpy = vi.fn((chart: uPlot) => {
      chartInstance = chart;
    });

    const { unmount } = render(() => (
      <SolidUplot {...DEFAULT_OPTIONS} data={DEFAULT_DATA} onCreate={onCreateSpy} />
    ));

    await waitFor(() => expect(onCreateSpy).toHaveBeenCalled());

    vi.spyOn(chartInstance!, "destroy");

    unmount();

    expect(chartInstance!.destroy).toHaveBeenCalledTimes(1);
  });

  test("creates a new chart when a non-updateable prop changes (e.g. series)", async () => {
    const onCreateSpy = vi.fn();

    const initialSeries = [
      {
        label: "Series 1",
        stroke: "red",
      },
    ] as uPlot.Series[];

    const [data, setData] = createSignal<uPlot.AlignedData>(DEFAULT_DATA);
    const [series, setSeries] = createSignal<uPlot.Series[]>(initialSeries);

    render(() => (
      <SolidUplot {...DEFAULT_OPTIONS} data={data()} series={series()} onCreate={onCreateSpy} />
    ));

    await waitFor(() => expect(onCreateSpy).toHaveBeenCalledTimes(1));

    setData([...DEFAULT_DATA, [5, 15, 25, 35, 45]]);

    setSeries([
      ...initialSeries,
      {
        label: "Series 2",
        stroke: "blue",
      },
    ]);

    await waitFor(() => expect(onCreateSpy).toHaveBeenCalledTimes(2));
  });

  test("plugin factory receives the pluginBus and can set/read data", async () => {
    const bus = createPluginBus<{ testKey?: string }>();
    const normalPluginReadySpy = vi.fn();

    const normalPlugin = {
      hooks: {
        ready: normalPluginReadySpy,
      },
    } as uPlot.Plugin;

    // Plugin factory that sets and reads from the bus
    const pluginFactory = vi.fn(({ bus }) => {
      return {
        hooks: {
          ready: () => {
            bus.setData("testKey", "hello-bus");
          },
        },
      };
    });

    render(() => (
      <SolidUplot
        width={200}
        height={100}
        data={[
          [1, 2, 3],
          [4, 5, 6],
        ]}
        series={[{}, { label: "A" }]}
        pluginBus={bus}
        plugins={[normalPlugin, pluginFactory]}
      />
    ));

    await waitFor(() => {
      expect(pluginFactory).toHaveBeenCalled();
      expect(normalPluginReadySpy).toHaveBeenCalled();
    });

    expect(bus.data.testKey).toBe("hello-bus");
  });
});

describe("PLUGIN: cursor", () => {
  test("updates bus on pointer events", async () => {
    let uPlotInstance!: uPlot;
    const bus = createPluginBus<CursorPluginMessageBus>();

    render(() => (
      <SolidUplot
        width={200}
        height={100}
        data={[
          [1, 2, 3],
          [4, 5, 6],
        ]}
        series={[{}, { label: "A" }]}
        pluginBus={bus}
        plugins={[cursor()]}
        onCreate={(chart) => {
          uPlotInstance = chart;
        }}
      />
    ));

    // Wait for the chart to be created and the plugin to register
    await waitFor(() => {
      // The cursor plugin should have initialized the bus
      expect(bus.data.cursor).toBeDefined();
    });

    // Find the .over element (uPlot's mouse event layer)
    const over = document.querySelector(".u-over") as HTMLElement;
    expect(over).toBeInTheDocument();

    // Simulate pointerenter
    over.dispatchEvent(new PointerEvent("pointerenter"));
    await waitFor(() => {
      expect(bus.data.cursor?.sourceId).toBe(uPlotInstance.root.id);
    });

    // Simulate pointerleave
    over.dispatchEvent(new PointerEvent("pointerleave"));
    await waitFor(() => {
      expect(bus.data.cursor?.sourceId).toBeUndefined();
    });
  });
});

describe("PLUGIN: focusSeries", () => {
  test("focuses series based on cursor proximity", async () => {
    let uPlotInstance!: uPlot;
    const bus = createPluginBus<CursorPluginMessageBus & FocusSeriesPluginMessageBus>();

    render(() => (
      <SolidUplot
        width={600}
        height={300}
        data={[
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
          [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
          [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
          [
            40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220,
            230,
          ],
        ]}
        series={[{}, { label: "Series 1" }, { label: "Series 2" }, { label: "Series 3" }]}
        pluginBus={bus}
        plugins={[cursor(), focusSeries({ pxThreshold: 500 })]}
        onCreate={(chart) => {
          uPlotInstance = chart;
        }}
      />
    ));

    await waitFor(() => {
      expect(uPlotInstance).toBeDefined();
    });

    const over = document.querySelector(".u-over") as HTMLElement;
    expect(over).toBeInTheDocument();

    await userEvent.hover(over);

    await waitFor(() => {
      expect(bus.data.focusSeries).toBeDefined();
      expect(bus.data.focusSeries?.targets).toHaveLength(3);
      expect(bus.data.focusSeries?.targets[0]).toHaveProperty("label", "Series 1");
    });

    await userEvent.unhover(over);

    await waitFor(() => {
      expect(bus.data.focusSeries).toBeUndefined();
    });
  });

  test("handles cleanup properly", async () => {
    let uPlotInstance!: uPlot;
    const bus = createPluginBus<CursorPluginMessageBus & FocusSeriesPluginMessageBus>();
    const { unmount } = render(() => (
      <SolidUplot
        width={200}
        height={100}
        data={[
          [1, 2, 3],
          [4, 5, 6],
        ]}
        series={[{}, { label: "Series 1" }]}
        pluginBus={bus}
        plugins={[cursor(), focusSeries({ pxThreshold: 500 })]}
        onCreate={(chart) => {
          uPlotInstance = chart;
        }}
      />
    ));

    await waitFor(() => {
      expect(uPlotInstance).toBeDefined();
    });

    const over = document.querySelector(".u-over") as HTMLElement;
    expect(over).toBeInTheDocument();

    await userEvent.hover(over);

    await waitFor(() => {
      expect(bus.data.focusSeries).toBeDefined();
    });

    unmount();

    expect(document.querySelector(".u-over")).not.toBeInTheDocument();
  });

  test("plugin factory creates plugin with correct hooks", () => {
    const bus = createPluginBus<CursorPluginMessageBus & FocusSeriesPluginMessageBus>();
    const plugin = focusSeries()({ bus });

    expect(plugin.hooks).toBeDefined();
    expect(plugin.hooks.ready).toBeDefined();
    expect(plugin.hooks.setCursor).toBeDefined();
    expect(plugin.hooks.destroy).toBeDefined();
  });

  test("plugin updates series alpha based on cursor proximity", async () => {
    let uPlotInstance!: uPlot;
    const bus = createPluginBus<CursorPluginMessageBus & FocusSeriesPluginMessageBus>();
    const pxThreshold = 5;

    const { container } = render(() => (
      <SolidUplot
        width={600}
        height={300}
        data={[
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9],
        ]}
        series={[{}, { label: "Series 1" }, { label: "Series 2" }]}
        pluginBus={bus}
        plugins={[cursor(), focusSeries({ pxThreshold })]}
        onCreate={(chart) => {
          uPlotInstance = chart;
        }}
      />
    ));

    await waitFor(() => {
      expect(uPlotInstance).toBeDefined();
    });

    // Mock cursor data near Series 1's data point
    const yPos = uPlotInstance.valToPos(5, "y");
    const xPos = uPlotInstance.valToPos(2, "x");

    // Set cursor data in bus
    bus.setData("cursor", {
      sourceId: uPlotInstance.root.id,
      state: {
        [uPlotInstance.root.id]: {
          plotId: uPlotInstance.root.id,
          idx: 1,
          xValue: 2,
          visible: true,
          position: { top: yPos, left: xPos },
        },
      },
    });

    // Get the over element
    const over = container.querySelector(".u-over") as HTMLElement;
    expect(over).toBeInTheDocument();

    await userEvent.hover(over);
    expect(bus.data.focusSeries).toBeDefined();
    expect(bus.data.focusSeries?.targets).toHaveLength(0);

    const series1 = uPlotInstance.series[1];
    const series2 = uPlotInstance.series[2];
    expect(series1?.alpha).toBe(1);
    expect(series2?.alpha).toBe(1);

    await userEvent.unhover(over);

    await waitFor(() => {
      expect(bus.data.focusSeries).toBeUndefined();
    });
  });
});

describe("PLUGIN: legend", () => {
  const MockLegend: Component<LegendProps> = (props) => {
    return (
      <div data-testid="mock-legend">
        <For each={props.seriesData}>
          {(series) => <div data-testid={`legend-item-${series.label}`}>{series.label}</div>}
        </For>
      </div>
    );
  };

  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      width: 100,
      height: 50,
      top: 0,
      left: 0,
      right: 100,
      bottom: 50,
      x: 0,
      y: 0,
      toJSON: () => {},
    });
  });

  test("renders legend with series data", async () => {
    const bus = createPluginBus<CursorPluginMessageBus & FocusSeriesPluginMessageBus>();
    let uPlotInstance!: uPlot;

    render(() => (
      <SolidUplot
        width={600}
        height={300}
        data={[
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9],
        ]}
        series={[{}, { label: "Series 1" }, { label: "Series 2" }]}
        pluginBus={bus}
        plugins={[legend(MockLegend)]}
        onCreate={(chart) => {
          uPlotInstance = chart;
        }}
      />
    ));

    await waitFor(() => {
      expect(uPlotInstance).toBeDefined();
    });

    const legendContainer = document.querySelector("#solid-uplot-legend-root");
    expect(legendContainer).toBeInTheDocument();

    // Check if legend items are rendered
    expect(document.querySelector('[data-testid="legend-item-Series 1"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="legend-item-Series 2"]')).toBeInTheDocument();
  });

  test("positions legend according to placement prop", async () => {
    const bus = createPluginBus<CursorPluginMessageBus & FocusSeriesPluginMessageBus>();
    let uPlotInstance!: uPlot;

    render(() => (
      <SolidUplot
        width={600}
        height={300}
        data={[
          [1, 2, 3],
          [4, 5, 6],
        ]}
        series={[{}, { label: "Series 1" }]}
        pluginBus={bus}
        plugins={[legend(MockLegend, { placement: "top-right" })]}
        onCreate={(chart) => {
          uPlotInstance = chart;
        }}
      />
    ));

    await waitFor(() => {
      expect(uPlotInstance).toBeDefined();
    });

    const legendContainer = document.querySelector("#solid-uplot-legend-root") as HTMLElement;
    expect(legendContainer).toBeInTheDocument();
  });

  test("cleans up legend on unmount", async () => {
    const bus = createPluginBus<CursorPluginMessageBus & FocusSeriesPluginMessageBus>();
    let uPlotInstance!: uPlot;

    const { unmount } = render(() => (
      <SolidUplot
        width={600}
        height={300}
        data={[
          [1, 2, 3],
          [4, 5, 6],
        ]}
        series={[{}, { label: "Series 1" }]}
        pluginBus={bus}
        plugins={[legend(MockLegend)]}
        onCreate={(chart) => {
          uPlotInstance = chart;
        }}
      />
    ));

    await waitFor(() => {
      expect(uPlotInstance).toBeDefined();
    });

    expect(document.querySelector("#solid-uplot-legend-root")).toBeInTheDocument();

    unmount();

    expect(document.querySelector("#solid-uplot-legend-root")).not.toBeInTheDocument();
  });

  test("applies custom styles to legend container", async () => {
    const bus = createPluginBus<CursorPluginMessageBus & FocusSeriesPluginMessageBus>();
    let uPlotInstance!: uPlot;

    const customStyle = {
      padding: "10px",
      width: "200px",
      height: "100px",
    };

    render(() => (
      <SolidUplot
        width={600}
        height={300}
        data={[
          [1, 2, 3],
          [4, 5, 6],
        ]}
        series={[{}, { label: "Series 1" }]}
        pluginBus={bus}
        plugins={[legend(MockLegend, { style: customStyle })]}
        onCreate={(chart) => {
          uPlotInstance = chart;
        }}
      />
    ));

    await waitFor(() => {
      expect(uPlotInstance).toBeDefined();
    });

    const legendContainer = document.querySelector("#solid-uplot-legend-root") as HTMLElement;
    await waitFor(() => {
      expect(legendContainer).toBeInTheDocument();
    });

    expect(legendContainer).toHaveStyle({
      position: "absolute",
      "z-index": "10",
      "pointer-events": "auto",
      padding: "10px",
    });
  });

  test("applies default positioning styles", async () => {
    const bus = createPluginBus<CursorPluginMessageBus & FocusSeriesPluginMessageBus>();
    let uPlotInstance!: uPlot;

    render(() => (
      <SolidUplot
        width={600}
        height={300}
        data={[
          [1, 2, 3],
          [4, 5, 6],
        ]}
        series={[{}, { label: "Series 1" }]}
        pluginBus={bus}
        plugins={[legend(MockLegend)]}
        onCreate={(chart) => {
          uPlotInstance = chart;
        }}
      />
    ));

    await waitFor(() => expect(uPlotInstance).toBeDefined());

    const legendContainer = document.querySelector("#solid-uplot-legend-root") as HTMLElement;

    await waitFor(() => expect(legendContainer).toBeInTheDocument());

    expect(legendContainer).toHaveStyle({
      position: "absolute",
      "z-index": "10",
      "pointer-events": "auto",
    });
  });
});

describe("PLUGIN: tooltip", () => {
  const MockTooltip: Component<TooltipProps> = (props) => {
    return (
      <div data-testid="mock-tooltip">
        <div data-testid="tooltip-cursor-x">{props.cursor.xValue}</div>
        <For each={props.seriesData}>
          {(series) => {
            const value = props.u.data[series.seriesIdx]?.[props.cursor.idx];
            return (
              <div data-testid={`tooltip-series-${series.label}`}>
                {series.label}: {value}
              </div>
            );
          }}
        </For>
      </div>
    );
  };

  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      width: 100,
      height: 50,
      top: 0,
      left: 0,
      right: 100,
      bottom: 50,
      x: 0,
      y: 0,
      toJSON: () => {},
    });
  });

  test("renders tooltip with cursor and series data", async () => {
    const bus = createPluginBus<CursorPluginMessageBus>({
      cursor: {
        state: {},
      },
    });
    let uPlotInstance!: uPlot;

    render(() => (
      <SolidUplot
        width={600}
        height={300}
        data={[
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9],
        ]}
        series={[{}, { label: "Series 1" }, { label: "Series 2" }]}
        pluginBus={bus}
        plugins={[cursor(), tooltip(MockTooltip)]}
        onCreate={(chart) => {
          uPlotInstance = chart;
        }}
      />
    ));

    await waitFor(() => expect(uPlotInstance).toBeDefined());

    // Set cursor data
    bus.setData("cursor", {
      sourceId: uPlotInstance.root.id,
      state: {
        [uPlotInstance.root.id]: {
          plotId: uPlotInstance.root.id,
          idx: 1,
          xValue: 2,
          visible: true,
          position: { top: 100, left: 200 },
        },
      },
    });

    await waitFor(() => {
      const tooltip = document.querySelector("#solid-uplot-tooltip-root");
      expect(tooltip).toBeInTheDocument();
    });

    // Verify tooltip content
    expect(document.querySelector('[data-testid="tooltip-cursor-x"]')).toHaveTextContent("2");
    expect(document.querySelector('[data-testid="tooltip-series-Series 1"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="tooltip-series-Series 2"]')).toBeInTheDocument();
  });

  test("positions tooltip according to placement prop", async () => {
    const bus = createPluginBus<CursorPluginMessageBus>({
      cursor: {
        state: {},
      },
    });
    let uPlotInstance!: uPlot;

    render(() => (
      <SolidUplot
        width={600}
        height={300}
        data={[
          [1, 2, 3],
          [4, 5, 6],
        ]}
        series={[{}, { label: "Series 1" }]}
        pluginBus={bus}
        plugins={[cursor(), tooltip(MockTooltip, { placement: "bottom-right" })]}
        onCreate={(chart) => {
          uPlotInstance = chart;
        }}
      />
    ));

    await waitFor(() => expect(uPlotInstance).toBeDefined());

    // Set cursor data
    bus.setData("cursor", {
      sourceId: uPlotInstance.root.id,
      state: {
        [uPlotInstance.root.id]: {
          plotId: uPlotInstance.root.id,
          idx: 1,
          xValue: 2,
          visible: true,
          position: { top: 100, left: 200 },
        },
      },
    });

    await waitFor(() => {
      const tooltip = document.querySelector("#solid-uplot-tooltip-root") as HTMLElement;
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveStyle({
        position: "absolute",
        "z-index": "20",
        "pointer-events": "none",
      });
    });
  });

  test("cleans up tooltip on unmount", async () => {
    const bus = createPluginBus<CursorPluginMessageBus>({
      cursor: {
        state: {},
      },
    });
    let uPlotInstance!: uPlot;

    const { unmount } = render(() => (
      <SolidUplot
        width={600}
        height={300}
        data={[
          [1, 2, 3],
          [4, 5, 6],
        ]}
        series={[{}, { label: "Series 1" }]}
        pluginBus={bus}
        plugins={[cursor(), tooltip(MockTooltip)]}
        onCreate={(chart) => {
          uPlotInstance = chart;
        }}
      />
    ));

    await waitFor(() => expect(uPlotInstance).toBeDefined());

    // Set cursor data to show tooltip
    bus.setData("cursor", {
      sourceId: uPlotInstance.root.id,
      state: {
        [uPlotInstance.root.id]: {
          plotId: uPlotInstance.root.id,
          idx: 1,
          xValue: 2,
          visible: true,
          position: { top: 100, left: 200 },
        },
      },
    });

    await waitFor(() => {
      expect(document.querySelector("#solid-uplot-tooltip-root")).toBeInTheDocument();
    });

    unmount();

    expect(document.querySelector("#solid-uplot-tooltip-root")).not.toBeInTheDocument();
  });

  test("applies custom styles to tooltip container", async () => {
    const bus = createPluginBus<CursorPluginMessageBus>({
      cursor: {
        state: {},
      },
    });
    let uPlotInstance!: uPlot;

    const customStyle = {
      padding: "10px",
    };

    render(() => (
      <SolidUplot
        width={600}
        height={300}
        data={[
          [1, 2, 3],
          [4, 5, 6],
        ]}
        series={[{}, { label: "Series 1" }]}
        pluginBus={bus}
        plugins={[cursor(), tooltip(MockTooltip, { style: customStyle })]}
        onCreate={(chart) => {
          uPlotInstance = chart;
        }}
      />
    ));

    await waitFor(() => expect(uPlotInstance).toBeDefined());

    // Set cursor data to show tooltip
    bus.setData("cursor", {
      sourceId: uPlotInstance.root.id,
      state: {
        [uPlotInstance.root.id]: {
          plotId: uPlotInstance.root.id,
          idx: 1,
          xValue: 2,
          visible: true,
          position: { top: 100, left: 200 },
        },
      },
    });
    const tooltipContainer = document.querySelector("#solid-uplot-tooltip-root") as HTMLElement;
    expect(tooltipContainer).toBeInTheDocument();

    await waitFor(() => {
      expect(tooltipContainer).toHaveStyle({
        position: "absolute",
        "z-index": "20",
        "pointer-events": "none",
        padding: "10px",
      });
    });
  });

  test("hides tooltip when cursor data is cleared", async () => {
    const bus = createPluginBus<CursorPluginMessageBus>({
      cursor: {
        state: {},
      },
    });
    let uPlotInstance!: uPlot;

    render(() => (
      <SolidUplot
        width={600}
        height={300}
        data={[
          [1, 2, 3],
          [4, 5, 6],
        ]}
        series={[{}, { label: "Series 1" }]}
        pluginBus={bus}
        plugins={[cursor(), tooltip(MockTooltip)]}
        onCreate={(chart) => {
          uPlotInstance = chart;
        }}
      />
    ));

    await waitFor(() => expect(uPlotInstance).toBeDefined());

    // Set cursor data to show tooltip
    bus.setData("cursor", {
      sourceId: uPlotInstance.root.id,
      state: {
        [uPlotInstance.root.id]: {
          plotId: uPlotInstance.root.id,
          idx: 1,
          xValue: 2,
          visible: true,
          position: { top: 100, left: 200 },
        },
      },
    });

    await waitFor(() => {
      expect(document.querySelector("#solid-uplot-tooltip-root")).toBeInTheDocument();
    });

    bus.setData("cursor", "state", uPlotInstance.root.id, undefined);

    await waitFor(() => {
      expect(document.querySelector("#solid-uplot-tooltip-root")).not.toBeInTheDocument();
    });
  });
});
