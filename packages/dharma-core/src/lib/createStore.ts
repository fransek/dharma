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

  const get = () => state;

  const setSilently = (stateModifier: StateModifier<TState>) => {
    state = merge(state, stateModifier);
    return state;
  };

  const set = (stateModifier: StateModifier<TState>) => {
    const prevState = state;
    setSilently(stateModifier);

    if (!Object.is(state, prevState)) {
      dispatch();
    }

    return state;
  };

  const resetSilently = () => setSilently(initialState);

  const reset = () => set(initialState);

  const getContext = (): StoreEventContext<TState> => ({
    state,
    set,
    reset,
    initialState,
  });

  const listeners = new Set<Listener<TState>>();
  const actions = config.actions?.({
    set,
    get,
    reset,
    initialState,
  }) as TActions;
  const storageAdapter = createStorageAdapter(config, get, set, getContext);

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
    onChange?.({
      state,
      set: setSilently,
      reset: resetSilently,
      initialState,
    });
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
