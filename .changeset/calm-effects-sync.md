---
"dharma-core": minor
---

- `set` and `reset` no longer notify subscribers or call `onChange` when the state is unchanged, e.g. `set((state) => state)`. `merge` returns the current state itself in that case.
- Derived stores now stay up to date when not mounted.
- Effects created with `createEffect` now run again when remounted.
- Persisted stores now sync with changes made in other tabs via the `storage` event.
- Async storage no longer overwrites state set while it was being read.
- `StorageAPI` now accepts any `PromiseLike`, not just native promises.
