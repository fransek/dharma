import { Store } from "dharma-core";
import { createContext } from "react";
import { StoreContext } from "./types";

/**
 * Creates a store context with an instantiation function.
 * Useful if you need to initialize a store with dynamic data like props, or if you need to create multiple instances of the same store.
 *
 * @param {(...args: TArgs) => Store<TState, TActions>} createStore - A function that returns a new store instance.
 * @returns {StoreContext<TArgs, TState, TActions>} A store context object with the given instantiation function.
 *
 * @example
 * ```tsx
 * import { createStore } from "dharma-core";
 * import { createStoreContext } from "dharma-react";
 * import { useMemo } from "react";
 *
 * const StoreContext = createStoreContext((initialCount: number) =>
 *   createStore({
 *     initialState: { count: initialCount },
 *     defineActions: ({ set }) => ({
 *       increment: () => set((state) => ({ count: state.count + 1 })),
 *       decrement: () => set((state) => ({ count: state.count - 1 })),
 *     }),
 *   }),
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
 *     () => StoreContext.createStore(initialCount),
 *     [initialCount],
 *   );
 *
 *   return (
 *     <StoreContext value={store}>{children}</StoreContext>
 *   );
 * }
 * ```
 */
export const createStoreContext = <TArgs extends unknown[], TState, TActions>(
  createStore: (...args: TArgs) => Store<TState, TActions>,
): StoreContext<TArgs, TState, TActions> => {
  const context = createContext<Store<TState, TActions> | null>(null);
  return Object.assign(context, { createStore });
};
