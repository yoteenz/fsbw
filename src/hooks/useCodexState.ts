import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ensureCodexStore,
  getCodexStats,
  getCodexCuratorLines,
  listCodexArticles,
  queryCodex,
  STUDIO_WORLD_CODEX_UPDATED_EVENT,
  type CodexArticleRecord,
  type CodexSearchFilters,
  type CodexVolumeId,
} from '../studio-os-core/studio-world-codex';

export function useCodexState() {
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    ensureCodexStore();
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    ensureCodexStore();
  }, []);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_WORLD_CODEX_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(STUDIO_WORLD_CODEX_UPDATED_EVENT, onUpdate);
  }, [refresh]);

  const articles = useMemo(() => listCodexArticles(), [tick]);
  const stats = useMemo(() => getCodexStats(), [tick]);
  const curatorLines = useMemo(() => getCodexCuratorLines(), [tick]);

  return { articles, stats, curatorLines, refresh, tick };
}

export function useCodexSearch(query: string, filters?: CodexSearchFilters) {
  const { tick } = useCodexState();
  return useMemo(() => queryCodex(query, filters, 12), [query, filters, tick]);
}

export function useCodexArticlesByVolume(volume: CodexVolumeId): CodexArticleRecord[] {
  const { articles } = useCodexState();
  return useMemo(() => articles.filter((a) => a.volume === volume), [articles, volume]);
}
