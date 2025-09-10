import { Store } from "dharma-core";
import { useRef, useSyncExternalStore } from "react";
import { deeplyEquals } from "./deeplyEquals";

/**
 * A hook used to access a store created with `createStore` and bind it to a component.
 *
 * @param {Store<TState, TActions>} store - The store created with `createStore`.
 * @param {(state: TState) => TSelection} [select] - A function to select a subset of the state. Can prevent unnecessary re-renders.
 * @returns {TSelection} The selected state from the store.
 *
 * @example
 * Basic usage:
 * ```tsx
 * import { useStore } from "dharma-react";
 * import { store } from "./store";
 *
 * const { increment, decrement } = store.actions;
 *
 * function Counter() {
 *   const { count } = useStore(store);
 *
 *   return (
 *     <div>
 *       <div>{count}</div>
 *       <button onClick={decrement}>-</button>
 *       <button onClick={increment}>+</button>
 *     </div>
 *   );
 * }
 * ```
 * @example
 * With a select function:
 * ```tsx
 * const { count } = useStore(globalStore, (state) => state.counter);
 * ```
 * @remarks
 * If the `select` function is provided, an equality check is performed. This has some caveats:
 * - For optimal performance, return a direct reference to the state. (e.g. `state.count`)
 * - If you return an object literal, it should only contain direct references to the state. (e.g. `{ count: state.count }`)
 */
export const useStore = <
  TState extends object,
  TActions extends object,
  TSelection = TState,
>(
  store: Store<TState, TActions>,
  select?: (state: TState) => TSelection,
): TSelection => {
  const snapshotRef = useRef<TSelection | null>(null);

  const getSelection = () => {
    if (!select) {
      return store.get();
    }

    const newState = select(store.get());

    if (!deeplyEquals(snapshotRef.current, newState)) {
      snapshotRef.current = newState;
    }

    return snapshotRef.current;
  };

  return useSyncExternalStore(
    store.subscribe,
    getSelection,
    getSelection,
  ) as TSelection;
};
