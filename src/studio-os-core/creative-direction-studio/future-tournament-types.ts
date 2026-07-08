/** Future Tournament™ — intelligent design review before concepts reach the founder. */

export type TournamentJudgeId =
  | 'creative-intelligence'
  | 'architecture-auditor'
  | 'experience-intelligence'
  | 'company-genome'
  | 'asset-intelligence'
  | 'creative-budget'
  | 'marketplace-intelligence'
  | 'brand-consistency'
  | 'navigation-intelligence'
  | 'scene-stack-validator';

export type TournamentScoreCategory =
  | 'creative-vision'
  | 'brand-alignment'
  | 'architectural-quality'
  | 'environmental-storytelling'
  | 'luxury'
  | 'innovation'
  | 'founder-goals'
  | 'navigation'
  | 'long-term-flexibility'
  | 'expansion-potential'
  | 'creative-budget'
  | 'generation-efficiency'
  | 'asset-reuse'
  | 'marketplace-potential'
  | 'maintainability'
  | 'scene-stack-quality'
  | 'emotional-impact'
  | 'replayability'
  | 'overall-magic';

export type TournamentJudgeScore = {
  judgeId: TournamentJudgeId;
  conceptId: string;
  overallScore: number;
  categoryScores: Partial<Record<TournamentScoreCategory, number>>;
  rationale: string;
};

export type TournamentHeadToHead = {
  id: string;
  round: number;
  conceptAId: string;
  conceptBId: string;
  conceptALabel: string;
  conceptBLabel: string;
  winnerId: string;
  loserId: string;
  whyWinner: string[];
  whyLoserEliminated: string[];
};

export type TournamentChampionship = {
  finalistAId: string;
  finalistBId: string;
  finalistALabel: string;
  finalistBLabel: string;
  recommendMerge: boolean;
  mergeEquityBoostPct: number;
  mergeRationale: string;
  clearWinnerId?: string;
  chairmanSummary: string;
};

export type FutureTournamentResult = {
  id: string;
  ranAt: string;
  judgeScores: TournamentJudgeScore[];
  rounds: TournamentHeadToHead[];
  championship: TournamentChampionship;
  finalistIds: string[];
  eliminatedIds: string[];
  rankedConceptIds: string[];
};

export type TournamentLearningRecord = {
  acceptedRecommendations: number;
  rejectedRecommendations: number;
  preferredArchetypes: string[];
  mergePatterns: string[];
  creativePriorities: string[];
  founderOverrides: Array<{
    at: string;
    action: 'accept-chairman' | 'reject-chairman' | 'pick-finalist' | 'request-merge';
    conceptId?: string;
    detail?: string;
  }>;
};

export const TOURNAMENT_JUDGE_LABELS: Record<TournamentJudgeId, string> = {
  'creative-intelligence': 'Creative Intelligence Engine™',
  'architecture-auditor': 'Architecture Auditor™',
  'experience-intelligence': 'Experience Intelligence Engine™',
  'company-genome': 'Company Genome™',
  'asset-intelligence': 'Asset Intelligence Engine™',
  'creative-budget': 'Creative Budget™',
  'marketplace-intelligence': 'Marketplace Intelligence™',
  'brand-consistency': 'Brand Consistency Engine™',
  'navigation-intelligence': 'Navigation Intelligence™',
  'scene-stack-validator': 'Scene Stack Validator™',
};

export const TOURNAMENT_CATEGORY_LABELS: Record<TournamentScoreCategory, string> = {
  'creative-vision': 'Creative Vision',
  'brand-alignment': 'Brand Alignment',
  'architectural-quality': 'Architectural Quality',
  'environmental-storytelling': 'Environmental Storytelling',
  luxury: 'Luxury',
  innovation: 'Innovation',
  'founder-goals': 'Founder Goals',
  navigation: 'Navigation',
  'long-term-flexibility': 'Long-Term Flexibility',
  'expansion-potential': 'Expansion Potential',
  'creative-budget': 'Creative Budget',
  'generation-efficiency': 'Generation Efficiency',
  'asset-reuse': 'Asset Reuse',
  'marketplace-potential': 'Marketplace Potential',
  maintainability: 'Maintainability',
  'scene-stack-quality': 'Scene Stack Quality',
  'emotional-impact': 'Emotional Impact',
  replayability: 'Replayability',
  'overall-magic': 'Overall Magic™',
};
