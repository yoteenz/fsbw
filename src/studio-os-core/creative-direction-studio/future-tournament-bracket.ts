import type { CreativeConceptFuture } from './creative-pipeline-types';
import type { TournamentHeadToHead, TournamentJudgeScore } from './future-tournament-types';
import { aggregateConceptTournamentScore } from './future-tournament-scoring';

function uid(): string {
  return `h2h-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function comparePair(
  a: CreativeConceptFuture,
  b: CreativeConceptFuture,
  judgeScores: TournamentJudgeScore[]
): { winner: CreativeConceptFuture; loser: CreativeConceptFuture; whyWinner: string[]; whyLoser: string[] } {
  const scoreA = aggregateConceptTournamentScore(a.id, judgeScores);
  const scoreB = aggregateConceptTournamentScore(b.id, judgeScores);
  const winner = scoreA >= scoreB ? a : b;
  const loser = scoreA >= scoreB ? b : a;

  const whyWinner: string[] = [];
  const whyLoser: string[] = [];

  if (winner.analysis.brandGenomeAlignment > loser.analysis.brandGenomeAlignment) {
    whyWinner.push('Higher Company Genome™ alignment');
  }
  const wCost = parseFloat(winner.analysis.generationCostEstimate.replace(/[^0-9.]/g, '')) || 0;
  const lCost = parseFloat(loser.analysis.generationCostEstimate.replace(/[^0-9.]/g, '')) || 0;
  if (wCost < lCost) whyWinner.push('Lower production cost');
  if (winner.analysis.reusePct > loser.analysis.reusePct) {
    whyWinner.push('Greater asset reuse');
  }
  if (winner.analysis.navigationEfficiency > loser.analysis.navigationEfficiency) {
    whyWinner.push('Better navigation');
  }
  if (whyWinner.length === 0) whyWinner.push('Higher executive review board composite score');

  if (loser.atmosphere.length < 18) whyLoser.push('Weak environmental storytelling');
  if (loser.architecture === winner.architecture) whyLoser.push('Duplicate architecture language');
  if (loser.analysis.reusePct < 55) whyLoser.push('Limited expansion / reuse opportunities');
  if (whyLoser.length === 0) whyLoser.push('Lower composite score across Studio OS judges');

  return { winner, loser, whyWinner, whyLoser };
}

/** Head-to-head bracket — winners advance until finalists remain. */
export function runTournamentBracket(
  concepts: CreativeConceptFuture[],
  judgeScores: TournamentJudgeScore[]
): { rounds: TournamentHeadToHead[]; finalists: CreativeConceptFuture[]; eliminatedIds: string[] } {
  let field = concepts.filter((c) => !c.isMerged);
  const rounds: TournamentHeadToHead[] = [];
  const eliminatedIds: string[] = [];
  let roundNum = 1;

  while (field.length > 2) {
    const nextRound: CreativeConceptFuture[] = [];
    for (let i = 0; i < field.length; i += 2) {
      const a = field[i]!;
      const b = field[i + 1];
      if (!b) {
        nextRound.push(a);
        continue;
      }
      const { winner, loser, whyWinner, whyLoser } = comparePair(a, b, judgeScores);
      rounds.push({
        id: uid(),
        round: roundNum,
        conceptAId: a.id,
        conceptBId: b.id,
        conceptALabel: a.tagline,
        conceptBLabel: b.tagline,
        winnerId: winner.id,
        loserId: loser.id,
        whyWinner,
        whyLoserEliminated: whyLoser,
      });
      eliminatedIds.push(loser.id);
      nextRound.push(winner);
    }
    field = nextRound;
    roundNum += 1;
  }

  return { rounds, finalists: field, eliminatedIds };
}
