import { createStorageAdapter } from "./createStorageAdapter";
import { merge } from "./merge";
import { Listener, StateModifier, Store, StoreConfig } from "./types";

/**
 * Creates a store with an initial state and actions that can modify the state.
 *
 * @param {StoreConfig<TState, TActions>} [config] - The configuration for the store.
 *
 * @returns {Store<TState, TActions>} The created store with state management methods.
 *
 * @example
 * Basic usage:
 * ```ts
 * import { createStore } from "dharma-core";
 *
 * const store = createStore({
 *   initialState: { count: 0 },
 *   defineActions: ({ set }) => ({
 *     increment: () => set((state) => ({ count: state.count + 1 })),
 *     decrement: () => set((state) => ({ count: state.count - 1 })),
 *   }),
 * });
 * ```
 *
 * @example
 * Lifecycle hooks:
 * ```ts
 * import { createStore } from "dharma-core";
 * import { State } from "./types";
 *
 * const initialState: State = { data: null, loading: true, error: null };
 *
 * const store = createStore({
 *   initialState,
 *   onAttach: async ({ set }) => {
 *     try {
 *       const response = await fetch("https://api.example.com/data");
 *       const data = await response.json();
 *       set({ data, loading: false });
 *     } catch (error) {
 *       set({ error, loading: false });
 *     }
 *   },
 *   onDetach: ({ reset }) => reset(),
 * });
 * ```
 *
 * @example
 * Persisting state:
 * ```ts
 * import { createStore } from "dharma-core";
 *
 * const store = createStore({
 *   persist: true,
 *   key: "count",
 *   initialState: { count: 0 },
 *   defineActions: ({ set }) => ({
 *     increment: () => set((state) => ({ count: state.count + 1 })),
 *     decrement: () => set((state) => ({ count: state.count - 1 })),
 *   }),
 * });
 * ```
 *
 * **Note:** The state needs to be serializable by whatever serializer you choose (JSON by default).
 * If you need something more versatile I would recommend using a library like [superjson](https://github.com/flightcontrolhq/superjson).
 *
 * @example
 * Custom storage and serializer:
 * ```ts
 * import { createStore } from "dharma-core";
 * import superjson from "superjson";
 *
 * const store = createStore({
 *   persist: true,
 *   key: "count",
 *   storage: sessionStorage,
 *   serializer: superjson,
 *   initialState: { count: 0 },
 *   defineActions: ({ set }) => ({
 *     increment: () => set((state) => ({ count: state.count + 1 })),
 *     decrement: () => set((state) => ({ count: state.count - 1 })),
 *   }),
 * });
 * ```
 */
export const createStore = <
  TState extends object,
  TActions extends object = Record<never, never>,
>(
  config: StoreConfig<TState, TActions>,
): Store<TState, TActions> => {
  const { initialState, defineActions, onLoad, onAttach, onDetach, onChange } =
    config;

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
  const actions = defineActions
    ? defineActions({ set, get, reset })
    : ({} as TActions);
  const storageAdapter = createStorageAdapter(config, get, set);

  const subscribe = (listener: Listener<TState>) => {
    if (listeners.size === 0) {
      onAttach?.({ state, set, reset });
      storageAdapter?.onAttach();
    }

    listener(state);
    listeners.add(listener);

    return () => {
      listeners.delete(listener);

      if (listeners.size === 0) {
        onDetach?.({ state, set, reset });
        storageAdapter?.onDetach();
      }
    };
  };

  const dispatch = () => {
    onChange?.({
      state,
      set: setSilently,
      reset: resetSilently,
    });
    storageAdapter?.onChange(state);
    listeners.forEach((listener) => listener(state));
  };

  onLoad?.({ state, set, reset });
  storageAdapter?.onLoad();

  return {
    get,
    set,
    reset,
    subscribe,
    actions,
  };
};
