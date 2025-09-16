export type Listener<TState> = (state: TState) => void;

export type SetState<TState> = (stateModifier: StateModifier<TState>) => TState;

export type Store<TState, TActions> = {
  /** Returns the current state of the store. */
  get: () => TState;
  /** Actions that can modify the state of the store. */
  actions: TActions;
  /** Subscribes to changes in the state of the store. Returns an unsubscribe function. */
  subscribe: (listener: Listener<TState>) => () => void;
};

export type StoreEventContext<TState> = {
  /** The current state of the store. */
  state: TState;
  /** Sets the state of the store. */
  set: SetState<TState>;
  /** Resets the state of the store to its initial value. */
  reset: () => TState;
};

export type StoreEventListener<TState> = (
  context: StoreEventContext<TState>,
) => void;

export type StateModifier<TState> =
  | Partial<TState>
  | ((state: TState) => Partial<TState>);

export type StateHandler<TState> = {
  /** Returns the current state of the store. */
  get: () => TState;
  /** Sets the state of the store. */
  set: SetState<TState>;
  /** Resets the state of the store to its initial value. */
  reset: () => TState;
};

export type DefineActions<TState, TActions> = (
  stateHandler: StateHandler<TState>,
) => TActions;

export type BaseConfig<TState, TActions> = {
  /** The initial state of the store. */
  initialState: TState;
  /** A function that defines actions that can modify the state. */
  defineActions?: DefineActions<TState, TActions>;
  /** Invoked when the store is created. */
  onLoad?: StoreEventListener<TState>;
  /** Invoked when the store is subscribed to. */
  onAttach?: StoreEventListener<TState>;
  /** Invoked when the store is unsubscribed from. */
  onDetach?: StoreEventListener<TState>;
  /** Invoked whenever the state changes. */
  onChange?: StoreEventListener<TState>;
};

export type MaybePromise<T> = T | Promise<T>;

export type StorageAPI = {
  getItem: (key: string) => MaybePromise<string | null>;
  setItem: (key: string, value: string) => MaybePromise<void>;
  removeItem: (key: string) => MaybePromise<void>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Serializer<T = any> = {
  stringify: (value: T) => string;
  parse: (value: string) => T;
};

export type NoPersistConfig = {
  /** Whether to persist the state of the store. */
  persist?: false;
};

export type PersistConfig<TState> = {
  /** Whether to persist the state of the store. */
  persist: true;
  /** The unique key used to identify this store in storage. Required if `persist` is true. */
  key: string;
  /** The storage to use for persisting the state. Defaults to local storage if available. */
  storage?: StorageAPI;
  /** The serializer to use for storing the state. Defaults to JSON. */
  serializer?: Serializer<TState>;
};

export type StoreConfig<TState, TActions> = BaseConfig<TState, TActions> &
  (PersistConfig<TState> | NoPersistConfig);
