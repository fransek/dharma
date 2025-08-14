import { useContext } from "react";
import { StoreContext } from "./createStoreContext";
import { BoundStore, useStore } from "./useStore";

/**
 * A hook used to access a store context created with `createStoreContext`.
 *
 * @param {StoreContext<TArgs, TState, TActions>} storeContext - The context of the store.
 * @param {(state: TState) => TSelection} [select] - A function to select a subset of the state. Can prevent unnecessary re-renders.
 * @returns {BoundStore<TState, TActions, TSelection>} The store instance.
 *
 * @example
 * Basic usage:
 * ```tsx
 * import { useStoreContext } from "@fransek/statekit";
 * import { StoreContext } from "./store";
 *
 * function Counter() {
 *   const {
 *     state: { count },
 *     actions: { increment, decrement, reset },
 *   } = useStoreContext(StoreContext);
 *
 *   return (
 *     <div>
 *       <div>{count}</div>
 *       <button onClick={decrement}>-</button>
 *       <button onClick={increment}>+</button>
 *       <button onClick={reset}>Reset</button>
 *     </div>
 *   );
 * }
 * ```
 * @example
 * With a select function:
 * ```tsx
 * const {
 *   state: { count },
 * } = useStoreContext(GlobalStoreContext, (state) => state.counter);
 * ```
 * @remarks
 * If the `select` function is provided, an equality check is performed. This has some caveats:
 * - For optimal performance, return a direct reference to the state. (e.g. `state.count`)
 * - If you return an object literal, it should only contain direct references to the state. (e.g. `{ count: state.count }`)
 *
 * @group Hooks
 */
export const useStoreContext = <
  TArgs extends unknown[],
  TState extends object,
  TActions extends object,
  TSelection = TState,
>(
  storeContext: StoreContext<TArgs, TState, TActions>,
  select?: (state: TState) => TSelection,
): BoundStore<TState, TActions, TSelection> => {
  const store = useContext(storeContext);
  if (!store) {
    throw new Error(
      "Store context not found. Make sure you are using the store context within a provider.",
    );
  }
  return useStore(store, select);
};
