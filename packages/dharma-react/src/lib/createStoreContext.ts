import { Store } from "dharma-core";
import { createContext } from "react";
import { StoreContext } from "../types/types";

/**
 * Creates a store context with an instantiation function.
 * Useful if you need to initialize a store with dynamic data like props, or if you need to create multiple instances of the same store.
 *
 * @param {(...args: TArgs) => Store<TState, TActions>} createStore - A function that returns a new store instance.
 * @returns {StoreContext<TArgs, TState, TActions>} A store context object with the given instantiation function.
 *
 * @see {@link https://dharma.fransek.dev/react/createstorecontext/}
 */
export const createStoreContext = <TArgs extends unknown[], TState, TActions>(
  createStore: (...args: TArgs) => Store<TState, TActions>,
): StoreContext<TArgs, TState, TActions> => {
  const context = createContext<Store<TState, TActions> | null>(null);
  return Object.assign(context, { createStore });
};
