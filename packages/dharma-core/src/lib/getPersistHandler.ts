import { SetState, StoreConfig } from "./createStore";

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

  const storage = config.storage ?? (isBrowser ? localStorage : undefined);

  if (!storage) {
    return null;
  }

  const { key, serializer = JSON, initialState } = config;
  const initKey = `init_${key}`;

  const initializeSnapshots = () => {
    const initialStateSnapshot = storage.getItem(initKey);
    const initialStateString = serializer.stringify(initialState);

    if (initialStateSnapshot !== initialStateString) {
      storage.setItem(initKey, initialStateString);
      storage.removeItem(key);
    }
  };

  const updateSnapshot = (newState: TState) => {
    const currentSnapshot = storage.getItem(key);
    const newSnapshot = serializer.stringify(newState);

    if (newSnapshot !== currentSnapshot) {
      storage.setItem(key, newSnapshot);
    }
  };

  const updateState = () => {
    const currentSnapshot = storage.getItem(key);

    if (currentSnapshot && currentSnapshot !== serializer.stringify(get())) {
      set(serializer.parse(currentSnapshot));
    }
  };

  return {
    initializeSnapshots,
    updateSnapshot,
    updateState,
  };
};
