// Node 25 exposes a global `localStorage` object without the usual methods.
// This lightweight polyfill ensures `getItem`/`setItem` etc. exist.
(() => {
  if (
    typeof globalThis.localStorage !== "undefined" &&
    typeof (globalThis as any).localStorage.getItem === "function"
  ) {
    return;
  }

  const store = new Map<string, string>();

  const storagePolyfill: Storage = {
    getItem: (key) => (store.has(key) ? store.get(key)! : null),
    setItem: (key, value) => {
      store.set(key, String(value));
    },
    removeItem: (key) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    key: (index) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  };

  (globalThis as any).localStorage = storagePolyfill;
})();
