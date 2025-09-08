import { merge } from "./merge";

type Listener<TState extends object> = (state: TState) => void;

export type StorageAPI = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

export type AsyncStorageAPI = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Serializer<T = any> = {
  stringify: (value: T) => string;
  parse: (value: string) => T;
};

export type PersistenceConfiguration<TState extends object> = {
  /** The unique key used to identify this store in storage. */
  key: string;
  /** The storage to use for persisting the state. Can be sync (like localStorage) or async (like AsyncStorage). */
  storage: StorageAPI | AsyncStorageAPI;
  /** The serializer to use for storing the state. Defaults to JSON. */
  serializer?: Serializer<TState>;
};

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

export type StoreConfiguration<
  TState extends object,
  TActions extends object,
> = {
  /** The initial state of the store. */
  initialState: TState;
  /** A function that defines actions that can modify the state. */
  defineActions?: DefineActions<TState, TActions>;
  /** Configuration for persisting the store state. */
  persistence?: PersistenceConfiguration<TState>;
  /** Invoked when the store is created. */
  onLoad?: StoreEventHandler<TState>;
  /** Invoked when the store is subscribed to. */
  onAttach?: StoreEventHandler<TState>;
  /** Invoked when the store is unsubscribed from. */
  onDetach?: StoreEventHandler<TState>;
  /** Invoked whenever the state changes. */
  onChange?: StoreEventHandler<TState>;
};

/**
 * Creates a store with an initial state and actions that can modify the state.
 * Optionally supports state persistence with both sync and async storage providers.
 *
 * @param {StoreConfiguration<TState>} [config] - The configuration for the store.
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
 * With localStorage persistence:
 * ```ts
 * import { createStore } from "dharma-core";
 *
 * const store = createStore({
 *   initialState: { count: 0 },
 *   defineActions: ({ set }) => ({
 *     increment: () => set((state) => ({ count: state.count + 1 })),
 *   }),
 *   persistence: {
 *     key: "counter",
 *     storage: localStorage,
 *   },
 * });
 * ```
 * 
 * @example
 * With React Native AsyncStorage:
 * ```ts
 * import { createStore } from "dharma-core";
 * import AsyncStorage from "@react-native-async-storage/async-storage";
 *
 * const store = createStore({
 *   initialState: { count: 0 },
 *   defineActions: ({ set }) => ({
 *     increment: () => set((state) => ({ count: state.count + 1 })),
 *   }),
 *   persistence: {
 *     key: "counter",
 *     storage: AsyncStorage,
 *   },
 * });
 * ```
 */
// Helper function to detect if storage is async
const isAsyncStorage = (storage: StorageAPI | AsyncStorageAPI): storage is AsyncStorageAPI => {
  // Use a safe key that's very unlikely to exist and catch any errors
  try {
    const result = storage.getItem("__dharma_async_detection_test__");
    
    // If it returns a Promise, it's async storage
    if (result instanceof Promise) {
      // Catch any promise rejection to avoid unhandled rejection warnings
      result.catch(() => {
        // Ignore detection errors
      });
      return true;
    }
    
    return false;
  } catch (error) {
    // If calling getItem synchronously throws an error, we assume it's sync storage
    // since async storage should return a rejected Promise, not throw
    return false;
  }
};

export const createStore = <
  TState extends object,
  TActions extends object = Record<never, never>,
>(
  config: StoreConfiguration<TState, TActions>,
): Store<TState, TActions> => {
  const { initialState, defineActions, persistence, onLoad, onAttach, onDetach, onChange } =
    config;

  // If persistence is configured, create a persistent store
  if (persistence) {
    return createPersistentStore(config, persistence);
  }

  // Otherwise, create a regular store
  return createRegularStore(config);
};

// Separate function for creating regular stores
const createRegularStore = <
  TState extends object,
  TActions extends object = Record<never, never>,
>(
  config: StoreConfiguration<TState, TActions>,
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
    }

    listener(state);
    listeners.add(listener);

    return () => {
      listeners.delete(listener);

      if (listeners.size === 0) {
        onDetach?.({ state, set, reset });
      }
    };
  };

  const actions = defineActions
    ? defineActions({ set, get, reset })
    : ({} as TActions);

  onLoad?.({ state, set, reset });

  return {
    get,
    set,
    reset,
    subscribe,
    actions,
  };
};

// Separate function for creating persistent stores
const createPersistentStore = <
  TState extends object,
  TActions extends object = Record<never, never>,
>(
  config: StoreConfiguration<TState, TActions>,
  persistenceConfig: PersistenceConfiguration<TState>,
): Store<TState, TActions> => {
  const { storage, key, serializer = JSON } = persistenceConfig;
  const { onAttach, onDetach, onChange } = config;

  if (isAsyncStorage(storage)) {
    return createAsyncPersistentStoreImpl(config, persistenceConfig);
  } else {
    return createSyncPersistentStoreImpl(config, persistenceConfig);
  }
};

// Implementation for sync storage (like localStorage)
const createSyncPersistentStoreImpl = <
  TState extends object,
  TActions extends object = Record<never, never>,
>(
  config: StoreConfiguration<TState, TActions>,
  persistenceConfig: PersistenceConfiguration<TState>,
): Store<TState, TActions> => {
  const { storage, key, serializer = JSON } = persistenceConfig;
  const { initialState, onAttach, onDetach, onChange } = config;
  const syncStorage = storage as StorageAPI;

  const IS_BROWSER = typeof window !== "undefined";
  
  // If we're in Node.js and no custom storage is provided, fall back to regular store
  if (!IS_BROWSER && syncStorage === (globalThis as any).localStorage) {
    return createRegularStore(config);
  }

  const initialStateKey = `init_${key}`;

  try {
    const initialStateSnapshot = syncStorage.getItem(initialStateKey);
    const initialStateString = serializer.stringify(initialState);

    if (initialStateSnapshot !== initialStateString) {
      syncStorage.setItem(initialStateKey, initialStateString);
      syncStorage.removeItem(key);
    }
  } catch (error) {
    // If storage fails, fall back to regular store
    console.warn("Failed to access storage, falling back to regular store:", error);
    return createRegularStore(config);
  }

  const updateSnapshot = (newState: TState) => {
    try {
      const currentSnapshot = syncStorage.getItem(key);
      const newSnapshot = serializer.stringify(newState);

      if (newSnapshot !== currentSnapshot) {
        syncStorage.setItem(key, newSnapshot);
      }
    } catch (error) {
      console.warn("Failed to write to sync storage:", error);
    }
  };

  const updateState = (store: Store<TState, TActions>) => {
    try {
      const currentSnapshot = syncStorage.getItem(key);

      if (
        currentSnapshot &&
        currentSnapshot !== serializer.stringify(store.get())
      ) {
        store.set(serializer.parse(currentSnapshot));
      }
    } catch (error) {
      console.warn("Failed to read from sync storage:", error);
    }
  };

  const store = createRegularStore({
    ...config,
    onAttach: (ctx) => {
      onAttach?.(ctx);
      updateState(store);
      if (IS_BROWSER) {
        window.addEventListener("focus", () => updateState(store));
      }
    },
    onDetach: (ctx) => {
      onDetach?.(ctx);
      if (IS_BROWSER) {
        window.removeEventListener("focus", () => updateState(store));
      }
    },
    onChange: ({ state, ...ctx }) => {
      onChange?.({ state, ...ctx });
      updateSnapshot(state);
    },
  });

  return store;
};

// Implementation for async storage (like AsyncStorage)
const createAsyncPersistentStoreImpl = <
  TState extends object,
  TActions extends object = Record<never, never>,
>(
  config: StoreConfiguration<TState, TActions>,
  persistenceConfig: PersistenceConfiguration<TState>,
): Store<TState, TActions> => {
  const { storage, key, serializer = JSON } = persistenceConfig;
  const { initialState, onAttach, onDetach, onChange } = config;
  const asyncStorage = storage as AsyncStorageAPI;

  const initialStateKey = `init_${key}`;
  let isLoadingFromStorage = false;

  const updateSnapshot = async (newState: TState) => {
    try {
      const currentSnapshot = await asyncStorage.getItem(key);
      const newSnapshot = serializer.stringify(newState);

      if (newSnapshot !== currentSnapshot) {
        await asyncStorage.setItem(key, newSnapshot);
      }
    } catch (error) {
      // Silently ignore storage errors during writes
      console.warn("Failed to write to async storage:", error);
    }
  };

  const loadFromStorage = async (store: Store<TState, TActions>) => {
    if (isLoadingFromStorage) return;
    isLoadingFromStorage = true;

    try {
      // Check if initial state has changed
      const initialStateSnapshot = await asyncStorage.getItem(initialStateKey);
      const initialStateString = serializer.stringify(initialState);

      if (initialStateSnapshot !== initialStateString) {
        await asyncStorage.setItem(initialStateKey, initialStateString);
        await asyncStorage.removeItem(key);
        return;
      }

      // Load persisted state if available
      const currentSnapshot = await asyncStorage.getItem(key);
      if (
        currentSnapshot &&
        currentSnapshot !== serializer.stringify(store.get())
      ) {
        const parsedState = serializer.parse(currentSnapshot);
        store.set(parsedState);
      }
    } catch (error) {
      // Silently ignore storage errors during reads
      console.warn("Failed to read from async storage:", error);
    } finally {
      isLoadingFromStorage = false;
    }
  };

  const store = createRegularStore({
    ...config,
    onAttach: (ctx) => {
      onAttach?.(ctx);
      // Load from storage when first subscriber attaches
      loadFromStorage(store);
    },
    onDetach: (ctx) => {
      onDetach?.(ctx);
    },
    onChange: ({ state, ...ctx }) => {
      onChange?.({ state, ...ctx });
      // Fire-and-forget write to storage
      updateSnapshot(state);
    },
  });

  return store;
};
