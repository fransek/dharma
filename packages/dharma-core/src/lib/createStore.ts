import { createStorageAdapter } from "../internal/createStorageAdapter";
import { Listener, StateModifier, Store, StoreConfig } from "../types/types";
import { merge } from "./merge";

/**
 * Creates a store with an initial state and actions that can modify the state.
 *
 * @param {StoreConfig<TState, TActions>} [config] - The configuration for the store.
 *
 * @returns {Store<TState, TActions>} The created store with state management methods.
 *
 * @see {@link https://dharma.fransek.dev/core/createstore/}
 */
export const createStore = <TState, TActions = undefined>(
  config: StoreConfig<TState, TActions>,
): Store<TState, TActions> => {
  const { initialState, onLoad, onAttach, onDetach, onChange } = config;

  let state = initialState;

  const get = () => state;

  const setSilently = (stateModifier: StateModifier<TState>) => {
    state = merge(state, stateModifier);
    return state;
  };

  const set = (stateModifier: StateModifier<TState>) => {
    setSilently(stateModifier);
    dispatch();
    return state;
  };

  const resetSilently = () => setSilently(initialState);

  const reset = () => {
    resetSilently();
    dispatch();
    return state;
  };

  const listeners = new Set<Listener<TState>>();
  const actions = config.actions?.({
    set,
    get,
    reset,
    initialState,
  }) as TActions;
  const storageAdapter = createStorageAdapter(config, get, set);

  const subscribe = (listener: Listener<TState>) => {
    if (listeners.size === 0) {
      storageAdapter?.onAttach();
      onAttach?.({ state, set, reset, initialState });
    }

    listener(state);
    listeners.add(listener);

    return () => {
      listeners.delete(listener);

      if (listeners.size === 0) {
        storageAdapter?.onDetach();
        onDetach?.({ state, set, reset, initialState });
      }
    };
  };

  const dispatch = () => {
    storageAdapter?.onChange(state);
    onChange?.({
      state,
      set: setSilently,
      reset: resetSilently,
      initialState,
    });
    listeners.forEach((listener) => listener(state));
  };

  storageAdapter?.onLoad();
  onLoad?.({ state, set, reset, initialState });

  return {
    get,
    subscribe,
    actions,
    set,
    reset,
    initialState,
  };
};
