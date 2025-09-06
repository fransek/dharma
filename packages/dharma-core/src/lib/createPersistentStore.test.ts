import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createPersistentStore,
  Serializer,
  StorageAPI,
} from "./createPersistentStore";

describe("createPersistentStore", () => {
  const key = "test";
  const initKey = `init_${key}`;
  const initialState = { count: 0 };
  const listener = vi.fn();
  const defineActions = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("should initialize with the given initial state", () => {
    const store = createPersistentStore({ key, initialState, defineActions });
    expect(store.get()).toEqual(initialState);
  });

  it("should persist state changes to localStorage", () => {
    const store = createPersistentStore({ key, initialState, defineActions });
    store.subscribe(listener);
    store.set({ count: 1 });
    const storedState = localStorage.getItem(key);
    expect(storedState).toBe(JSON.stringify({ count: 1 }));
  });

  it("should load state from localStorage if available", () => {
    localStorage.setItem(initKey, JSON.stringify({ count: 0 }));
    localStorage.setItem(key, JSON.stringify({ count: 1 }));
    const store = createPersistentStore({ key, initialState, defineActions });
    expect(store.get()).toEqual({ count: 0 });
    store.subscribe(listener);
    expect(store.get()).toEqual({ count: 1 });
  });

  it("should load state from sessionStorage if available", () => {
    sessionStorage.setItem(initKey, JSON.stringify({ count: 0 }));
    sessionStorage.setItem(key, JSON.stringify({ count: 2 }));
    const store = createPersistentStore({
      key,
      initialState,
      defineActions,
      storage: sessionStorage,
    });
    store.subscribe(listener);
    expect(store.get()).toEqual({ count: 2 });
  });

  it("should update state when window gains focus", () => {
    const store = createPersistentStore({ key, initialState, defineActions });
    store.subscribe(listener);
    store.set({ count: 1 });
    localStorage.setItem(key, JSON.stringify({ count: 2 }));
    window.dispatchEvent(new Event("focus"));
    expect(store.get()).toEqual({ count: 2 });
  });

  it("should use custom serializer", () => {
    const customSerializer: Serializer = {
      stringify: vi.fn(),
      parse: vi.fn(),
    };
    const store = createPersistentStore({
      key,
      initialState,
      defineActions,
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
    const store = createPersistentStore({
      key,
      initialState,
      defineActions,
      storage: customStorage,
    });
    store.set({ count: 1 });
    expect(customStorage.setItem).toHaveBeenCalledWith(
      key,
      JSON.stringify({ count: 1 }),
    );
  });
});
