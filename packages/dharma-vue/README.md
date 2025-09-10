# dharma-vue

[![Version](https://img.shields.io/npm/v/dharma-vue)](https://npmjs.com/package/dharma-vue)
[![Downloads](https://img.shields.io/npm/dm/dharma-vue.svg)](https://npmjs.com/package/dharma-vue)
[![Minzipped size](https://img.shields.io/bundlephobia/minzip/dharma-vue)](https://bundlephobia.com/package/dharma-vue)

dharma-vue provides Vue.js bindings for dharma-core.

## Getting started

1. Install the packages:

```sh
npm install dharma-core dharma-vue
# or
pnpm add dharma-core dharma-vue
# or
yarn add dharma-core dharma-vue
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

export const { increment, decrement } = store.actions;
```

3. Use the store:

```vue
<script setup>
import { useStore } from "dharma-vue";
import { decrement, increment, store } from "./store";

const state = useStore(store);
</script>

<template>
  <div>
    <div>{{ state.count }}</div>
    <button @click="decrement">-</button>
    <button @click="increment">+</button>
  </div>
</template>
```

[Read the documentation](https://fransek.github.io/dharma/modules/dharma-vue.html)
