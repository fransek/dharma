import { getPersistenceHandlers } from "./getPersistenceHandlers";
import { merge } from "./merge";

type Listener<TState extends object> = (state: TState) => void;

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

export type EventHandlerContext<TState extends object> = {
  /** The current state of the store. */
  state: TState;
  /** Sets the state of the store. */
  set: SetState<TState>;
  /** Resets the state of the store to its initial value. */
  reset: () => TState;
};

export type StoreEventHandler<TState extends object> = (
  context: EventHandlerContext<TState>,
) => void;

export type StateModifier<TState extends object> =
  | Partial<TState>
  | ((state: TState) => Partial<TState>);

export type StateFunctions<TState extends object> = {
  /** Returns the current state of the store. */
  get: () => TState;
  /** Sets the state of the store. */
  set: SetState<TState>;
  /** Resets the state of the store to its initial value. */
  reset: () => TState;
};

export type DefineActions<TState extends object, TActions> = (
  stateFunctions: StateFunctions<TState>,
) => TActions;

type BaseConfig<TState extends object, TActions extends object> = {
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

export type StorageAPI = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Serializer<T = any> = {
  stringify: (value: T) => string;
  parse: (value: string) => T;
};

type NonPersistentConfig = {
  persist?: false;
};

type PersistentConfig<TState extends object> = {
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
> = BaseConfig<TState, TActions> &
  (NonPersistentConfig | PersistentConfig<TState>);

/**
 * Creates a store with an initial state and actions that can modify the state.
 *
 * @param {StoreConfig<TState, TActions>} [config] - The configuration for the store.
 *
 * @returns {Store<TState, TActions>} The created store with state management methods.
 *
 * @example
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
  const listeners = new Set<Listener<TState>>();

  const get = () => state;

  const setSilently = (stateModifier: StateModifier<TState>) => {
    state = merge(state, stateModifier);
    return state;
  };

  const resetSilently = () => setSilently(initialState);

  const dispatch = () => {
    onChange?.({ state, set: setSilently, reset: resetSilently });
    persistenceHandlers?.updateSnapshot(state);
    listeners.forEach((listener) => listener(state));
  };

  const set = (stateModifier: StateModifier<TState>) => {
    setSilently(stateModifier);
    dispatch();
    return state;
  };

  const reset = () => {
    resetSilently();
    dispatch();
    return state;
  };

  const subscribe = (listener: Listener<TState>) => {
    if (listeners.size === 0) {
      onAttach?.({ state, set, reset });
      persistenceHandlers?.updateState();

      if (IS_BROWSER && persistenceHandlers) {
        window.addEventListener("focus", persistenceHandlers.updateState);
      }
    }

    listener(state);
    listeners.add(listener);

    return () => {
      listeners.delete(listener);

      if (listeners.size === 0) {
        onDetach?.({ state, set, reset });

        if (IS_BROWSER && persistenceHandlers) {
          window.removeEventListener("focus", persistenceHandlers.updateState);
        }
      }
    };
  };

  const actions = defineActions
    ? defineActions({ set, get, reset })
    : ({} as TActions);

  const IS_BROWSER = typeof window !== "undefined";
  const persistenceHandlers = getPersistenceHandlers<TState, TActions>(
    config,
    IS_BROWSER,
    get,
    set,
  );

  onLoad?.({ state, set, reset });
  persistenceHandlers?.initializeSnapshots();

  return {
    get,
    set,
    reset,
    subscribe,
    actions,
  };
};
