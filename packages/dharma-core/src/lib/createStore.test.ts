import AsyncStorage from "@react-native-async-storage/async-storage";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Serializer, StorageAPI } from "../types/types";
import { createStore } from "./createStore";

describe("createStore", () => {
  const initialState = { count: 0 };
  const store = createStore({
    initialState,
  });

  afterEach(store.reset);

  it("should initialize with the given state", () => {
    expect(store.get()).toEqual(initialState);
    expect(store.initialState).toEqual(initialState);
  });

  it("should update the state using set and reset", () => {
    store.set({ count: 1 });
    expect(store.get().count).toBe(1);
    store.reset();
    expect(store.get().count).toBe(0);
  });

  it("should notify subscribers on state change", () => {
    const listener = vi.fn();
    store.subscribe(listener);
    store.set({ count: 1 });
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("should unsubscribe listeners correctly", () => {
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.set({ count: 1 });
    expect(listener).toHaveBeenCalledOnce();
  });

  it("should create actions if provided", () => {
    const store = createStore({
      initialState: { count: 0 },
      actions: ({ set, get, reset }) => ({
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

  it("should create actions if provided", () => {
    const store = createStore({
      initialState: { count: 0 },
    });
    expect(store.actions).toEqual(undefined);
  });

  it("should call onChange if provided", () => {
    const initialState = { count: 0, other: "foo" };
    const store = createStore({
      initialState,
      onChange: ({ state, set }) => set({ other: state.other + "bar" }),
    });
    store.set({ count: 1 });
    expect(store.get()).toEqual({ count: 1, other: "foobar" });
  });

  it("should call onAttach on first subscribe", () => {
    const initialState = { count: 0 };
    const store = createStore({
      initialState,
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
      onLoad: ({ state, set }) => set({ count: state.count + 1 }),
    });
    expect(store.get().count).toBe(1);
  });

  describe("atomic stores", () => {
    it("should update the state", () => {
      const store = createStore({
        initialState: 0,
      });
      store.set(1);
      expect(store.get()).toBe(1);
    });

    it("should update the state with a function", () => {
      const store = createStore({
        initialState: 0,
      });
      store.set((state) => state + 1);
      expect(store.get()).toBe(1);
    });
  });

  describe("persist", () => {
    const key = "test";
    const initKey = `init_${key}`;
    const initialState = { count: 0 };
    const listener = vi.fn();

    beforeEach(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    it("should initialize with the given initial state", () => {
      const store = createStore({
        persist: true,
        key,
        initialState,
      });
      expect(store.get()).toEqual(initialState);
    });

    it("should persist state changes to localStorage", () => {
      const store = createStore({
        persist: true,
        key,
        initialState,
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
      });
      store.subscribe(listener);
      store.set({ count: 1 });
      localStorage.setItem(key, JSON.stringify({ count: 2 }));
      window.dispatchEvent(new Event("focus"));
      expect(store.get()).toEqual({ count: 2 });
    });

    it("should add and remove focus event listener once", () => {
      const addEventListenerSpy = vi.spyOn(window, "addEventListener");
      const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
      const store = createStore({
        persist: true,
        key,
        initialState,
      });
      const unsubscribe = store.subscribe(vi.fn());
      const unsubscribe2 = store.subscribe(vi.fn());
      expect(addEventListenerSpy).toHaveBeenCalledOnce();
      unsubscribe();
      unsubscribe2();
      expect(removeEventListenerSpy).toHaveBeenCalledOnce();
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
        storage: customStorage,
      });
      store.set({ count: 1 });
      expect(customStorage.setItem).toHaveBeenCalledWith(
        key,
        JSON.stringify({ count: 1 }),
      );
    });

    it("should use async storage", async () => {
      const listener = vi.fn();
      vi.spyOn(AsyncStorage, "setItem");

      const store = createStore({
        persist: true,
        key,
        initialState,
        storage: AsyncStorage,
      });
      store.subscribe(listener);
      expect(listener).toHaveBeenCalledExactlyOnceWith(initialState);
      await Promise.resolve(store.set({ count: 1 }));
      const expectedSnapshot = JSON.stringify({ count: 1 });
      const snapshot = await AsyncStorage.getItem(key);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(key, expectedSnapshot);
      expect(snapshot).toBe(expectedSnapshot);
    });
  });

  describe("storage event listeners", () => {
    const key = "test-storage-events";
    const initialState = { count: 0 };
    const listener = vi.fn();

    beforeEach(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    it("should call onStorageLoad when storage is initialized", () => {
      const onStorageLoad = vi.fn();
      createStore({
        persist: true,
        key,
        initialState,
        actions,
        onStorageLoad,
      });
      expect(onStorageLoad).toHaveBeenCalledWith({
        state: initialState,
        key,
      });
    });

    it("should call onStorageChange when state is persisted", () => {
      const onStorageChange = vi.fn();
      const store = createStore({
        persist: true,
        key,
        initialState,
        actions,
        onStorageChange,
      });
      store.subscribe(listener);
      store.actions.set({ count: 1 });
      expect(onStorageChange).toHaveBeenCalledWith({
        state: { count: 1 },
        key,
      });
    });

    it("should call onStorageSync when state is synchronized from storage", () => {
      const onStorageSync = vi.fn();
      localStorage.setItem(`init_${key}`, JSON.stringify({ count: 0 }));
      localStorage.setItem(key, JSON.stringify({ count: 5 }));
      const store = createStore({
        persist: true,
        key,
        initialState,
        actions,
        onStorageSync,
      });
      store.subscribe(listener);
      expect(onStorageSync).toHaveBeenCalled();
      expect(store.get().count).toBe(5);
    });

    it("should call onStorageSync on window focus", () => {
      const onStorageSync = vi.fn();
      const store = createStore({
        persist: true,
        key,
        initialState,
        actions,
        onStorageSync,
      });
      store.subscribe(listener);
      onStorageSync.mockClear();
      localStorage.setItem(key, JSON.stringify({ count: 10 }));
      window.dispatchEvent(new Event("focus"));
      expect(onStorageSync).toHaveBeenCalledWith({
        state: { count: 10 },
        key,
      });
    });

    it("should call onStorageError when storage operations fail", () => {
      const onStorageError = vi.fn();
      const badStorage: StorageAPI = {
        getItem: () => {
          throw new Error("Storage error");
        },
        setItem: vi.fn(),
        removeItem: vi.fn(),
      };
      createStore({
        persist: true,
        key,
        initialState,
        actions,
        storage: badStorage,
        onStorageError,
      });
      expect(onStorageError).toHaveBeenCalled();
      expect(onStorageError.mock.calls[0][0]).toMatchObject({
        state: initialState,
        key,
      });
      expect(onStorageError.mock.calls[0][0].error).toBeInstanceOf(Error);
    });

    it("should call onStorageError when sync fails", () => {
      const onStorageError = vi.fn();
      const onStorageSync = vi.fn();
      const badStorage: StorageAPI = {
        getItem: () => {
          throw new Error("Sync error");
        },
        setItem: vi.fn(),
        removeItem: vi.fn(),
      };
      const store = createStore({
        persist: true,
        key,
        initialState,
        actions,
        storage: badStorage,
        onStorageError,
        onStorageSync,
      });
      onStorageError.mockClear();
      store.subscribe(listener);
      expect(onStorageError).toHaveBeenCalled();
      expect(onStorageSync).not.toHaveBeenCalled();
    });

    it("should call onStorageError when setItem fails", () => {
      const onStorageError = vi.fn();
      const onStorageChange = vi.fn();
      const badStorage: StorageAPI = {
        getItem: () => null,
        setItem: () => {
          throw new Error("SetItem error");
        },
        removeItem: vi.fn(),
      };
      const store = createStore({
        persist: true,
        key,
        initialState,
        actions,
        storage: badStorage,
        onStorageError,
        onStorageChange,
      });
      onStorageError.mockClear();
      store.subscribe(listener);
      store.actions.set({ count: 1 });
      expect(onStorageError).toHaveBeenCalled();
      expect(onStorageChange).not.toHaveBeenCalled();
    });

    it("should call all storage event listeners when configured", () => {
      const onStorageLoad = vi.fn();
      const onStorageChange = vi.fn();
      const onStorageSync = vi.fn();

      // Set up storage with a different state to trigger sync
      localStorage.setItem(`init_${key}`, JSON.stringify(initialState));
      localStorage.setItem(key, JSON.stringify({ count: 5 }));

      const store = createStore({
        persist: true,
        key,
        initialState,
        actions,
        onStorageLoad,
        onStorageChange,
        onStorageSync,
      });
      expect(onStorageLoad).toHaveBeenCalledOnce();
      store.subscribe(listener);
      // onStorageSync should be called because storage has different state
      expect(onStorageSync).toHaveBeenCalledOnce();
      store.actions.set({ count: 1 });
      expect(onStorageChange).toHaveBeenCalledOnce();
    });
  });
});
