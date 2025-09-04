import { createStore } from "dharma-core";
import { createStoreContext, useStore, useStoreContext } from "dharma-react";
import { useMemo } from "react";
import { Button } from "../ui/button";

// Create the store context
const CounterStoreContext = createStoreContext((initialCount: number) =>
  createStore(
    { count: initialCount, isEven: initialCount % 2 === 0 },
    (set) => ({
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
    }),
    {
      onChange: (state, set) => set({ isEven: state.count % 2 === 0 }),
    },
  ),
);

export const Counter = ({ initialCount }: { initialCount: number }) => {
  // Create an instance of the store. Make sure the store is not instantiated on every render.
  const store = useMemo(
    () => CounterStoreContext.initialize(initialCount),
    [initialCount],
  );
  // Use the store
  const {
    state: count,
    actions: { increment, decrement },
  } = useStore(store, (state) => state.count);

  return (
    // Provide the store to the context
    <CounterStoreContext value={store}>
      <div className="grid grid-cols-3 text-center items-center w-fit">
        <Button onClick={decrement}>-</Button>
        <div aria-label="count">{count}</div>
        <Button onClick={increment}>+</Button>
      </div>
      <DoubleCounter />
    </CounterStoreContext>
  );
};

const DoubleCounter = () => {
  // Access the store from the context
  const { state: isEven } = useStoreContext(
    CounterStoreContext,
    (state) => state.isEven,
  );

  return (
    <div className="text-sm" aria-label="double">
      {isEven ? "Even" : "Odd"}
    </div>
  );
};

export const Context = () => (
  <div className="container-full w-fit">
    <div className="container-full card">
      <h2 className="font-bold">Counter 1</h2>
      <Counter initialCount={0} />
    </div>
    <div className="container-full card">
      <h2 className="font-bold">Counter 2</h2>
      <Counter initialCount={5} />
    </div>
  </div>
);
