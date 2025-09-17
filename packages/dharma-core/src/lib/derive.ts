import { deeplyEquals } from "./deeplyEquals";
import { Listener, Store } from "./types";

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
 * @returns A new store containing the derived state. This store is read-only (no actions).
 */
export const derive = <TState, TActions, TDerived>(
  store: Store<TState, TActions>,
  deriveFn: (state: TState) => TDerived,
  dependencyFn?: (state: TState) => unknown[],
): Store<TDerived, never> => {
  let memo: TDerived | undefined;
  let prev: unknown[] | undefined;
  let isStale = true;
  const listeners = new Set<Listener<TDerived>>();

  const compute = () => {
    memo = deriveFn(store.get());
    isStale = false;
    return memo;
  };

  const get = () => {
    if (!dependencyFn) {
      if (isStale) {
        return compute();
      }

      return memo as TDerived;
    }

    const next = dependencyFn?.(store.get());

    if (!isStale || deeplyEquals(prev, next)) {
      return memo as TDerived;
    }

    prev = next;
    return compute();
  };

  store.subscribe(() => {
    isStale = true;
    listeners.forEach((listener) => listener(get()));
  });

  const subscribe = (listener: Listener<TDerived>) => {
    listener(get());
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  return {
    get,
    subscribe,
    actions: null as never,
  };
};
