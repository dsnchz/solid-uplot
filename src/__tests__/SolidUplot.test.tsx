import { cleanup, render, waitFor } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import uPlot from "uplot";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

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

    expect(div).toHaveAttribute("id", "test-id");
    expect(div).toHaveAttribute("class", "test-class");
    expect(div).toHaveStyle({ width: "500px", height: "300px" });
  });

  test("calls onCreate callback when plot is created", () => {
    const onCreateMock = vi.fn();

    render(() => <SolidUplot {...DEFAULT_OPTIONS} data={DEFAULT_DATA} onCreate={onCreateMock} />);

    expect(onCreateMock).toHaveBeenCalledTimes(1);
    expect(onCreateMock).toHaveBeenCalledWith(expect.any(Object), expect.any(HTMLDivElement));
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
});
