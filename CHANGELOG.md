# @dschz/solid-uplot

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
