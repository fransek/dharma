import { Store } from "dharma-core";
import { deeplyEquals } from "dharma-core/deeplyEquals";
import { useRef, useSyncExternalStore } from "react";

/**
 * A hook used to access a store created with `createStore` and bind it to a component.
 *
 * @param {Store<TState, TActions>} store - The store created with `createStore`.
 * @param {(state: TState) => TSelection} [select] - A function to select a subset of the state. Can prevent unnecessary re-renders.
 * @returns {TSelection} The selected state from the store.
 *
 * @see {@link https://dharma.fransek.dev/react/usestore/}
 */
export const useStore = <TState, TActions, TSelection = TState>(
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
