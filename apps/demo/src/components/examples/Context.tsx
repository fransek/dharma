import { createStore } from "dharma-core";
import { createStoreContext, useStore, useStoreContext } from "dharma-react";
import { useMemo } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

// Create the store context
const CounterStoreContext = createStoreContext((initialCount: number) =>
  createStore({ count: initialCount, input: "" }, (set) => ({
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
    setInput: (input: string) => set({ input }),
  })),
);

const Example = ({ initialCount }: { initialCount: number }) => {
  // Create an instance of the store. Make sure the store is not instantiated on every render.
  const store = useMemo(
    () => CounterStoreContext.createStore(initialCount),
    [initialCount],
  );
  const { increment, decrement } = store.actions;
  // Use the store
  const count = useStore(store, (state) => state.count);

  return (
    // Provide the store to the context
    <CounterStoreContext value={store}>
      <div className="grid grid-cols-3 text-center items-center w-fit">
        <Button onClick={decrement}>-</Button>
        <div aria-label="count">{count}</div>
        <Button onClick={increment}>+</Button>
      </div>
      <TextInput />
    </CounterStoreContext>
  );
};

const TextInput = () => {
  const {
    state: input,
    actions: { setInput },
  } = useStoreContext(CounterStoreContext, (state) => state.input);

  return (
    <Input
      value={input}
      onChange={(e) => setInput(e.target.value)}
      placeholder="Type something..."
    />
  );
};

export const Context = () => (
  <div className="container-full w-fit">
    <div className="container-full card">
      <h2 className="font-bold">Context 1</h2>
      <Example initialCount={0} />
    </div>
    <div className="container-full card">
      <h2 className="font-bold">Context 2</h2>
      <Example initialCount={5} />
    </div>
  </div>
);
