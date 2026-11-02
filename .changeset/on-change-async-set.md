---
"dharma-core": minor
---

**Breaking:** Notify subscribers of `set` and `reset` calls made asynchronously inside `onChange`.

Previously, `onChange` received a silent `set`, so changes made after an `await` updated the state without notifying subscribers, persisting, or invoking `onChange`. Now only calls made synchronously inside `onChange` are folded into the current change. Asynchronous calls are regular changes and trigger `onChange` again, so guard them to avoid an infinite loop.
