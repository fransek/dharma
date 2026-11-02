import AsyncStorage from "@react-native-async-storage/async-storage";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Serializer, StorageAPI } from "../types/types";
import { createEffect } from "./createEffect";
import { createStore } from "./createStore";
import { StorageUnavailableError } from "./StorageUnavailableError";

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
      onChange: ({ get, set }) => set({ other: get().other + "bar" }),
    });
    store.set({ count: 1 });
    expect(store.get()).toEqual({ count: 1, other: "foobar" });
  });

  it("should only call onDetach once when unsubscribe is called twice", () => {
    const onDetach = vi.fn();
    const store = createStore({ initialState: { count: 0 }, onDetach });
    const unsubscribe = store.subscribe(vi.fn());
    unsubscribe();
    unsubscribe();
    expect(onDetach).toHaveBeenCalledOnce();
  });

  it("should not notify subscribers when the state is unchanged", () => {
    const listener = vi.fn();
    const onChange = vi.fn();
    const store = createStore({ initialState: { count: 0 }, onChange });
    store.subscribe(listener);
    store.set((state) => state);
    store.reset();
    expect(listener).toHaveBeenCalledOnce(); // Initial call on subscribe
    expect(onChange).not.toHaveBeenCalled();
  });

  it("should call onAttach on first subscribe", () => {
    const initialState = { count: 0 };
    const store = createStore({
      initialState,
      onAttach: ({ get, set }) => set({ count: get().count + 1 }),
    });
    const listener = vi.fn();
    store.subscribe(listener);
    expect(store.get().count).toBe(1);
  });

  it("should call onDetach on last unsubscribe", () => {
    const initialState = { count: 0 };
    const store = createStore({
      initialState,
      onDetach: ({ get, set }) => set({ count: get().count + 1 }),
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
      onLoad: ({ get, set }) => set({ count: get().count + 1 }),
    });
    expect(store.get().count).toBe(1);
  });

  it("should return the latest state from get in event hooks", () => {
    const snapshots: number[] = [];
    createStore({
      initialState: { count: 0 },
      onLoad: ({ get, state, set }) => {
        set({ count: 1 });
        snapshots.push(state.count, get().count);
      },
    });
    expect(snapshots).toEqual([0, 1]);
  });

  it("should return the latest state from get in onChange", () => {
    const snapshots: number[] = [];
    const store = createStore({
      initialState: { count: 0 },
      onChange: ({ get, state, set }) => {
        set({ count: 10 });
        snapshots.push(state.count, get().count);
      },
    });
    store.set({ count: 1 });
    expect(snapshots).toEqual([1, 10]);
  });

  it("should return the latest state from get after an await", async () => {
    let resolve!: () => void;
    const done = new Promise<void>((r) => (resolve = r));
    const snapshots: number[] = [];
    const store = createStore({
      initialState: { count: 0 },
      onAttach: async ({ get, state }) => {
        await Promise.resolve();
        snapshots.push(state.count, get().count);
        resolve();
      },
    });
    store.subscribe(vi.fn());
    store.set({ count: 5 });
    await done;
    expect(snapshots).toEqual([0, 5]);
  });

  it("should not dispatch again for synchronous sets in onChange", () => {
    const listener = vi.fn();
    const onChange = vi.fn(({ get, set }) => {
      if (get().count === 1) set({ count: 2 });
    });
    const store = createStore({ initialState: { count: 0 }, onChange });
    store.subscribe(listener);
    store.set({ count: 1 });
    expect(onChange).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenLastCalledWith({ count: 2 });
  });

  it("should notify listeners of asynchronous sets in onChange", async () => {
    const listener = vi.fn();
    const store = createStore({
      initialState: { count: 0, doubled: 0 },
      onChange: async ({ get, set }) => {
        await Promise.resolve();
        const { count, doubled } = get();
        if (doubled !== count * 2) set({ doubled: count * 2 });
      },
    });
    store.subscribe(listener);
    store.set({ count: 1 });
    await vi.waitFor(() =>
      expect(listener).toHaveBeenLastCalledWith({ count: 1, doubled: 2 }),
    );
  });

  it("should notify earlier listeners of sets made by a listener", () => {
    const store = createStore({ initialState: { count: 0 } });
    const first = vi.fn();
    store.subscribe(first);
    store.subscribe(({ count }) => {
      if (count === 1) store.set({ count: 2 });
    });
    store.set({ count: 1 });
    expect(first).toHaveBeenLastCalledWith({ count: 2 });
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
    const initialState = { count: 0 };
    const listener = vi.fn();

    beforeEach(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    afterEach(() => {
      vi.restoreAllMocks();
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
      localStorage.setItem(key, JSON.stringify({ count: 1 }));
      const store = createStore({
        persist: true,
        key,
        initialState,
      });
      expect(store.get()).toEqual({ count: 1 });
    });

    it("should load state from localStorage on attach if available", () => {
      localStorage.setItem(key, JSON.stringify({ count: 1 }));
      const store = createStore({
        persist: true,
        key,
        initialState,
        syncWithStorageOn: "attach",
      });
      expect(store.get()).toEqual({ count: 0 });
      store.subscribe(listener);
      expect(store.get()).toEqual({ count: 1 });
    });

    it("should load state from sessionStorage if available", () => {
      sessionStorage.setItem(key, JSON.stringify({ count: 2 }));
      const store = createStore({
        persist: true,
        key,
        initialState,
        storage: sessionStorage,
      });
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

    it("should add and remove window event listeners once", () => {
      const addEventListenerSpy = vi.spyOn(window, "addEventListener");
      const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
      const store = createStore({
        persist: true,
        key,
        initialState,
      });
      const unsubscribe = store.subscribe(vi.fn());
      const unsubscribe2 = store.subscribe(vi.fn());
      const events = (spy: typeof addEventListenerSpy) =>
        spy.mock.calls.map(([event]) => event);
      expect(events(addEventListenerSpy)).toEqual(["focus", "storage"]);
      unsubscribe();
      unsubscribe2();
      expect(events(removeEventListenerSpy)).toEqual(["focus", "storage"]);
    });

    it("should update state when the storage changes in another tab", () => {
      const store = createStore({
        persist: true,
        key,
        initialState,
      });
      store.subscribe(listener);
      localStorage.setItem(key, JSON.stringify({ count: 2 }));
      window.dispatchEvent(
        new StorageEvent("storage", { key, storageArea: sessionStorage }),
      );
      expect(store.get()).toEqual(initialState);
      window.dispatchEvent(
        new StorageEvent("storage", { key, storageArea: localStorage }),
      );
      expect(store.get()).toEqual({ count: 2 });
    });

    it("should not overwrite state set while loading from async storage", async () => {
      const pendingReads: ((value: string) => void)[] = [];
      const store = createStore({
        persist: true,
        key,
        initialState,
        storage: {
          getItem: () =>
            new Promise<string>((resolve) => pendingReads.push(resolve)),
          setItem: vi.fn(),
        },
      });
      store.set({ count: 1 });
      pendingReads.forEach((resolve) => resolve(JSON.stringify({ count: 5 })));
      await new Promise((resolve) => setTimeout(resolve));
      expect(store.get()).toEqual({ count: 1 });
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

    it("should persist and dispatch changes made by an effect", () => {
      const onChange = vi.fn();
      const store = createStore({
        initialState: { count: 0 },
        persist: true,
        key: "clamped",
        onChange,
      });
      createEffect(store, ({ count }) => {
        if (count > 10) store.set({ count: 10 });
      }).mount();
      store.set({ count: 50 });
      expect(store.get()).toEqual({ count: 10 });
      expect(localStorage.getItem("clamped")).toBe(
        JSON.stringify({ count: 10 }),
      );
      expect(onChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ state: { count: 10 } }),
      );
    });

    it("should persist changes made in onChange", () => {
      const store = createStore({
        persist: true,
        key,
        initialState: { count: 0, other: "foo" },
        onChange: ({ get, set }) => set({ other: get().other + "bar" }),
      });
      store.set({ count: 1 });
      expect(localStorage.getItem(key)).toBe(
        JSON.stringify({ count: 1, other: "foobar" }),
      );
    });

    it("should catch async storage write errors", async () => {
      const onStorageError = vi.fn();
      const error = new Error("Write failed");
      const store = createStore({
        persist: true,
        key,
        initialState,
        storage: {
          getItem: async () => null,
          setItem: () => Promise.reject(error),
        },
        onStorageError,
      });
      store.set({ count: 1 });
      await vi.waitFor(() =>
        expect(onStorageError).toHaveBeenCalledWith(error),
      );
    });

    it("should report a missing storage provider in the browser", () => {
      const onStorageError = vi.fn();
      vi.spyOn(window, "localStorage", "get").mockImplementation(() => {
        throw new DOMException("Access denied", "SecurityError");
      });
      createStore({ persist: true, key, initialState, onStorageError });
      expect(onStorageError).toHaveBeenCalledExactlyOnceWith(
        expect.any(StorageUnavailableError),
      );
    });

    it("should catch async storage read errors", async () => {
      const onStorageError = vi.fn();
      const error = new Error("Read failed");
      createStore({
        persist: true,
        key,
        initialState,
        storage: {
          getItem: () => Promise.reject(error),
          setItem: vi.fn(),
        },
        onStorageError,
      });
      await vi.waitFor(() =>
        expect(onStorageError).toHaveBeenCalledWith(error),
      );
    });

    it("should not throw if localStorage is inaccessible", () => {
      vi.spyOn(window, "localStorage", "get").mockImplementation(() => {
        throw new DOMException("Access denied", "SecurityError");
      });
      const store = createStore({ persist: true, key, initialState });
      expect(store.get()).toEqual(initialState);
    });

    it("should support storage that returns non-native thenables", async () => {
      const store = createStore({
        persist: true,
        key,
        initialState,
        storage: {
          getItem: () =>
            ({
              then: (resolve: (value: string) => void) =>
                resolve(JSON.stringify({ count: 3 })),
            }) as unknown as Promise<string>,
          setItem: vi.fn(),
        },
      });
      await vi.waitFor(() => expect(store.get()).toEqual({ count: 3 }));
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
      store.set({ count: 1 });
      const expectedSnapshot = JSON.stringify({ count: 1 });
      await vi.waitFor(async () =>
        expect(await AsyncStorage.getItem(key)).toBe(expectedSnapshot),
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(key, expectedSnapshot);
    });
  });
});
