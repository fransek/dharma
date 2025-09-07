// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import {
  AsyncStorageAPI,
  createAsyncPersistentStore,
} from "./createAsyncPersistentStore";

describe("createAsyncPersistentStore in node environment", () => {
  const baseConfig = {
    key: "test",
    initialState: { count: 0 },
    defineActions: vi.fn().mockReturnValue({}),
  };

  it("should work in a node environment", () => {
    const storage = new CustomAsyncStorage();
    expect(() =>
      createAsyncPersistentStore({ ...baseConfig, storage }),
    ).not.toThrow();
  });

  it("should persist state correctly in node environment", async () => {
    const storage = new CustomAsyncStorage();
    const store = createAsyncPersistentStore({ ...baseConfig, storage });

    // Subscribe to trigger initial loading
    const unsubscribe = store.subscribe(() => {});

    // Wait for async initialization
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(await storage.getItem("init_test")).toBe(
      JSON.stringify({ count: 0 }),
    );

    store.set({ count: 1 });

    // Wait for async storage write
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(await storage.getItem("test")).toBe(JSON.stringify({ count: 1 }));

    unsubscribe();
  });
});

class CustomAsyncStorage implements AsyncStorageAPI {
  private store: Record<string, string> = {};

  async getItem(key: string): Promise<string | null> {
    return this.store[key] || null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.store[key] = value;
  }

  async removeItem(key: string): Promise<void> {
    delete this.store[key];
  }
}
