import { StateModifier, Store } from "dharma-core";

export type StoreContext<
  TArgs extends unknown[],
  TState extends object,
  TActions extends object,
> = React.Context<Store<TState, TActions> | null> & {
  /** Returns a new instance of the store. */
  createStore: (...args: TArgs) => Store<TState, TActions>;
};

export type BoundStore<
  TState extends object,
  TActions extends object,
  TSelection = TState,
> = {
  state: TSelection;
  actions: TActions;
  set: (stateModifier: StateModifier<TState>) => TState;
  reset: () => TState;
};
