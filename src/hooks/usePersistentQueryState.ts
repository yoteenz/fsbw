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

/** Stable string so we do not call navigate when only param ordering/encoding differs (avoids replaceState spam). */
function canonicalQueryString(search: string): string {
  const raw = normalizeSearch(search);
  if (!raw) return '';
  const sp = new URLSearchParams(raw);
  const entries = [...sp.entries()].sort((a, b) => {
    const k = a[0].localeCompare(b[0]);
    return k !== 0 ? k : a[1].localeCompare(b[1]);
  });
  return new URLSearchParams(entries).toString();
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
      setValue((prev) => (prev === fromQuery ? prev : fromQuery));
      return;
    }
    const fromSession = readFromSession();
    if (fromSession) {
      setValue((prev) => (prev === fromSession ? prev : fromSession));
      return;
    }
    // Only react to URL/session changes here. If this effect also reacts to
    // every local state update, it can briefly read stale session/query data
    // and oscillate between values, spamming history.replaceState().
    setValue((prev) => (prev === defaultValue ? prev : defaultValue));
  }, [location.search, defaultValue]);

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    if (value === defaultValue) sp.delete(queryKey);
    else sp.set(queryKey, value);
    const nextSearch = sp.toString();
    const currentSearch = normalizeSearch(location.search);
    if (canonicalQueryString(nextSearch) === canonicalQueryString(currentSearch)) return;
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
