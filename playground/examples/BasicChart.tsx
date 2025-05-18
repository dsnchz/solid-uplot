import { type Component } from "solid-js";

import { SolidUplot } from "../../src";

export const BasicChart: Component = () => {
  return (
    <SolidUplot
      data={[
        [0, 1, 2, 3], // x values
        [10, 20, 30, 40], // y values for series 1
        [15, 25, 35, 45], // y values for series 2
      ]}
      width={600}
      height={400}
      scales={{
        x: {
          time: false,
        },
      }}
      series={[
        {},
        {
          label: "Series 1",
          stroke: "#1f77b4",
        },
        {
          label: "Series 2",
          stroke: "#ff7f0e",
        },
      ]}
      legend={{
        show: true,
      }}
    >
      <div>Hello</div>
    </SolidUplot>
  );
};
