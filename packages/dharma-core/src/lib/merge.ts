import { StateModifier } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isObject = (value: unknown): value is Record<keyof any, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

/**
 * Merges the current state with a state modifier.
 *
 * @param {T} currentState - The current state object.
 * @param {StateModifier<T>} stateModifier - A function or object that modifies the state.
 * @returns {T} The new state object, which is a combination of the current state and the state modifier.
 *
 * @see {@link https://dharma.fransek.dev/core/merge/}
 */
export const merge = <T>(
  currentState: T,
  stateModifier: StateModifier<T>,
): T => {
  if (isObject(stateModifier)) {
    return { ...currentState, ...stateModifier };
  }

  if (typeof stateModifier === "function") {
    const modifiedState = stateModifier(currentState);

    if (isObject(modifiedState)) {
      return { ...currentState, ...modifiedState };
    }

    return modifiedState;
  }

  return stateModifier;
};
