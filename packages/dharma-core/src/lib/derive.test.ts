import { afterEach, describe, expect, it, vi } from "vitest";
import { createStore } from "./createStore";
import * as deeplyEquals from "./deeplyEquals";
import { derive } from "./derive";

describe("derive", () => {
  const listener = vi.fn();
  const onAttach = vi.fn();
  const onDetach = vi.fn();

  const store = createStore({
    initialState: { count: 0, other: "foo" },
    actions: ({ set, reset }) => ({
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
      reset: () => reset(),
      setOther: (other: string) => set({ other }),
    }),
    onAttach,
    onDetach,
  });

  const { increment, setOther, reset } = store.actions;

  const calculate = vi.fn((count: number) => count * 2);

  afterEach(() => {
    reset();
    vi.clearAllMocks();
  });

  it("should derive a value from the store", () => {
    const derived = derive(store, (state) => calculate(state.count));
    derived.actions.mount();
    expect(derived.get()).toBe(0);
    increment();
    expect(derived.get()).toBe(2);
    derived.actions.unmount();
  });

  it("should only recompute upon requesting the state", () => {
    const derived = derive(store, (state) => calculate(state.count));
    derived.actions.mount();
    increment();
    expect(calculate).toHaveBeenCalledTimes(0);
    derived.get();
    expect(calculate).toHaveBeenCalledTimes(1);
    derived.actions.unmount();
  });

  it("should only recompute when dependencies change", () => {
    const derived = derive(
      store,
      (state) => calculate(state.count),
      (state) => [state.count],
    );
    derived.actions.mount();
    increment();
    derived.get(); // Dependency changed, recomputing
    setOther("bar");
    derived.get(); // No dependency changed, returning memoized value
    expect(calculate).toHaveBeenCalledTimes(1);
    derived.actions.unmount();
  });

  it("should notify subscribers when the derived state changes", () => {
    const derived = derive(store, (state) => calculate(state.count));
    const unsubscribe = derived.subscribe(listener);
    increment();
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    derived.actions.unmount();
  });

  it("should only recompute once when notifying subscribers", () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    const derived = derive(store, (state) => calculate(state.count));

    const unsubscribe1 = derived.subscribe(listener1);
    const unsubscribe2 = derived.subscribe(listener2);

    expect(calculate).toHaveBeenCalledTimes(1);
    increment();
    expect(calculate).toHaveBeenCalledTimes(2);

    unsubscribe1();
    unsubscribe2();
    derived.actions.unmount();
  });

  it("should only check dependencies when stale", () => {
    const deeplyEqualsSpy = vi.spyOn(deeplyEquals, "deeplyEquals");
    const derived = derive(
      store,
      (state) => calculate(state.count),
      (state) => [state.count],
    );
    derived.actions.mount();
    derived.get(); // Stale, but no previous dependency snapshot
    expect(deeplyEqualsSpy).toHaveBeenCalledTimes(0);
    derived.get(); // Not stale, not checking dependencies
    expect(deeplyEqualsSpy).toHaveBeenCalledTimes(0);
    increment();
    derived.get(); // Stale, checking dependencies
    expect(deeplyEqualsSpy).toHaveBeenCalledTimes(1);
    derived.actions.unmount();
  });

  it("should subscribe to the original store when mounted", () => {
    const derived = derive(store, (state) => calculate(state.count));
    expect(onAttach).not.toHaveBeenCalled();
    derived.actions.mount();
    expect(onAttach).toHaveBeenCalledOnce();
    derived.actions.unmount();
  });

  it("should unsubscribe to the original store when unmounted", () => {
    const derived = derive(store, (state) => calculate(state.count));
    derived.actions.mount();
    derived.actions.unmount();
    expect(onDetach).toHaveBeenCalledOnce();
  });

  it("should subscribe to the original store when subscribed to", () => {
    const derived = derive(store, (state) => calculate(state.count));
    expect(onAttach).not.toHaveBeenCalled();
    derived.subscribe(listener);
    expect(onAttach).toHaveBeenCalledOnce();
    derived.actions.unmount();
  });

  it("should unsubscribe to the original store when unsubscribed from", () => {
    const derived = derive(store, (state) => calculate(state.count));
    const unsubscribe = derived.subscribe(listener);
    unsubscribe();
    expect(onDetach).toHaveBeenCalledOnce();
    derived.actions.unmount();
  });

  it("should update the derived state when remounted", () => {
    const derived = derive(store, (state) => calculate(state.count));
    derived.actions.mount();
    increment();
    expect(derived.get()).toBe(2);
    derived.actions.unmount();
    increment();
    expect(derived.get()).toBe(2); // Stale
    derived.actions.mount();
    expect(derived.get()).toBe(4);
    derived.actions.unmount();
  });

  it("should update the derived state when remounted with dependencies", () => {
    const derived = derive(
      store,
      (state) => calculate(state.count),
      (state) => [state.count],
    );
    derived.actions.mount();
    increment();
    expect(derived.get()).toBe(2);
    derived.actions.unmount();
    increment();
    expect(derived.get()).toBe(2); // Stale
    derived.actions.mount();
    expect(derived.get()).toBe(4);
    derived.actions.unmount();
  });
});
