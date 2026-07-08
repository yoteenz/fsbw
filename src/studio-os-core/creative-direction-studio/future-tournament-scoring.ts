import type { CreativeConceptFuture } from './creative-pipeline-types';
import type {
  TournamentJudgeId,
  TournamentJudgeScore,
  TournamentScoreCategory,
} from './future-tournament-types';
import { TOURNAMENT_JUDGE_LABELS } from './future-tournament-types';

const JUDGES: TournamentJudgeId[] = [
  'creative-intelligence',
  'architecture-auditor',
  'experience-intelligence',
  'company-genome',
  'asset-intelligence',
  'creative-budget',
  'marketplace-intelligence',
  'brand-consistency',
  'navigation-intelligence',
  'scene-stack-validator',
];

function archetypeBoost(archetype: CreativeConceptFuture['archetype'], cats: TournamentScoreCategory[]): number {
  const map: Partial<Record<CreativeConceptFuture['archetype'], TournamentScoreCategory[]>> = {
    'luxury-editorial': ['luxury', 'brand-alignment', 'emotional-impact'],
    'apple-minimal': ['navigation', 'generation-efficiency', 'maintainability'],
    'futuristic-luxury': ['innovation', 'marketplace-potential', 'overall-magic'],
    'modern-penthouse': ['environmental-storytelling', 'founder-goals', 'expansion-potential'],
    'gallery-experience': ['replayability', 'scene-stack-quality', 'architectural-quality'],
    'architectural-showcase': ['architectural-quality', 'creative-vision', 'long-term-flexibility'],
    'merged-concept': ['asset-reuse', 'overall-magic', 'brand-alignment'],
  };
  const boosts = map[archetype] ?? [];
  return cats.some((c) => boosts.includes(c)) ? 12 : 0;
}

function baseCategoryScores(concept: CreativeConceptFuture): Partial<Record<TournamentScoreCategory, number>> {
  const a = concept.analysis;
  const cost = parseFloat(a.generationCostEstimate.replace(/[^0-9.]/g, '')) || 40;
  const mkt = parseFloat(a.marketplacePotential.replace(/[^0-9.]/g, '')) || 40;

  return {
    'creative-vision': 68 + (concept.completeSceneStack ? 14 : 0),
    'brand-alignment': a.brandGenomeAlignment,
    'architectural-quality': 62 + (concept.architecture.length > 30 ? 10 : 0),
    'environmental-storytelling': 58 + (concept.atmosphere.length > 20 ? 14 : 0),
    luxury: concept.archetype === 'luxury-editorial' ? 92 : concept.archetype === 'apple-minimal' ? 58 : 74,
    innovation: concept.archetype === 'futuristic-luxury' ? 90 : 65,
    'founder-goals': 70 + Math.min(20, a.navigationEfficiency / 5),
    navigation: a.navigationEfficiency,
    'long-term-flexibility': 64 + a.reusePct / 4,
    'expansion-potential': 60 + mkt / 3,
    'creative-budget': Math.max(45, 95 - cost / 2),
    'generation-efficiency': Math.max(50, 100 - cost / 1.5),
    'asset-reuse': a.reusePct,
    'marketplace-potential': Math.min(98, 50 + mkt / 2),
    maintainability: concept.archetype === 'apple-minimal' ? 88 : 72,
    'scene-stack-quality': concept.completeSceneStack ? 86 : 55,
    'emotional-impact': concept.archetype === 'luxury-editorial' ? 89 : 71,
    replayability: concept.archetype === 'gallery-experience' ? 87 : 66,
    'overall-magic': Math.round(
      (a.brandGenomeAlignment + a.navigationEfficiency + a.reusePct) / 3 + archetypeBoost(concept.archetype, ['overall-magic'])
    ),
  };
}

function judgeWeight(judgeId: TournamentJudgeId, category: TournamentScoreCategory): number {
  const focus: Partial<Record<TournamentJudgeId, TournamentScoreCategory[]>> = {
    'creative-intelligence': ['creative-vision', 'emotional-impact', 'overall-magic'],
    'architecture-auditor': ['architectural-quality', 'environmental-storytelling', 'long-term-flexibility'],
    'experience-intelligence': ['navigation', 'replayability', 'founder-goals'],
    'company-genome': ['brand-alignment', 'founder-goals', 'luxury'],
    'asset-intelligence': ['asset-reuse', 'maintainability', 'generation-efficiency'],
    'creative-budget': ['creative-budget', 'generation-efficiency', 'asset-reuse'],
    'marketplace-intelligence': ['marketplace-potential', 'expansion-potential', 'innovation'],
    'brand-consistency': ['brand-alignment', 'luxury', 'emotional-impact'],
    'navigation-intelligence': ['navigation', 'scene-stack-quality', 'replayability'],
    'scene-stack-validator': ['scene-stack-quality', 'architectural-quality', 'overall-magic'],
  };
  const cats = focus[judgeId] ?? [];
  if (cats.includes(category)) return 1.4;
  return 0.85;
}

export function scoreConceptForJudge(
  concept: CreativeConceptFuture,
  judgeId: TournamentJudgeId
): TournamentJudgeScore {
  const categoryScores = baseCategoryScores(concept);
  const entries = Object.entries(categoryScores) as [TournamentScoreCategory, number][];
  let weighted = 0;
  let weightSum = 0;
  for (const [cat, score] of entries) {
    const w = judgeWeight(judgeId, cat);
    weighted += score * w;
    weightSum += w;
  }
  const overallScore = Math.round(weighted / Math.max(weightSum, 1));

  const rationale =
    judgeId === 'company-genome'
      ? `${concept.tagline}: ${concept.analysis.brandGenomeAlignment}% genome alignment.`
      : judgeId === 'creative-budget'
        ? `${concept.tagline}: ${concept.analysis.reusePct}% reuse · ${concept.analysis.generationCostEstimate} est.`
        : judgeId === 'marketplace-intelligence'
          ? `${concept.tagline}: ${concept.analysis.marketplacePotential} marketplace signal.`
          : `${TOURNAMENT_JUDGE_LABELS[judgeId]} scores ${concept.tagline} at ${overallScore}.`;

  return { judgeId, conceptId: concept.id, overallScore, categoryScores, rationale };
}

export function scoreAllConcepts(concepts: CreativeConceptFuture[]): TournamentJudgeScore[] {
  const vision = concepts.filter((c) => !c.isMerged);
  return vision.flatMap((concept) => JUDGES.map((judgeId) => scoreConceptForJudge(concept, judgeId)));
}

export function aggregateConceptTournamentScore(
  conceptId: string,
  judgeScores: TournamentJudgeScore[]
): number {
  const scores = judgeScores.filter((s) => s.conceptId === conceptId);
  if (!scores.length) return 0;
  return Math.round(scores.reduce((sum, s) => sum + s.overallScore, 0) / scores.length);
}

export function rankConceptsByTournament(
  concepts: CreativeConceptFuture[],
  judgeScores: TournamentJudgeScore[]
): string[] {
  const vision = concepts.filter((c) => !c.isMerged);
  return [...vision]
    .sort(
      (a, b) =>
        aggregateConceptTournamentScore(b.id, judgeScores) -
        aggregateConceptTournamentScore(a.id, judgeScores)
    )
    .map((c) => c.id);
}
