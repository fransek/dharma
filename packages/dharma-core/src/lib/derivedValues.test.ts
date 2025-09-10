/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi } from "vitest";
import { createStore } from "./createStore";

describe("createStore with derived values", () => {
  it("should compute derived values from initial state", () => {
    const store = createStore({
      initialState: { count: 5 },
      defineDerivedValues: (state) => ({
        doubled: state.count * 2,
        isEven: state.count % 2 === 0,
      }),
    });

    const state = store.get() as any;
    expect(state.count).toBe(5);
    expect(state.doubled).toBe(10);
    expect(state.isEven).toBe(false);
  });

  it("should recompute derived values when state changes", () => {
    const store = createStore({
      initialState: { count: 0 },
      defineDerivedValues: (state) => ({
        doubled: state.count * 2,
        isEven: state.count % 2 === 0,
      }),
    });

    // Initial state
    expect((store.get() as any).doubled).toBe(0);
    expect((store.get() as any).isEven).toBe(true);

    // After increment
    store.set({ count: 3 });
    expect((store.get() as any).doubled).toBe(6);
    expect((store.get() as any).isEven).toBe(false);

    // After another change
    store.set({ count: 4 });
    expect((store.get() as any).doubled).toBe(8);
    expect((store.get() as any).isEven).toBe(true);
  });

  it("should work with actions that modify state", () => {
    const store = createStore({
      initialState: { count: 0 },
      defineActions: ({ set }) => ({
        increment: () => set((state) => ({ count: state.count + 1 })),
        decrement: () => set((state) => ({ count: state.count - 1 })),
      }),
      defineDerivedValues: (state) => ({
        doubled: state.count * 2,
        squared: state.count * state.count,
      }),
    });

    expect((store.get() as any).doubled).toBe(0);
    expect((store.get() as any).squared).toBe(0);

    store.actions.increment();
    expect((store.get() as any).doubled).toBe(2);
    expect((store.get() as any).squared).toBe(1);

    store.actions.increment();
    expect((store.get() as any).doubled).toBe(4);
    expect((store.get() as any).squared).toBe(4);

    store.actions.decrement();
    expect((store.get() as any).doubled).toBe(2);
    expect((store.get() as any).squared).toBe(1);
  });

  it("should notify subscribers with derived values included", () => {
    const store = createStore({
      initialState: { count: 0 },
      defineDerivedValues: (state) => ({
        doubled: state.count * 2,
      }),
    });

    const listener = vi.fn();
    store.subscribe(listener);

    // Initial call with derived values
    expect(listener).toHaveBeenCalledWith({
      count: 0,
      doubled: 0,
    });

    store.set({ count: 5 });
    expect(listener).toHaveBeenLastCalledWith({
      count: 5,
      doubled: 10,
    });
  });

  it("should work with complex derived values", () => {
    interface TodoState {
      todos: { title: string; completed: boolean }[];
      filter: "all" | "completed" | "active";
    }

    const store = createStore({
      initialState: {
        todos: [
          { title: "Task 1", completed: true },
          { title: "Task 2", completed: false },
          { title: "Task 3", completed: true },
        ],
        filter: "all" as const,
      },
      defineDerivedValues: (state: TodoState) => ({
        completedCount: state.todos.filter((todo) => todo.completed).length,
        activeCount: state.todos.filter((todo) => !todo.completed).length,
        totalCount: state.todos.length,
        filteredTodos: state.todos.filter((todo) => {
          if (state.filter === "completed") return todo.completed;
          if (state.filter === "active") return !todo.completed;
          return true;
        }),
      }),
    });

    const state = store.get() as any;
    expect(state.completedCount).toBe(2);
    expect(state.activeCount).toBe(1);
    expect(state.totalCount).toBe(3);
    expect(state.filteredTodos).toHaveLength(3);

    // Change filter
    store.set({ filter: "completed" } as any);
    expect((store.get() as any).filteredTodos).toHaveLength(2);
    expect(
      (store.get() as any).filteredTodos.every((todo: any) => todo.completed),
    ).toBe(true);

    // Change filter to active
    store.set({ filter: "active" } as any);
    expect((store.get() as any).filteredTodos).toHaveLength(1);
    expect(
      (store.get() as any).filteredTodos.every((todo: any) => !todo.completed),
    ).toBe(true);
  });

  it("should work with reset functionality", () => {
    const store = createStore({
      initialState: { count: 0 },
      defineDerivedValues: (state) => ({
        doubled: state.count * 2,
      }),
    });

    store.set({ count: 10 });
    expect((store.get() as any).doubled).toBe(20);

    store.reset();
    expect(store.get().count).toBe(0);
    expect((store.get() as any).doubled).toBe(0);
  });

  it("should work without derived values (backward compatibility)", () => {
    const store = createStore({
      initialState: { count: 0 },
      defineActions: ({ set }) => ({
        increment: () => set((state) => ({ count: state.count + 1 })),
      }),
    });

    expect(store.get()).toEqual({ count: 0 });
    store.actions.increment();
    expect(store.get()).toEqual({ count: 1 });
  });

  it("should not recompute derived values unnecessarily", () => {
    const computeFn = vi.fn((state: { count: number }) => ({
      doubled: state.count * 2,
    }));

    const store = createStore({
      initialState: { count: 0 },
      defineDerivedValues: computeFn,
    });

    // Initial computation
    store.get();
    expect(computeFn).toHaveBeenCalledTimes(1);

    // Getting state again shouldn't recompute
    store.get();
    store.get();
    expect(computeFn).toHaveBeenCalledTimes(1);

    // Changing state should trigger recomputation
    store.set({ count: 1 });
    store.get();
    expect(computeFn).toHaveBeenCalledTimes(2);

    // Getting state again shouldn't recompute
    store.get();
    expect(computeFn).toHaveBeenCalledTimes(2);
  });

  it("should work with event listeners", () => {
    const onChangeFn = vi.fn();

    const store = createStore({
      initialState: { count: 0 },
      defineDerivedValues: (state) => ({
        doubled: state.count * 2,
      }),
      onChange: onChangeFn,
    });

    store.set({ count: 5 });

    expect(onChangeFn).toHaveBeenCalledWith({
      state: { count: 5, doubled: 10 },
      set: expect.any(Function),
      reset: expect.any(Function),
    });
  });
});
