# @dschz/solid-uplot

## 0.5.0

### Breaking Changes

#### DOM Structure: Two-div layout

The component now renders a **two-div structure** instead of a single div. A new inner
`<div class="solid-uplot-chart">` wraps the uPlot canvas, separating it from the
outer layout container.

**Before (v0.4.0):**

```html
<div id="solid-uplot-root" class="solid-uplot" ref="{ref}">
  <!-- children (legends, toolbars, etc.) -->
  <!-- uPlot canvas injected here, in the same container -->
</div>
```

**After (v0.5.0):**

```html
<div id="solid-uplot-root" class="solid-uplot" ref="{ref}">
  <!-- children (legends, toolbars, etc.) -->
  <div class="solid-uplot-chart">
    <!-- uPlot canvas injected here, in the inner container -->
  </div>
</div>
```

The `ref` prop continues to point to the component's root element. The inner
`solid-uplot-chart` div is an implementation detail and should not be targeted
directly.

**Migration notes:**

- CSS selectors targeting `.solid-uplot` still match the outer container.
  The new `.solid-uplot-chart` class is available for targeting the chart
  wrapper specifically, but is considered internal.
- If you were relying on the root div having `position: relative`, note
  that this style now lives on the inner chart div. The root div's
  positioning is unset (controlled by your layout).

#### `autoResize` behavioral change

When `autoResize` is enabled, the `width` and `height` props are now **ignored**.
The chart fills whatever space its container provides via flex layout instead of
using the prop values as initial dimensions.

The parent container **must** provide explicit dimensions (e.g., fixed height,
flex/grid layout). If it does not, the chart renders at 0px height and logs a
development-mode warning, rather than growing infinitely.

| Scenario                         | v0.4.0                     | v0.5.0                         |
| -------------------------------- | -------------------------- | ------------------------------ |
| Constrained parent (has height)  | Works correctly            | Works correctly                |
| Flex/grid parent with height     | Works correctly            | Works correctly                |
| Unconstrained parent (no height) | **Infinite height growth** | 0px chart height + dev warning |

### Bug Fixes

#### Infinite height growth with `autoResize`

Fixed a feedback loop where enabling `autoResize` in a container without explicit
height constraints caused the chart to grow infinitely. The root cause was the
single-div layout: the ResizeObserver reported the container size, uPlot resized
its canvas to match, the canvas content pushed the container taller, and the cycle
repeated.

The fix introduces the two-div structure described above. The inner chart div uses
`flex: 1 1 0` with `min-height: 0` and `min-width: 0`, ensuring its size is
dictated by the parent layout rather than by the canvas content. This breaks the
feedback loop entirely.

#### Tooltip positioning in offset containers

Fixed tooltip placement when the chart is not at the document origin (e.g., has
margins, padding, or is nested in a layout). Previously, absolute-positioned
tooltips calculated coordinates in document-absolute space using `window.scrollX/Y`,
but were rendered inside a `position: relative` ancestor — causing a double-offset
that displaced the tooltip from the cursor.

Tooltips now compute container-relative coordinates by subtracting the root
element's viewport position (`rootRect.left`/`rootRect.top`). Overflow detection
was updated to use a `rootOffset` parameter instead of the previous `isFixed`
boolean, correctly converting back to viewport coordinates for edge flipping.

#### `focusSeries` implicit return fix

Fixed a missing return value in the series focus target matching logic. The final
`"index" in t` branch now correctly returns the comparison result instead of
falling through as `undefined`.

### Internal

- **Monorepo migration**: The project was restructured from a flat single-package
  repository into a Bun workspaces monorepo (`packages/solid-uplot`,
  `apps/playground`, `apps/e2e`, `packages/tsconfig`). Published import paths
  are unchanged.
- **E2E test suite**: Added Playwright-based end-to-end tests covering resize
  behavior (fixed, auto, manual), infinite growth regression, and tooltip
  positioning (absolute and fixed/dialog modes).
- **Dev-mode warning**: When `autoResize` observes a 0px container height, a
  one-time console warning guides developers to provide explicit container
  dimensions.
- **Playground refinements**: Updated the Resize and Children Placement pages to
  reflect the new `autoResize` semantics — removed outdated warnings about
  `autoResize` with children, added a Dashboard Layout page demonstrating the
  recommended flex-based resize pattern, and standardized the demo styling.

## 0.4.0

### Minor Changes

- Adds onPositionCalculated callback option to tooltip plugin

## 0.3.0

### Minor Changes

- **Chart data types**: The `data` prop now accepts `number[][]` format in addition to `uPlot.AlignedData`, reducing friction when passing
  common array-of-arrays data structures
- **Focus series plugin**: Added `shouldRedrawOnBusUpdate` callback option to provide fine-grained control over cross-chart focus
  synchronization (e.g., filtering by source chart, conditional coordination based on bus state)
- **Tooltip plugin**: Added `fixed` positioning option to prevent clipping when tooltips are rendered inside dialog elements or other
  overflow-constrained containers

## 0.2.0

### Minor Changes

- Adds default solid-uplot css class and onCursorMove callback

## 0.1.7

### Patch Changes

- Adds JSR score badge to readme

## 0.1.6

### Patch Changes

- updates readme badges

## 0.1.5

### Patch Changes

- updates readme content

## 0.1.4

### Patch Changes

- Fixes linting and formatting issue and updates readme content

## 0.1.3

### Patch Changes

- Export missing UplotPluginFactory type for custom plugin authoring

## 0.1.2

### Patch Changes

- Updates package keywords to improve discoverability

## 0.1.1

### Patch Changes

- Adds missing jsdoc comments to exported symbols/types

## 0.1.0

### Summary

This is the initial release of **@dschz/solid-uplot** - A comprehensive SolidJS wrapper for uPlot with an ehanced plugin system that features a plugin bus architecture.

### ✨ Core Features

- **SolidUplot Component**: Fully reactive SolidJS wrapper around uPlot with fine-grained control over chart lifecycle
- **Auto-resize Support**: Built-in responsive sizing with `autoResize` prop for automatic container adaptation
- **TypeScript Support**: Complete TypeScript definitions with full type safety throughout the API
- **Plugin Bus System**: Advanced inter-plugin communication system with reactive message passing

### 🔌 Plugin System

- **Type-safe Plugin Architecture**: Strongly typed plugin factory system with message bus integration
- **Plugin Bus**: Reactive store for plugin-to-plugin and external component communication
- **Extensible Design**: Open architecture for creating custom plugins that integrate seamlessly

### 🎨 Built-in Plugins

#### Cursor Plugin (`cursor`)

- Tracks cursor position and interaction state across charts
- Provides reactive cursor data through the plugin bus
- Foundation for other interactive plugins

#### Focus Series Plugin (`focusSeries`)

- Highlights series based on cursor proximity with configurable pixel threshold
- Automatic series alpha adjustment for visual emphasis
- Integrates with cursor plugin for seamless interaction

#### Tooltip Plugin (`tooltip`)

- Custom SolidJS component rendering for tooltips
- Automatic positioning with edge detection and overflow handling
- Scroll-aware positioning that works with page scrolling
- Configurable placement preferences (`top-left`, `top-right`, `bottom-left`, `bottom-right`)
- Accessible tooltip with proper ARIA attributes

#### Legend Plugin (`legend`)

- Custom SolidJS component rendering for legends
- Smart positioning (top-left, top-right) to avoid axis conflicts
- Size-constrained to prevent overflow of chart drawing area
- Configurable pixel offset from chart edges (`pxOffset`)
- Plugin bus integration for interactive features (tooltip-aware dimming)
- Non-interfering design that works harmoniously with chart interactions

### 🛠️ Utility Functions

- **getSeriesData**: Extract series metadata from uPlot instances
- **getCursorData**: Process cursor position and data index information
- **getColorString**: Convert series stroke/fill properties to color values
- **getNewCalendarDayIndices**: Calendar-specific data processing utilities

### 📁 Package Structure

Three main export paths for organized functionality:

- **`@dschz/solid-uplot`**: Core components and plugin system
- **`@dschz/solid-uplot/plugins`**: Built-in plugins and their TypeScript types
- **`@dschz/solid-uplot/utils`**: Utility functions for data processing

### 🎮 Interactive Playground

- Comprehensive playground application with live examples
- Interactive demos for all plugins and features
- Best practices and implementation patterns
- Plugin development guides and examples

### 📚 Documentation

- Complete README with usage examples and API reference
- TypeScript definitions for all components and plugins
- Plugin development guide with established patterns
- External component integration examples

### 🔧 Developer Experience

- Full TypeScript support with strict typing
- Reactive updates with SolidJS fine-grained reactivity
- Clean plugin architecture following established patterns
- Comprehensive test suite with 42 passing tests
- Modern build system with tsup and SolidJS presets
