// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { StateHandler, StorageAPI } from "../types/types";
import { createStore } from "./createStore";

describe("createStore (node)", () => {
  const baseConfig = {
    persist: true,
    key: "test",
    initialState: { count: 0 },
    defineActions: (handler: StateHandler<{ count: number }>) => handler,
  };

  it("should not throw in a node environment", () => {
    expect(() => createStore(baseConfig)).not.toThrow();
  });

  it("should use the provided storage", () => {
    const storage = new CustomStorage();
    const store = createStore({ ...baseConfig, storage });
    expect(storage.getItem("init_test")).toBe(JSON.stringify({ count: 0 }));
    store.actions.set({ count: 1 });
    expect(storage.getItem("test")).toBe(JSON.stringify({ count: 1 }));
  });

  it("should console.warn if storage methods throw", () => {
    const faultyStorage = new FaultyStorage();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const store = createStore({ ...baseConfig, storage: faultyStorage });
    expect(warnSpy).toHaveBeenCalledWith(
      "[dharma-core] Failed to initialize snapshots. If this happened during SSR, you can safely ignore this warning.",
    );

    store.subscribe(vi.fn());
    expect(warnSpy).toHaveBeenCalledWith(
      "[dharma-core] Failed to update state from snapshot",
    );

    store.actions.set({ count: 1 });
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
  removeItem(key: string): void {
    delete this.store[key];
  }
}

class FaultyStorage implements StorageAPI {
  getItem(): string | null {
    throw new Error("Storage error");
  }
  setItem(): void {
    throw new Error("Storage error");
  }
  removeItem(): void {
    throw new Error("Storage error");
  }
}
