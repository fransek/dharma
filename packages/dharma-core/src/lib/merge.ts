import { StateModifier } from "./createStore";

/**
 * Merges the current state with a state modifier.
 * Useful for creating custom set functions.
 *
 * @param {T} stateModifier - A function or object that modifies the state.
 * @param {StateModifier<T>} stateModifier - The current state object.
 * @returns {T} The new state object, which is a combination of the current state and the state modifier.
 *
 * @example
 * ```ts
 * import { createStore, merge, StateModifier } from "@fransek/statekit";
 *
 * const store = createStore(
 *   {
 *     counter: {
 *       count: 0,
 *     },
 *     // ...
 *   },
 *   (set) => {
 *     const setCounter = (counter: StateModifier<{ count: number }>) =>
 *       set((state) => ({
 *         counter: merge(state.counter, counter),
 *       }));
 *
 *     return {
 *       increment: () => setCounter((state) => ({ count: state.count + 1 })),
 *       decrement: () => setCounter((state) => ({ count: state.count - 1 })),
 *       reset: () => setCounter({ count: 0 }),
 *       // ...
 *     };
 *   },
 * );
 * ```
 * @group Utilities
 */
export const merge = <T extends object>(
  currentState: T,
  stateModifier: StateModifier<T>,
): T => {
  const newState =
    typeof stateModifier === "function"
      ? stateModifier(currentState)
      : stateModifier;
  return { ...currentState, ...newState };
};
