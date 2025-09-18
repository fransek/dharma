import { describe, expect, it } from "vitest";
import { deeplyEquals } from "./deeplyEquals";

describe("deeplyEquals", () => {
  it("should return true for identical primitives", () => {
    expect(deeplyEquals(1, 1)).toBe(true);
    expect(deeplyEquals("hello", "hello")).toBe(true);
    expect(deeplyEquals(true, true)).toBe(true);
    expect(deeplyEquals(null, null)).toBe(true);
    expect(deeplyEquals(undefined, undefined)).toBe(true);
  });

  it("should return false for different primitives", () => {
    expect(deeplyEquals(1, 2)).toBe(false);
    expect(deeplyEquals("hello", "world")).toBe(false);
    expect(deeplyEquals(true, false)).toBe(false);
    expect(deeplyEquals(null, undefined)).toBe(false);
  });

  it("should handle objects with same structure and values", () => {
    expect(deeplyEquals({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
    expect(deeplyEquals({ b: 2, a: 1 }, { a: 1, b: 2 })).toBe(true);
  });

  it("should return false for objects with different values", () => {
    expect(deeplyEquals({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
    expect(deeplyEquals({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });

  it("should handle arrays", () => {
    expect(deeplyEquals([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(deeplyEquals([1, 2, 3], [1, 2, 4])).toBe(false);
    expect(deeplyEquals([1, 2], [1, 2, 3])).toBe(false);
  });

  it("should return false for mixed types", () => {
    expect(deeplyEquals([], {})).toBe(false);
    expect(deeplyEquals(1, "1")).toBe(false);
    expect(deeplyEquals({ a: 1 }, [1])).toBe(false);
  });

  it("should handle same reference", () => {
    const obj = { a: 1 };
    expect(deeplyEquals(obj, obj)).toBe(true);
  });
});
