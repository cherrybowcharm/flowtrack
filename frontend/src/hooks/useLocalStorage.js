import { useState } from "react";

/**
 * useState but synced with localStorage.
 * Values are JSON-serialised automatically.
 *
 * Usage:
 *   const [theme, setTheme] = useLocalStorage("theme", "system");
 */
export function useLocalStorage(key, initialValue) {
  const [stored, setStored] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  function setValue(value) {
    try {
      const val = value instanceof Function ? value(stored) : value;
      setStored(val);
      window.localStorage.setItem(key, JSON.stringify(val));
    } catch (err) {
      console.warn("useLocalStorage write failed:", err);
    }
  }

  return [stored, setValue];
}
