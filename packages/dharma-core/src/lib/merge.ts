import { StateModifier } from "./types";

/**
 * Merges the current state with a state modifier.
 *
 * @param {T} currentState - The current state object.
 * @param {StateModifier<T>} stateModifier - A function or object that modifies the state.
 * @returns {T} The new state object, which is a combination of the current state and the state modifier.
 *
 * @example
 * ```ts
 * import { createStore, merge, StateModifier } from "dharma-core";
 *
 * const store = createStore({
 *   initialState: {
 *     counter: {
 *       count: 0,
 *     },
 *     // ...
 *   },
 *   defineActions: ({ set }) => {
 *     const setCounter = (counter: StateModifier<{ count: number }>) =>
 *       set((state) => ({
 *         counter: merge(state.counter, counter),
 *       }));
 *
 *     return {
 *       increment: () => setCounter((state) => ({ count: state.count + 1 })),
 *       decrement: () => setCounter((state) => ({ count: state.count - 1 })),
 *       // ...
 *     };
 *   },
 * });
 * ```
 */
export const merge = <T>(
  currentState: T,
  stateModifier: StateModifier<T>,
): T => {
  if (typeof stateModifier === "object") {
    return { ...currentState, ...stateModifier };
  }

  if (typeof stateModifier === "function") {
    const modifiedState = stateModifier(currentState);

    if (typeof modifiedState === "object") {
      return { ...currentState, ...modifiedState };
    }

    return modifiedState;
  }

  return stateModifier;
};
