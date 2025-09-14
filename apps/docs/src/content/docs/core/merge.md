---
title: merge
---

Merges the current state with a state modifier.

```ts
const newState = merge(currentState, stateModifier);
```

## Parameters

- `currentState` - The current state object.
- `stateModifier` - The state modifier function or object.

## Returns

The new state object, which is a combination of the current state and the state modifier.

## Usage

```ts
import { createStore, merge, StateModifier } from "dharma-core";

const store = createStore({
  initialState: {
    counter: {
      count: 0,
    },
    // ...
  },
  defineActions: ({ set }) => {
    const setCounter = (counter: StateModifier<{ count: number }>) =>
      set((state) => ({
        counter: merge(state.counter, counter),
      }));

    return {
      increment: () => setCounter((state) => ({ count: state.count + 1 })),
      decrement: () => setCounter((state) => ({ count: state.count - 1 })),
      // ...
    };
  },
});
```
