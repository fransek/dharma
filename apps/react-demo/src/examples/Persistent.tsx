import { Link } from "@tanstack/react-router";
import { createPersistentStore } from "dharma-core";
import { useStore } from "dharma-react";

// Create the store
const store = createPersistentStore(
  // Provide a unique key to identify the store in storage
  "count",
  { count: 0 },
  (set) => ({
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
  }),
  {
    // storage: sessionStorage,
    // serializer: superjson,
  },
);

export const Persistent = () => {
  // Use the store
  const {
    state: { count },
    actions: { increment, decrement },
  } = useStore(store);

  return (
    <>
      <div className="grid grid-cols-3 text-center items-center">
        <button onClick={decrement}>-</button>
        <div aria-label="count">{count}</div>
        <button onClick={increment}>+</button>
      </div>
      <Link target="_blank" to="/persistent">
        Duplicate this tab
      </Link>
    </>
  );
};
