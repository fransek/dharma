import { act, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createStore } from "dharma-core";
import { useRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { useStore } from "./useStore";

const useRenderCount = () => {
  const renderCount = useRef(0);
  renderCount.current += 1;
  return renderCount.current;
};

describe("useStore", () => {
  const store = createStore({ count: 0 }, (set) => ({
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
    reset: () => set({ count: 0 }),
  }));

  afterEach(() => {
    store.actions.reset();
  });

  it("should return the initial state and actions", () => {
    const { result } = renderHook(() => useStore(store));

    expect(result.current).toStrictEqual({
      state: { count: 0 },
      actions: {
        increment: expect.any(Function),
        decrement: expect.any(Function),
        reset: expect.any(Function),
      },
    });
  });

  it("should call the action functions", () => {
    const { result } = renderHook(() => useStore(store));

    act(() => {
      result.current.actions.increment();
    });

    expect(result.current.state).toStrictEqual({ count: 1 });
  });

  it("should return the selected state and only re-render when the selected state changes", async () => {
    const testStore = createStore({ count: 0, foo: 0 }, (set) => ({
      increaseCount: () => set((state) => ({ count: state.count + 1 })),
      increaseFoo: () => set((state) => ({ foo: state.foo + 1 })),
    }));

    const Component = () => {
      const {
        state: count,
        actions: { increaseCount, increaseFoo },
      } = useStore(testStore, (state) => state.count);
      const renderCount = useRenderCount();

      return (
        <>
          <button data-testid="countButton" onClick={increaseCount}>
            {count}
          </button>
          <button data-testid="fooButton" onClick={increaseFoo}>
            Increase Foo
          </button>
          <div data-testid="renderCount">{renderCount}</div>
        </>
      );
    };

    render(<Component />);

    const countButton = screen.getByTestId("countButton");
    const fooButton = screen.getByTestId("fooButton");
    const renderCounter = screen.getByTestId("renderCount");

    expect(countButton.innerHTML).toBe("0");
    expect(renderCounter.innerHTML).toBe("1");

    await userEvent.click(countButton);

    expect(countButton.innerHTML).toBe("1");
    expect(renderCounter.innerHTML).toBe("2");

    await userEvent.click(fooButton);

    expect(testStore.get().foo).toBe(1);
    expect(renderCounter.innerHTML).toBe("2");
  });
});
