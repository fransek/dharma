import { Serializer } from "./createPersistentStore";
import { createStore, Store, StoreConfiguration } from "./createStore";

export type AsyncStorageAPI = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

export type AsyncPersistentStoreConfiguration<
  TState extends object,
  TActions extends object,
> = StoreConfiguration<TState, TActions> & {
  /** The unique key used to identify this store in storage. */
  key: string;
  /** The async storage to use for persisting the state. */
  storage: AsyncStorageAPI;
  /** The serializer to use for storing the state. Defaults to JSON. */
  serializer?: Serializer<TState>;
};

/**
 * Creates a store that persists its state in async storage like React Native AsyncStorage.
 * The store is created immediately and populated from storage asynchronously.
 *
 * **Note:** The state needs to be serializable by whatever serializer you use. (JSON by default)
 * If you need something more versatile I would recommend using a library like [superjson](https://github.com/flightcontrolhq/superjson).
 *
 * @param {AsyncPersistentStoreConfiguration<TState, TActions>} config - The configuration for the async persistent store.
 *
 * @returns {Store<TState, TActions>} The created store.
 *
 * @example
 * Basic usage with React Native AsyncStorage:
 * ```ts
 * import { createAsyncPersistentStore } from "dharma-core";
 * import AsyncStorage from "@react-native-async-storage/async-storage";
 *
 * const store = createAsyncPersistentStore({
 *   key: "count",
 *   storage: AsyncStorage,
 *   initialState: { count: 0 },
 *   defineActions: ({ set }) => ({
 *     increment: () => set((state) => ({ count: state.count + 1 })),
 *     decrement: () => set((state) => ({ count: state.count - 1 })),
 *     reset: () => set({ count: 0 }),
 *   }),
 * });
 * ```
 * @example
 * With custom serialization:
 * ```ts
 * import { createAsyncPersistentStore } from "dharma-core";
 * import AsyncStorage from "@react-native-async-storage/async-storage";
 * import superjson from "superjson";
 *
 * const store = createAsyncPersistentStore({
 *   key: "count",
 *   storage: AsyncStorage,
 *   initialState: { count: 0 },
 *   defineActions: ({ set }) => ({
 *     increment: () => set((state) => ({ count: state.count + 1 })),
 *     decrement: () => set((state) => ({ count: state.count - 1 })),
 *     reset: () => set({ count: 0 }),
 *   }),
 *   serializer: superjson,
 * });
 * ```
 */
export const createAsyncPersistentStore = <
  TState extends object,
  TActions extends object = Record<never, never>,
>(
  config: AsyncPersistentStoreConfiguration<TState, TActions>,
): Store<TState, TActions> => {
  const {
    key,
    initialState,
    storage,
    serializer = JSON,
    onAttach,
    onDetach,
    onChange,
    ...rest
  } = config;

  const initialStateKey = `init_${key}`;
  let isLoadingFromStorage = false;

  const updateSnapshot = async (newState: TState) => {
    try {
      const currentSnapshot = await storage.getItem(key);
      const newSnapshot = serializer.stringify(newState);

      if (newSnapshot !== currentSnapshot) {
        await storage.setItem(key, newSnapshot);
      }
    } catch (error) {
      // Silently ignore storage errors during writes
      console.warn("Failed to write to async storage:", error);
    }
  };

  const loadFromStorage = async () => {
    if (isLoadingFromStorage) return;
    isLoadingFromStorage = true;

    try {
      // Check if initial state has changed
      const initialStateSnapshot = await storage.getItem(initialStateKey);
      const initialStateString = serializer.stringify(initialState);

      if (initialStateSnapshot !== initialStateString) {
        await storage.setItem(initialStateKey, initialStateString);
        await storage.removeItem(key);
        return;
      }

      // Load persisted state if available
      const currentSnapshot = await storage.getItem(key);
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

  const store = createStore({
    initialState,
    onAttach: (ctx) => {
      onAttach?.(ctx);
      // Load from storage when first subscriber attaches
      loadFromStorage();
    },
    onDetach: (ctx) => {
      onDetach?.(ctx);
    },
    onChange: ({ state, ...ctx }) => {
      onChange?.({ state, ...ctx });
      // Fire-and-forget write to storage
      updateSnapshot(state);
    },
    ...rest,
  });

  return store;
};
