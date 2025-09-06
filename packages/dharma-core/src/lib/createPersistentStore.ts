import { createStore, Store, StoreConfiguration } from "./createStore";

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

export type PersistentStoreConfiguration<
  TState extends object,
  TActions extends object,
> = StoreConfiguration<TState, TActions> & {
  /** The unique key used to identify this store in storage. */
  key: string;
  /** The storage to use for persisting the state. Defaults to local storage if available. */
  storage?: StorageAPI;
  /** The serializer to use for storing the state. Defaults to JSON. */
  serializer?: Serializer<TState>;
};

/**
 * Creates a store that persists its state in local or session storage.
 * Defaults to local storage but this can be changed in the options.
 *
 * **Note:** The state needs to be serializable by whatever serializer you use. (JSON by default)
 * If you need something more versatile I would recommend using a library like [superjson](https://github.com/flightcontrolhq/superjson).
 *
 * @param {PersistentStoreConfiguration<TState, TActions>} config - The configuration for the persistent store.
 *
 * @returns {Store<TState, TActions>} The created store.
 *
 * @example
 * Basic usage:
 * ```ts
 * import { createPersistentStore } from "dharma-core";
 *
 * const store = createPersistentStore({
 *   key: "count",
 *   initialState: { count: 0 },
 *   defineActions: ({ set }) => ({
 *     increment: () => set((state) => ({ count: state.count + 1 })),
 *     decrement: () => set((state) => ({ count: state.count - 1 })),
 *     reset: () => set({ count: 0 }),
 *   }),
 * });
 * ```
 * @example
 * With superjson serialization and session storage:
 * ```ts
 * import { createPersistentStore } from "dharma-core";
 * import superjson from "superjson";
 *
 * const store = createPersistentStore({
 *   key: "count",
 *   initialState: { count: 0 },
 *   defineActions: ({ set }) => ({
 *     increment: () => set((state) => ({ count: state.count + 1 })),
 *     decrement: () => set((state) => ({ count: state.count - 1 })),
 *     reset: () => set({ count: 0 }),
 *   }),
 *   serializer: superjson,
 *   storage: sessionStorage,
 * });
 * ```
 */
export const createPersistentStore = <
  TState extends object,
  TActions extends object = Record<never, never>,
>(
  config: PersistentStoreConfiguration<TState, TActions>,
): Store<TState, TActions> => {
  const {
    key,
    initialState,
    storage: customStorage,
    serializer = JSON,
    onAttach,
    onDetach,
    onChange,
    ...rest
  } = config;

  const IS_BROWSER = typeof window !== "undefined";
  const storage = customStorage ?? (IS_BROWSER ? localStorage : undefined);

  if (!storage) {
    return createStore(config);
  }

  const initialStateKey = `init_${key}`;

  const initialStateSnapshot = storage.getItem(initialStateKey);
  const initialStateString = serializer.stringify(initialState);

  if (initialStateSnapshot !== initialStateString) {
    storage.setItem(initialStateKey, initialStateString);
    storage.removeItem(key);
  }

  const updateSnapshot = (newState: TState) => {
    const currentSnapshot = storage.getItem(key);
    const newSnapshot = serializer.stringify(newState);

    if (newSnapshot !== currentSnapshot) {
      storage.setItem(key, newSnapshot);
    }
  };

  const updateState = () => {
    const currentSnapshot = storage.getItem(key);

    if (
      currentSnapshot &&
      currentSnapshot !== serializer.stringify(store.get())
    ) {
      store.set(serializer.parse(currentSnapshot));
    }
  };

  const store = createStore({
    initialState,
    onAttach: (ctx) => {
      onAttach?.(ctx);
      updateState();
      if (IS_BROWSER) {
        window.addEventListener("focus", updateState);
      }
    },
    onDetach: (ctx) => {
      onDetach?.(ctx);
      if (IS_BROWSER) {
        window.removeEventListener("focus", updateState);
      }
    },
    onChange: ({ state, ...ctx }) => {
      onChange?.({ state, ...ctx });
      updateSnapshot(state);
    },
    ...rest,
  });

  return store;
};
