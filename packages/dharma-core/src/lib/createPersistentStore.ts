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
  key: string;
  /** The storage to use for persisting the state. Defaults to local storage. */
  storage?: StorageAPI | "local" | "session";
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
 * @param {string} key - A unique key to identify the store in storage.
 * @param {TState} initialState - The initial state of the store.
 * @param {DefineActions<TState, TActions>} [defineActions] - A function to define actions for the store.
 * @param {PersistentStoreConfiguration<TState>} [options] - Additional options for the persistent store.
 *
 * @returns {Store<TState, TActions>} The created store.
 *
 * @example
 * Basic usage:
 * ```ts
 * import { createPersistentStore } from "dharma-core";
 *
 * const store = createPersistentStore("count", { count: 0 }, ({ set }) => ({
 *   increment: () => set((state) => ({ count: state.count + 1 })),
 *   decrement: () => set((state) => ({ count: state.count - 1 })),
 *   reset: () => set({ count: 0 }),
 * }));
 * ```
 * @example
 * With superjson serialization and session storage:
 * ```ts
 * import { createPersistentStore } from "dharma-core";
 * import superjson from "superjson";
 *
 * const store = createPersistentStore(
 *   "count",
 *   { count: 0 },
 *   ({ set }) => ({
 *     increment: () => set((state) => ({ count: state.count + 1 })),
 *     decrement: () => set((state) => ({ count: state.count - 1 })),
 *     reset: () => set({ count: 0 }),
 *   }),
 *   {
 *     serializer: superjson,
 *     storage: "session",
 *   },
 * );
 * ```
 * @group Core
 */
export const createPersistentStore = <
  TState extends object,
  TActions extends object = Record<never, never>,
>(
  options: PersistentStoreConfiguration<TState, TActions>,
): Store<TState, TActions> => {
  if (typeof window === "undefined") {
    return createStore(options);
  }

  const {
    key,
    initialState,
    storage: _storage = "local",
    serializer = JSON,
    onAttach,
    onDetach,
    onChange,
    ...rest
  } = options;

  const storage = getStorage(_storage);
  const stateKey = `store_${key}`;
  const initialStateKey = `init_${key}`;
  const initialStateSnapshot = storage.getItem(initialStateKey);
  const initialStateString = serializer.stringify(initialState);

  if (initialStateSnapshot !== initialStateString) {
    storage.setItem(initialStateKey, initialStateString);
    storage.removeItem(stateKey);
  }

  const updateSnapshot = (newState: TState) => {
    const currentSnapshot = storage.getItem(stateKey);
    const newSnapshot = serializer.stringify(newState);

    if (newSnapshot !== currentSnapshot) {
      storage.setItem(stateKey, newSnapshot);
    }
  };

  const updateState = () => {
    const currentSnapshot = storage.getItem(stateKey);

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
      window.addEventListener("focus", updateState);
    },
    onDetach: (ctx) => {
      onDetach?.(ctx);
      window.removeEventListener("focus", updateState);
    },
    onChange: ({ state, ...ctx }) => {
      onChange?.({ state, ...ctx });
      updateSnapshot(state);
    },
    ...rest,
  });

  return store;
};

const getStorage = (storage: StorageAPI | "local" | "session"): StorageAPI => {
  switch (storage) {
    case "local":
      return localStorage;
    case "session":
      return sessionStorage;
    default:
      return storage;
  }
};
