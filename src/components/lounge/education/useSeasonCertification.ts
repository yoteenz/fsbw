import { useCallback, useEffect, useMemo, useState } from 'react';
import type { EducationCertification, EducationSeason } from '../../../content/education/types';
import {
  computeCertificationProgress,
  isSeasonCertificationEnabled,
} from '../../../content/education/hierarchy/certificationResolver';
import { getCompletedEpisodeIdsForSeason } from './seasonProgress';
import {
  fetchUserCertifications,
  syncSeasonCertification,
  type CertificationSyncResult,
} from './certificationApi';
import { trackEducationHierarchyEvent } from './educationHierarchyAnalytics';

export function useSeasonCertification(season: EducationSeason) {
  const [certification, setCertification] = useState<EducationCertification | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [pendingReveal, setPendingReveal] = useState(false);
  const [progressTick, setProgressTick] = useState(0);
  const enabled = isSeasonCertificationEnabled(season);

  const completedEpisodeIds = useMemo(() => {
    void progressTick;
    return getCompletedEpisodeIdsForSeason(season);
  }, [season, progressTick]);

  const progress = useMemo(
    () => computeCertificationProgress(season, completedEpisodeIds),
    [season, completedEpisodeIds],
  );

  const refresh = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return null;
    }
    setLoading(true);
    try {
      const data = await fetchUserCertifications();
      const match = data?.certifications.find(
        (c) => c.seasonId === season.id && c.status === 'active',
      );
      setCertification(match ?? null);
      setPendingReveal(Boolean(match && !match.certificationRevealSeenAt));
      return match ?? null;
    } finally {
      setLoading(false);
    }
  }, [enabled, season.id]);

  const tryIssue = useCallback(async (): Promise<CertificationSyncResult | null> => {
    if (!enabled || certification) return null;
    if (!progress.isComplete) return null;

    setSyncing(true);
    try {
      const result = await syncSeasonCertification({
        seasonId: season.id,
        completedEpisodeIds,
      });
      if (result?.ok) {
        setCertification(result.certification);
        if (result.issued) {
          trackEducationHierarchyEvent('education_certification_earned', {
            masteryId: season.masteryId,
            seasonId: season.id,
            certificationId: result.certification.id,
            collectibleId: result.certification.collectibleId,
          });
        }
        if (result.needsReveal) setPendingReveal(true);
      }
      return result;
    } finally {
      setSyncing(false);
    }
  }, [certification, completedEpisodeIds, enabled, progress.isComplete, season]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!enabled || certification || !progress.isComplete) return;
    void tryIssue();
  }, [certification, enabled, progress.isComplete, tryIssue]);

  useEffect(() => {
    const onProgress = () => setProgressTick((t) => t + 1);
    window.addEventListener('loungeSeasonProgressUpdated', onProgress);
    return () => window.removeEventListener('loungeSeasonProgressUpdated', onProgress);
  }, []);

  return {
    enabled,
    certification,
    loading,
    syncing,
    progress,
    pendingReveal,
    refresh,
    tryIssue,
    dismissReveal: () => setPendingReveal(false),
  };
}
