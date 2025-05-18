import { Route, Router } from "@solidjs/router";
import { type Component, type ParentProps } from "solid-js";

import { ChildrenPlacementPlayground } from "./pages/ChildrenPlacement";
import { DynamicResize } from "./pages/DynamicResize";
import { ErrorPage } from "./pages/Error";
import { Examples } from "./pages/Examples";
import { Home } from "./pages/Home";
import { LegendShowcasePage } from "./pages/LegendShowcase";
import { MultiPlotPage } from "./pages/MultiPlot";
import { PluginsPage } from "./pages/Plugins";
import { Streaming } from "./pages/Streaming";
import { Sidebar } from "./Sidebar";

const RootLayout: Component<ParentProps> = (props) => (
  <div class="flex h-screen bg-gray-50">
    <Sidebar />
    <main class="flex-1 overflow-auto">{props.children}</main>
  </div>
);

export const App: Component = () => {
  return (
    <Router root={RootLayout}>
      <Route path="/" component={Home} />
      <Route path="/examples" component={Examples} />
      <Route path="/plugins" component={PluginsPage} />
      <Route path="/legend-showcase" component={LegendShowcasePage} />
      <Route path="/streaming" component={Streaming} />
      <Route path="/multi-plot" component={MultiPlotPage} />
      <Route path="/children-placement" component={ChildrenPlacementPlayground} />
      <Route path="/dynamic-resize" component={DynamicResize} />
      <Route path="*" component={ErrorPage} />
    </Router>
  );
};
