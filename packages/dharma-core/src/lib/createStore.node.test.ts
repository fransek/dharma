// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { StorageAPI } from "../types/types";
import { createStore } from "./createStore";

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

  it("should not warn about missing storage until the state changes", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const store = createStore(baseConfig);
    store.subscribe(vi.fn())();
    store.set((state) => state);
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("should warn once per store when state changes can't be persisted", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const store = createStore(baseConfig);
    store.set({ count: 1 });
    store.set({ count: 2 });
    expect(warnSpy).toHaveBeenCalledExactlyOnceWith(
      '[dharma-core] State changes to "test" won\'t be persisted because no storage is available. Pass a `storage` option to persist outside the browser.',
    );
    createStore(baseConfig).set({ count: 1 });
    expect(warnSpy).toHaveBeenCalledTimes(2);
    warnSpy.mockRestore();
  });

  it("should use the provided storage", () => {
    const storage = new CustomStorage();
    const store = createStore({ ...baseConfig, storage });
    store.set({ count: 1 });
    expect(storage.getItem("test")).toBe(JSON.stringify({ count: 1 }));
  });

  it("should console.warn if storage methods throw", () => {
    const faultyStorage = new FaultyStorage();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const store = createStore({ ...baseConfig, storage: faultyStorage });

    expect(warnSpy).toHaveBeenCalledWith(
      "[dharma-core] Failed to sync state with snapshot. If this happened during SSR, you can safely ignore this warning.",
    );

    store.set({ count: 1 });
    expect(warnSpy).toHaveBeenCalledWith(
      "[dharma-core] Failed to update snapshot",
    );

    warnSpy.mockRestore();
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
