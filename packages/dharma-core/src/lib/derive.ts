import { DerivedStore, Listener, Store } from "../types/types";
import { deeplyEquals } from "./deeplyEquals";

/**
 * Creates a derived store from an existing store.
 *
 * A derived store computes its state based on the original store's state using a derive function.
 * The derived store's value is memoized and only recomputed when requested.
 *
 * @param store - The original store to derive from
 * @param deriveFn - A function that computes the derived state from the original state
 * @param dependencyFn - Optional function that returns an array of dependencies. If provided, the derived state will only be recomputed when these dependencies change
 *
 * @returns A new store containing the derived state
 *
 * @see {@link https://dharma.fransek.dev/core/derive/}
 */
export const derive = <TState, TActions, TDerived>(
  store: Store<TState, TActions>,
  deriveFn: (state: TState) => TDerived,
  dependencyFn?: (state: TState) => unknown[],
): DerivedStore<TDerived> => {
  let memo: TDerived | undefined;
  let hasMemo = false;
  let prevState: TState | undefined;
  let prevDeps: unknown[] | undefined;
  let unsubscribe: (() => void) | undefined;
  const listeners = new Set<Listener<TDerived>>();

  const get = () => {
    const state = store.get();

    if (hasMemo && Object.is(state, prevState)) {
      return memo as TDerived;
    }

    prevState = state;
    const deps = dependencyFn?.(state);

    if (hasMemo && dependencyFn && deeplyEquals(prevDeps, deps)) {
      return memo as TDerived;
    }

    prevDeps = deps;
    memo = deriveFn(state);
    hasMemo = true;
    return memo;
  };

  const subscribe = (listener: Listener<TDerived>) => {
    if (listeners.size === 0) {
      mount();
    }

    listener(get());
    listeners.add(listener);

    return () => {
      listeners.delete(listener);

      if (listeners.size === 0) {
        unmount();
      }
    };
  };

  const listener = () => {
    listeners.forEach((listener) => listener(get()));
  };

  const mount = () => {
    if (!unsubscribe) {
      unsubscribe = store.subscribe(listener);
    }
    return unmount;
  };

  const unmount = () => {
    unsubscribe?.();
    unsubscribe = undefined;
  };

  return {
    get,
    subscribe,
    mount,
    unmount,
  };
};
