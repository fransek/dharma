import { describe, expect, it, vi } from "vitest";
import { greet } from "./index";

describe("greet", () => {
  it("should log greeting with provided name", () => {
    const consoleSpy = vi.spyOn(console, "log");

    greet("World");

    expect(consoleSpy).toHaveBeenCalledWith("Hello, World!");
    consoleSpy.mockRestore();
  });
});
