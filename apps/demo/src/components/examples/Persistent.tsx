import { createStore } from "dharma-core";
import { useStore } from "dharma-react";
import { ExternalLink } from "lucide-react";
import { Button } from "../ui/button";

// Create the store with persistence (if localStorage is available)
const store = createStore({
  initialState: { count: 0 },
  defineActions: ({ set }) => ({
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
  }),
  // Only add persistence if we're in the browser
  ...(typeof window !== 'undefined' && {
    persistence: {
      // Provide a unique key to identify the store in storage
      key: "count",
      // Use localStorage for persistence
      storage: localStorage,
      // serializer: superjson, // Optional custom serializer
    },
  }),
});

const { increment, decrement } = store.actions;

export const Persistent = () => {
  // Use the store
  const { count } = useStore(store);

  return (
    <div className="container-full w-fit items-center">
      <div className="grid grid-cols-3 text-center items-center w-fit">
        <Button onClick={decrement}>-</Button>
        <div aria-label="count">{count}</div>
        <Button onClick={increment}>+</Button>
      </div>
      <Button asChild variant="link">
        <a target="_blank" href="/persistent">
          Duplicate this tab
          <ExternalLink />
        </a>
      </Button>
    </div>
  );
};
