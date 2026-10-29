import { StorageUnavailableError } from "../lib/StorageUnavailableError";
import { SetState, StorageAPI, StoreConfig } from "../types/types";

const isThenable = (value: unknown): value is PromiseLike<unknown> =>
  typeof (value as PromiseLike<unknown> | null)?.then === "function";

const getDefaultStorage = (): StorageAPI | undefined => {
  try {
    // Accessing localStorage can throw, e.g. in sandboxed iframes or when cookies are disabled
    return localStorage;
  } catch {
    return undefined;
  }
};

export const createStorageAdapter = <TState, TActions>(
  config: StoreConfig<TState, TActions>,
  get: () => TState,
  set: SetState<TState>,
) => {
  if (!config.persist) {
    return null;
  }

  const IS_BROWSER = typeof window !== "undefined";
  // React Native defines window without the event listener API
  const CAN_LISTEN =
    IS_BROWSER && typeof window.addEventListener === "function";

  const storage =
    config.storage ?? (IS_BROWSER ? getDefaultStorage() : undefined);

  const {
    key,
    serializer = JSON,
    syncWithStorageOn = "load",
    onStorageError,
  } = config;

  if (!storage) {
    onStorageError?.(new StorageUnavailableError(key));
    return null;
  }

  const syncWithSnapshot = async () => {
    let nextState: TState;

    try {
      const prevState = get();
      let currentSnapshot = storage.getItem(key);

      if (isThenable(currentSnapshot)) {
        currentSnapshot = await currentSnapshot;

        // The state changed while reading, so the snapshot is outdated
        if (!Object.is(get(), prevState)) {
          return;
        }
      }

      if (!currentSnapshot || currentSnapshot === serializer.stringify(get())) {
        return;
      }

      nextState = serializer.parse(currentSnapshot);
    } catch (error) {
      onStorageError?.(error);
      return;
    }

    set(nextState);
  };

  const onLoad = () => {
    if (syncWithStorageOn === "load") {
      syncWithSnapshot();
    }
  };

  const onStorage = (event: StorageEvent) => {
    if (event.key === key && event.storageArea === storage) {
      syncWithSnapshot();
    }
  };

  const onAttach = () => {
    if (syncWithStorageOn === "attach") {
      syncWithSnapshot();
    }

    if (CAN_LISTEN) {
      window.addEventListener("focus", syncWithSnapshot);
      window.addEventListener("storage", onStorage);
    }
  };

  const onChange = async (newState: TState) => {
    try {
      let currentSnapshot = storage.getItem(key);
      const newSnapshot = serializer.stringify(newState);

      if (isThenable(currentSnapshot)) {
        currentSnapshot = await currentSnapshot;
      }

      if (newSnapshot !== currentSnapshot) {
        await storage.setItem(key, newSnapshot);
      }
    } catch (error) {
      onStorageError?.(error);
    }
  };

  const onDetach = () => {
    if (CAN_LISTEN) {
      window.removeEventListener("focus", syncWithSnapshot);
      window.removeEventListener("storage", onStorage);
    }
  };

  return {
    onLoad,
    onChange,
    onAttach,
    onDetach,
  };
};
