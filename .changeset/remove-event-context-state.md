---
"dharma-core": minor
---

**Breaking:** Remove the deprecated `state` field from the context passed to `onLoad`, `onAttach`, `onDetach` and `onChange`. Use `get()` instead.

Hooks and actions now receive the same readonly `StateContext`. `StoreEventContext` and `ActionContext` are deprecated aliases of `StateContext`.
