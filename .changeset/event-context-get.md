---
"dharma-core": minor
---

Add `get` to the context passed to `onLoad`, `onAttach`, `onDetach` and `onChange`, and deprecate `state`.

`state` is a snapshot taken when the hook is invoked, so it goes stale after calling `set` or `reset`, or after an `await`. `get()` always returns the current state. Replace `({ state }) => ...` with `({ get }) => { const state = get(); ... }`.
