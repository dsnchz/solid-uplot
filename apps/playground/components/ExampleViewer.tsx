import { type Component, createSignal, Show } from "solid-js";

import { CodeBlock } from "./CodeBlock";

export type ExampleProps = {
  title: string;
  description: string;
  component: Component;
  sourceCode: string;
  category: "Basic" | "Plugin" | "Advanced" | "Integration";
};

export const ExampleViewer: Component<ExampleProps> = (props) => {
  const [showSource, setShowSource] = createSignal(false);

  return (
    <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">{props.title}</h2>
          <p class="mt-1 text-sm text-gray-500">{props.description}</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            onClick={() => setShowSource(!showSource())}
            class="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            {showSource() ? "Hide Source" : "View Source"}
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(props.sourceCode)}
            class="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Copy Code
          </button>
        </div>
      </div>

      <div class="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <props.component />
      </div>

      <Show when={showSource()}>
        <CodeBlock code={props.sourceCode} language="tsx" />
      </Show>
    </div>
  );
};
