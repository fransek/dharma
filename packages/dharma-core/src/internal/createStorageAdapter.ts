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

  const { key, serializer = JSON, syncWithStorageOn = "load" } = config;

  const syncWithSnapshot = async () => {
    try {
      let currentSnapshot = storage.getItem(key);

      if (currentSnapshot instanceof Promise) {
        currentSnapshot = await currentSnapshot;
      }

      if (currentSnapshot && currentSnapshot !== serializer.stringify(get())) {
        set(serializer.parse(currentSnapshot));
      }
    } catch (e) {
      warn(
        "Failed to sync state with snapshot. If this happened during SSR, you can safely ignore this warning.",
      );
      console.error(e);
    }
  };

  const onLoad = () => {
    if (syncWithStorageOn === "load") {
      syncWithSnapshot();
    }
  };

  const onAttach = () => {
    if (syncWithStorageOn === "attach") {
      syncWithSnapshot();
    }

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
    } catch (e) {
      warn("Failed to update snapshot");
      console.error(e);
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
