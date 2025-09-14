---
title: useStore
---

A hook used to access a store created with `createStore` and bind it to a component.

```tsx
const state = useStore(store, select?);
```

## Parameters

- `store` - The store created with `createStore`.
- `select?` - A function to select a subset of the state. Can prevent unnecessary re-renders.

## Returns

The selected state from the store.

## Usage

### Basic example

```tsx
import { useStore } from "dharma-react";
import { store } from "./store";

const { increment, decrement } = store.actions;

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

### With a select function

```tsx
const count = useStore(store, (state) => state.count);
```

**Note:** If the `select` function is provided, an equality check is performed. This has some caveats:

- For optimal performance, return a direct reference to the state. (e.g. `state.count`)
- If you return an object literal, it should only contain direct references to the state. (e.g. `{ count: state.count }`)
