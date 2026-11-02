import { createStorageAdapter } from "../internal/createStorageAdapter";
import {
  Listener,
  StateContext,
  StateModifier,
  Store,
  StoreConfig,
} from "../types/types";
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

  // Set while onChange runs, so its synchronous sets join the current dispatch
  let isSilent = false;

  const get = () => state;

  const set = (stateModifier: StateModifier<TState>) => {
    const prevState = state;
    state = merge(state, stateModifier);

    if (!Object.is(state, prevState) && !isSilent) {
      dispatch();
    }

    return state;
  };

  const reset = () => set(initialState);

  const listeners = new Set<Listener<TState>>();

  const ctx: StateContext<TState> = {
    get,
    set,
    reset,
    initialState,
  };

  const actions = config.actions?.(ctx) as TActions;

  const storageAdapter = createStorageAdapter(config, get, set);

  const subscribe = (listener: Listener<TState>) => {
    if (listeners.size === 0) {
      storageAdapter?.onAttach();
      onAttach?.(ctx);
    }

    listener(state);
    listeners.add(listener);

    return () => {
      if (listeners.delete(listener) && listeners.size === 0) {
        storageAdapter?.onDetach();
        onDetach?.(ctx);
      }
    };
  };

  const dispatch = () => {
    isSilent = true;
    try {
      onChange?.(ctx);
    } finally {
      isSilent = false;
    }
    storageAdapter?.onChange(state);
    listeners.forEach((listener) => listener(state));
  };

  storageAdapter?.onLoad();
  onLoad?.(ctx);

  return {
    get,
    subscribe,
    actions,
    set,
    reset,
    initialState,
  };
};
