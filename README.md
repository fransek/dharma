# Dharma

[![Version](https://img.shields.io/npm/v/dharma-core)](https://npmjs.com/package/dharma-core)
[![Downloads](https://img.shields.io/npm/dm/dharma-core.svg)](https://npmjs.com/package/dharma-core)
[![Minzipped size](https://img.shields.io/bundlephobia/minzip/dharma-core)](https://bundlephobia.com/package/dharma-core)

A simple and lightweight state management solution for JavaScript and TypeScript applications.

## Basic usage

```ts
import { createStore } from "dharma-core";

const store = createStore({ count: 0 }, (set) => ({
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));

// Subscribe to state changes
store.subscribe((state) => console.log(state));
// Update the state
store.actions.increment();
// { count: 1 }
store.actions.decrement();
// { count: 0 }
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

const store = createStore({ count: 0 }, (set) => ({
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));
```

3. Use the store:

```tsx
import { useStore } from "dharma-react";
import { store } from "./store";

function Counter() {
  const {
    state: { count },
    actions: { increment, decrement, reset },
  } = useStore(store);

  return (
    <div>
      <div>{count}</div>
      <button onClick={decrement}>-</button>
      <button onClick={increment}>+</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```
