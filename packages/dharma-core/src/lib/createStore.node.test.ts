// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { StorageAPI, StoreEventContext } from "../types/types";
import { createStore } from "./createStore";
import { StorageUnavailableError } from "./StorageUnavailableError";

describe("createStore (node)", () => {
  const baseConfig = {
    persist: true,
    key: "test",
    initialState: { count: 0 },
  };

  it("should not throw in a node environment", () => {
    expect(() => createStore(baseConfig)).not.toThrow();
  });

  it("should not throw when window has no event listener API", () => {
    // React Native defines window as globalThis without addEventListener
    vi.stubGlobal("window", globalThis);
    const store = createStore({ ...baseConfig, storage: new CustomStorage() });
    expect(() => store.subscribe(vi.fn())()).not.toThrow();
    vi.unstubAllGlobals();
  });

  it("should use the provided storage", () => {
    const storage = new CustomStorage();
    const store = createStore({ ...baseConfig, storage });
    store.set({ count: 1 });
    expect(storage.getItem("test")).toBe(JSON.stringify({ count: 1 }));
  });

  it("should report storage errors", () => {
    const onStorageError = vi.fn();
    const store = createStore({
      ...baseConfig,
      storage: new FaultyStorage(),
      onStorageError,
    });
    expect(onStorageError).toHaveBeenLastCalledWith(
      new Error("Storage error"),
      expect.anything(),
    );

    store.set({ count: 1 });
    expect(onStorageError).toHaveBeenCalledTimes(2);
  });

  it("should report write errors", () => {
    const onStorageError = vi.fn();
    const error = new Error("Write failed");
    const store = createStore({
      ...baseConfig,
      storage: {
        getItem: () => null,
        setItem: () => {
          throw error;
        },
      },
      onStorageError,
    });
    store.set({ count: 1 });
    expect(onStorageError).toHaveBeenCalledExactlyOnceWith(error, {
      state: { count: 1 },
      initialState: baseConfig.initialState,
      set: store.set,
      reset: store.reset,
    });
  });

  it("should allow recovering from storage errors with the context", () => {
    const storage = new CustomStorage();
    storage.setItem("test", "{not json");
    const store = createStore({
      persist: true,
      key: "test",
      initialState: { count: 0 },
      storage,
      onStorageError: (_error, { set }) => set({ count: -1 }),
    });
    expect(store.get()).toEqual({ count: -1 });
  });

  it("should not loop when the state set in onStorageError can't be written", () => {
    const onStorageError = vi.fn(
      (_error: unknown, { set }: StoreEventContext<{ count: bigint }>) =>
        set({ count: 0n }),
    );
    const store = createStore({
      persist: true,
      key: "test",
      initialState: { count: 0n },
      storage: new CustomStorage(),
      onStorageError,
    });
    store.set({ count: 1n });
    expect(store.get()).toEqual({ count: 0n });
    expect(onStorageError).toHaveBeenCalledExactlyOnceWith(
      expect.any(TypeError),
      expect.anything(),
    );
  });

  it("should not loop when the state set in onStorageError can't be written async", async () => {
    const onStorageError = vi.fn(
      (_error: unknown, { set }: StoreEventContext<{ count: number }>) =>
        set({ count: -1 }),
    );
    const store = createStore({
      persist: true,
      key: "test",
      initialState: { count: 0 },
      storage: {
        getItem: async () => null,
        setItem: () => Promise.reject(new Error("Write failed")),
      },
      onStorageError,
    });
    store.set({ count: 1 });
    await vi.waitFor(() => expect(store.get()).toEqual({ count: -1 }));
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(onStorageError).toHaveBeenCalledOnce();
  });

  it("should keep the state if the snapshot can't be parsed", () => {
    const onStorageError = vi.fn();
    const storage = new CustomStorage();
    storage.setItem("test", "{not json");
    const store = createStore({ ...baseConfig, storage, onStorageError });
    expect(store.get()).toEqual(baseConfig.initialState);
    expect(onStorageError).toHaveBeenCalledExactlyOnceWith(
      expect.any(SyntaxError),
      expect.objectContaining({ state: baseConfig.initialState }),
    );
  });

  it("should not write if the state can't be serialized", () => {
    const onStorageError = vi.fn();
    const error = new Error("Serialize error");
    const storage = new CustomStorage();
    const store = createStore({
      ...baseConfig,
      storage,
      serializer: {
        parse: JSON.parse,
        stringify: () => {
          throw error;
        },
      },
      onStorageError,
    });
    store.set({ count: 1 });
    expect(storage.getItem("test")).toBeNull();
    expect(onStorageError).toHaveBeenCalledExactlyOnceWith(
      error,
      expect.anything(),
    );
  });

  it("should report a missing storage provider outside the browser", () => {
    const onStorageError = vi.fn();
    createStore({ ...baseConfig, onStorageError });
    expect(onStorageError).toHaveBeenCalledExactlyOnceWith(
      expect.any(StorageUnavailableError),
      expect.objectContaining({ state: baseConfig.initialState }),
    );
  });
});

class CustomStorage implements StorageAPI {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }
  setItem(key: string, value: string): void {
    this.store[key] = value;
  }
}

class FaultyStorage implements StorageAPI {
  getItem(): string | null {
    throw new Error("Storage error");
  }
  setItem(): void {
    throw new Error("Storage error");
  }
}
