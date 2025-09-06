// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { createPersistentStore } from "./createPersistentStore";

describe("createPersistentStore", () => {
  const base = {
    key: "test",
    initialState: { count: 0 },
    defineActions: vi.fn(),
  };

  it("should not throw in a node environment", () => {
    expect(() => createPersistentStore(base)).not.toThrow();
    expect(() =>
      createPersistentStore({
        ...base,
        storage: "local",
      }),
    ).not.toThrow();
    expect(() =>
      createPersistentStore({
        ...base,
        storage: "session",
      }),
    ).not.toThrow();
  });
});
