import { afterEach, describe, expect, it, vi } from "vitest";
import { createEffect } from "./createEffect";
import { createStore } from "./createStore";

describe("createEffect", () => {
  const onAttach = vi.fn();
  const onDetach = vi.fn();

  const store = createStore({
    initialState: { count: 0, other: "foo" },
    defineActions: ({ set, reset }) => ({
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
      reset: () => reset(),
      setOther: (other: string) => set({ other }),
    }),
    onAttach,
    onDetach,
  });

  const { increment, setOther, reset } = store.actions;

  const effectFn = vi.fn();

  afterEach(() => {
    reset();
    vi.clearAllMocks();
  });

  it("should run the effect when the store changes", () => {
    const effect = createEffect(store, effectFn);
    effect.mount();
    expect(effectFn).toHaveBeenCalledTimes(1); // Initial run
    increment();
    expect(effectFn).toHaveBeenCalledTimes(2);
    effect.unmount();
  });

  it("should not run the effect if dependencies have not changed", () => {
    const effect = createEffect(
      store,
      (state) => effectFn(state.count),
      (state) => [state.count],
    );
    effect.mount();
    expect(effectFn).toHaveBeenCalledTimes(1);
    increment();
    expect(effectFn).toHaveBeenCalledTimes(2);
    setOther("bar");
    expect(effectFn).toHaveBeenCalledTimes(2); // Should not run again
    effect.unmount();
  });

  it("should subscribe to the store on mount and unsubscribe on unmount", () => {
    const effect = createEffect(store, effectFn);
    expect(onAttach).not.toHaveBeenCalled();
    effect.mount();
    expect(onAttach).toHaveBeenCalledTimes(1);
    effect.unmount();
    expect(onDetach).toHaveBeenCalledTimes(1);
  });

  it("should not run the effect after unmounting", () => {
    const effect = createEffect(store, effectFn);
    effect.mount();
    expect(effectFn).toHaveBeenCalledTimes(1);
    effect.unmount();
    increment();
    expect(effectFn).toHaveBeenCalledTimes(1);
  });

  it("should pass the store's state to the effect function", () => {
    const effect = createEffect(store, (state) => effectFn(state));
    effect.mount();
    expect(effectFn).toHaveBeenCalledWith({ count: 0, other: "foo" });
    increment();
    expect(effectFn).toHaveBeenCalledWith({ count: 1, other: "foo" });
    effect.unmount();
  });
});
