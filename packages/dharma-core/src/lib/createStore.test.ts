import AsyncStorage from "@react-native-async-storage/async-storage";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createStore, Serializer, StorageAPI } from "./createStore";

describe("createStore", () => {
  const defineActions = vi.fn();

  it("should initialize with the given state", () => {
    const initialState = { count: 0 };
    const store = createStore({ initialState, defineActions });
    expect(store.get()).toEqual(initialState);
  });

  it("should update the state using set and reset", () => {
    const initialState = { count: 0 };
    const store = createStore({ initialState, defineActions });
    store.set({ count: 1 });
    expect(store.get().count).toBe(1);
    store.reset();
    expect(store.get().count).toBe(0);
  });

  it("should notify subscribers on state change", () => {
    const initialState = { count: 0 };
    const store = createStore({ initialState, defineActions });
    const listener = vi.fn();
    store.subscribe(listener);
    store.set({ count: 1 });
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("should unsubscribe listeners correctly", () => {
    const initialState = { count: 0 };
    const store = createStore({ initialState, defineActions });
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.set({ count: 1 });
    expect(listener).toHaveBeenCalledOnce();
  });

  it("should create actions if provided", () => {
    const store = createStore({
      initialState: { count: 0 },
      defineActions: ({ set, get, reset }) => ({
        increment: () => set((state) => ({ count: state.count + 1 })),
        getCount: () => get().count,
        resetCount: () => reset(),
      }),
    });
    store.actions.increment();
    expect(store.actions.getCount()).toBe(1);
    store.actions.resetCount();
    expect(store.actions.getCount()).toBe(0);
  });

  it("should call onChange if provided", () => {
    const initialState = { count: 0, other: "foo" };
    const store = createStore({
      initialState,
      defineActions,
      onChange: ({ state, set }) => set({ other: state.other + "bar" }),
    });
    store.set({ count: 1 });
    expect(store.get()).toEqual({ count: 1, other: "foobar" });
  });

  it("should call onAttach on first subscribe", () => {
    const initialState = { count: 0 };
    const store = createStore({
      initialState,
      defineActions,
      onAttach: ({ state, set }) => set({ count: state.count + 1 }),
    });
    const listener = vi.fn();
    store.subscribe(listener);
    expect(store.get().count).toBe(1);
  });

  it("should call onDetach on last unsubscribe", () => {
    const initialState = { count: 0 };
    const store = createStore({
      initialState,
      defineActions,
      onDetach: ({ state, set }) => set({ count: state.count + 1 }),
    });
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    expect(store.get().count).toBe(1);
  });

  it("should call onLoad on store creation", () => {
    const initialState = { count: 0 };
    const store = createStore({
      initialState,
      defineActions,
      onLoad: ({ state, set }) => set({ count: state.count + 1 }),
    });
    expect(store.get().count).toBe(1);
  });

  describe("persist", () => {
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
      const store = createStore({
        persist: true,
        key,
        initialState,
        defineActions,
      });
      expect(store.get()).toEqual(initialState);
    });

    it("should persist state changes to localStorage", () => {
      const store = createStore({
        persist: true,
        key,
        initialState,
        defineActions,
      });
      store.subscribe(listener);
      store.set({ count: 1 });
      const storedState = localStorage.getItem(key);
      expect(storedState).toBe(JSON.stringify({ count: 1 }));
    });

    it("should load state from localStorage if available", () => {
      localStorage.setItem(initKey, JSON.stringify({ count: 0 }));
      localStorage.setItem(key, JSON.stringify({ count: 1 }));
      const store = createStore({
        persist: true,
        key,
        initialState,
        defineActions,
      });
      expect(store.get()).toEqual({ count: 0 });
      store.subscribe(listener);
      expect(store.get()).toEqual({ count: 1 });
    });

    it("should load state from sessionStorage if available", () => {
      sessionStorage.setItem(initKey, JSON.stringify({ count: 0 }));
      sessionStorage.setItem(key, JSON.stringify({ count: 2 }));
      const store = createStore({
        persist: true,
        key,
        initialState,
        defineActions,
        storage: sessionStorage,
      });
      store.subscribe(listener);
      expect(store.get()).toEqual({ count: 2 });
    });

    it("should update state when window gains focus", () => {
      const store = createStore({
        persist: true,
        key,
        initialState,
        defineActions,
      });
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
      const store = createStore({
        persist: true,
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
      const store = createStore({
        persist: true,
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

    it("should use async storage", async () => {
      vi.spyOn(AsyncStorage, "setItem");

      const store = createStore({
        persist: true,
        key,
        initialState,
        defineActions,
        storage: AsyncStorage,
      });

      await Promise.resolve(store.set({ count: 1 }));
      const expectedSnapshot = JSON.stringify({ count: 1 });
      const snapshot = await AsyncStorage.getItem(key);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(key, expectedSnapshot);
      expect(snapshot).toBe(expectedSnapshot);
    });
  });
});
