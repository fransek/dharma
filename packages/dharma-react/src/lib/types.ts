import { Store } from "dharma-core";

export type StoreContext<
  TArgs extends unknown[],
  TState,
  TActions,
> = React.Context<Store<TState, TActions> | null> & {
  /** Returns a new instance of the store. */
  createStore: (...args: TArgs) => Store<TState, TActions>;
};

export type BoundStore<TState, TActions, TSelection = TState> = {
  state: TSelection;
  actions: TActions;
};
