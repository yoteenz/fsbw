import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  COMPONENT_REVIEW_STORAGE_KEY,
  COMPONENT_REVIEW_IDS,
  canAdvanceToPhase,
  currentImplementationPhase,
  defaultComponentReviewState,
  isComponentVisibleInReview,
  isReviewModeDisabledInQuery,
  parseReviewComponentFromQuery,
  type ComponentReviewId,
  type ComponentReviewState,
} from './experience-lab-v2-component-review';
import { resolveExperienceLabV2FeatureFlags } from './experience-lab-v2-feature-flags';

function readStoredReviewState(): ComponentReviewState | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(COMPONENT_REVIEW_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ComponentReviewState;
  } catch {
    return null;
  }
}

function writeStoredReviewState(state: ComponentReviewState): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(COMPONENT_REVIEW_STORAGE_KEY, JSON.stringify(state));
}

export function useExperienceLabComponentReview() {
  const location = useLocation();
  const navigate = useNavigate();
  const flags = resolveExperienceLabV2FeatureFlags();

  const [state, setState] = useState<ComponentReviewState>(() => {
    const stored = readStoredReviewState();
    const base = stored ?? defaultComponentReviewState();
    const fromQuery = parseReviewComponentFromQuery(location.search);
    const disabled = isReviewModeDisabledInQuery(location.search);
    const enabled = flags.experienceLabV2ComponentReviewEnabled && !disabled;
    return {
      ...base,
      enabled,
      activeComponent: fromQuery ?? base.activeComponent,
    };
  });

  const implementationPhase = useMemo(
    () => currentImplementationPhase(state.lockedVersions),
    [state.lockedVersions]
  );

  const show = useCallback(
    (target: ComponentReviewId) => isComponentVisibleInReview(state.enabled, state.activeComponent, target),
    [state.enabled, state.activeComponent]
  );

  const setActiveComponent = useCallback(
    (id: ComponentReviewId) => {
      if (!canAdvanceToPhase(id, state.lockedVersions)) return;
      setState((prev) => {
        const next = { ...prev, activeComponent: id };
        writeStoredReviewState(next);
        return next;
      });
      const params = new URLSearchParams(location.search);
      params.set('elabReview', id);
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
    },
    [location.pathname, location.search, navigate, state.lockedVersions]
  );

  const setReviewEnabled = useCallback(
    (enabled: boolean) => {
      setState((prev) => {
        const next = { ...prev, enabled };
        writeStoredReviewState(next);
        return next;
      });
      const params = new URLSearchParams(location.search);
      if (enabled) params.set('elabReview', state.activeComponent);
      else params.set('elabReview', 'off');
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
    },
    [location.pathname, location.search, navigate, state.activeComponent]
  );

  const lockComponent = useCallback((id: ComponentReviewId, version: string) => {
    setState((prev) => {
      const next = {
        ...prev,
        lockedVersions: { ...prev.lockedVersions, [id]: version },
      };
      writeStoredReviewState(next);
      return next;
    });
  }, []);

  const isLocked = useCallback(
    (id: ComponentReviewId) => Boolean(state.lockedVersions[id]),
    [state.lockedVersions]
  );

  const isSelectable = useCallback(
    (id: ComponentReviewId) => canAdvanceToPhase(id, state.lockedVersions),
    [state.lockedVersions]
  );

  return {
    enabled: state.enabled,
    activeComponent: state.activeComponent,
    lockedVersions: state.lockedVersions,
    implementationPhase,
    show,
    setActiveComponent,
    setReviewEnabled,
    lockComponent,
    isLocked,
    isSelectable,
    componentIds: COMPONENT_REVIEW_IDS,
  };
}

export type ExperienceLabComponentReview = ReturnType<typeof useExperienceLabComponentReview>;
