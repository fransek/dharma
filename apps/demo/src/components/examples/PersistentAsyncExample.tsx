import AsyncStorage from "@react-native-async-storage/async-storage";
import { createStore } from "dharma-core";
import { useStore } from "dharma-react";
import { ExternalLink } from "lucide-react";
import { Button } from "../ui/button";

const store = createStore({
  key: "async-storage",
  persist: true,
  initialState: { count: 0 },
  storage: AsyncStorage,
  defineActions: ({ set }) => ({
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
  }),
});

const { increment, decrement } = store.actions;

export const PersistentAsyncExample = () => {
  const { count } = useStore(store);

  return (
    <div className="container-full w-fit items-center">
      <div className="grid grid-cols-3 text-center items-center w-fit">
        <Button onClick={decrement}>-</Button>
        <div aria-label="count">{count}</div>
        <Button onClick={increment}>+</Button>
      </div>
      <Button asChild variant="link">
        <a target="_blank" href="/async-storage">
          Duplicate this tab
          <ExternalLink />
        </a>
      </Button>
    </div>
  );
};
