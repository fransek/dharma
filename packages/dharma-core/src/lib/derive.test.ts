import { afterEach, describe, expect, it, vi } from "vitest";
import { createStore } from "./createStore";
import * as deeplyEquals from "./deeplyEquals";
import { derive } from "./derive";

describe("derive", () => {
  const store = createStore({
    initialState: { count: 0, other: "foo" },
    defineActions: ({ set, reset }) => ({
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
      reset: () => reset(),
      setOther: (other: string) => set({ other }),
    }),
  });

  const { increment, setOther, reset } = store.actions;

  const calculate = vi.fn((count: number) => count * 2);

  afterEach(() => {
    reset();
    vi.clearAllMocks();
  });

  it("should derive a value from the store", () => {
    const derived = derive(store, (state) => calculate(state.count));
    expect(derived.get()).toBe(0);
    increment();
    expect(derived.get()).toBe(2);
  });

  it("should only recompute upon requesting the state", () => {
    const derived = derive(store, (state) => calculate(state.count));
    increment();
    expect(calculate).toHaveBeenCalledTimes(0);
    derived.get();
    expect(calculate).toHaveBeenCalledTimes(1);
  });

  it("should only recompute when dependencies change", () => {
    const derived = derive(
      store,
      (state) => calculate(state.count),
      (state) => [state.count],
    );
    increment();
    derived.get(); // Dependency changed, recomputing
    setOther("bar");
    derived.get(); // No dependency changed, returning memoized value
    expect(calculate).toHaveBeenCalledTimes(1);
  });

  it("should notify subscribers when the derived state changes", () => {
    const listener = vi.fn();
    const derived = derive(store, (state) => calculate(state.count));
    const unsubscribe = derived.subscribe(listener);
    increment();
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
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
  });

  it("should only check dependencies when stale", () => {
    const deeplyEqualsSpy = vi.spyOn(deeplyEquals, "deeplyEquals");
    const derived = derive(
      store,
      (state) => calculate(state.count),
      (state) => [state.count],
    );
    derived.get(); // Stale, but no previous dependency snapshot
    expect(deeplyEqualsSpy).toHaveBeenCalledTimes(0);
    derived.get(); // Not stale, not checking dependencies
    expect(deeplyEqualsSpy).toHaveBeenCalledTimes(0);
    increment();
    derived.get(); // Stale, checking dependencies
    expect(deeplyEqualsSpy).toHaveBeenCalledTimes(1);
  });

  it("should not subscribe to source store until derived store has subscribers", () => {
    const subscribeSpy = vi.spyOn(store, "subscribe");

    // Creating derive should not subscribe to source store
    const derived = derive(store, (state) => calculate(state.count));
    expect(subscribeSpy).toHaveBeenCalledTimes(0);

    // Getting value should not subscribe to source store
    derived.get();
    expect(subscribeSpy).toHaveBeenCalledTimes(0);

    // Only when we subscribe to derived store should it subscribe to source
    const unsubscribe = derived.subscribe(vi.fn());
    expect(subscribeSpy).toHaveBeenCalledTimes(1);

    unsubscribe();
  });

  it("should unsubscribe from source store when last listener is removed", () => {
    const unsubscribeSpy = vi.fn();
    vi.spyOn(store, "subscribe").mockReturnValue(unsubscribeSpy);

    const derived = derive(store, (state) => calculate(state.count));
    const unsubscribe1 = derived.subscribe(vi.fn());
    const unsubscribe2 = derived.subscribe(vi.fn());

    // Removing first listener should not unsubscribe from source
    unsubscribe1();
    expect(unsubscribeSpy).toHaveBeenCalledTimes(0);

    // Removing last listener should unsubscribe from source
    unsubscribe2();
    expect(unsubscribeSpy).toHaveBeenCalledTimes(1);
  });

  it("should resubscribe to source store after being completely unsubscribed", () => {
    const subscribeSpy = vi.spyOn(store, "subscribe");
    const derived = derive(store, (state) => calculate(state.count));

    // First subscription
    const unsubscribe1 = derived.subscribe(vi.fn());
    expect(subscribeSpy).toHaveBeenCalledTimes(1);
    unsubscribe1();

    // Second subscription after being fully unsubscribed
    const unsubscribe2 = derived.subscribe(vi.fn());
    expect(subscribeSpy).toHaveBeenCalledTimes(2);
    unsubscribe2();
  });
});
