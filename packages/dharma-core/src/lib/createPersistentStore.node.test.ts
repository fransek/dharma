// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { createPersistentStore, StorageAPI } from "./createPersistentStore";

describe("createPersistentStore", () => {
  const baseConfig = {
    key: "test",
    initialState: { count: 0 },
    defineActions: vi.fn(),
  };

  it("should not throw in a node environment", () => {
    expect(() => createPersistentStore(baseConfig)).not.toThrow();
  });

  it("should use the provided storage", () => {
    const storage = new CustomStorage();
    const store = createPersistentStore({ ...baseConfig, storage });
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
