import { A } from "@solidjs/router";
import { type Component } from "solid-js";

export const Home: Component = () => {
  return (
    <div class="container mx-auto max-w-4xl p-8">
      <h1 class="mb-8 text-4xl font-bold">SolidUplot</h1>
      <p class="mb-4 text-lg text-gray-600">
        A SolidJS wrapper for uPlot — an ultra-fast, small footprint charting library for
        time-series data.
      </p>
      <div class="mb-8 flex gap-4">
        <A
          href="/examples"
          class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          View Examples
        </A>
        <a
          href="https://github.com/dsnchz/solid-uplot"
          target="_blank"
          rel="noopener noreferrer"
          class="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          GitHub
        </a>
      </div>
      <div class="grid gap-8 md:grid-cols-2">
        <div class="rounded-lg border border-gray-200 bg-white p-6">
          <h2 class="mb-4 text-xl font-semibold">Features</h2>
          <ul class="list-inside list-disc space-y-2 text-gray-600">
            <li>Fully reactive SolidJS wrapper</li>
            <li>Plugin system with inter-plugin communication</li>
            <li>Fine-grained control over chart lifecycle</li>
            <li>Lightweight and fast</li>
            <li>TypeScript support out of the box</li>
          </ul>
        </div>
        <div class="rounded-lg border border-gray-200 bg-white p-6">
          <h2 class="mb-4 text-xl font-semibold">Quick Start</h2>
          <pre class="rounded-lg bg-gray-900 p-4 text-sm text-white">
            <code>npm install solid-js uplot @dschz/solid-uplot</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
