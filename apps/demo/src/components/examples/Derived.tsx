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

const derived = derive(
  store,
  (state) => {
    const squared = state.count * state.count;
    console.log(`Computing squared: ${squared}`);
    return squared;
  },
  (state) => [state.count],
);

const { increment, decrement, setInput } = store.actions;

export const Derived = () => {
  const { count, input } = useStore(store);
  const squared = useStore(derived);

  return (
    <div className="grid grid-cols-3 text-center items-center w-fit gap-y-2">
      <Button onClick={decrement}>-</Button>
      <div aria-label="count">{count}</div>
      <Button onClick={increment}>+</Button>
      <div className="col-span-3 text-sm">Squared: {squared}</div>
      <Input
        className="col-span-3"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
    </div>
  );
};
