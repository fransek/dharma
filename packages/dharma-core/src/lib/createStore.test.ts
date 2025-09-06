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
