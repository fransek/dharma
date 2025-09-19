import { Store } from "dharma-core";
import { createContext } from "react";
import { StoreContext } from "../types/types";

/**
 * Creates a store context with an instantiation function.
 * Useful if you need to initialize a store with dynamic data like props, or if you need to create multiple instances of the same store.
 *
 * @param {TCreateStore} createStore - A function that returns a new store instance.
 * @returns {StoreContext<TCreateStore>} A store context object with the given instantiation function.
 *
 * @see {@link https://dharma.fransek.dev/react/createstorecontext/}
 */
export const createStoreContext = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TCreateStore extends (...args: any[]) => Store<any, any>,
>(
  createStore: TCreateStore,
): StoreContext<TCreateStore> => {
  const context = createContext<ReturnType<TCreateStore> | null>(null);
  return Object.assign(context, { createStore });
};
