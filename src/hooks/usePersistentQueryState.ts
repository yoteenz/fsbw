import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

type UsePersistentQueryStateOptions<T extends string> = {
  queryKey: string;
  storageKey: string;
  defaultValue: T;
  allowedValues: readonly T[];
};

function normalizeSearch(search: string): string {
  return search.startsWith('?') ? search.slice(1) : search;
}

export function usePersistentQueryState<T extends string>({
  queryKey,
  storageKey,
  defaultValue,
  allowedValues,
}: UsePersistentQueryStateOptions<T>) {
  const navigate = useNavigate();
  const location = useLocation();
  const allowed = useMemo(() => [...allowedValues], [allowedValues]);

  const resolveValue = (raw: string | null): T | null => {
    if (!raw) return null;
    const exact = allowed.find((v) => v === raw);
    if (exact) return exact;
    const upperRaw = raw.trim().toUpperCase();
    const insensitive = allowed.find((v) => v.toUpperCase() === upperRaw);
    return insensitive ?? null;
  };

  const readFromSearch = (search: string): T | null => {
    const sp = new URLSearchParams(search);
    return resolveValue(sp.get(queryKey));
  };

  const readFromSession = (): T | null => {
    if (typeof window === 'undefined') return null;
    try {
      return resolveValue(window.sessionStorage.getItem(storageKey));
    } catch {
      return null;
    }
  };

  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;
    return readFromSearch(window.location.search) ?? readFromSession() ?? defaultValue;
  });

  useEffect(() => {
    const fromQuery = readFromSearch(location.search);
    if (fromQuery) {
      if (fromQuery !== value) setValue(fromQuery);
      return;
    }
    const fromSession = readFromSession();
    if (fromSession) {
      if (fromSession !== value) setValue(fromSession);
      return;
    }
    if (value !== defaultValue) setValue(defaultValue);
  }, [location.search, value, defaultValue]);

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    if (value === defaultValue) sp.delete(queryKey);
    else sp.set(queryKey, value);
    const nextSearch = sp.toString();
    const currentSearch = normalizeSearch(location.search);
    if (nextSearch === currentSearch) return;
    navigate(`${location.pathname}${nextSearch ? `?${nextSearch}` : ''}`, { replace: true });
  }, [value, defaultValue, queryKey, location.pathname, location.search, navigate]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (value === defaultValue) window.sessionStorage.removeItem(storageKey);
      else window.sessionStorage.setItem(storageKey, value);
    } catch {
      /* ignore */
    }
  }, [value, defaultValue, storageKey]);

  return [value, setValue] as const;
}
