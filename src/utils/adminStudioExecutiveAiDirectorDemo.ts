/**
 * Executive AI Director — strategic intelligence layer (Milestone 16).
 * Demo/placeholder; coaches from workspace history + configuration — not a chatbot.
 */

export const EXECUTIVE_AI_DIRECTOR_SUBTITLE =
  'YOUR EXECUTIVE ADVISOR — COACH · FORECAST · OPTIMIZE · NEVER REPLACE CREATION.';

export const EXECUTIVE_AI_DIRECTOR_INHERITANCE_CHAIN = [
  'WORKSPACE MEMORY',
  'EXECUTIVE AI DIRECTOR',
  'PRODUCTION BUILDER',
  'DIRECTOR MODE',
  'CONTENT PACKS',
  'DISTRIBUTION',
  'LEGACY',
] as const;

export type ExecutiveAiTabId =
  | 'brief'
  | 'insights'
  | 'production'
  | 'brand'
  | 'prompt'
  | 'forecast'
  | 'recommendations'
  | 'timeline'
  | 'chat';

export const EXECUTIVE_AI_TABS: Array<{ id: ExecutiveAiTabId; label: string }> = [
  { id: 'brief', label: "TODAY'S BRIEF" },
  { id: 'insights', label: 'CREATIVE INTEL' },
  { id: 'production', label: 'PRODUCTION' },
  { id: 'brand', label: 'BRAND' },
  { id: 'prompt', label: 'PROMPT REVIEW' },
  { id: 'forecast', label: 'FORECAST' },
  { id: 'recommendations', label: 'ADVICE' },
  { id: 'timeline', label: 'TIMELINE' },
  { id: 'chat', label: 'EXECUTIVE CHAT' },
];

export type ExecutiveAiHubCardId =
  | 'todays-brief'
  | 'creative-insights'
  | 'brand-health'
  | 'opportunities'
  | 'production-recs'
  | 'trend-signals'
  | 'performance-forecast';

export const EXECUTIVE_AI_HUB_CARDS: Array<{
  id: ExecutiveAiHubCardId;
  title: string;
  metric: string;
  description: string;
  tab: ExecutiveAiTabId;
  accentHex: string;
}> = [
  { id: 'todays-brief', title: "TODAY'S BRIEF", metric: '7 SIGNALS', description: 'LUXURY MORNING EXECUTIVE REPORT', tab: 'brief', accentHex: '#EB1C24' },
  { id: 'creative-insights', title: 'CREATIVE INSIGHTS', metric: '24 PATTERNS', description: 'HISTORICAL WORKSPACE PERFORMANCE', tab: 'insights', accentHex: '#2563EB' },
  { id: 'brand-health', title: 'BRAND HEALTH', metric: '98%', description: 'TYPOGRAPHY · TONE · COMPLIANCE', tab: 'brand', accentHex: '#16A34A' },
  { id: 'opportunities', title: 'OPPORTUNITIES', metric: '6 OPEN', description: 'GROWTH & CONTENT GAPS', tab: 'recommendations', accentHex: '#D97706' },
  { id: 'production-recs', title: 'PRODUCTION RECS', metric: '4 ACTIVE', description: 'PRE-GENERATION COACHING', tab: 'production', accentHex: '#9333EA' },
  { id: 'trend-signals', title: 'TREND SIGNALS', metric: 'INTERNAL', description: 'WORKSPACE DATA · NO EXTERNAL FEEDS', tab: 'insights', accentHex: '#0D9488' },
  { id: 'performance-forecast', title: 'PERFORMANCE FORECAST', metric: 'EST.', description: 'PREDICTIVE RANGES · NOT FACTS', tab: 'forecast', accentHex: '#CA8A04' },
];

export type ExecutiveScoreDimension = {
  id: string;
  label: string;
  score: number;
};

export const EXECUTIVE_SCORECARD_SEED: ExecutiveScoreDimension[] = [
  { id: 'creative', label: 'CREATIVE', score: 94 },
  { id: 'brand', label: 'BRAND', score: 98 },
  { id: 'production', label: 'PRODUCTION', score: 91 },
  { id: 'publishing', label: 'PUBLISHING', score: 87 },
  { id: 'audience', label: 'AUDIENCE', score: 92 },
  { id: 'consistency', label: 'CONSISTENCY', score: 89 },
  { id: 'innovation', label: 'INNOVATION', score: 85 },
  { id: 'growth', label: 'GROWTH', score: 88 },
];

export type ExecutiveBriefLine = {
  id: string;
  text: string;
  source: 'history' | 'config' | 'estimate';
};

export const EXECUTIVE_TODAYS_BRIEF: {
  greeting: string;
  lines: ExecutiveBriefLine[];
  footer: string;
} = {
  greeting: 'GOOD MORNING.',
  lines: [
    { id: 'b1', text: "LAST WEEK'S SLAY REPORT ACHIEVED THE HIGHEST COMPLETION RATE OF THE MONTH (WORKSPACE HISTORY).", source: 'history' },
    { id: 'b2', text: 'WEATHER STUDIO CONTINUES OUTPERFORMING BUILD STUDIO BY 14% (INTERNAL BENCHMARK).', source: 'history' },
    { id: 'b3', text: 'LUXURY WHITE WARDROBE GENERATED THE HIGHEST ENGAGEMENT IN RECENT PACKS.', source: 'history' },
    { id: 'b4', text: 'THREE UNFINISHED CONTENT PACKS REQUIRE ATTENTION (CURRENT WORKSPACE CONFIG).', source: 'config' },
    { id: 'b5', text: 'NO EMAIL CAMPAIGN PUBLISHED IN SEVEN DAYS (PUBLISHING CADENCE).', source: 'history' },
    { id: 'b6', text: 'TWO AI ASSETS STILL REQUIRE APPROVAL IN ASSET DIRECTOR.', source: 'config' },
    { id: 'b7', text: 'ESTIMATED NEXT LAUNCH WINDOW: HIGH CONFIDENCE FOR THURSDAY 10AM (FORECAST — NOT GUARANTEED).', source: 'estimate' },
  ],
  footer: 'BRIEF COMPILED FROM WORKSPACE HISTORY + CURRENT CONFIGURATION · EXTERNAL TREND FEEDS NOT CONNECTED',
};

export type CreativeIntelItem = {
  id: string;
  category: string;
  label: string;
  value: string;
  source: 'history' | 'config';
  keywords: string[];
};

export const CREATIVE_INTELLIGENCE_INDEX: CreativeIntelItem[] = [
  { id: 'ci-studio-1', category: 'STUDIOS', label: 'TOP STUDIO', value: 'WEATHER STUDIO · 14% ABOVE AVG', source: 'history', keywords: ['studio', 'weather', 'set', 'environment'] },
  { id: 'ci-studio-2', category: 'STUDIOS', label: 'RUNNER UP', value: 'BUILD STUDIO · STRONG PRODUCT STORIES', source: 'history', keywords: ['studio', 'build', 'product'] },
  { id: 'ci-talent-1', category: 'TALENT', label: 'TOP TALENT', value: 'PSA · HIGHEST TRUST SCORE', source: 'history', keywords: ['talent', 'psa', 'host', 'personality'] },
  { id: 'ci-camera-1', category: 'CAMERA', label: 'TOP ANGLE', value: 'MEDIUM CLOSE · +22% COMPLETION', source: 'history', keywords: ['camera', 'angle', 'framing', 'medium', 'close'] },
  { id: 'ci-cta-1', category: 'CTA', label: 'TOP CTA', value: 'SHOP THE COLLECTION · 4.2% CTR', source: 'history', keywords: ['cta', 'shop', 'conversion'] },
  { id: 'ci-length-1', category: 'PACING', label: 'IDEAL RUNTIME', value: '8–12 MIN LOUNGE · 45–90 SEC SOCIAL', source: 'history', keywords: ['length', 'runtime', 'video', 'duration'] },
  { id: 'ci-time-1', category: 'PUBLISHING', label: 'TOP UPLOAD WINDOW', value: 'THU 10AM · TUE 6PM (WORKSPACE)', source: 'history', keywords: ['upload', 'time', 'schedule', 'publish'] },
  { id: 'ci-thumb-1', category: 'THUMBNAILS', label: 'TOP THUMBNAIL STYLE', value: 'MARBLE + RED ACCENT + PORTRAIT', source: 'history', keywords: ['thumbnail', 'thumb', 'preview'] },
  { id: 'ci-lounge-1', category: 'LOUNGE TV', label: 'TOP CATEGORY', value: 'LEARN · LACE MASTERY', source: 'history', keywords: ['lounge', 'tv', 'category', 'learn'] },
  { id: 'ci-blog-1', category: 'JOURNAL', label: 'TOP BLOG TOPIC', value: 'LUXURY CARE EDUCATION', source: 'history', keywords: ['blog', 'journal', 'article', 'topic'] },
];

export type ProductionCoachingNote = {
  id: string;
  severity: 'info' | 'warn' | 'critical';
  title: string;
  detail: string;
  source: 'history' | 'config' | 'analysis';
};

export type BrandComplianceItem = {
  id: string;
  area: string;
  status: 'pass' | 'review' | 'fail';
  note: string;
};

export const BRAND_COMPLIANCE_SEED: BrandComplianceItem[] = [
  { id: 'bc-1', area: 'TYPOGRAPHY', status: 'pass', note: 'FUTURA PT + COVERED BY YOUR GRACE ON LABELS' },
  { id: 'bc-2', area: 'BRAND COLORS', status: 'pass', note: '#EB1C24 PRIMARY · MARBLE BACKGROUNDS' },
  { id: 'bc-3', area: 'LUXURY TONE', status: 'pass', note: 'EDITORIAL · CONFIDENT · NOT SALESY' },
  { id: 'bc-4', area: 'WORKSPACE RULES', status: 'review', note: 'CONTENT BRAIN CTA LIBRARY — 2 UNUSED VARIANTS' },
  { id: 'bc-5', area: 'VOICE CONSISTENCY', status: 'pass', note: 'PSA FOUNDER VOICE ALIGNED' },
  { id: 'bc-6', area: 'PROMPT CONSISTENCY', status: 'review', note: 'REPEATED "LUXURY EDITORIAL" IN 3 SCENES' },
  { id: 'bc-7', area: 'GRAPHIC CONSISTENCY', status: 'pass', note: 'FORECAST GRAPHICS KIT APPROVED' },
];

export type PromptReviewFinding = {
  id: string;
  type: 'repetition' | 'weak' | 'missing' | 'style' | 'brand';
  text: string;
};

export type ExecutiveRecommendation = {
  id: string;
  title: string;
  body: string;
  source: 'history' | 'config' | 'estimate';
  priority: 'high' | 'medium' | 'low';
};

export const EXECUTIVE_RECOMMENDATIONS_SEED: ExecutiveRecommendation[] = [
  { id: 'r1', title: 'CREATE ANOTHER WEATHER STUDIO EPISODE', body: 'WEATHER STUDIO OUTPERFORMS BUILD STUDIO BY 14% IN WORKSPACE HISTORY.', source: 'history', priority: 'high' },
  { id: 'r2', title: 'LUXURY TIPS ENGAGEMENT RISING', body: 'AUDIENCE ENGAGEMENT WITH "LUXURY TIPS" SEGMENTS INCREASED 9% (INTERNAL).', source: 'history', priority: 'medium' },
  { id: 'r3', title: 'TOP CTA UNUSED FOR 4 WEEKS', body: 'YOUR HIGHEST-PERFORMING CTA HAS NOT BEEN USED RECENTLY.', source: 'history', priority: 'high' },
  { id: 'r4', title: 'BALANCE EMAIL MIX', body: 'LAST THREE EMAILS FOCUSED ON LAUNCHES — CONSIDER EDUCATIONAL CONTENT NEXT.', source: 'config', priority: 'medium' },
  { id: 'r5', title: 'COMPLETE DRAFT PACKS', body: 'THREE CONTENT PACKS IN DRAFT — FINISH BEFORE NEXT PUBLISHING WINDOW.', source: 'config', priority: 'high' },
];

export type AbStrategyVariant = {
  id: string;
  dimension: string;
  variantA: string;
  variantB: string;
  rationale: string;
  source: 'history' | 'estimate';
};

export const AB_STRATEGY_SEED: AbStrategyVariant[] = [
  { id: 'ab1', dimension: 'THUMBNAIL', variantA: 'MARBLE + PSA PORTRAIT', variantB: 'FORECAST GRAPHIC HERO', rationale: 'A WINS ON TRUST (HISTORY); B WINS ON CLICK CURIOSITY (ESTIMATE).', source: 'history' },
  { id: 'ab2', dimension: 'HOOK', variantA: 'WEATHER METAPHOR OPEN', variantB: 'DIRECT PRODUCT QUESTION', rationale: 'A HIGHER COMPLETION (HISTORY); B HIGHER SHORT-FORM CTR (ESTIMATE).', source: 'estimate' },
  { id: 'ab3', dimension: 'CTA', variantA: 'SHOP THE COLLECTION', variantB: 'BOOK A CONSULT', rationale: 'A TOP CTR IN WORKSPACE; B STRONGER FOR PREMIUM MEMBERS.', source: 'history' },
  { id: 'ab4', dimension: 'OPENING SCENE', variantA: 'WIDE WEATHER DESK', variantB: 'CLOSE PSA WELCOME', rationale: 'A SETS BROADCAST TONE; B FASTER HOOK FOR SOCIAL CUTDOWNS.', source: 'estimate' },
];

export type ContentGapItem = {
  id: string;
  pillar: string;
  gap: string;
  source: 'history' | 'config';
};

export const CONTENT_GAP_SEED: ContentGapItem[] = [
  { id: 'g1', pillar: 'SERIES', gap: 'NO RECENT "SLAY LAB" EPISODE IN 3 WEEKS', source: 'history' },
  { id: 'g2', pillar: 'TOPICS', gap: 'OCEAN CURL EDUCATION UNDER-REPRESENTED', source: 'config' },
  { id: 'g3', pillar: 'PRODUCT EDUCATION', gap: 'SOFT WAVE CARE GUIDE MISSING', source: 'config' },
  { id: 'g4', pillar: 'CUSTOMER EDUCATION', gap: 'LACE MASTERY STRONG — ADD ADVANCED PARTING', source: 'history' },
  { id: 'g5', pillar: 'MEMBER EXCLUSIVES', gap: 'NO PREMIUM-ONLY LOUNGE EPISODE THIS MONTH', source: 'config' },
  { id: 'g6', pillar: 'SEASONAL', gap: 'SUMMER LUXURY CAMPAIGN NOT SCHEDULED', source: 'config' },
  { id: 'g7', pillar: 'CONTENT PILLARS', gap: 'TREND FORECAST UNDER-INDEXED VS CARE', source: 'history' },
];

export type PerformanceForecast = {
  id: string;
  label: string;
  estimate: string;
  range: string;
  confidence: 'high' | 'medium' | 'low';
  disclaimer: string;
};

export const PERFORMANCE_FORECAST_SEED: PerformanceForecast[] = [
  { id: 'f1', label: 'EST. WATCH TIME', estimate: '6:40 AVG', range: '5:50 – 7:20', confidence: 'medium', disclaimer: 'BASED ON WORKSPACE HISTORY · ESTIMATE ONLY' },
  { id: 'f2', label: 'EST. COMPLETION RATE', estimate: '68%', range: '62% – 74%', confidence: 'medium', disclaimer: 'NOT GUARANTEED' },
  { id: 'f3', label: 'EST. EMAIL OPEN RATE', estimate: '41%', range: '36% – 46%', confidence: 'low', disclaimer: 'CONFIG-BASED · NO LIVE ESP DATA' },
  { id: 'f4', label: 'EST. CTR', estimate: '3.8%', range: '3.1% – 4.5%', confidence: 'medium', disclaimer: 'INTERNAL BENCHMARK' },
  { id: 'f5', label: 'EST. PRODUCTION TIME', estimate: '28 MIN', range: '22 – 36 MIN', confidence: 'high', disclaimer: 'FROM BUILDER + DIRECTOR DRAFTS' },
  { id: 'f6', label: 'EST. GENERATION COST', estimate: '$186', range: '$160 – $210', confidence: 'low', disclaimer: 'DEMO PRICING · NOT BILLED' },
];

export type TrendSignalPlugin = {
  id: string;
  name: string;
  status: 'internal' | 'available' | 'disconnected';
  note: string;
};

export const TREND_SIGNAL_PLUGINS: TrendSignalPlugin[] = [
  { id: 'internal', name: 'WORKSPACE HISTORY', status: 'internal', note: 'ACTIVE — PRIMARY SIGNAL SOURCE' },
  { id: 'instagram', name: 'INSTAGRAM', status: 'disconnected', note: 'OPTIONAL — NOT CONNECTED' },
  { id: 'tiktok', name: 'TIKTOK', status: 'disconnected', note: 'OPTIONAL — NOT CONNECTED' },
  { id: 'pinterest', name: 'PINTEREST', status: 'disconnected', note: 'OPTIONAL — NOT CONNECTED' },
  { id: 'youtube', name: 'YOUTUBE', status: 'disconnected', note: 'OPTIONAL — NOT CONNECTED' },
  { id: 'google-trends', name: 'GOOGLE TRENDS', status: 'disconnected', note: 'OPTIONAL — NOT CONNECTED' },
];

export type WorkspaceMemoryEntry = {
  id: string;
  category: string;
  label: string;
  recordedAt: string;
  note: string;
};

export const WORKSPACE_MEMORY_SEED: WorkspaceMemoryEntry[] = [
  { id: 'wm1', category: 'PROMPT', label: 'WEATHER STUDIO + BROADCAST LIGHTING', recordedAt: '2026-06-28', note: 'HIGH COMPLETION PACK' },
  { id: 'wm2', category: 'CAMERA', label: 'MEDIUM CLOSE PSA', recordedAt: '2026-06-25', note: 'TOP TRUST SCORE' },
  { id: 'wm3', category: 'STUDIO', label: 'WEATHER STUDIO', recordedAt: '2026-07-01', note: '14% ABOVE AVG' },
  { id: 'wm4', category: 'TALENT', label: 'PSA HOST', recordedAt: '2026-06-30', note: 'HIGHEST RETENTION' },
  { id: 'wm5', category: 'PACING', label: '8 MIN LOUNGE EPISODES', recordedAt: '2026-06-20', note: 'OPTIMAL COMPLETION' },
  { id: 'wm6', category: 'TITLE', label: 'CHERRY RED FORECAST', recordedAt: '2026-06-18', note: 'TOP CLICK-THROUGH' },
  { id: 'wm7', category: 'SCHEDULE', label: 'THU 10AM PREMIERE', recordedAt: '2026-06-15', note: 'BEST OPEN RATE WINDOW' },
  { id: 'wm8', category: 'EMAIL SUBJECT', label: 'YOUR LUXURY FORECAST AWAITS', recordedAt: '2026-06-12', note: '41% OPEN (INTERNAL)' },
];

export type ExecutiveTimelineEntry = {
  id: string;
  date: string;
  title: string;
  category: 'launch' | 'campaign' | 'show' | 'milestone' | 'experiment' | 'brand';
  note: string;
};

export const EXECUTIVE_TIMELINE_SEED: ExecutiveTimelineEntry[] = [
  { id: 'et1', date: '2026-07-01', title: 'WEATHER STUDIO REFRESH', category: 'brand', note: 'ASSET DIRECTOR V3 APPROVED' },
  { id: 'et2', date: '2026-06-28', title: 'SLAY REPORT EP. 12', category: 'show', note: 'HIGHEST COMPLETION THIS MONTH' },
  { id: 'et3', date: '2026-06-22', title: 'SUMMER LUXURY TEASE', category: 'campaign', note: 'MULTI-CHANNEL LAUNCH' },
  { id: 'et4', date: '2026-06-15', title: 'PRODUCTION BUILDER LIVE', category: 'milestone', note: 'VISUAL ASSEMBLY WORKFLOW' },
  { id: 'et5', date: '2026-06-08', title: 'A/B THUMBNAIL TEST', category: 'experiment', note: 'MARBLE PORTRAIT WON +12%' },
  { id: 'et6', date: '2026-05-30', title: 'LOUNGE TV LEARN HUB', category: 'launch', note: 'LACE MASTERY SERIES' },
];

export type ProductionTimelineEntry = {
  id: string;
  productionName: string;
  generatedAt: string;
  publishedAt?: string;
  performance?: string;
  contentPackId?: string;
  workspace: string;
  status: 'draft' | 'generated' | 'published';
};

export const PRODUCTION_TIMELINE_SEED: ProductionTimelineEntry[] = [
  { id: 'pt1', productionName: 'CHERRY RED FORECAST', generatedAt: '2026-06-26', publishedAt: '2026-06-28', performance: '68% COMPLETION', contentPackId: 'cherry-red-forecast', workspace: 'FRONTAL SLAYER', status: 'published' },
  { id: 'pt2', productionName: 'CUTTING YOUR LACE', generatedAt: '2026-06-18', publishedAt: '2026-06-20', performance: '72% COMPLETION', contentPackId: 'cutting-your-lace', workspace: 'FRONTAL SLAYER', status: 'published' },
  { id: 'pt3', productionName: 'UNTITLED DRAFT', generatedAt: '2026-07-02', workspace: 'FRONTAL SLAYER', status: 'draft' },
];

export type ExecutiveChatMessage = {
  id: string;
  role: 'user' | 'advisor';
  text: string;
  sourceNote?: string;
  createdAt: string;
};

export function searchCreativeIntel(query: string): CreativeIntelItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return CREATIVE_INTELLIGENCE_INDEX;
  return CREATIVE_INTELLIGENCE_INDEX.filter(
    (item) =>
      item.label.toLowerCase().includes(q) ||
      item.value.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.keywords.some((k) => k.includes(q))
  );
}

export function overallStudioHealth(scores: ExecutiveScoreDimension[]): number {
  if (!scores.length) return 0;
  return Math.round(scores.reduce((s, d) => s + d.score, 0) / scores.length);
}

export const SOURCE_LABELS: Record<string, string> = {
  history: 'WORKSPACE HISTORY',
  config: 'CURRENT CONFIGURATION',
  estimate: 'PREDICTIVE ESTIMATE',
  analysis: 'PRODUCTION ANALYSIS',
};
