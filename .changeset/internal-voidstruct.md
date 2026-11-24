---
"@dschz/solid-uplot": patch
---

`VoidStruct` is no longer exported from `@dschz/solid-uplot`. It was only the generic constraint `Record<string, unknown>` and was exported by mistake in 0.6.0; write `Record<string, unknown>` if you constrained your own generics with it. The README's package-structure section now explains built-in cursor tracking under `@dschz/solid-uplot/plugins`.
