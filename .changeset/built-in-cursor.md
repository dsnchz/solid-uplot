---
"@dschz/solid-uplot": minor
---

Cursor tracking is built in, and every chart has a plugin bus.

Cursor position is the core primitive every chart plugin reads, so `SolidUplot` now installs cursor tracking on every chart, ahead of all other plugins, instead of relying on consumers to add a `cursor()` plugin (and add it first).

**Breaking**

- `cursor()` is removed from `@dschz/solid-uplot/plugins`. Delete it from your `plugins` arrays.
- `CursorPluginMessage` and `CursorPluginMessageBus` moved from `@dschz/solid-uplot/plugins` to `@dschz/solid-uplot`.
- `UplotPluginFactoryContext["bus"]` is no longer optional, and `FocusSeriesPluginOptions` is no longer generic.

**New**

- `pluginBus` is optional: a chart without one uses its own bus, so `plugins={[tooltip(Tip)]}` works with nothing else. Pass a bus to share it between charts or with outside components.
- Every bus carries the cursor state: `SolidUplotPluginBus<T>` is typed `T & CursorPluginMessageBus`, and `createPluginBus` seeds `cursor: { state: {} }`, so `bus.data.cursor` is always defined and bus types never need to list `CursorPluginMessageBus`.

**Fixed**

- A chart joining or re-joining a shared bus no longer resets the other charts' cursor state (before, every chart creation reset it, hiding the other charts' tooltips until their cursor moved again).
