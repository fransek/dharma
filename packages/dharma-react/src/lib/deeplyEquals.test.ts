import { describe, expect, it, vi } from "vitest";
import { deeplyEquals } from "./deeplyEquals";

describe("deeplyEquals", () => {
  it("should return true for identical objects", () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { a: 1, b: 2 };

    expect(deeplyEquals(obj1, obj2)).toBe(true);
  });

  it("should return false for different objects", () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { a: 1, b: 3 };

    expect(deeplyEquals(obj1, obj2)).toBe(false);
  });

  it("should return true for identical nested objects", () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { a: 1, b: { c: 2 } };

    expect(deeplyEquals(obj1, obj2)).toBe(true);
  });

  it("should return false for different nested objects", () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { a: 1, b: { c: 3 } };

    expect(deeplyEquals(obj1, obj2)).toBe(false);
  });

  it("should return true for the same reference", () => {
    const obj = { a: 1, b: 2 };

    expect(deeplyEquals(obj, obj)).toBe(true);
  });

  it("should return false for different types", () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = "string";

    expect(deeplyEquals(obj1, obj2)).toBe(false);
  });

  it("should return true for null values", () => {
    expect(deeplyEquals(null, null)).toBe(true);
  });

  it("should return false for one null value", () => {
    const obj = { a: 1, b: 2 };

    expect(deeplyEquals(obj, null)).toBe(false);
    expect(deeplyEquals(null, obj)).toBe(false);
  });

  it("should return false for any two values with different references except object literals", () => {
    const a = deeplyEquals(new Date(2021, 1, 1), new Date(2021, 1, 1));
    expect(a).toBe(false);

    const b = deeplyEquals([1, 2, 3], [1, 2, 3]);
    expect(b).toBe(false);

    const c = deeplyEquals(vi.fn(), vi.fn());
    expect(c).toBe(false);
  });
});
