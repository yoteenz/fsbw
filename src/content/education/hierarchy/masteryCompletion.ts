import type { EducationMastery } from '../types';
import { getAllEducationMasteries, getSeasonsForMastery } from './catalog';
import {
  computeCertificationProgress,
  isSeasonCertificationEnabled,
  resolveRequiredEpisodeIdsForSeason,
} from './certificationResolver';

/** Future-ready: all required Seasons with certification completed → Mastery credential. */
export function resolveMasteryCertificationReadiness(
  mastery: EducationMastery,
  completedSeasonIds: Set<string>,
): {
  certifiableSeasonCount: number;
  completedCertifiableSeasonCount: number;
  isMasteryCertificationReady: boolean;
} {
  const seasons = getSeasonsForMastery(mastery.id).filter(isSeasonCertificationEnabled);
  const certifiableSeasonCount = seasons.length;
  const completedCertifiableSeasonCount = seasons.filter((s) => completedSeasonIds.has(s.id)).length;
  return {
    certifiableSeasonCount,
    completedCertifiableSeasonCount,
    isMasteryCertificationReady:
      certifiableSeasonCount > 0 && completedCertifiableSeasonCount >= certifiableSeasonCount,
  };
}

export function listMasteriesWithCertificationProgress(completedEpisodeIdsBySeason: Record<string, string[]>) {
  return getAllEducationMasteries().map((mastery) => {
    const seasons = getSeasonsForMastery(mastery.id);
    const seasonProgress = seasons
      .filter(isSeasonCertificationEnabled)
      .map((season) => {
        const ids = completedEpisodeIdsBySeason[season.id] ?? [];
        return {
          seasonId: season.id,
          ...computeCertificationProgress(season, ids),
          requiredEpisodeIds: resolveRequiredEpisodeIdsForSeason(season),
        };
      });
    return { masteryId: mastery.id, title: mastery.title, seasonProgress };
  });
}
