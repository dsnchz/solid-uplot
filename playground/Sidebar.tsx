import { A } from "@solidjs/router";
import { type Component, createSignal, For } from "solid-js";

type NavItem = {
  href: string;
  label: string;
  description?: string;
};

const navItems: NavItem[] = [
  { href: "/", label: "Home", description: "Getting started" },
  { href: "/examples", label: "Examples", description: "Basic chart examples" },
  { href: "/plugins", label: "Plugins", description: "Plugin system showcase" },
  { href: "/tooltip-dialog", label: "Tooltip Dialog", description: "Tooltip in dialog context" },
  { href: "/legend-showcase", label: "Legend Showcase", description: "Legend plugin examples" },
  { href: "/streaming", label: "Streaming", description: "Real-time data updates" },
  { href: "/multi-plot", label: "Multi Plot", description: "Multiple synchronized charts" },
  {
    href: "/children-placement",
    label: "Children Placement",
    description: "Layout with child components",
  },
  { href: "/dynamic-resize", label: "Dynamic Resize", description: "Responsive sizing patterns" },
];

export const Sidebar: Component = () => {
  const [isCollapsed, setIsCollapsed] = createSignal(false);

  return (
    <aside
      class={`bg-white border-r border-gray-200 transition-all duration-300 ${
        isCollapsed() ? "w-16" : "w-64"
      }`}
    >
      <div class="flex h-full flex-col">
        {/* Header */}
        <div class="flex h-16 items-center border-b border-gray-200 px-4">
          {isCollapsed() ? (
            <button
              onClick={() => setIsCollapsed(false)}
              class="mx-auto rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              title="Expand sidebar"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                />
              </svg>
            </button>
          ) : (
            <>
              <A href="/" class="text-xl font-bold text-gray-900">
                SolidUplot
              </A>
              <button
                onClick={() => setIsCollapsed(true)}
                class="ml-auto rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                title="Collapse sidebar"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                  />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav class={`flex-1 overflow-y-auto py-4 ${isCollapsed() ? "px-2" : "px-4"}`}>
          <ul class={isCollapsed() ? "space-y-1" : "space-y-2"}>
            <For each={navItems}>
              {(item) => (
                <li>
                  <A
                    href={item.href}
                    class={`group flex items-center rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 ${
                      isCollapsed() ? "px-2 py-2 justify-center" : "px-3 py-2"
                    }`}
                    activeClass="bg-blue-50 text-blue-700 hover:bg-blue-50 hover:text-blue-700"
                    end={item.href === "/"}
                    title={isCollapsed() ? item.label : undefined}
                  >
                    <div
                      class={`transition-all duration-300 ${isCollapsed() ? "mx-auto" : "mr-3"}`}
                    >
                      {/* Icon based on the page */}
                      {item.href === "/" && (
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                      )}
                      {item.href === "/examples" && (
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      )}
                      {item.href === "/plugins" && (
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                      )}
                      {item.href === "/tooltip-dialog" && (
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                          />
                        </svg>
                      )}
                      {item.href === "/legend-showcase" && (
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4 4 4 0 004-4V5z"
                          />
                        </svg>
                      )}
                      {item.href === "/streaming" && (
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      )}
                      {item.href === "/multi-plot" && (
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                          />
                        </svg>
                      )}
                      {item.href === "/children-placement" && (
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                          />
                        </svg>
                      )}
                      {item.href === "/dynamic-resize" && (
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                          />
                        </svg>
                      )}
                    </div>
                    <div
                      class={`transition-all duration-300 ${
                        isCollapsed() ? "w-0 opacity-0" : "w-auto opacity-100"
                      } overflow-hidden`}
                    >
                      <div class="font-medium">{item.label}</div>
                      {item.description && (
                        <div class="text-xs text-gray-500">{item.description}</div>
                      )}
                    </div>
                  </A>
                </li>
              )}
            </For>
          </ul>
        </nav>

        {/* Footer */}
        <div class={`border-t border-gray-200 ${isCollapsed() ? "p-2" : "p-4"}`}>
          <a
            href="https://github.com/dsnchz/solid-uplot"
            target="_blank"
            rel="noopener noreferrer"
            class={`group flex items-center rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 ${
              isCollapsed() ? "px-2 py-2 justify-center" : "px-3 py-2"
            }`}
            title={isCollapsed() ? "GitHub Repository" : undefined}
          >
            <div class={`transition-all duration-300 ${isCollapsed() ? "mx-auto" : "mr-3"}`}>
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div
              class={`transition-all duration-300 ${
                isCollapsed() ? "w-0 opacity-0" : "w-auto opacity-100"
              } overflow-hidden`}
            >
              <div class="font-medium">GitHub</div>
              <div class="text-xs text-gray-500">View source code</div>
            </div>
          </a>
        </div>
      </div>
    </aside>
  );
};
