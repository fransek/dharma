// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { StorageAPI } from "../types/types";
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
    expect(onStorageError).toHaveBeenLastCalledWith(new Error("Storage error"));

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
    expect(onStorageError).toHaveBeenCalledExactlyOnceWith(error);
  });

  it("should keep the state if the snapshot can't be parsed", () => {
    const onStorageError = vi.fn();
    const storage = new CustomStorage();
    storage.setItem("test", "{not json");
    const store = createStore({ ...baseConfig, storage, onStorageError });
    expect(store.get()).toEqual(baseConfig.initialState);
    expect(onStorageError).toHaveBeenCalledExactlyOnceWith(
      expect.any(SyntaxError),
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
    expect(onStorageError).toHaveBeenCalledExactlyOnceWith(error);
  });

  it("should report a missing storage provider outside the browser", () => {
    const onStorageError = vi.fn();
    createStore({ ...baseConfig, onStorageError });
    expect(onStorageError).toHaveBeenCalledExactlyOnceWith(
      expect.any(StorageUnavailableError),
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
