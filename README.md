# Dharma

[![Version](https://img.shields.io/npm/v/dharma-core)](https://npmjs.com/package/dharma-core)
[![Downloads](https://img.shields.io/npm/dm/dharma-core.svg)](https://npmjs.com/package/dharma-core)
[![Minzipped size](https://img.shields.io/bundlephobia/minzip/dharma-core)](https://bundlephobia.com/package/dharma-core)

A simple and lightweight state management solution for JavaScript and TypeScript applications.

[Read the full documentation 📄](https://fransek.github.io/dharma)

## Basic usage

```ts
import { createStore } from "dharma-core";

const store = createStore({
  initialState: { count: 0 },
  defineActions: ({ set }) => ({
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
  }),
});

const { increment, decrement } = store.actions;

// Subscribe to state changes
const unsubscribe = store.subscribe((state) => console.log(state.count));
// Update the state
increment();
// { count: 1 }
decrement();
// { count: 0 }
unsubscribe();
```

## With React

[![Version](https://img.shields.io/npm/v/dharma-react)](https://npmjs.com/package/dharma-react)
[![Downloads](https://img.shields.io/npm/dm/dharma-react.svg)](https://npmjs.com/package/dharma-react)
[![Minzipped size](https://img.shields.io/bundlephobia/minzip/dharma-react)](https://bundlephobia.com/package/dharma-react)

dharma-react provides React bindings for dharma-core.

### Getting started

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
