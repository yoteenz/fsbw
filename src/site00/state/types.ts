/**
 * SITE 00 typed state architecture — domain boundaries.
 */

export type HomeMode = 'origin' | 'idnty-expanded' | 'bldr-expanded';

export type AuthMode = 'anonymous' | 'authenticated' | 'admin';

export type Site00State = {
  homeMode: HomeMode;
  selectedIdentityStateId: string | null;
  selectedBuildClassId: string | null;
  authMode: AuthMode;
  /** Future: linked project */
  activeProjectId: string | null;
};

export const INITIAL_SITE00_STATE: Site00State = {
  homeMode: 'origin',
  selectedIdentityStateId: null,
  selectedBuildClassId: null,
  authMode: 'anonymous',
  activeProjectId: null,
};

export type Site00Action =
  | { type: 'SET_HOME_MODE'; mode: HomeMode }
  | { type: 'SELECT_IDENTITY_STATE'; stateId: string }
  | { type: 'SELECT_BUILD_CLASS'; classId: string }
  | { type: 'CLEAR_SELECTIONS' }
  | { type: 'SET_AUTH_MODE'; mode: AuthMode };

export function site00Reducer(state: Site00State, action: Site00Action): Site00State {
  switch (action.type) {
    case 'SET_HOME_MODE':
      return { ...state, homeMode: action.mode };
    case 'SELECT_IDENTITY_STATE':
      return { ...state, selectedIdentityStateId: action.stateId };
    case 'SELECT_BUILD_CLASS':
      return { ...state, selectedBuildClassId: action.classId };
    case 'CLEAR_SELECTIONS':
      return { ...state, selectedIdentityStateId: null, selectedBuildClassId: null };
    case 'SET_AUTH_MODE':
      return { ...state, authMode: action.mode };
    default:
      return state;
  }
}
