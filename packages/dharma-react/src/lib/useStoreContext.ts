import { Store } from "dharma-core";
import { useContext } from "react";
import { BoundStore, StoreContext } from "../types/types";
import { useStore } from "./useStore";

/**
 * A hook used to access a store context created with `createStoreContext`.
 *
 * @param {StoreContext<TStoreCreator>} StoreContext - The context of the store.
 * @param {(state: TState) => TSelection} [select] - A function to select a subset of the state. Can prevent unnecessary re-renders.
 * @returns {BoundStore<TState, TActions, TSelection>} The store instance.
 *
 * @see {@link https://dharma.fransek.dev/react/usestorecontext/}
 */
export const useStoreContext = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TStoreCreator extends (...args: any[]) => Store<any, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TState = ReturnType<TStoreCreator> extends Store<infer S, any> ? S : never,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TActions = ReturnType<TStoreCreator> extends Store<any, infer A> ? A : never,
  TSelection = TState,
>(
  StoreContext: StoreContext<TStoreCreator>,
  select?: (state: TState) => TSelection,
): BoundStore<TState, TActions, TSelection> => {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error(
      "[dharma-react] Store context not found. Make sure you are using the store context within a provider.",
    );
  }
  return {
    state: useStore(store, select),
    actions: store.actions,
  };
};
