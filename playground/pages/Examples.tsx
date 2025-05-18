import { type Component } from "solid-js";

import { ExampleViewer } from "../components/ExampleViewer";
import { BasicChart } from "../examples/BasicChart";
import { ExternalIntegration } from "../examples/ExternalIntegration";
import { PluginShowcase } from "../examples/PluginShowcase";

const basicChartCode = `
import { SolidUplot } from "@dschz/solid-uplot";

const BasicChart = () => {
  return (
    <SolidUplot
      data={[
        [0, 1, 2, 3], // x values
        [10, 20, 30, 40], // y values for series 1
        [15, 25, 35, 45], // y values for series 2
      ]}
      width={600}
      height={400}
    />
  );
};
`;

const pluginShowcaseCode = `
import { SolidUplot } from "@dschz/solid-uplot";
import { cursor, tooltip, focusSeries } from "@dschz/solid-uplot/plugins";

const PluginShowcase = () => {
  return (
    <SolidUplot
      data={data}
      width={600}
      height={400}
      plugins={[
        cursor(),
        tooltip(MyTooltip),
        focusSeries(),
      ]}
    />
  );
};
`;

const externalIntegrationCode = `
import { createPluginBus } from "@dschz/solid-uplot";
import type { FocusSeriesPluginMessageBus } from "@dschz/solid-uplot/plugins/focusSeries";

const bus = createPluginBus<FocusSeriesPluginMessageBus>();

const DataGrid = (props: { bus: typeof bus }) => {
  const handleRowHover = (seriesLabel: string) => {
    props.bus.setData("focusSeries", {
      sourceId: "data-grid",
      targets: [{ label: seriesLabel }],
    });
  };

  return <table>{/* Grid implementation */}</table>;
};

const ExternalIntegration = () => {
  return (
    <div>
      <DataGrid bus={bus} />
      <SolidUplot
        data={data}
        pluginBus={bus}
        plugins={[focusSeries()]}
      />
    </div>
  );
};
`;

export const Examples: Component = () => {
  return (
    <div class="container mx-auto max-w-4xl space-y-8 p-8">
      <div class="mb-8 flex items-center justify-between">
        <h1 class="text-3xl font-bold">SolidUplot Examples</h1>
        <a
          href="https://github.com/dsnchz/solid-uplot/blob/main/playground/pages/Examples.tsx"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
        >
          <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
              clip-rule="evenodd"
            />
          </svg>
          View Source on GitHub
        </a>
      </div>

      <ExampleViewer
        title="Basic Chart"
        description="A simple chart with multiple series"
        component={BasicChart}
        sourceCode={basicChartCode}
        category="Basic"
      />

      <ExampleViewer
        title="Plugin Showcase"
        description="Demonstrating the power of the plugin system"
        component={PluginShowcase}
        sourceCode={pluginShowcaseCode}
        category="Plugin"
      />

      <ExampleViewer
        title="External Integration"
        description="Integrating external components with the plugin bus to trigger chart events. Hover over the data grid rows to highlight the corresponding series."
        component={ExternalIntegration}
        sourceCode={externalIntegrationCode}
        category="Integration"
      />
    </div>
  );
};
