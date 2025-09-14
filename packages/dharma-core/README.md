# dharma-core

[![Version](https://img.shields.io/npm/v/dharma-core)](https://npmjs.com/package/dharma-core)
[![Downloads](https://img.shields.io/npm/dm/dharma-core.svg)](https://npmjs.com/package/dharma-core)
[![Minzipped size](https://img.shields.io/bundlephobia/minzip/dharma-core)](https://bundlephobia.com/package/dharma-core)

A simple and lightweight state management solution for JavaScript and TypeScript applications.

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
const unsubscribe = store.subscribe((state) => console.log(state));
// Update the state
increment();
// { count: 1 }
decrement();
// { count: 0 }
unsubscribe();
```

[Read the documentation](https://dharma.fransek.dev/)
