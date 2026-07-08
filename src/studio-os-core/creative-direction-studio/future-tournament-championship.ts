import type { CreativeConceptFuture } from './creative-pipeline-types';
import type { TournamentChampionship, TournamentJudgeScore } from './future-tournament-types';
import { aggregateConceptTournamentScore } from './future-tournament-scoring';

/** Championship — clear winner vs Future Merge™ recommendation. */
export function resolveTournamentChampionship(
  finalists: CreativeConceptFuture[],
  judgeScores: TournamentJudgeScore[]
): TournamentChampionship {
  const a = finalists[0]!;
  const b = finalists[1] ?? finalists[0]!;
  const scoreA = aggregateConceptTournamentScore(a.id, judgeScores);
  const scoreB = aggregateConceptTournamentScore(b.id, judgeScores);
  const gap = Math.abs(scoreA - scoreB);

  const recommendMerge = gap < 6 && finalists.length === 2;
  const mergeEquityBoostPct = recommendMerge ? 18 : 0;

  const clearWinner = gap >= 6 ? (scoreA >= scoreB ? a : b) : undefined;

  const mergeRationale = recommendMerge
    ? `Scores within ${gap} points — merging environmental storytelling from ${scoreA >= scoreB ? a.tagline : b.tagline} with lighting from ${scoreA >= scoreB ? b.tagline : a.tagline} may exceed either finalist alone.`
    : clearWinner
      ? `${clearWinner.tagline} leads by ${gap} composite points across all judges.`
      : 'Review both finalists in the Review Chamber™ before committing.';

  const chairmanSummary = recommendMerge
    ? 'Chairman recommends Future Merge™ instead of declaring a single winner.'
    : clearWinner
      ? `Chairman declares ${clearWinner.tagline} the tournament champion — founder retains final authority.`
      : 'Chairman presents both finalists for founder review.';

  return {
    finalistAId: a.id,
    finalistBId: b.id,
    finalistALabel: a.tagline,
    finalistBLabel: b.tagline,
    recommendMerge,
    mergeEquityBoostPct,
    mergeRationale,
    clearWinnerId: clearWinner?.id,
    chairmanSummary,
  };
}
