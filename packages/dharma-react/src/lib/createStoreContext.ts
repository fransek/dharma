import { Store } from "dharma-core";
import { createContext } from "react";
import { StoreContext } from "../types/types";

/**
 * Creates a store context with an instantiation function.
 * Useful if you need to initialize a store with dynamic data like props, or if you need to create multiple instances of the same store.
 *
 * @returns {StoreContext<TStoreCreator>} A store context object with the given instantiation function.
 *
 * @see {@link https://dharma.fransek.dev/react/createstorecontext/}
 */
export const createStoreContext = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TStoreCreator extends (...args: any[]) => Store<any, any>,
>(): StoreContext<TStoreCreator> => {
  return createContext<ReturnType<TStoreCreator> | null>(null);
};
