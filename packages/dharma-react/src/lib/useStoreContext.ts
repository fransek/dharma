import { useContext } from "react";
import { BoundStore, StoreContext } from "../types/types";
import { useStore } from "./useStore";

/**
 * A hook used to access a store context created with `createStoreContext`.
 *
 * @param {StoreContext<TArgs, TState, TActions>} StoreContext - The context of the store.
 * @param {(state: TState) => TSelection} [select] - A function to select a subset of the state. Can prevent unnecessary re-renders.
 * @returns {BoundStore<TState, TActions, TSelection>} The store instance.
 *
 * @see {@link https://dharma.fransek.dev/react/usestorecontext/}
 */
export const useStoreContext = <
  TArgs extends unknown[],
  TState,
  TActions,
  TSelection = TState,
>(
  StoreContext: StoreContext<TArgs, TState, TActions>,
  select?: (state: TState) => TSelection,
): BoundStore<TState, TActions, TSelection> => {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error(
      "Store context not found. Make sure you are using the store context within a provider.",
    );
  }
  return {
    state: useStore(store, select),
    actions: store.actions,
  };
};
