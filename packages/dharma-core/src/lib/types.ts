export type Listener<TState extends object> = (state: TState) => void;

export type SetState<TState extends object> = (
  stateModifier: StateModifier<TState>,
) => TState;

export type Store<TState extends object, TActions extends object> = {
  /** Returns the current state of the store. */
  get: () => TState;
  /** Sets the state of the store. */
  set: SetState<TState>;
  /** Resets the state of the store to its initial value. */
  reset: () => TState;
  /** Actions that can modify the state of the store. */
  actions: TActions;
  /** Subscribes to changes in the state of the store. Returns an unsubscribe function. */
  subscribe: (listener: Listener<TState>) => () => void;
};

export type StoreEventContext<TState extends object> = {
  /** The current state of the store. */
  state: TState;
  /** Sets the state of the store. */
  set: SetState<TState>;
  /** Resets the state of the store to its initial value. */
  reset: () => TState;
};

export type StoreEventListener<TState extends object> = (
  context: StoreEventContext<TState>,
) => void;

export type DefineActions<TState extends object, TActions> = (
  stateHandler: StateHandler<TState>,
) => TActions;

export type StateModifier<TState extends object> =
  | Partial<TState>
  | ((state: TState) => Partial<TState>);

export type StateHandler<TState extends object> = {
  /** Returns the current state of the store. */
  get: () => TState;
  /** Sets the state of the store. */
  set: SetState<TState>;
  /** Resets the state of the store to its initial value. */
  reset: () => TState;
};

export type DerivedValue<TState extends object, TValue> = (
  state: TState,
) => TValue;

export type DefineDerivedValues<TState extends object> = (
  state: TState,
) => Record<string, unknown>;

export type BaseConfig<TState extends object, TActions extends object> = {
  /** The initial state of the store. */
  initialState: TState;
  /** A function that defines actions that can modify the state. */
  defineActions?: DefineActions<TState, TActions>;
  /** A function that defines derived values computed from the state. */
  defineDerivedValues?: DefineDerivedValues<TState>;
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

export type PersistConfig<TState extends object> = {
  /** Whether to persist the state of the store. */
  persist: true;
  /** The unique key used to identify this store in storage. */
  key: string;
  /** The storage to use for persisting the state. Defaults to local storage if available. */
  storage?: StorageAPI;
  /** The serializer to use for storing the state. Defaults to JSON. */
  serializer?: Serializer<TState>;
};

export type StoreConfig<
  TState extends object,
  TActions extends object,
> = BaseConfig<TState, TActions> & (PersistConfig<TState> | NoPersistConfig);
