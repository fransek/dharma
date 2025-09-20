import { Effect, Store } from "../types/types";
import { deeplyEquals } from "./deeplyEquals";

/**
 * Creates an effect that runs when the store's state changes.
 *
 * @param store - The store instance to subscribe to
 * @param effectFn - The function to run when dependencies change. Receives the current state as argument.
 * @param dependencyFn - Optional function that returns an array of dependencies. If provided, the effect will only run when these dependencies change.
 *
 * @returns An Effect object with mount and unmount methods
 *
 * @see {@link https://dharma.fransek.dev/core/createeffect/}
 */
export const createEffect = <TState, TActions, TDerived>(
  store: Store<TState, TActions>,
  effectFn: (state: TState) => TDerived,
  dependencyFn?: (state: TState) => unknown[],
): Effect => {
  let prev: unknown[] | undefined;
  let unsubscribe: (() => void) | undefined;

  const execute = () => effectFn(store.get());

  const effect = () => {
    const next = dependencyFn?.(store.get());

    if (!prev || !deeplyEquals(prev, next)) {
      prev = next;
      execute();
    }
  };

  const mount = () => {
    if (!unsubscribe) {
      unsubscribe = store.subscribe(effect);
    }
    return unmount;
  };

  const unmount = () => {
    unsubscribe?.();
    unsubscribe = undefined;
  };

  return {
    mount,
    unmount,
  };
};
