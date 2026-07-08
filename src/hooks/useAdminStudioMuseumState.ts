import { useCallback, useMemo, useState } from 'react';
import {
  resolveMuseumHistorianQuote,
  type MuseumViewMode,
} from '../studio-os-core/studio-museum';
import { ADMIN_STUDIO_STORAGE_KEYS, readStudioJson, writeStudioJson } from '../utils/adminStudioStorage';
import {
  buildMuseumCatalog,
  exportMuseumSnapshot,
  MUSEUM_LEGACY_WALL,
} from '../utils/adminStudioMuseumDemo';

type MuseumPrefs = {
  visitedExhibits: string[];
  favoriteExhibits: string[];
};

const EMPTY_PREFS: MuseumPrefs = { visitedExhibits: [], favoriteExhibits: [] };

export function useAdminStudioMuseum() {
  const [viewMode, setViewMode] = useState<MuseumViewMode>('exhibits');
  const [selectedExhibitId, setSelectedExhibitId] = useState<string | null>('sm-exhibit-mansion-v1');
  const [timelineIndex, setTimelineIndex] = useState(0);
  const [replayStepIndex, setReplayStepIndex] = useState(0);
  const [replayPlaying, setReplayPlaying] = useState(false);
  const [historianContext, setHistorianContext] = useState<'enter' | 'timeline' | 'replay' | 'marketplace' | 'idle'>('idle');
  const [version, setVersion] = useState(0);

  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const prefs = useMemo(() => {
    void version;
    return readStudioJson<MuseumPrefs>(ADMIN_STUDIO_STORAGE_KEYS.museum) ?? EMPTY_PREFS;
  }, [version]);

  const exhibits = useMemo(() => buildMuseumCatalog(), []);
  const legacyWall = MUSEUM_LEGACY_WALL;

  const selectedExhibit = useMemo(
    () => exhibits.find((e) => e.id === selectedExhibitId) ?? null,
    [exhibits, selectedExhibitId]
  );

  const activeTimelineNode = useMemo(() => {
    if (!selectedExhibit?.timeline.length) return null;
    const idx = Math.min(timelineIndex, selectedExhibit.timeline.length - 1);
    return selectedExhibit.timeline[idx] ?? null;
  }, [selectedExhibit, timelineIndex]);

  const historianQuote = useMemo(
    () => resolveMuseumHistorianQuote(selectedExhibit, historianContext),
    [historianContext, selectedExhibit]
  );

  const snapshot = useMemo(() => exportMuseumSnapshot(), [exhibits]);

  const persistPrefs = useCallback(
    (next: MuseumPrefs) => {
      writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.museum, next);
      bump();
    },
    [bump]
  );

  const selectExhibit = useCallback(
    (id: string) => {
      setSelectedExhibitId(id);
      setTimelineIndex(0);
      setReplayStepIndex(0);
      setReplayPlaying(false);
      setHistorianContext('enter');
      const visited = new Set(prefs.visitedExhibits);
      visited.add(id);
      persistPrefs({ ...prefs, visitedExhibits: [...visited] });
    },
    [persistPrefs, prefs]
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      const favs = new Set(prefs.favoriteExhibits);
      if (favs.has(id)) favs.delete(id);
      else favs.add(id);
      persistPrefs({ ...prefs, favoriteExhibits: [...favs] });
    },
    [persistPrefs, prefs]
  );

  const scrubTimeline = useCallback(
    (index: number) => {
      setTimelineIndex(index);
      setHistorianContext('timeline');
      if (viewMode !== 'time-machine') setViewMode('time-machine');
    },
    [viewMode]
  );

  const startReplay = useCallback(() => {
    setReplayStepIndex(0);
    setReplayPlaying(true);
    setViewMode('replay');
    setHistorianContext('replay');
  }, []);

  const advanceReplay = useCallback(() => {
    if (!selectedExhibit) return;
    setReplayStepIndex((i) => {
      const next = i + 1;
      if (next >= selectedExhibit.replaySteps.length) {
        setReplayPlaying(false);
        return i;
      }
      return next;
    });
  }, [selectedExhibit]);

  return {
    viewMode,
    setViewMode,
    exhibits,
    legacyWall,
    selectedExhibitId,
    selectedExhibit,
    selectExhibit,
    toggleFavorite,
    isFavorite: (id: string) => prefs.favoriteExhibits.includes(id),
    isVisited: (id: string) => prefs.visitedExhibits.includes(id),
    timelineIndex,
    scrubTimeline,
    activeTimelineNode,
    replayStepIndex,
    replayPlaying,
    setReplayPlaying,
    startReplay,
    advanceReplay,
    historianQuote,
    historianContext,
    setHistorianContext,
    snapshot,
  };
}
