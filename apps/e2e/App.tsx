import { Route, Router } from "@solidjs/router";
import type { Component } from "solid-js";

import { Home } from "./pages/Home";
import { Resize } from "./pages/Resize";
import { Tooltip } from "./pages/Tooltip";

export const App: Component = () => {
  return (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/test-resize" component={Resize} />
      <Route path="/test-tooltip" component={Tooltip} />
    </Router>
  );
};
