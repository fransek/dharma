import { createPersistentStore } from "dharma-core";
import { useStore } from "dharma-react";
import { ExternalLink } from "lucide-react";
import { Button } from "../ui/button";

// Create the store
const store = createPersistentStore({
  // Provide a unique key to identify the store in storage
  key: "count",
  initialState: { count: 0 },
  defineActions: ({ set }) => ({
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
  }),
  // storage: sessionStorage,
  // serializer: superjson,
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
