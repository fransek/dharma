import { SetState, StorageAPI, StoreConfig } from "./createStore";

export const getPersistHandler = <
  TState extends object,
  TActions extends object = Record<never, never>,
>(
  config: StoreConfig<TState, TActions>,
  isBrowser: boolean,
  get: () => TState,
  set: SetState<TState>,
) => {
  if (!config.persist) {
    return null;
  }

  const storage =
    config.storage ?? (isBrowser ? (localStorage as StorageAPI) : undefined);

  if (!storage) {
    return null;
  }

  const { key, serializer = JSON, initialState } = config;
  const initKey = `init_${key}`;

  const initializeSnapshots = async () => {
    try {
      let initialStateSnapshot = storage.getItem(initKey);
      const initialStateString = serializer.stringify(initialState);

      if (initialStateSnapshot instanceof Promise) {
        initialStateSnapshot = await initialStateSnapshot;
      }

      if (initialStateSnapshot !== initialStateString) {
        storage.setItem(initKey, initialStateString);
        storage.removeItem(key);
      }
    } catch {}
  };

  const updateSnapshot = async (newState: TState) => {
    try {
      let currentSnapshot = storage.getItem(key);
      const newSnapshot = serializer.stringify(newState);

      if (currentSnapshot instanceof Promise) {
        currentSnapshot = await currentSnapshot;
      }

      if (newSnapshot !== currentSnapshot) {
        storage.setItem(key, newSnapshot);
      }
    } catch {}
  };

  const updateState = async () => {
    try {
      let currentSnapshot = storage.getItem(key);

      if (currentSnapshot instanceof Promise) {
        currentSnapshot = await currentSnapshot;
      }

      if (currentSnapshot && currentSnapshot !== serializer.stringify(get())) {
        set(serializer.parse(currentSnapshot));
      }
    } catch {}
  };

  return {
    initializeSnapshots,
    updateSnapshot,
    updateState,
  };
};
