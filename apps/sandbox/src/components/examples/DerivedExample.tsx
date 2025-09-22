import { createStore, derive } from "dharma-core";
import { useStore } from "dharma-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const store = createStore({
  initialState: { count: 0, input: "" },
  defineActions: ({ set }) => ({
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
    setInput: (input: string) => set({ input }),
  }),
});

const { increment, decrement, setInput } = store.actions;

const computationCounter = createStore({
  initialState: 0,
  defineActions: ({ set }) => ({
    increment: () => set((state) => state + 1),
  }),
});

const derived = derive(
  store,
  (state) => {
    const squared = state.count * state.count;
    computationCounter.actions.increment();
    return squared;
  },
  (state) => [state.count],
);

export const DerivedExample = () => {
  const { count, input } = useStore(store);
  const squared = useStore(derived);
  const computations = useStore(computationCounter);

  return (
    <div className="grid grid-cols-3 text-center items-center w-fit gap-y-2">
      <Button onClick={decrement}>-</Button>
      <div aria-label="count">{count}</div>
      <Button onClick={increment}>+</Button>
      <div className="col-span-3 text-sm">Squared: {squared}</div>
      <div className="col-span-3 text-sm">Computations: {computations}</div>
      <Input
        className="col-span-3"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
    </div>
  );
};
