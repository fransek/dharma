import { createStore } from "dharma-core";
import { createStoreContext, useStore, useStoreContext } from "dharma-react";
import { useMemo } from "react";

// Create the store context
const CounterStoreContext = createStoreContext((initialCount: number) => {
  const initialState = { count: initialCount, double: initialCount * 2 };

  return createStore(
    initialState,
    (set) => ({
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
    }),
    {
      onChange: (state, set) => set({ double: state.count * 2 }),
      onDetach: (_, set) => set(initialState),
    },
  );
});

export const Counter = ({ initialCount }: { initialCount: number }) => {
  // Create an instance of the store. Make sure the store is not instantiated on every render.
  const store = useMemo(
    () => CounterStoreContext.instantiate(initialCount),
    [initialCount],
  );
  // Use the store
  const {
    state: count,
    actions: { increment, decrement },
  } = useStore(store, (state) => state.count);

  return (
    // Provide the store to the context
    <CounterStoreContext.Provider value={store}>
      <div className="grid grid-cols-3 text-center items-center">
        <button onClick={decrement}>-</button>
        <div aria-label="count">{count}</div>
        <button onClick={increment}>+</button>
      </div>
      <DoubleCounter />
    </CounterStoreContext.Provider>
  );
};

const DoubleCounter = () => {
  // Access the store from the context
  const { state: double } = useStoreContext(
    CounterStoreContext,
    (state) => state.double,
  );

  return <div aria-label="double">Double: {double}</div>;
};

export const Context = () => (
  <>
    <div className="flex flex-col gap-4 border p-4 rounded items-start">
      <h2 className="font-bold">Counter 1</h2>
      <Counter initialCount={0} />
    </div>
    <div className="flex flex-col gap-4 border p-4 rounded items-start">
      <h2 className="font-bold">Counter 2</h2>
      <Counter initialCount={10} />
    </div>
  </>
);
