import { Store } from "dharma-core";
import {
  DeepReadonly,
  onUnmounted,
  readonly,
  ref,
  UnwrapNestedRefs,
} from "vue";
import { deeplyEquals } from "./deeplyEquals";

// Overload for when no select function is provided
export function useStore<TState extends object, TActions extends object>(
  store: Store<TState, TActions>,
): DeepReadonly<UnwrapNestedRefs<TState>>;

// Overload for when a select function is provided
export function useStore<
  TState extends object,
  TActions extends object,
  TSelection,
>(
  store: Store<TState, TActions>,
  select: (state: TState) => TSelection,
): DeepReadonly<UnwrapNestedRefs<TSelection>>;

/**
 * A composable used to access a store created with `createStore` and bind it to a Vue component.
 *
 * @param {Store<TState, TActions>} store - The store created with `createStore`.
 * @param {(state: TState) => TSelection} [select] - A function to select a subset of the state. Can prevent unnecessary re-renders.
 * @returns {DeepReadonly<UnwrapNestedRefs<TSelection>>} A reactive, readonly reference to the selected state from the store.
 *
 * @example
 * Basic usage:
 * ```vue
 * <script setup>
 * import { useStore } from "dharma-vue";
 * import { store } from "./store";
 *
 * const { increment, decrement } = store.actions;
 * const state = useStore(store);
 * </script>
 *
 * <template>
 *   <div>
 *     <div>{{ state.count }}</div>
 *     <button @click="decrement">-</button>
 *     <button @click="increment">+</button>
 *   </div>
 * </template>
 * ```
 * @example
 * With a select function:
 * ```vue
 * <script setup>
 * const count = useStore(globalStore, (state) => state.counter);
 * </script>
 * ```
 * @remarks
 * If the `select` function is provided, an equality check is performed. This has some caveats:
 * - For optimal performance, return a direct reference to the state. (e.g. `state.count`)
 * - If you return an object literal, it should only contain direct references to the state. (e.g. `{ count: state.count }`)
 */
export function useStore<
  TState extends object,
  TActions extends object,
  TSelection,
>(
  store: Store<TState, TActions>,
  select?: (state: TState) => TSelection,
): DeepReadonly<UnwrapNestedRefs<TSelection>> {
  const getSelection = () =>
    (select ? select(store.get()) : store.get()) as TSelection;

  const currentState = ref(getSelection());

  const unsubscribe = store.subscribe(() => {
    const newSelection = getSelection();

    if (!deeplyEquals(currentState.value, newSelection)) {
      currentState.value = newSelection;
    }
  });

  onUnmounted(unsubscribe);

  return readonly(currentState) as DeepReadonly<UnwrapNestedRefs<TSelection>>;
}
