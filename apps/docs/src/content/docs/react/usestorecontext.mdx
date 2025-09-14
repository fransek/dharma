---
title: useStoreContext
---

A hook used to access a store context created with `createStoreContext`.

```tsx
const store = useStoreContext(StoreContext, select?);
```

## Parameters

- `StoreContext` - The context of the store.
- `select?` - A function to select a subset of the state. Can prevent unnecessary re-renders.

## Returns

The store instance.

- `state` - The current state of the store.
- `actions` - The actions that can modify the state of the store.

## Usage

### Basic example

```tsx
import { useStoreContext } from "dharma-react";
import { StoreContext } from "./store";

function Counter() {
  const {
    state: { count },
    actions: { increment, decrement },
  } = useStoreContext(StoreContext);

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
const { state: count } = useStoreContext(StoreContext, (state) => state.count);
```

If the `select` function is provided, an equality check is performed. This has some caveats:

- For optimal performance, return a direct reference to the state. (e.g. `state.count`)
- If you return an object literal, it should only contain direct references to the state. (e.g. `{ count: state.count }`)
