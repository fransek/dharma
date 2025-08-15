import { merge } from "./merge";

export type Store<TState extends object, TActions extends object> = {
  /** Returns the current state of the store. */
  get: () => TState;
  /** Sets the state of the store. */
  set: (stateModifier: StateModifier<TState>) => TState;
  /** Actions that can modify the state of the store. */
  actions: TActions;
  /** Subscribes to changes in the state of the store. Returns an unsubscribe function. */
  subscribe: (listener: Listener) => Listener;
};

type Listener = () => void;

export type StoreEventHandler<TState extends object> = (
  state: TState,
  set: SetState<TState>,
) => void;

export type SetState<TState extends object> = (
  stateModifier: StateModifier<TState>,
) => TState;

export type StateModifier<TState extends object> =
  | Partial<TState>
  | ((state: TState) => Partial<TState>);

export type DefineActions<TState extends object, TActions> = (
  set: (stateModifier: StateModifier<TState>) => TState,
  get: () => TState,
) => TActions;

export type StoreOptions<TState extends object> = {
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
 *
 * @param {TState} initialState - The initial state of the store.
 * @param {DefineActions<TState, TActions>} [defineActions] - A function that defines actions that can modify the state.
 * @param {StoreOptions<TState>} [options] - Additional options for the store.
 *
 * @returns {Store<TState, TActions>} The created store with state management methods.
 *
 * @example
 * ```ts
 * import { createStore } from "dharma-core";
 *
 * const store = createStore({ count: 0 }, (set) => ({
 *   increment: () => set((state) => ({ count: state.count + 1 })),
 *   decrement: () => set((state) => ({ count: state.count - 1 })),
 *   reset: () => set({ count: 0 }),
 * }));
 * ```
 * @group Core
 */
export const createStore = <
  TState extends object,
  TActions extends object = Record<never, never>,
>(
  initialState: TState,
  defineActions: DefineActions<TState, TActions>,
  { onLoad, onAttach, onDetach, onChange }: StoreOptions<TState> = {},
): Store<TState, TActions> => {
  let state = initialState;
  const listeners = new Set<Listener>();

  const get = () => state;

  const setSilently = (stateModifier: StateModifier<TState>) => {
    state = merge(state, stateModifier);
    return state;
  };

  const dispatch = () => {
    onChange?.(state, setSilently);
    listeners.forEach((listener) => listener());
  };

  const set = (stateModifier: StateModifier<TState>) => {
    setSilently(stateModifier);
    dispatch();
    return state;
  };

  const subscribe = (listener: Listener) => {
    if (listeners.size === 0) {
      onAttach?.(state, set);
    }

    listeners.add(listener);

    return () => {
      listeners.delete(listener);

      if (listeners.size === 0) {
        onDetach?.(state, set);
      }
    };
  };

  const actions = defineActions ? defineActions(set, get) : ({} as TActions);

  onLoad?.(state, set);

  return {
    get,
    set,
    subscribe,
    actions,
  };
};
