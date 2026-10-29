import { StateModifier } from "../types/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isObject = (value: unknown): value is Record<keyof any, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

/**
 * Merges the current state with a state modifier.
 *
 * @param {T} currentState - The current state object.
 * @param {StateModifier<T>} stateModifier - A function or object that modifies the state.
 * @returns {T} The new state object, which is a combination of the current state and the state modifier.
 * Returns `currentState` itself if the state modifier resolves to it.
 *
 * @see {@link https://dharma.fransek.dev/core/merge/}
 */
export const merge = <T>(
  currentState: T,
  stateModifier: StateModifier<T>,
): T => {
  const modifiedState =
    typeof stateModifier === "function"
      ? stateModifier(currentState)
      : stateModifier;

  if (Object.is(modifiedState, currentState)) {
    return currentState;
  }

  if (isObject(modifiedState)) {
    return { ...currentState, ...modifiedState };
  }

  return modifiedState as T;
};
