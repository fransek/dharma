import { Store } from "dharma-core";
import { createContext } from "react";

export type StoreContext<
  TArgs extends unknown[],
  TState extends object,
  TActions extends object,
> = React.Context<Store<TState, TActions> | null> & {
  /** Returns a new instance of the store. */
  instantiate: (...args: TArgs) => Store<TState, TActions>;
};

/**
 * Creates a store context with an instantiation function.
 * Useful if you need to initialize a store with dynamic data like props, or if you need to create multiple instances of the same store.
 *
 * @param {(...args: TArgs) => Store<TState, TActions>} instantiate - A function that returns a new store instance.
 * @returns {StoreContext<TArgs, TState, TActions>} A store context object with the given instantiation function.
 *
 * @example
 * ```tsx
 * import { createStore, createStoreContext } from "@fransek/statekit";
 * import { useMemo } from "react";
 *
 * const StoreContext = createStoreContext((initialCount: number) =>
 *   createStore({ count: initialCount }, (set) => ({
 *     increment: () => set((state) => ({ count: state.count + 1 })),
 *     decrement: () => set((state) => ({ count: state.count - 1 })),
 *     reset: () => set({ count: 0 }),
 *   })),
 * );
 *
 * function StoreProvider({
 *   children,
 *   initialCount,
 * }: {
 *   children: React.ReactNode;
 *   initialCount: number;
 * }) {
 *   const store = useMemo(
 *     () => StoreContext.instantiate(initialCount),
 *     [initialCount],
 *   );
 *
 *   return (
 *     <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
 *   );
 * }
 * ```
 * @group Utilities
 */
export const createStoreContext = <
  TArgs extends unknown[],
  TState extends object,
  TActions extends object,
>(
  instantiate: (...args: TArgs) => Store<TState, TActions>,
): StoreContext<TArgs, TState, TActions> => {
  const context = createContext<Store<TState, TActions> | null>(null);
  return Object.assign(context, { instantiate });
};
