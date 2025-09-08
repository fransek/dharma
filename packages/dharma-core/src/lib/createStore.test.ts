import { describe, expect, it, vi } from "vitest";
import { createStore } from "./createStore";

describe("createStore", () => {
  const defineActions = vi.fn();

  it("should initialize with the given state", () => {
    const initialState = { count: 0 };
    const store = createStore({ initialState, defineActions });
    expect(store.get()).toEqual(initialState);
  });

  it("should update the state using set and reset", () => {
    const initialState = { count: 0 };
    const store = createStore({ initialState, defineActions });
    store.set({ count: 1 });
    expect(store.get().count).toBe(1);
    store.reset();
    expect(store.get().count).toBe(0);
  });

  it("should notify subscribers on state change", () => {
    const initialState = { count: 0 };
    const store = createStore({ initialState, defineActions });
    const listener = vi.fn();
    store.subscribe(listener);
    store.set({ count: 1 });
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("should unsubscribe listeners correctly", () => {
    const initialState = { count: 0 };
    const store = createStore({ initialState, defineActions });
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.set({ count: 1 });
    expect(listener).toHaveBeenCalledOnce();
  });

  it("should create actions if provided", () => {
    const store = createStore({
      initialState: { count: 0 },
      defineActions: ({ set, get, reset }) => ({
        increment: () => set((state) => ({ count: state.count + 1 })),
        getCount: () => get().count,
        resetCount: () => reset(),
      }),
    });
    store.actions.increment();
    expect(store.actions.getCount()).toBe(1);
    store.actions.resetCount();
    expect(store.actions.getCount()).toBe(0);
  });

  it("should call onChange if provided", () => {
    const initialState = { count: 0, other: "foo" };
    const store = createStore({
      initialState,
      defineActions,
      onChange: ({ state, set }) => set({ other: state.other + "bar" }),
    });
    store.set({ count: 1 });
    expect(store.get()).toEqual({ count: 1, other: "foobar" });
  });

  it("should call onAttach on first subscribe", () => {
    const initialState = { count: 0 };
    const store = createStore({
      initialState,
      defineActions,
      onAttach: ({ state, set }) => set({ count: state.count + 1 }),
    });
    const listener = vi.fn();
    store.subscribe(listener);
    expect(store.get().count).toBe(1);
  });

  it("should call onDetach on last unsubscribe", () => {
    const initialState = { count: 0 };
    const store = createStore({
      initialState,
      defineActions,
      onDetach: ({ state, set }) => set({ count: state.count + 1 }),
    });
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    expect(store.get().count).toBe(1);
  });

  it("should call onLoad on store creation", () => {
    const initialState = { count: 0 };
    const store = createStore({
      initialState,
      defineActions,
      onLoad: ({ state, set }) => set({ count: state.count + 1 }),
    });
    expect(store.get().count).toBe(1);
  });
});

describe("createStore with sync persistence", () => {
  const createMockStorage = () => {
    const data: Record<string, string> = {};
    return {
      getItem: (key: string) => data[key] || null,
      setItem: (key: string, value: string) => { data[key] = value; },
      removeItem: (key: string) => { delete data[key]; },
      data,
    };
  };

  it("should persist state to sync storage", () => {
    const storage = createMockStorage();
    const store = createStore({
      initialState: { count: 0 },
      defineActions: ({ set }) => ({
        increment: () => set((state) => ({ count: state.count + 1 })),
      }),
      persistence: {
        key: "test-counter",
        storage,
      },
    });

    store.actions.increment();
    expect(JSON.parse(storage.data["test-counter"])).toEqual({ count: 1 });
  });

  it("should load state from sync storage on first subscription", () => {
    const storage = createMockStorage();
    storage.setItem("test-counter", JSON.stringify({ count: 5 }));
    storage.setItem("init_test-counter", JSON.stringify({ count: 0 }));

    const store = createStore({
      initialState: { count: 0 },
      persistence: {
        key: "test-counter",
        storage,
      },
    });

    expect(store.get()).toEqual({ count: 0 });
    
    // Subscribe to trigger loading from storage
    const unsubscribe = store.subscribe(() => {});
    expect(store.get()).toEqual({ count: 5 });
    unsubscribe();
  });

  it("should clear storage when initial state changes", () => {
    const storage = createMockStorage();
    storage.setItem("test-counter", JSON.stringify({ count: 5 }));
    storage.setItem("init_test-counter", JSON.stringify({ count: 0, old: true }));

    const store = createStore({
      initialState: { count: 0 },
      persistence: {
        key: "test-counter",
        storage,
      },
    });

    // Subscribe to trigger persistence logic
    const unsubscribe = store.subscribe(() => {});
    expect(storage.data["test-counter"]).toBeUndefined();
    expect(JSON.parse(storage.data["init_test-counter"])).toEqual({ count: 0 });
    unsubscribe();
  });

  it("should use custom serializer", () => {
    const storage = createMockStorage();
    const customSerializer = {
      stringify: (value: any) => `custom:${JSON.stringify(value)}`,
      parse: (value: string) => JSON.parse(value.replace("custom:", "")),
    };

    const store = createStore({
      initialState: { count: 0 },
      defineActions: ({ set }) => ({
        increment: () => set((state) => ({ count: state.count + 1 })),
      }),
      persistence: {
        key: "test-counter",
        storage,
        serializer: customSerializer,
      },
    });

    store.actions.increment();
    expect(storage.data["test-counter"]).toBe("custom:{\"count\":1}");
  });

  it("should handle storage errors gracefully", () => {
    const failingStorage = {
      getItem: () => { throw new Error("Storage error"); },
      setItem: () => { throw new Error("Storage error"); },
      removeItem: () => { throw new Error("Storage error"); },
    };

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const store = createStore({
      initialState: { count: 0 },
      defineActions: ({ set }) => ({
        increment: () => set((state) => ({ count: state.count + 1 })),
      }),
      persistence: {
        key: "test-counter",
        storage: failingStorage,
      },
    });

    // Should fall back to regular store behavior
    expect(store.get()).toEqual({ count: 0 });
    store.actions.increment();
    expect(store.get()).toEqual({ count: 1 });

    consoleSpy.mockRestore();
  });
});

describe("createStore with async persistence", () => {
  const createMockAsyncStorage = () => {
    const data: Record<string, string> = {};
    return {
      getItem: async (key: string) => data[key] || null,
      setItem: async (key: string, value: string) => { data[key] = value; },
      removeItem: async (key: string) => { delete data[key]; },
      data,
    };
  };

  it("should persist state to async storage", async () => {
    const storage = createMockAsyncStorage();
    const store = createStore({
      initialState: { count: 0 },
      defineActions: ({ set }) => ({
        increment: () => set((state) => ({ count: state.count + 1 })),
      }),
      persistence: {
        key: "async-counter",
        storage,
      },
    });

    store.actions.increment();
    
    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 10));
    
    expect(JSON.parse(storage.data["async-counter"])).toEqual({ count: 1 });
  });

  it("should load state from async storage on first subscription", async () => {
    const storage = createMockAsyncStorage();
    storage.data["async-counter"] = JSON.stringify({ count: 5 });
    storage.data["init_async-counter"] = JSON.stringify({ count: 0 });

    const store = createStore({
      initialState: { count: 0 },
      persistence: {
        key: "async-counter",
        storage,
      },
    });

    expect(store.get()).toEqual({ count: 0 });
    
    // Subscribe to trigger loading from storage
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    
    // Wait for async loading
    await new Promise(resolve => setTimeout(resolve, 10));
    
    expect(store.get()).toEqual({ count: 5 });
    unsubscribe();
  });

  it("should clear async storage when initial state changes", async () => {
    const storage = createMockAsyncStorage();
    storage.data["async-counter"] = JSON.stringify({ count: 5 });
    storage.data["init_async-counter"] = JSON.stringify({ count: 0, old: true });

    const store = createStore({
      initialState: { count: 0 },
      persistence: {
        key: "async-counter",
        storage,
      },
    });

    // Subscribe to trigger persistence logic
    const unsubscribe = store.subscribe(() => {});
    
    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10));
    
    expect(storage.data["async-counter"]).toBeUndefined();
    expect(JSON.parse(storage.data["init_async-counter"])).toEqual({ count: 0 });
    unsubscribe();
  });

  it("should handle async storage errors gracefully", async () => {
    const failingAsyncStorage = {
      getItem: async () => Promise.reject(new Error("Async storage error")),
      setItem: async () => Promise.reject(new Error("Async storage error")),
      removeItem: async () => Promise.reject(new Error("Async storage error")),
    };

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const store = createStore({
      initialState: { count: 0 },
      defineActions: ({ set }) => ({
        increment: () => set((state) => ({ count: state.count + 1 })),
      }),
      persistence: {
        key: "async-counter",
        storage: failingAsyncStorage,
      },
    });

    // Should work normally (errors are just logged)
    expect(store.get()).toEqual({ count: 0 });
    store.actions.increment();
    expect(store.get()).toEqual({ count: 1 });

    // Subscribe to trigger async loading (which will fail)
    const unsubscribe = store.subscribe(() => {});
    await new Promise(resolve => setTimeout(resolve, 10));
    
    expect(consoleSpy).toHaveBeenCalled();
    
    unsubscribe();
    consoleSpy.mockRestore();
  });
});
