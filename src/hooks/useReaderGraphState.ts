import {useCallback, useMemo, useState} from 'react';
import { buildReaderGraphSeed } from '../studio-os-core/reader-graph/bootstrap';
import {
  bootstrapReaderGraphStore,
  readReaderGraphStore,
  selectReaderGraphReader,
  selectReaderGraphWorkspace,
  setReaderGraphZoom,
} from '../studio-os-core/reader-graph/store';
import type { GraphZoomLevel, ReaderGraphWorkspaceId } from '../studio-os-core/reader-graph/types';

function ensureSeeded(): void {
  bootstrapReaderGraphStore(buildReaderGraphSeed());
}

export function useReaderGraphState() {
  const [version, setVersion] = useState(() => {
    ensureSeeded();
    return 0;
  });

  const store = useMemo(() => {
    void version;
    return readReaderGraphStore();
  }, [version]);

  const selectedReader = useMemo(
    () => store.readers.find((r) => r.id === store.selectedReaderId) ?? store.readers[0] ?? null,
    [store.readers, store.selectedReaderId]
  );

  const workspaceReaders = useMemo(
    () => store.readers.filter((r) => r.workspaceId === store.activeWorkspaceId),
    [store.readers, store.activeWorkspaceId]
  );

  const readerHealth = useMemo(
    () => (selectedReader ? store.relationshipHealth[selectedReader.id] ?? null : null),
    [store.relationshipHealth, selectedReader]
  );

  const readerTimeline = useMemo(
    () => (selectedReader ? store.timelines.filter((t) => t.readerId === selectedReader.id) : []),
    [store.timelines, selectedReader]
  );

  const readerInterests = useMemo(
    () => (selectedReader ? store.interests.filter((i) => i.readerId === selectedReader.id) : []),
    [store.interests, selectedReader]
  );

  const readerBehavior = useMemo(
    () => (selectedReader ? store.behaviorIntel.find((b) => b.readerId === selectedReader.id) ?? null : null),
    [store.behaviorIntel, selectedReader]
  );

  const readerSignals = useMemo(
    () => (selectedReader ? store.intelligenceSignals.filter((s) => s.readerId === selectedReader.id) : []),
    [store.intelligenceSignals, selectedReader]
  );

  const readerRecommendations = useMemo(
    () => (selectedReader ? store.recommendations.filter((r) => r.readerId === selectedReader.id) : []),
    [store.recommendations, selectedReader]
  );

  const selectWorkspace = useCallback((id: ReaderGraphWorkspaceId) => {
    selectReaderGraphWorkspace(id);
    setVersion((v) => v + 1);
  }, []);

  const selectReader = useCallback((id: string | null) => {
    selectReaderGraphReader(id);
    setVersion((v) => v + 1);
  }, []);

  const setGraphZoom = useCallback((zoom: GraphZoomLevel) => {
    setReaderGraphZoom(zoom);
    setVersion((v) => v + 1);
  }, []);

  return {
    store,
    selectedReader,
    workspaceReaders,
    readerHealth,
    readerTimeline,
    readerInterests,
    readerBehavior,
    readerSignals,
    readerRecommendations,
    selectWorkspace,
    selectReader,
    setGraphZoom,
  };
}
