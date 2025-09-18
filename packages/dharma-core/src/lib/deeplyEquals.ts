/**
 * Performs a deep equality check between two values.
 * Only checks direct properties, not nested object structures.
 * @param prev - The previous value to compare.
 * @param next - The next value to compare.
 * @returns True if the values are deeply equal, false otherwise.
 */
export const deeplyEquals = (prev: unknown, next: unknown): boolean => {
  if (prev === next) {
    return true;
  }

  if (prev == null || next == null) {
    return prev === next;
  }

  if (typeof prev !== "object" || typeof next !== "object") {
    return false;
  }

  if (Array.isArray(prev) !== Array.isArray(next)) {
    return false;
  }

  const prevKeys = Object.keys(prev);
  const nextKeys = Object.keys(next);

  if (prevKeys.length !== nextKeys.length) {
    return false;
  }

  for (const key of prevKeys) {
    if (!nextKeys.includes(key)) {
      return false;
    }

    const prevValue = (prev as Record<string, unknown>)[key];
    const nextValue = (next as Record<string, unknown>)[key];

    if (prevValue !== nextValue) {
      return false;
    }
  }

  return true;
};
