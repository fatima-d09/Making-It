import { useSyncExternalStore } from "react";

// a tiny Zustand-style store. React components subscribe with useStore(selector),
// and plain code (like the canvas engine) can read/write with getState/setState.
export function createStore<T extends object>(initial: T) {
  let state = initial;
  const listeners = new Set<() => void>();

  const getState = () => state;
  const setState = (partial: Partial<T> | ((s: T) => Partial<T>)) => {
    const next = typeof partial === "function" ? partial(state) : partial;
    state = { ...state, ...next };
    listeners.forEach((l) => l());
  };
  const subscribe = (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  };

  function useStore<S>(selector: (s: T) => S): S {
    return useSyncExternalStore(subscribe, () => selector(state), () => selector(state));
  }

  return { getState, setState, subscribe, useStore };
}
