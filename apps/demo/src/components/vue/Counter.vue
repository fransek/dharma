<script lang="ts" setup>
import { createStore } from "dharma-core";
import { useStore } from "dharma-vue";

const store = createStore({
  initialState: { count: 0 },
  defineActions: ({ set }) => ({
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
  }),
});

const { increment, decrement } = store.actions;

const count = useStore(store, (state) => state.count);
const state = useStore(store);
</script>

<template>
  <div class="flex flex-col gap-4 items-center">
    <div class="grid grid-cols-3 text-center items-center w-fit">
      <button
        @click="decrement"
        class="bg-primary text-primary-foreground py-2 px-4 rounded"
      >
        -
      </button>
      <div aria-label="count">{{ count }}</div>
      <button
        @click="increment"
        class="bg-primary text-primary-foreground py-2 px-4 rounded"
      >
        +
      </button>
    </div>
    <div aria-label="count">{{ state }}</div>
  </div>
</template>
