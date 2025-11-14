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
  let prev: unknown[] | undefined;
  let isStale = true;
  let unsubscribe: (() => void) | undefined;
  const listeners = new Set<Listener<TDerived>>();

  const compute = () => {
    memo = deriveFn(store.get());
    isStale = false;
    return memo;
  };

  const get = () => {
    const next = dependencyFn?.(store.get());
    isStale &&= !prev || !deeplyEquals(prev, next);

    if (isStale) {
      prev = next;
      return compute();
    }

    return memo as TDerived;
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
    isStale = true;
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
