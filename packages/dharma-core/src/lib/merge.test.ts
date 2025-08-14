import { describe, expect, it } from "vitest";
import { StateModifier } from "./createStore";
import { merge } from "./merge";

interface TestState {
  a: number;
  b: string;
}

describe("merge", () => {
  it("should merge state with an object state modifier", () => {
    const currentState: TestState = { a: 1, b: "initial" };
    const stateModifier: StateModifier<TestState> = { a: 2 };

    const newState = merge(currentState, stateModifier);

    expect(newState).toEqual({ a: 2, b: "initial" });
  });

  it("should merge state with a function state modifier", () => {
    const currentState: TestState = { a: 1, b: "initial" };
    const stateModifier: StateModifier<TestState> = (state) => ({
      a: state.a + 1,
    });

    const newState = merge(currentState, stateModifier);

    expect(newState).toEqual({ a: 2, b: "initial" });
  });

  it("should not modify the original state", () => {
    const currentState: TestState = { a: 1, b: "initial" };
    const stateModifier: StateModifier<TestState> = { a: 2 };

    const newState = merge(currentState, stateModifier);

    expect(currentState).toEqual({ a: 1, b: "initial" });
    expect(newState).toEqual({ a: 2, b: "initial" });
  });

  it("should handle an empty state modifier", () => {
    const currentState: TestState = { a: 1, b: "initial" };
    const stateModifier: StateModifier<TestState> = {};

    const newState = merge(currentState, stateModifier);

    expect(newState).toEqual({ a: 1, b: "initial" });
  });
});
