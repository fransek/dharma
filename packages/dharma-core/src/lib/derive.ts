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
  let sourceUnsubscribe: (() => void) | null = null;
  let lastSourceState: TState | undefined;
  const listeners = new Set<Listener<TDerived>>();

  const compute = () => {
    const currentSourceState = store.get();
    lastSourceState = currentSourceState;
    memo = deriveFn(currentSourceState);
    isStale = false;
    return memo;
  };

  const get = () => {
    // Check if source state has changed even without subscription
    const currentSourceState = store.get();
    if (lastSourceState !== currentSourceState) {
      isStale = true;
    }

    if (!dependencyFn) {
      if (isStale) {
        return compute();
      }

      return memo as TDerived;
    }

    const next = dependencyFn(currentSourceState);
    isStale &&= !prev || !deeplyEquals(prev, next);

    if (isStale) {
      prev = next;
      return compute();
    }

    return memo as TDerived;
  };

  const subscribe = (listener: Listener<TDerived>) => {
    // Only subscribe to the source store when we have our first listener
    // This prevents triggering onAttach during SSR when derive() is called
    if (listeners.size === 0 && !sourceUnsubscribe) {
      sourceUnsubscribe = store.subscribe((state) => {
        lastSourceState = state;
        isStale = true;
        listeners.forEach((listener) => listener(get()));
      });
    }

    listener(get());
    listeners.add(listener);

    return () => {
      listeners.delete(listener);

      // Unsubscribe from source store when we have no more listeners
      if (listeners.size === 0 && sourceUnsubscribe) {
        sourceUnsubscribe();
        sourceUnsubscribe = null;
        // Keep the last known state for future get() calls
      }
    };
  };

  return {
    get,
    subscribe,
    actions: null as never,
  };
};
