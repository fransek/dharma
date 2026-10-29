/**
 * Reported to `onStorageError` when a persisted store has no storage to use.
 * This is expected during SSR, and can otherwise mean that local storage is inaccessible.
 */
export class StorageUnavailableError extends Error {
  constructor(key: string) {
    super(
      `[dharma-core] No storage provider was found for "${key}". If this happened during SSR, it can be safely ignored.`,
    );
    this.name = "StorageUnavailableError";
  }
}
