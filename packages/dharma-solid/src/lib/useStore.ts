import { Store } from "dharma-core";
import { createSignal, onCleanup, onMount } from "solid-js";
import { deeplyEquals } from "./deeplyEquals"; // assuming you have this util

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
 * import { useStore } from "dharma-solid";
 * import { store } from "./store";
 *
 * const { increment, decrement, reset } = store.actions;
 *
 * function Counter() {
 *   const state = useStore(store);
 *
 *   return (
 *     <div>
 *       <div>{state().count}</div>
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
 * const { count } = useStore(globalStore, (state) => state.counter);
 * ```
 * @remarks
 * If the `select` function is provided, an equality check is performed. This has some caveats:
 * - For optimal performance, return a direct reference to the state. (e.g. `state.count`)
 * - If you return an object literal, it should only contain direct references to the state. (e.g. `{ count: state.count }`)
 */
export function useStore<
  TState extends object,
  TActions extends object,
  TSelection = TState,
>(
  { get, subscribe }: Store<TState, TActions>,
  select?: (state: TState) => TSelection,
): () => TSelection {
  const getSelection = () => {
    if (select) {
      return select(get());
    }
    return get() as unknown as TSelection;
  };

  const [state, setState] = createSignal<TSelection>(getSelection());

  onMount(() => {
    const unsubscribe = subscribe(() => {
      const nextState = getSelection();
      if (!deeplyEquals(state(), nextState)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        setState(nextState as Exclude<TSelection, Function>);
      }
    });

    onCleanup(unsubscribe);
  });

  return state;
}
