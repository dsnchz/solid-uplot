import { A } from "@solidjs/router";
import { type Component } from "solid-js";

export const ErrorPage: Component = () => {
  return (
    <div class="container mx-auto max-w-4xl p-8">
      <h1 class="mb-4 text-3xl font-bold">Page Not Found</h1>
      <p class="mb-4 text-gray-600">The page you're looking for doesn't exist.</p>
      <A href="/" class="text-blue-600 hover:text-blue-800">
        Return to Home
      </A>
    </div>
  );
};
