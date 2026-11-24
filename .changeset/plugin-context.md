---
"@dschz/solid-uplot": minor
---

Components passed to `tooltip()` and `legend()` now render under the `<SolidUplot>` component's owner, so `useContext` sees the app's providers (it returned `undefined` before). Plugin factories receive that owner as `ctx.owner`, for custom plugins that mount Solid UI: `runWithOwner(owner ?? null, () => render(() => <Ui />, u.over))`.
