import { createStore } from "dharma-core";
import { useStore } from "dharma-react";
import { Button } from "../ui/button";

// Create the store
const store = createStore({ count: 0 }, ({ set }) => ({
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));

const { increment, decrement } = store.actions;

export const Counter = () => {
  // Use the store
  const { count } = useStore(store);

  return (
    <div className="grid grid-cols-3 text-center items-center w-fit">
      <Button onClick={decrement}>-</Button>
      <div aria-label="count">{count}</div>
      <Button onClick={increment}>+</Button>
    </div>
  );
};
