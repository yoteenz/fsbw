import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  archivePrompt,
  ensureArchitectsPromptLibrarySubsystem,
  getArchitectsPromptLibraryReadyView,
  promotePromptToCanon,
  toggleOrbLibrarianMode,
  GENESIS_UPDATED_EVENT,
  type AplRoomPath,
} from '../studio-os-core/genesis';

export function useArchitectsPromptLibraryState(founderDisplayName = 'Founder') {
  const location = useLocation();
  const [tick, setTick] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPromptId, setSelectedPromptId] = useState<string | undefined>();

  const refresh = useCallback(() => {
    ensureArchitectsPromptLibrarySubsystem();
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    ensureArchitectsPromptLibrarySubsystem();
  }, []);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(GENESIS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(GENESIS_UPDATED_EVENT, onUpdate);
  }, [refresh]);

  const view = useMemo(
    () =>
      getArchitectsPromptLibraryReadyView({
        pathname: location.pathname,
        searchQuery,
        selectedPromptId,
        founderDisplayName,
      }),
    [location.pathname, searchQuery, selectedPromptId, founderDisplayName, tick]
  );

  useEffect(() => {
    if (!selectedPromptId && view.selectedPromptId) {
      setSelectedPromptId(view.selectedPromptId);
    }
  }, [view.selectedPromptId, selectedPromptId]);

  const toggleLibrarianMode = useCallback(() => {
    toggleOrbLibrarianMode();
    refresh();
  }, [refresh]);

  const canonizeSelected = useCallback(() => {
    if (!selectedPromptId) return false;
    const ok = promotePromptToCanon(selectedPromptId);
    refresh();
    return ok;
  }, [selectedPromptId, refresh]);

  const archiveSelected = useCallback(
    (reason: string) => {
      if (!selectedPromptId) return;
      archivePrompt(selectedPromptId, reason);
      refresh();
    },
    [selectedPromptId, refresh]
  );

  const activeRoom = (location.pathname.split('/').pop() ?? 'prompt-library') as AplRoomPath;

  return {
    view,
    activeRoom,
    searchQuery,
    setSearchQuery,
    selectedPromptId,
    setSelectedPromptId,
    toggleLibrarianMode,
    canonizeSelected,
    archiveSelected,
    refresh,
  };
}
