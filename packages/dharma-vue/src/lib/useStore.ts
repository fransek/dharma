import { Store } from "dharma-core";
import { computed, onUnmounted, ref, type ComputedRef } from "vue";
import { deeplyEquals } from "./deeplyEquals";

/**
 * A composable used to access a store created with `createStore` and bind it to a Vue component.
 *
 * @param {Store<TState, TActions>} store - The store created with `createStore`.
 * @param {(state: TState) => TSelection} [select] - A function to select a subset of the state. Can prevent unnecessary re-renders.
 * @returns {ComputedRef<TSelection>} A reactive computed reference to the selected state from the store.
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
export const useStore = <
  TState extends object,
  TActions extends object,
  TSelection = TState,
>(
  store: Store<TState, TActions>,
  select?: (state: TState) => TSelection,
): ComputedRef<TSelection> => {
  // Create a reactive reference to hold the current state
  const currentState = ref<TSelection>(
    select ? select(store.get()) : (store.get() as unknown as TSelection),
  );

  // Subscribe to store changes
  const unsubscribe = store.subscribe(() => {
    const newState = store.get();
    const newSelection = select
      ? select(newState)
      : (newState as unknown as TSelection);

    // Only update if the selection has actually changed
    if (!deeplyEquals(currentState.value, newSelection)) {
      currentState.value = newSelection;
    }
  });

  // Clean up subscription when component unmounts
  onUnmounted(() => {
    unsubscribe();
  });

  // Return a computed reference for reactivity
  return computed(() => currentState.value);
};
