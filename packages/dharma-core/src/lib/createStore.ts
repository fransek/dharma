import { createStorageAdapter } from "./createStorageAdapter";
import { merge } from "./merge";

export type Listener<TState extends object> = (state: TState) => void;

export type SetState<TState extends object> = (
  stateModifier: StateModifier<TState>,
) => TState;

export type Store<TState extends object, TActions extends object> = {
  /** Returns the current state of the store. */
  get: () => TState;
  /** Sets the state of the store. */
  set: SetState<TState>;
  /** Resets the state of the store to its initial value. */
  reset: () => TState;
  /** Actions that can modify the state of the store. */
  actions: TActions;
  /** Subscribes to changes in the state of the store. Returns an unsubscribe function. */
  subscribe: (listener: Listener<TState>) => () => void;
};

export type StoreEventContext<TState extends object> = {
  /** The current state of the store. */
  state: TState;
  /** Sets the state of the store. */
  set: SetState<TState>;
  /** Resets the state of the store to its initial value. */
  reset: () => TState;
};

export type StoreEventHandler<TState extends object> = (
  context: StoreEventContext<TState>,
) => void;

export type StateModifier<TState extends object> =
  | Partial<TState>
  | ((state: TState) => Partial<TState>);

export type StateHandler<TState extends object> = {
  /** Returns the current state of the store. */
  get: () => TState;
  /** Sets the state of the store. */
  set: SetState<TState>;
  /** Resets the state of the store to its initial value. */
  reset: () => TState;
};

export type DefineActions<TState extends object, TActions> = (
  stateHandler: StateHandler<TState>,
) => TActions;

export type BaseConfig<TState extends object, TActions extends object> = {
  /** The initial state of the store. */
  initialState: TState;
  /** A function that defines actions that can modify the state. */
  defineActions?: DefineActions<TState, TActions>;
  /** Invoked when the store is created. */
  onLoad?: StoreEventHandler<TState>;
  /** Invoked when the store is subscribed to. */
  onAttach?: StoreEventHandler<TState>;
  /** Invoked when the store is unsubscribed from. */
  onDetach?: StoreEventHandler<TState>;
  /** Invoked whenever the state changes. */
  onChange?: StoreEventHandler<TState>;
};

export type MaybePromise<T> = T | Promise<T>;

export type StorageAPI = {
  getItem: (key: string) => MaybePromise<string | null>;
  setItem: (key: string, value: string) => MaybePromise<void>;
  removeItem: (key: string) => MaybePromise<void>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Serializer<T = any> = {
  stringify: (value: T) => string;
  parse: (value: string) => T;
};

export type NoPersistConfig = {
  /** Whether to persist the state of the store. */
  persist?: false;
};

export type PersistConfig<TState extends object> = {
  /** Whether to persist the state of the store. */
  persist: true;
  /** The unique key used to identify this store in storage. */
  key: string;
  /** The storage to use for persisting the state. Defaults to local storage if available. */
  storage?: StorageAPI;
  /** The serializer to use for storing the state. Defaults to JSON. */
  serializer?: Serializer<TState>;
};

export type StoreConfig<
  TState extends object,
  TActions extends object,
> = BaseConfig<TState, TActions> & (PersistConfig<TState> | NoPersistConfig);

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
 * With event handlers:
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
 * Persistent store (uses local storage by default):
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
 * With superjson serialization and session storage:
 * ```ts
 * import { createStore } from "dharma-core";
 * import superjson from "superjson";
 *
 * const store = createStore({
 *   persist: true,
 *   key: "count",
 *   serializer: superjson,
 *   storage: sessionStorage,
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
