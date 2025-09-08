// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { createStore } from "./createStore";
import type { StorageAPI } from "./types";

describe("createStore (node)", () => {
  const baseConfig = {
    persist: true,
    key: "test",
    initialState: { count: 0 },
    defineActions: vi.fn(),
  };

  it("should not throw in a node environment", () => {
    expect(() => createStore(baseConfig)).not.toThrow();
  });

  it("should use the provided storage", () => {
    const storage = new CustomStorage();
    const store = createStore({ ...baseConfig, storage });
    expect(storage.getItem("init_test")).toBe(JSON.stringify({ count: 0 }));
    store.set({ count: 1 });
    expect(storage.getItem("test")).toBe(JSON.stringify({ count: 1 }));
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
