import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { isBackendMode } from '../config/dataMode';
import {
  loadAuthSession,
  onAuthStateChange,
  signOut as authSignOut,
  type AioAuthSession,
} from './authService';

interface AioAuthContextValue {
  loading: boolean;
  session: AioAuthSession | null;
  isAuthenticated: boolean;
  isInternal: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AioAuthContext = createContext<AioAuthContextValue | null>(null);

export function AIOAuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(isBackendMode());
  const [session, setSession] = useState<AioAuthSession | null>(null);

  const refresh = useCallback(async () => {
    if (!isBackendMode()) {
      setSession(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const next = await loadAuthSession();
      setSession(next);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isBackendMode()) {
      setLoading(false);
      return;
    }
    void refresh();
    const unsub = onAuthStateChange(() => {
      void refresh();
    });
    return () => {
      unsub?.();
    };
  }, [refresh]);

  const signOut = useCallback(async () => {
    await authSignOut();
    setSession(null);
  }, []);

  const value = useMemo<AioAuthContextValue>(
    () => ({
      loading,
      session,
      isAuthenticated: Boolean(session?.user),
      isInternal: Boolean(session?.isInternal),
      refresh,
      signOut,
    }),
    [loading, session, refresh, signOut],
  );

  return <AioAuthContext.Provider value={value}>{children}</AioAuthContext.Provider>;
}

export function useAIOAuth(): AioAuthContextValue {
  const ctx = useContext(AioAuthContext);
  if (!ctx) {
    return {
      loading: false,
      session: null,
      isAuthenticated: false,
      isInternal: false,
      refresh: async () => {},
      signOut: async () => {},
    };
  }
  return ctx;
}
