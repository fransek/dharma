import { Store } from "dharma-core";
import { useRef, useSyncExternalStore } from "react";
import { deeplyEquals } from "./deeplyEquals";

export type BoundStore<
  TState extends object,
  TActions extends object,
  TSelection = TState,
> = {
  state: TSelection;
  actions: TActions;
};

/**
 * A hook used to access a store created with `createStore` and bind it to a component.
 *
 * @param {Store<TState, TActions, TSelection>} store - The store created with `createStore`.
 * @param {(state: TState) => TSelection} [select] - A function to select a subset of the state. Can prevent unnecessary re-renders.
 * @returns {BoundStore<TState, TActions, TSelection>} An object containing the current state, actions, and set function.
 *
 * @example
 * Basic usage:
 * ```tsx
 * import { useStore } from "@fransek/statekit";
 * import { store } from "./store";
 *
 * function Counter() {
 *   const {
 *     state: { count },
 *     actions: { increment, decrement, reset },
 *   } = useStore(store);
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
 * } = useStore(globalStore, (state) => state.counter);
 * ```
 * @remarks
 * If the `select` function is provided, an equality check is performed. This has some caveats:
 * - For optimal performance, return a direct reference to the state. (e.g. `state.count`)
 * - If you return an object literal, it should only contain direct references to the state. (e.g. `{ count: state.count }`)
 *
 * @group Hooks
 */
export const useStore = <
  TState extends object,
  TActions extends object,
  TSelection = TState,
>(
  { get, subscribe, actions }: Store<TState, TActions>,
  select?: (state: TState) => TSelection,
): BoundStore<TState, TActions, TSelection> => {
  const latestSnapshotRef = useRef<TSelection | null>(null);

  const getState = () => {
    if (select) {
      const newState = select(get());
      if (!deeplyEquals(latestSnapshotRef.current, newState)) {
        latestSnapshotRef.current = newState;
      }
      return latestSnapshotRef.current;
    }
    return get();
  };

  const state = useSyncExternalStore(
    subscribe,
    getState,
    getState,
  ) as TSelection;

  return { state, actions };
};
