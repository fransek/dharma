import { Store } from "dharma-core";
import { Context } from "react";

export type StoreContext<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TCreateStore extends (...args: any[]) => Store<any, any>,
> = Context<ReturnType<TCreateStore> | null> & {
  createStore: TCreateStore;
};

export type BoundStore<TState, TActions, TSelection = TState> = {
  state: TSelection;
  actions: TActions;
};
