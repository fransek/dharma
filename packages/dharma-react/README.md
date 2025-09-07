# dharma-react

[![Version](https://img.shields.io/npm/v/dharma-react)](https://npmjs.com/package/dharma-react)
[![Downloads](https://img.shields.io/npm/dm/dharma-react.svg)](https://npmjs.com/package/dharma-react)
[![Minzipped size](https://img.shields.io/bundlephobia/minzip/dharma-react)](https://bundlephobia.com/package/dharma-react)

dharma-react provides React bindings for dharma-core.

## Getting started

1. Install the packages:

```sh
npm install dharma-core dharma-react
# or
pnpm add dharma-core dharma-react
# or
yarn add dharma-core dharma-react
```

2. Create a store:

```ts
import { createStore } from "dharma-core";

export const store = createStore({
  initialState: { count: 0 },
  defineActions: ({ set }) => ({
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
  }),
});

export const { increment, decrement, reset } = store.actions;
```

3. Use the store:

```tsx
import { useStore } from "dharma-react";
import { decrement, increment, reset, store } from "./store";

function Counter() {
  const { count } = useStore(store);

  return (
    <div>
      <div>{count}</div>
      <button onClick={decrement}>-</button>
      <button onClick={increment}>+</button>
    </div>
  );
}
```

[Read the documentation](https://fransek.github.io/dharma/modules/dharma-react.html)
