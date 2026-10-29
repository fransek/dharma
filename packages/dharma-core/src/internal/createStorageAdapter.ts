import { SetState, StorageAPI, StoreConfig } from "../types/types";
import { warn } from "./warn";

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

  if (!storage) {
    // Only warn on the first change, so stores that are only read during SSR stay quiet
    let hasWarned = false;
    const noop = () => {};

    return {
      onLoad: noop,
      onAttach: noop,
      onDetach: noop,
      onChange: () => {
        if (!hasWarned) {
          hasWarned = true;
          warn(
            `State changes to "${config.key}" won't be persisted because no storage is available. Pass a \`storage\` option to persist outside the browser.`,
          );
        }
      },
    };
  }

  const { key, serializer = JSON, syncWithStorageOn = "load" } = config;

  const syncWithSnapshot = async () => {
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

  // Syncs changes made in other tabs
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
    } catch (e) {
      warn("Failed to update snapshot");
      console.error(e);
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
