import type { CreativeConceptFuture } from './creative-pipeline-types';
import type {
  FutureTournamentResult,
  TournamentHeadToHead,
  TournamentLearningRecord,
} from './future-tournament-types';
import { TOURNAMENT_JUDGE_LABELS } from './future-tournament-types';
import { aggregateConceptTournamentScore } from './future-tournament-scoring';

function uid(): string {
  return `chair-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export type ChairmanOrbLine = {
  id: string;
  message: string;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
};

/** Orb™ Chairman of the Review Board. */
export function buildChairmanOrbRecommendations(
  tournament: FutureTournamentResult | null,
  concepts: CreativeConceptFuture[],
  learning: TournamentLearningRecord
): ChairmanOrbLine[] {
  if (!tournament) {
    return [
      {
        id: uid(),
        message: 'Run Future Tournament™ — I will convene the executive review board before you compare concepts.',
        reasoning: 'Eliminate decision fatigue; strongest ideas survive thoughtful review.',
        priority: 'high',
      },
    ];
  }

  const recs: ChairmanOrbLine[] = [];
  const byId = Object.fromEntries(concepts.map((c) => [c.id, c]));
  const { championship, judgeScores, rounds } = tournament;

  const archScores = concepts
    .filter((c) => tournament.finalistIds.includes(c.id))
    .map((c) => ({
      concept: c,
      arch: judgeScores.find((j) => j.judgeId === 'architecture-auditor' && j.conceptId === c.id)?.overallScore ?? 0,
    }))
    .sort((a, b) => b.arch - a.arch)[0];

  if (archScores) {
    recs.push({
      id: uid(),
      message: `${archScores.concept.tagline} demonstrated exceptional architectural cohesion.`,
      reasoning: `${TOURNAMENT_JUDGE_LABELS['architecture-auditor']} score ${archScores.arch}.`,
      priority: 'high',
    });
  }

  const mktLeader = [...concepts]
    .filter((c) => tournament.finalistIds.includes(c.id))
    .sort((a, b) => {
      const av = parseFloat(a.analysis.marketplacePotential.replace(/[^0-9.]/g, '')) || 0;
      const bv = parseFloat(b.analysis.marketplacePotential.replace(/[^0-9.]/g, '')) || 0;
      return bv - av;
    })[0];

  if (mktLeader) {
    recs.push({
      id: uid(),
      message: `${mktLeader.tagline} achieved the highest Marketplace potential.`,
      reasoning: mktLeader.analysis.marketplacePotential,
      priority: 'medium',
    });
  }

  if (championship.recommendMerge) {
    const fa = byId[championship.finalistAId];
    const fb = byId[championship.finalistBId];
    recs.push({
      id: uid(),
      message: `I recommend merging environmental storytelling from ${fa?.tagline ?? 'A'} with lighting from ${fb?.tagline ?? 'B'}.`,
      reasoning: championship.mergeRationale,
      priority: 'high',
    });
    recs.push({
      id: uid(),
      message: `This combination increases Creative Equity by approximately ${championship.mergeEquityBoostPct}%.`,
      reasoning: 'Synthesis often outperforms narrow winners when scores are within executive margin.',
      priority: 'high',
    });
  } else if (championship.clearWinnerId) {
    const w = byId[championship.clearWinnerId];
    recs.push({
      id: uid(),
      message: `Tournament champion: ${w?.tagline ?? 'Finalist'} — you retain final creative authority.`,
      reasoning: championship.chairmanSummary,
      priority: 'high',
    });
  }

  const lastRound = rounds[rounds.length - 1];
  if (lastRound) {
    recs.push({
      id: uid(),
      message: `${lastRound.conceptBLabel} eliminated: ${lastRound.whyLoserEliminated[0] ?? 'lower composite score'}.`,
      reasoning: lastRound.whyWinner.join(' · '),
      priority: 'low',
    });
  }

  if (learning.preferredArchetypes.length) {
    recs.push({
      id: uid(),
      message: `Learning: you favor ${learning.preferredArchetypes.slice(-2).join(' + ')} — future tournaments weight accordingly.`,
      reasoning: 'Founder decisions improve tournament alignment over time.',
      priority: 'low',
    });
  }

  recs.push({
    id: uid(),
    message: 'I recommend and explain — you decide. Future Tournament™ eliminates noise, not freedom.',
    reasoning: championship.chairmanSummary,
    priority: 'low',
  });

  return recs.slice(0, 6);
}

export function primaryChairmanLine(lines: ChairmanOrbLine[]): string {
  return lines.find((l) => l.priority === 'high')?.message ?? lines[0]?.message ?? '';
}

export function formatHeadToHeadReplay(round: TournamentHeadToHead): string[] {
  return [
    `${round.conceptALabel} vs ${round.conceptBLabel}`,
    `Winner: ${round.winnerId === round.conceptAId ? round.conceptALabel : round.conceptBLabel}`,
    ...round.whyWinner.map((w) => `✓ ${w}`),
    `Eliminated: ${round.whyLoserEliminated[0] ?? 'Lower score'}`,
  ];
}

export function finalistCompositeScores(
  tournament: FutureTournamentResult,
  concepts: CreativeConceptFuture[]
): Array<{ conceptId: string; label: string; score: number }> {
  return tournament.finalistIds.map((id) => {
    const c = concepts.find((x) => x.id === id);
    return {
      conceptId: id,
      label: c?.tagline ?? id,
      score: aggregateConceptTournamentScore(id, tournament.judgeScores),
    };
  });
}
