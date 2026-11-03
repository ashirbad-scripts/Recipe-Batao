import { useEffect, useState, useCallback } from "react";

export function useLocalList(key: string) {
  const [list, setList] = useState<string[]>([]);
  useEffect(() => {
    try { setList(JSON.parse(localStorage.getItem(key) ?? "[]")); } catch { /* ignore */ }
    const on = (e: StorageEvent) => e.key === key && setList(JSON.parse(e.newValue ?? "[]"));
    window.addEventListener("storage", on);
    return () => window.removeEventListener("storage", on);
  }, [key]);
  const save = useCallback((next: string[]) => {
    setList(next);
    localStorage.setItem(key, JSON.stringify(next));
  }, [key]);
  return [list, save] as const;
}
export const useFavorites = () => useLocalList("souschef:favorites");
export const usePantry = () => useLocalList("souschef:pantry");
