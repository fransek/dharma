import { createEffect, createStore } from "dharma-core";
import { useStore } from "dharma-react";
import { useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const store = createStore({
  initialState: { count: 0, input: "" },
  actions: ({ set }) => ({
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
    setInput: (input: string) => set({ input }),
  }),
});

const { increment, decrement, setInput } = store.actions;

const effect = createEffect(
  store,
  (state) => console.log(`count = ${state.count}`),
  (state) => [state.count],
);

export const EffectExample = () => {
  const { count, input } = useStore(store);
  useEffect(effect.mount, []);

  return (
    <div className="grid grid-cols-3 text-center items-center w-fit gap-y-4 ">
      <Button onClick={decrement}>-</Button>
      <div aria-label="count">{count}</div>
      <Button onClick={increment}>+</Button>
      <Input
        className="col-span-3"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
    </div>
  );
};
