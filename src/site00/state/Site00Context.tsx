import { createContext, useContext, useReducer, type ReactNode } from 'react';
import { INITIAL_SITE00_STATE, site00Reducer, type HomeMode, type Site00State } from './types';

type Site00ContextValue = {
  state: Site00State;
  setHomeMode: (mode: HomeMode) => void;
  selectIdentityState: (stateId: string) => void;
  selectBuildClass: (classId: string) => void;
  clearSelections: () => void;
};

const Site00Context = createContext<Site00ContextValue | null>(null);

export function Site00Provider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(site00Reducer, INITIAL_SITE00_STATE);

  const value: Site00ContextValue = {
    state,
    setHomeMode: (mode) => dispatch({ type: 'SET_HOME_MODE', mode }),
    selectIdentityState: (stateId) => dispatch({ type: 'SELECT_IDENTITY_STATE', stateId }),
    selectBuildClass: (classId) => dispatch({ type: 'SELECT_BUILD_CLASS', classId }),
    clearSelections: () => dispatch({ type: 'CLEAR_SELECTIONS' }),
  };

  return <Site00Context.Provider value={value}>{children}</Site00Context.Provider>;
}

export function useSite00(): Site00ContextValue {
  const ctx = useContext(Site00Context);
  if (!ctx) {
    throw new Error('useSite00 must be used within Site00Provider');
  }
  return ctx;
}

/** Optional hook for components outside provider (returns null) */
export function useSite00Optional(): Site00ContextValue | null {
  return useContext(Site00Context);
}
