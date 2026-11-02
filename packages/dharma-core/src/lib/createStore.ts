import { createStorageAdapter } from "../internal/createStorageAdapter";
import {
  Listener,
  StateModifier,
  Store,
  StoreConfig,
  StoreEventContext,
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

  const actions = config.actions?.({
    set,
    get,
    reset,
    initialState,
  }) as TActions;

  // TODO: Replace with a static object once `state` is removed.
  const getContext = (): StoreEventContext<TState> => ({
    get,
    state,
    set,
    reset,
    initialState,
  });

  const storageAdapter = createStorageAdapter(config, get, set);

  const subscribe = (listener: Listener<TState>) => {
    if (listeners.size === 0) {
      storageAdapter?.onAttach();
      onAttach?.(getContext());
    }

    listener(state);
    listeners.add(listener);

    return () => {
      if (listeners.delete(listener) && listeners.size === 0) {
        storageAdapter?.onDetach();
        onDetach?.(getContext());
      }
    };
  };

  const dispatch = () => {
    isSilent = true;
    try {
      onChange?.(getContext());
    } finally {
      isSilent = false;
    }
    storageAdapter?.onChange(state);
    listeners.forEach((listener) => listener(state));
  };

  storageAdapter?.onLoad();
  onLoad?.(getContext());

  return {
    get,
    subscribe,
    actions,
    set,
    reset,
    initialState,
  };
};
