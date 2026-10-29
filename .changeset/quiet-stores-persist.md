---
"dharma-core": patch
---

Fixed several persistence and subscription bugs: changes made in `onChange` are now persisted, async storage write errors are caught, inaccessible `localStorage` no longer throws, and calling an unsubscribe function twice no longer triggers `onDetach` twice. Improved `deeplyEquals` performance for objects with many keys.
