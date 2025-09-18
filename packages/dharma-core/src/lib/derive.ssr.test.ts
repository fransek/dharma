import { describe, expect, it, vi } from "vitest";
import { createStore } from "./createStore";
import { derive } from "./derive";

describe("derive SSR hydration fix", () => {
  it("should not trigger onAttach when derive is created on a persistent store", () => {
    const onAttachSpy = vi.fn();

    // Create a persistent store that would normally trigger onAttach
    const store = createStore({
      persist: true,
      key: "test-derive-ssr",
      initialState: { count: 0 },
      defineActions: ({ set }) => ({
        increment: () => set((state) => ({ count: state.count + 1 })),
      }),
      onAttach: onAttachSpy,
    });

    // Creating a derive should not trigger onAttach
    const derived = derive(store, (state) => state.count * 2);

    // onAttach should not have been called yet
    expect(onAttachSpy).toHaveBeenCalledTimes(0);

    // Getting value should still work without triggering onAttach
    expect(derived.get()).toBe(0);
    expect(onAttachSpy).toHaveBeenCalledTimes(0);

    // Only when we subscribe should onAttach be triggered
    const unsubscribe = derived.subscribe(() => {});
    expect(onAttachSpy).toHaveBeenCalledTimes(1);

    unsubscribe();
  });

  it("should handle multiple derives without multiple onAttach calls", () => {
    const onAttachSpy = vi.fn();

    const store = createStore({
      persist: true,
      key: "test-multiple-derives",
      initialState: { count: 0 },
      defineActions: ({ set }) => ({
        increment: () => set((state) => ({ count: state.count + 1 })),
      }),
      onAttach: onAttachSpy,
    });

    // Create multiple derived stores
    const derived1 = derive(store, (state) => state.count * 2);
    const derived2 = derive(store, (state) => state.count + 1);

    // No onAttach calls yet
    expect(onAttachSpy).toHaveBeenCalledTimes(0);

    // Subscribe to first derived store
    const unsubscribe1 = derived1.subscribe(() => {});
    expect(onAttachSpy).toHaveBeenCalledTimes(1);

    // Subscribe to second derived store - should not trigger another onAttach
    const unsubscribe2 = derived2.subscribe(() => {});
    expect(onAttachSpy).toHaveBeenCalledTimes(1);

    unsubscribe1();
    unsubscribe2();
  });

  it("should work correctly with persistence after subscription", () => {
    // Mock localStorage for this test
    const mockStorage = {
      getItem: vi.fn(() => JSON.stringify({ count: 5 })),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };

    const store = createStore({
      persist: true,
      key: "test-persistence",
      storage: mockStorage,
      initialState: { count: 0 },
      defineActions: ({ set }) => ({
        increment: () => set((state) => ({ count: state.count + 1 })),
      }),
    });

    // Clear storage calls from onLoad during store creation
    mockStorage.getItem.mockClear();

    const derived = derive(store, (state) => state.count * 3);

    // Before subscription, no additional storage access
    expect(mockStorage.getItem).toHaveBeenCalledTimes(0);

    // Subscribe should trigger storage access and load persisted state
    const unsubscribe = derived.subscribe(() => {});

    // Derived value should reflect the loaded state
    expect(derived.get()).toBe(15); // 5 * 3

    unsubscribe();
  });
});
