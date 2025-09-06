import { createStore } from "dharma-core";
import { describe, expect, it } from "vitest";
import { createStoreContext } from "./createStoreContext";

describe("createStoreContext", () => {
  it("should create a store context with an instantiation function", () => {
    const createCountStore = (initialCount: number) =>
      createStore({
        initialState: { count: initialCount },
        defineActions: ({ set }) => ({
          increment: () => set((state) => ({ count: state.count + 1 })),
          decrement: () => set((state) => ({ count: state.count - 1 })),
          reset: () => set({ count: 0 }),
        }),
      });

    const StoreContext = createStoreContext(createCountStore);

    expect(StoreContext).toHaveProperty("createStore");
    expect(typeof StoreContext.createStore).toBe("function");
  });

  it("should instantiate a new store with the given arguments", () => {
    const createCountStore = (initialCount: number) =>
      createStore({
        initialState: { count: initialCount },
        defineActions: ({ set }) => ({
          increment: () => set((state) => ({ count: state.count + 1 })),
          decrement: () => set((state) => ({ count: state.count - 1 })),
          reset: () => set({ count: 0 }),
        }),
      });

    const StoreContext = createStoreContext(createCountStore);
    const store = StoreContext.createStore(5);

    expect(store.get()).toEqual({ count: 5 });
    store.actions.increment();
    expect(store.get()).toEqual({ count: 6 });
    store.actions.decrement();
    expect(store.get()).toEqual({ count: 5 });
    store.actions.reset();
    expect(store.get()).toEqual({ count: 0 });
  });
});
