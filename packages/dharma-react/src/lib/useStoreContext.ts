import { useContext } from "react";
import { BoundStore, StoreContext } from "./types";
import { useStore } from "./useStore";

/**
 * A hook used to access a store context created with `createStoreContext`.
 *
 * @param {StoreContext<TArgs, TState, TActions>} StoreContext - The context of the store.
 * @param {(state: TState) => TSelection} [select] - A function to select a subset of the state. Can prevent unnecessary re-renders.
 * @returns {BoundStore<TState, TActions, TSelection>} The store instance.
 *
 * @example
 * Basic usage:
 * ```tsx
 * import { useStoreContext } from "dharma-react";
 * import { StoreContext } from "./store";
 *
 * function Counter() {
 *   const {
 *     state: { count },
 *     actions: { increment, decrement },
 *   } = useStoreContext(StoreContext);
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
 * const {
 *   state: count,
 * } = useStoreContext(StoreContext, (state) => state.count);
 * ```
 * @remarks
 * If the `select` function is provided, an equality check is performed. This has some caveats:
 * - For optimal performance, return a direct reference to the state. (e.g. `state.count`)
 * - If you return an object literal, it should only contain direct references to the state. (e.g. `{ count: state.count }`)
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
