import { createStore } from "dharma-core";
import { useStore } from "dharma-react";

// Create the store
const store = createStore({
  initialState: { count: 0 },
  defineActions: ({ set }) => ({
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
  }),
});

const { increment, decrement } = store.actions;

export const Counter = () => {
  // Use the store
  const { count } = useStore(store);

  return (
    <div>
      <button onClick={decrement}>-</button>
      <div>{count}</div>
      <button onClick={increment}>+</button>
    </div>
  );
};
