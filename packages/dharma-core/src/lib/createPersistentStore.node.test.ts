// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { createPersistentStore } from "./createPersistentStore";

describe("createPersistentStore", () => {
  const actions = vi.fn();
  it("should not throw in a node environment", () => {
    expect(() =>
      createPersistentStore("test", { count: 0 }, actions),
    ).not.toThrow();
    expect(() =>
      createPersistentStore("test", { count: 0 }, actions, {
        storage: "local",
      }),
    ).not.toThrow();
    expect(() =>
      createPersistentStore("test", { count: 0 }, actions, {
        storage: "session",
      }),
    ).not.toThrow();
  });
});
