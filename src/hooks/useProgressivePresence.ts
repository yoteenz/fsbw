import { useCallback, useMemo, useState } from 'react';
import {
  collapsePresenceElement,
  createPresenceState,
  dismissPresenceElement,
  expandPresenceElement,
  resolvePresenceVisibility,
  revealPresenceLevel,
  type PresenceEngineState,
  type PresenceIntent,
  type PresenceLevel,
} from '../studio-os-core/progressive-presence';

export function useProgressivePresence(roomId?: string) {
  const [state, setState] = useState<PresenceEngineState>(createPresenceState);

  const isVisible = useCallback(
    (elementId: string, options?: { forceIntent?: PresenceIntent; ambientVisibleCount?: number }) =>
      resolvePresenceVisibility(elementId, state, options).visible,
    [state]
  );

  const expand = useCallback((elementId: string, level?: PresenceLevel) => {
    setState((prev) => expandPresenceElement(prev, elementId, level));
  }, []);

  const collapse = useCallback((elementId: string) => {
    setState((prev) => collapsePresenceElement(prev, elementId));
  }, []);

  const dismiss = useCallback((elementId: string) => {
    setState((prev) => dismissPresenceElement(prev, elementId));
  }, []);

  const toggle = useCallback((elementId: string, level?: PresenceLevel) => {
    setState((prev) =>
      prev.expandedElements.has(elementId)
        ? collapsePresenceElement(prev, elementId)
        : expandPresenceElement(prev, elementId, level)
    );
  }, []);

  const revealLevel = useCallback((level: PresenceLevel) => {
    setState((prev) => revealPresenceLevel(prev, level));
  }, []);

  return useMemo(
    () => ({
      roomId,
      state,
      isVisible,
      expand,
      collapse,
      dismiss,
      toggle,
      revealLevel,
    }),
    [roomId, state, isVisible, expand, collapse, dismiss, toggle, revealLevel]
  );
}

export type ProgressivePresenceController = ReturnType<typeof useProgressivePresence>;
