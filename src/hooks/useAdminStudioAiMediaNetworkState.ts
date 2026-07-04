import { useCallback, useMemo, useState } from 'react';
import {
  bootstrapAiMediaNetworkStore,
  readAiMediaNetworkStore,
  mergeAiMediaNetworkPatch,
} from '../studio-os-core/ai-media-network/store';
import { summarizeMonetization, topPerformingSeries } from '../studio-os-core/ai-media-network/monetizationCenter';
import { groupCalendarByWeek, weeklyLineup } from '../studio-os-core/ai-media-network/contentCalendar';
import { getLabsFeedTargets } from '../studio-os-core/ai-media-network/labsBridge';
import { AI_MEDIA_WORKSPACE_ID } from '../studio-os-core/ai-media-network/constants';
import { buildDemoAiMediaNetworkStorePatch } from '../utils/adminStudioAiMediaNetworkDemo';

function ensureDemoSeeded(): void {
  bootstrapAiMediaNetworkStore();
  const store = readAiMediaNetworkStore();
  if (store.episodes.length === 0) {
    mergeAiMediaNetworkPatch(buildDemoAiMediaNetworkStorePatch());
  }
}

export function useAdminStudioAiMediaNetworkState() {
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => {
    ensureDemoSeeded();
    setVersion((v) => v + 1);
  }, []);

  const store = useMemo(() => {
    void version;
    ensureDemoSeeded();
    return readAiMediaNetworkStore();
  }, [version]);

  const workspaceId = AI_MEDIA_WORKSPACE_ID;
  const monetizationSummary = useMemo(() => summarizeMonetization(store.monetization), [store.monetization]);
  const seriesRankings = useMemo(() => topPerformingSeries(store), [store]);
  const weeklySchedule = useMemo(() => weeklyLineup(store.calendar), [store.calendar]);
  const calendarWeeks = useMemo(() => groupCalendarByWeek(store.calendar), [store.calendar]);
  const labsTargets = useMemo(() => getLabsFeedTargets(), []);
  const publishedEpisodes = store.episodes.filter((e) => e.status === 'published');
  const scheduledEpisodes = store.episodes.filter((e) => e.status === 'scheduled' || e.status === 'in-production');

  return {
    workspaceId,
    store,
    companyDna: store.companyDna,
    pillars: store.pillars,
    shows: store.shows,
    showAnalytics: store.showAnalytics,
    episodes: store.episodes,
    publishedEpisodes,
    scheduledEpisodes,
    calendar: store.calendar,
    seasonPlans: store.seasonPlans,
    crossPlatform: store.crossPlatform,
    monetization: store.monetization,
    monetizationSummary,
    seriesRankings,
    weeklySchedule,
    calendarWeeks,
    labsTargets,
    refresh,
  };
}
