import { SetState, StorageAPI, StoreConfig } from "../types/types";
import { warn } from "./warn";

export const createStorageAdapter = <TState, TActions>(
  config: StoreConfig<TState, TActions>,
  get: () => TState,
  set: SetState<TState>,
) => {
  if (!config.persist) {
    return null;
  }

  const IS_BROWSER = typeof window !== "undefined";

  const storage =
    config.storage ?? (IS_BROWSER ? (localStorage as StorageAPI) : undefined);

  if (!storage) {
    warn(
      "No storage provider found. If this happened during SSR, you can safely ignore this warning.",
    );
    return null;
  }

  const {
    key,
    serializer = JSON,
    initialState,
    onStorageLoad,
    onStorageError,
  } = config;
  const initKey = `init_${key}`;

  const onLoad = async () => {
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

      onStorageLoad?.({ state: get(), key });
    } catch (error) {
      warn(
        "Failed to initialize snapshots. If this happened during SSR, you can safely ignore this warning.",
      );
      onStorageError?.({ state: get(), key, error });
    }
  };

  const syncWithSnapshot = async () => {
    try {
      let currentSnapshot = storage.getItem(key);

      if (currentSnapshot instanceof Promise) {
        currentSnapshot = await currentSnapshot;
      }

      if (currentSnapshot && currentSnapshot !== serializer.stringify(get())) {
        set(serializer.parse(currentSnapshot));
      }

      config.onStorageSync?.({ state: get(), key });
    } catch (error) {
      warn("Failed to update state from snapshot");
      config.onStorageError?.({ state: get(), key, error });
    }
  };

  const onAttach = () => {
    syncWithSnapshot();

    if (IS_BROWSER) {
      window.addEventListener("focus", syncWithSnapshot);
    }
  };

  const onChange = async (newState: TState) => {
    try {
      let currentSnapshot = storage.getItem(key);
      const newSnapshot = serializer.stringify(newState);

      if (currentSnapshot instanceof Promise) {
        currentSnapshot = await currentSnapshot;
      }

      if (newSnapshot !== currentSnapshot) {
        storage.setItem(key, newSnapshot);
      }

      config.onStorageChange?.({ state: newState, key });
    } catch (error) {
      warn("Failed to update snapshot");
      config.onStorageError?.({ state: newState, key, error });
    }
  };

  const onDetach = () => {
    if (IS_BROWSER) {
      window.removeEventListener("focus", syncWithSnapshot);
    }
  };

  return {
    onLoad,
    onChange,
    onAttach,
    onDetach,
  };
};
