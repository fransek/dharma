---
"dharma-core": minor
---

Added the `onStorageError` option for handling persistence errors, along with the exported `StorageUnavailableError` class. Storage errors are no longer logged to the console, so use `onStorageError` to surface them.
