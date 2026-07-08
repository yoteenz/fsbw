import type { CreativeConceptFuture } from './creative-pipeline-types';
import type { FutureTournamentResult, TournamentLearningRecord } from './future-tournament-types';
import { runTournamentBracket } from './future-tournament-bracket';
import { resolveTournamentChampionship } from './future-tournament-championship';
import { rankConceptsByTournament, scoreAllConcepts } from './future-tournament-scoring';

function uid(): string {
  return `tournament-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Future Tournament™ — every vision enters the executive review board. */
export function runFutureTournament(
  concepts: CreativeConceptFuture[],
  _learning?: TournamentLearningRecord
): FutureTournamentResult {
  const vision = concepts.filter((c) => !c.isMerged);
  const judgeScores = scoreAllConcepts(vision);
  const rankedConceptIds = rankConceptsByTournament(vision, judgeScores);
  const { rounds, finalists, eliminatedIds } = runTournamentBracket(vision, judgeScores);
  const championship = resolveTournamentChampionship(finalists, judgeScores);

  return {
    id: uid(),
    ranAt: new Date().toISOString(),
    judgeScores,
    rounds,
    championship,
    finalistIds: finalists.map((f) => f.id),
    eliminatedIds,
    rankedConceptIds,
  };
}
