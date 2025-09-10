export const deeplyEquals = (a: unknown, b: unknown): boolean => {
  if (a === b) {
    return true;
  }

  if (
    a === null ||
    b === null ||
    typeof a !== "object" ||
    typeof b !== "object"
  ) {
    return false;
  }

  const protoA = Object.getPrototypeOf(a);
  const protoB = Object.getPrototypeOf(b);

  if (protoA !== protoB) {
    return false;
  }

  if (protoA === Array.prototype) {
    const arrA = a as unknown[];
    const arrB = b as unknown[];
    if (arrA.length !== arrB.length) return false;
    for (let i = 0; i < arrA.length; i++) {
      if (!deeplyEquals(arrA[i], arrB[i])) return false;
    }
    return true;
  }

  if (protoA !== Object.prototype) {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (const key of keysA) {
    if (!keysB.includes(key)) {
      return false;
    }
    if (
      !deeplyEquals(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key],
      )
    ) {
      return false;
    }
  }

  return true;
};
