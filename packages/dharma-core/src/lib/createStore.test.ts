import { describe, expect, it, vi } from "vitest";
import { createStore } from "./createStore";

describe("createStore", () => {
  const actions = vi.fn();

  it("should initialize with the given state", () => {
    const initialState = { count: 0 };
    const store = createStore(initialState, actions);
    expect(store.get()).toEqual(initialState);
  });

  it("should update the state using set", () => {
    const initialState = { count: 0 };
    const store = createStore(initialState, actions);
    store.set({ count: 1 });
    expect(store.get().count).toBe(1);
  });

  it("should notify subscribers on state change", () => {
    const initialState = { count: 0 };
    const store = createStore(initialState, actions);
    const listener = vi.fn();
    store.subscribe(listener);
    store.set({ count: 1 });
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("should unsubscribe listeners correctly", () => {
    const initialState = { count: 0 };
    const store = createStore(initialState, actions);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.set({ count: 1 });
    expect(listener).toHaveBeenCalledOnce();
  });

  it("should create actions if provided", () => {
    const initialState = { count: 0 };
    const store = createStore(initialState, ({ set, get }) => ({
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
      getCount: () => get().count,
    }));
    store.actions.increment();
    expect(store.actions.getCount()).toBe(1);
    store.actions.decrement();
    expect(store.actions.getCount()).toBe(0);
  });

  it("should call onChange if provided", () => {
    const initialState = { count: 0, other: "foo" };
    const store = createStore(initialState, actions, {
      onChange: ({ state, set }) => set({ other: state.other + "bar" }),
    });
    store.set({ count: 1 });
    expect(store.get()).toEqual({ count: 1, other: "foobar" });
  });

  it("should call onAttach on first subscribe", () => {
    const initialState = { count: 0 };
    const store = createStore(initialState, actions, {
      onAttach: ({ state, set }) => set({ count: state.count + 1 }),
    });
    const listener = vi.fn();
    store.subscribe(listener);
    expect(store.get().count).toBe(1);
  });

  it("should call onDetach on last unsubscribe", () => {
    const initialState = { count: 0 };
    const store = createStore(initialState, actions, {
      onDetach: ({ state, set }) => set({ count: state.count + 1 }),
    });
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    expect(store.get().count).toBe(1);
  });

  it("should call onLoad on store creation", () => {
    const initialState = { count: 0 };
    const store = createStore(initialState, actions, {
      onLoad: ({ state, set }) => set({ count: state.count + 1 }),
    });
    expect(store.get().count).toBe(1);
  });
});
