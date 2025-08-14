import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createPersistentStore,
  Serializer,
  StorageAPI,
} from "./createPersistentStore";

describe("createPersistentStore", () => {
  const key = "test";
  const initialState = { count: 0 };
  const listener = vi.fn();
  const initKey = `init_${key}`;
  const storeKey = `store_${key}`;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("should initialize with the given initial state", () => {
    const store = createPersistentStore(key, initialState);
    expect(store.get()).toEqual(initialState);
  });

  it("should persist state changes to localStorage", () => {
    const store = createPersistentStore(key, initialState);
    store.subscribe(listener);
    store.set({ count: 1 });
    const storedState = localStorage.getItem(storeKey);
    expect(storedState).toBe(JSON.stringify({ count: 1 }));
  });

  it("should load state from localStorage if available", () => {
    localStorage.setItem(initKey, JSON.stringify({ count: 0 }));
    localStorage.setItem(storeKey, JSON.stringify({ count: 1 }));
    const store = createPersistentStore(key, initialState);
    expect(store.get()).toEqual({ count: 0 });
    store.subscribe(listener);
    expect(store.get()).toEqual({ count: 1 });
  });

  it("should load state from sessionStorage if available", () => {
    sessionStorage.setItem(initKey, JSON.stringify({ count: 0 }));
    sessionStorage.setItem(storeKey, JSON.stringify({ count: 2 }));
    const store = createPersistentStore(key, initialState, null, {
      storage: sessionStorage,
    });
    store.subscribe(listener);
    expect(store.get()).toEqual({ count: 2 });
  });

  it("should update state when window gains focus", () => {
    const store = createPersistentStore(key, initialState);
    store.subscribe(listener);
    store.set({ count: 1 });
    localStorage.setItem(storeKey, JSON.stringify({ count: 2 }));
    window.dispatchEvent(new Event("focus"));
    expect(store.get()).toEqual({ count: 2 });
  });

  it("should use custom serializer", () => {
    const customSerializer: Serializer = {
      stringify: vi.fn(),
      parse: vi.fn(),
    };
    const store = createPersistentStore(key, initialState, null, {
      serializer: customSerializer,
    });
    store.set({ count: 1 });
    expect(customSerializer.stringify).toHaveBeenCalledWith({ count: 1 });
  });

  it("should use custom storage", () => {
    const customStorage: StorageAPI = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    const store = createPersistentStore(key, initialState, null, {
      storage: customStorage,
    });
    store.set({ count: 1 });
    expect(customStorage.setItem).toHaveBeenCalledWith(
      storeKey,
      JSON.stringify({ count: 1 }),
    );
  });
});
