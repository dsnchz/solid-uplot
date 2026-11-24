---
"@dschz/solid-uplot": minor
---

Public types and JSR entry points.

- `@dschz/solid-uplot` now exports `SolidUplotProps`, `SolidUplotOptions`, `SolidUplotPlugin`, `ChildrenPlacement`, `OnCreateMeta`, `OnCursorMoveParams` and `VoidStruct`. `SolidUplotPluginBus` is now a named type (`{ data, setData }`) instead of `ReturnType<typeof createPluginBus>`; the shape is unchanged.
- `@dschz/solid-uplot/plugins` adds `FocusSeriesPluginOptions`, `SeriesFocusTarget`, `TooltipPluginOptions`, `TooltipCursorPlacement`, `LegendPluginOptions` and `LegendPlacement`.
- `@dschz/solid-uplot/utils` adds `GetSeriesDataOptions`; `getCursorData` declares its return type (`CursorData | undefined`).
- JSR: the `./plugins` and `./utils` entry points are now published. Before, JSR exposed only the root entry.
