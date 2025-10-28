import { StateStorage, createJSONStorage } from "zustand/middleware";

const clientStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === "undefined") {
      return null;
    }
    return window.localStorage.getItem(name);
  },
  setItem: (name, value) => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(name, value);
  },
  removeItem: (name) => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.removeItem(name);
  },
};

const serverStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const persistStorage = createJSONStorage(() => (
  typeof window === "undefined" ? serverStorage : clientStorage
));
