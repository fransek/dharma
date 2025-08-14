import { describe, expect, it } from "vitest";
import { add } from "./index";

describe("add", () => {
  it("should return the sum of two numbers", () => {
    expect(add(2, 3)).toBe(5);
  });
});
