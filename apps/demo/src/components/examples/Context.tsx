import { createStore } from "dharma-core";
import { createStoreContext, useStoreContext } from "dharma-react";
import { useMemo } from "react";
import { Button } from "../ui/button";

// Create the store context
const CounterStoreContext = createStoreContext((initialCount: number) =>
  createStore({
    initialState: { count: initialCount },
    defineActions: ({ set }) => ({
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
    }),
  }),
);

const CounterStoreProvider = ({
  initialCount,
  children,
}: {
  initialCount: number;
  children: React.ReactNode;
}) => {
  // Create an instance of the store. Make sure the store is not recreated on every render.
  const store = useMemo(
    () => CounterStoreContext.createStore(initialCount),
    [initialCount],
  );

  return (
    // Provide the store to the context
    <CounterStoreContext value={store}>{children}</CounterStoreContext>
  );
};

const Counter = () => {
  // Use the store from the context
  const {
    state: { count },
    actions: { increment, decrement },
  } = useStoreContext(CounterStoreContext);

  return (
    <div className="grid grid-cols-3 text-center items-center w-fit">
      <Button onClick={decrement}>-</Button>
      <div aria-label="count">{count}</div>
      <Button onClick={increment}>+</Button>
    </div>
  );
};

export const Context = () => (
  <div className="container-full w-fit">
    <div className="container-full card">
      <h2 className="font-bold">Context 1</h2>
      <CounterStoreProvider initialCount={0}>
        <Counter />
      </CounterStoreProvider>
    </div>
    <div className="container-full card">
      <h2 className="font-bold">Context 2</h2>
      <CounterStoreProvider initialCount={5}>
        <Counter />
      </CounterStoreProvider>
    </div>
  </div>
);
