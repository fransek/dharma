---
"dharma-core": minor
---

`onStorageError` now receives the store's event context (`state`, `initialState`, `set` and `reset`) as its second argument, like the other event hooks. Errors from writing changes made in `onStorageError` are not reported back to it, so it can't loop.
