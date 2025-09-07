import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  AsyncStorageAPI,
  createAsyncPersistentStore,
} from "./createAsyncPersistentStore";
import { Serializer } from "./createPersistentStore";

// Mock async storage implementation
class MockAsyncStorage implements AsyncStorageAPI {
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

  clear() {
    this.store = {};
  }
}

describe("createAsyncPersistentStore", () => {
  const key = "test";
  const initKey = `init_${key}`;
  const initialState = { count: 0 };
  let storage: MockAsyncStorage;
  const listener = vi.fn();
  const defineActions = vi.fn().mockReturnValue({});

  beforeEach(() => {
    storage = new MockAsyncStorage();
    listener.mockClear();
    defineActions.mockClear();
  });

  it("should initialize with the given initial state", () => {
    const store = createAsyncPersistentStore({
      key,
      initialState,
      defineActions,
      storage,
    });
    expect(store.get()).toEqual(initialState);
  });

  it("should persist state changes to async storage", async () => {
    const store = createAsyncPersistentStore({
      key,
      initialState,
      defineActions,
      storage,
    });

    store.set({ count: 1 });

    // Wait for async storage write
    await new Promise((resolve) => setTimeout(resolve, 0));

    const storedState = await storage.getItem(key);
    expect(storedState).toBe(JSON.stringify({ count: 1 }));
  });

  it("should load state from async storage when first subscribed", async () => {
    // Pre-populate storage
    await storage.setItem(initKey, JSON.stringify({ count: 0 }));
    await storage.setItem(key, JSON.stringify({ count: 5 }));

    const store = createAsyncPersistentStore({
      key,
      initialState,
      defineActions,
      storage,
    });

    // Initially has initial state
    expect(store.get()).toEqual({ count: 0 });

    // Subscribe to trigger loading from storage
    const unsubscribe = store.subscribe(listener);

    // Wait for async loading
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Should now have loaded state
    expect(store.get()).toEqual({ count: 5 });

    unsubscribe();
  });

  it("should reset storage when initial state changes", async () => {
    // Pre-populate storage with old initial state
    await storage.setItem(initKey, JSON.stringify({ count: 1 }));
    await storage.setItem(key, JSON.stringify({ count: 5 }));

    const store = createAsyncPersistentStore({
      key,
      initialState: { count: 0 }, // Different initial state
      defineActions,
      storage,
    });

    const unsubscribe = store.subscribe(listener);

    // Wait for async loading
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Should use new initial state, not stored state
    expect(store.get()).toEqual({ count: 0 });

    // Storage should be reset
    const storedState = await storage.getItem(key);
    expect(storedState).toBeNull();

    // Initial state key should be updated
    const storedInitState = await storage.getItem(initKey);
    expect(storedInitState).toBe(JSON.stringify({ count: 0 }));

    unsubscribe();
  });

  it("should use custom serializer", async () => {
    const customSerializer: Serializer = {
      stringify: vi.fn().mockReturnValue("custom"),
      parse: vi.fn().mockReturnValue({ count: 1 }),
    };

    const store = createAsyncPersistentStore({
      key,
      initialState,
      defineActions,
      storage,
      serializer: customSerializer,
    });

    store.set({ count: 1 });

    // Wait for async storage write
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(customSerializer.stringify).toHaveBeenCalledWith({ count: 1 });
  });

  it("should handle storage errors gracefully during writes", async () => {
    const errorStorage: AsyncStorageAPI = {
      getItem: vi.fn().mockResolvedValue(null),
      setItem: vi.fn().mockRejectedValue(new Error("Storage error")),
      removeItem: vi.fn().mockResolvedValue(undefined),
    };

    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const store = createAsyncPersistentStore({
      key,
      initialState,
      defineActions,
      storage: errorStorage,
    });

    // This should not throw
    expect(() => store.set({ count: 1 })).not.toThrow();

    // Wait for async operation
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to write to async storage:",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  it("should handle storage errors gracefully during reads", async () => {
    const errorStorage: AsyncStorageAPI = {
      getItem: vi.fn().mockRejectedValue(new Error("Storage error")),
      setItem: vi.fn().mockResolvedValue(undefined),
      removeItem: vi.fn().mockResolvedValue(undefined),
    };

    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const store = createAsyncPersistentStore({
      key,
      initialState,
      defineActions,
      storage: errorStorage,
    });

    // This should not throw
    const unsubscribe = store.subscribe(listener);

    // Wait for async operation
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to read from async storage:",
      expect.any(Error),
    );

    // Store should still work with initial state
    expect(store.get()).toEqual(initialState);

    unsubscribe();
    consoleSpy.mockRestore();
  });

  it("should not load from storage multiple times simultaneously", async () => {
    // Pre-populate storage so it won't return early
    await storage.setItem(initKey, JSON.stringify(initialState));

    const getItemSpy = vi.spyOn(storage, "getItem");

    const store = createAsyncPersistentStore({
      key,
      initialState,
      defineActions,
      storage,
    });

    // Subscribe multiple times quickly
    const unsubscribe1 = store.subscribe(listener);
    const unsubscribe2 = store.subscribe(listener);
    const unsubscribe3 = store.subscribe(listener);

    // Wait for async operations
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Should only call getItem twice (once for init key, once for main key)
    // despite multiple subscriptions
    expect(getItemSpy).toHaveBeenCalledTimes(2);

    unsubscribe1();
    unsubscribe2();
    unsubscribe3();
  });

  it("should call lifecycle hooks correctly", async () => {
    const onAttach = vi.fn();
    const onDetach = vi.fn();
    const onChange = vi.fn();

    const store = createAsyncPersistentStore({
      key,
      initialState,
      defineActions,
      storage,
      onAttach,
      onDetach,
      onChange,
    });

    const unsubscribe = store.subscribe(listener);

    expect(onAttach).toHaveBeenCalledWith({
      state: initialState,
      set: expect.any(Function),
      reset: expect.any(Function),
    });

    store.set({ count: 1 });

    expect(onChange).toHaveBeenCalledWith({
      state: { count: 1 },
      set: expect.any(Function),
      reset: expect.any(Function),
    });

    unsubscribe();

    expect(onDetach).toHaveBeenCalledWith({
      state: { count: 1 },
      set: expect.any(Function),
      reset: expect.any(Function),
    });
  });
});
