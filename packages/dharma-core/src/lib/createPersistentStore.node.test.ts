// @vitest-environment node

import { describe, expect, it } from "vitest";
import { createPersistentStore } from "./createPersistentStore";

describe("createPersistentStore", () => {
  it("should not throw in a node environment", () => {
    expect(() => createPersistentStore("test", { count: 0 })).not.toThrow();
    expect(() =>
      createPersistentStore("test", { count: 0 }, null, { storage: "local" }),
    ).not.toThrow();
    expect(() =>
      createPersistentStore("test", { count: 0 }, null, { storage: "session" }),
    ).not.toThrow();
  });
});
