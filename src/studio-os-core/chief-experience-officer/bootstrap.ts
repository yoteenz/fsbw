import { CEO_EXECUTIVE_COMPASS } from './constants';
import { bootstrapChiefExperienceOfficerStore } from './store';
import type { ChiefExperienceOfficerStore } from './types';

export function buildChiefExperienceOfficerSeed(): Partial<ChiefExperienceOfficerStore> {
  return {
    companyName: 'NDXBOOK',
    activeWorkspaceId: 'ndxbook',
    dashboard: {
      summary:
        'CHIEF EXPERIENCE OFFICER V2.0 — lifelong guardian of customer experience · humanity · not interfaces.',
      experienceHealthPct: 86,
      trustScorePct: 88,
      pendingReviews: 5,
      frictionAlerts: 2,
      councilCollaborations: 4,
      relationshipHealthTrend: 'up',
    },
    executiveCompass: CEO_EXECUTIVE_COMPASS,
    experienceGovernance: [
      { id: 'eg-1', initiative: 'Onboarding journey friction fix', category: 'Onboarding', status: 'pending', experienceScore: 72 },
      { id: 'eg-2', initiative: 'Editorial platform homepage refresh', category: 'Website experiences', status: 'approved', experienceScore: 91 },
      { id: 'eg-3', initiative: 'First-time reader welcome email sequence', category: 'Emails', status: 'approved', experienceScore: 89 },
      { id: 'eg-4', initiative: 'Checkout flow simplification', category: 'Checkout', status: 'revision', experienceScore: 78 },
      { id: 'eg-5', initiative: 'Community reader spotlight program', category: 'Community interactions', status: 'approved', experienceScore: 93 },
      { id: 'eg-6', initiative: 'Creator collaboration onboarding', category: 'Creator collaborations', status: 'pending', experienceScore: 76 },
    ],
    experienceAlignment: [
      {
        id: 'ea-1',
        initiative: 'Onboarding friction pivot',
        experienceScore: 72,
        trustScore: 85,
        frictionAnalysis: 'Drop-off at account creation · confusion on value proposition',
        emotionalAlignment: 'Stat-forward voice preserved · trust before scale',
        relationshipImpact: 'First impression defines long-term reader relationship',
        recommendation: 'Experience before scale · fix journey before GTM acceleration',
        confidence: 91,
      },
      {
        id: 'ea-2',
        initiative: '100K readers GTM touchpoints',
        experienceScore: 84,
        trustScore: 88,
        frictionAnalysis: 'Low friction on editorial content · monitor paid acquisition paths',
        emotionalAlignment: 'Curiosity → trust progression aligned to blueprint',
        relationshipImpact: 'Relationship-driven growth honors hospitality standards',
        recommendation: 'Approve with onboarding fix prerequisite',
        confidence: 86,
      },
      {
        id: 'ea-3',
        initiative: 'Membership experience tier launch',
        experienceScore: 90,
        trustScore: 92,
        frictionAnalysis: 'Minimal · clear value · editorial depth rewarded',
        emotionalAlignment: 'Belonging · readers who think · community proof',
        relationshipImpact: 'Advocacy pathway for 12K engaged readers',
        recommendation: 'Approved · celebration moments planned',
        confidence: 93,
      },
    ],
    journeyIntelligence: [
      { id: 'ji-1', stage: 'AWARENESS', status: 'strong', insight: 'Stat-forward content attracts right readers' },
      { id: 'ji-2', stage: 'DISCOVERY', status: 'strong', insight: 'Editorial depth differentiates from hype media' },
      { id: 'ji-3', stage: 'ONBOARDING', status: 'friction', insight: 'Account creation drop-off · fix before scale', opportunity: 'Simplify first session · clear value in 60 seconds' },
      { id: 'ji-4', stage: 'ACTIVATION', status: 'watch', insight: 'First article engagement strong · repeat visit improving' },
      { id: 'ji-5', stage: 'RETENTION', status: 'strong', insight: '12K engaged readers · relationship compounding' },
      { id: 'ji-6', stage: 'ADVOCACY', status: 'watch', insight: 'Early advocates forming · community spotlight opportunity' },
    ],
    experienceIntelligence: [
      { id: 'ei-1', dimension: 'Clarity', score: 90, trend: 'up' },
      { id: 'ei-2', dimension: 'Hospitality', score: 87, trend: 'stable' },
      { id: 'ei-3', dimension: 'Customer effort', score: 74, trend: 'down' },
      { id: 'ei-4', dimension: 'Emotional satisfaction', score: 88, trend: 'up' },
      { id: 'ei-5', dimension: 'Relationship strength', score: 86, trend: 'up' },
      { id: 'ei-6', dimension: 'Community health', score: 85, trend: 'up' },
    ],
    experienceEvolution: [
      { id: 'ee-1', category: 'Journey improvement', recommendation: 'Onboarding simplification · trust-first first session' },
      { id: 'ee-2', category: 'Community initiative', recommendation: 'Reader spotlight gallery · belonging moments' },
      { id: 'ee-3', category: 'Surprise & delight', recommendation: 'First anniversary celebration for early readers' },
      { id: 'ee-4', category: 'Support enhancement', recommendation: 'Proactive friction alerts from Reader Graph signals' },
    ],
    experienceCouncil: [
      { id: 'ec-1', executive: 'Chief Brand Officer', collaboration: 'Onboarding brand expression · stat-forward consistency', status: 'active' },
      { id: 'ec-2', executive: 'Chief Digital Officer', collaboration: 'Editorial platform journey feasibility', status: 'active' },
      { id: 'ec-3', executive: 'Chief Growth Officer', collaboration: 'GTM touchpoint experience validation', status: 'active' },
      { id: 'ec-4', executive: 'Chief of Staff', collaboration: 'Experience council before founder escalation', status: 'active' },
    ],
    experienceStudio: [
      { id: 'es-1', element: 'Customer journey walls', description: '18-stage blueprint · friction markers · delight zones', location: 'Experience Studio · Architect Studio east wing' },
      { id: 'es-2', element: 'Experience simulations', description: 'Walk-through onboarding · first-time reader path', location: 'Simulation lab' },
      { id: 'es-3', element: 'Hospitality playbooks', description: 'Trust before scale · reader-first service standards', location: 'Experience atelier' },
      { id: 'es-4', element: 'Relationship maps', description: 'Reader Graph integration · 12K engaged visualization', location: 'Relationship wall' },
      { id: 'es-5', element: 'Live customer insights', description: 'Support intelligence · community health feeds', location: 'Insights console' },
    ],
    experienceMemory: [
      { id: 'em-1', category: 'FRICTION LESSON', memory: 'Onboarding drop-off · almost launched too early · experience pivot', date: '2026-06' },
      { id: 'em-2', category: 'SUCCESS', memory: 'First paying reader · validation of trust-first journey', date: '2026-01' },
      { id: 'em-3', category: 'COMMUNITY', memory: '100th engaged reader · community formed organically', date: '2026-02' },
      { id: 'em-4', category: 'REDESIGN', memory: 'Welcome email sequence · clarity improved activation 18%', date: '2026-04' },
      { id: 'em-5', category: 'RELATIONSHIP', memory: '12K readers · advocacy signals · relationship compounding', date: '2026-06' },
    ],
    experienceProtection: [
      { id: 'ep-1', alertType: 'Journey inconsistency', severity: 'high', description: 'Onboarding path differs from marketing promise', correction: 'Align GTM copy with actual first-session experience' },
      { id: 'ep-2', alertType: 'Customer frustration', severity: 'medium', description: 'Checkout flow extra steps vs competitor simplicity', correction: 'Checkout simplification review in progress' },
    ],
    dailyBriefing: [
      { id: 'db-1', category: 'EXPERIENCE HEALTH', summary: '86% health · 88% trust · relationship trending up', priority: 'high' },
      { id: 'db-2', category: 'FRICTION ALERTS', summary: 'Onboarding drop-off · checkout complexity', priority: 'high' },
      { id: 'db-3', category: 'COMMUNITY', summary: '12K engaged · spotlight program launching', priority: 'medium' },
      { id: 'db-4', category: 'JOURNEY IMPROVEMENTS', summary: 'Onboarding fix blocks GTM acceleration', priority: 'high' },
      { id: 'db-5', category: 'HOSPITALITY', summary: 'Early reader anniversary celebration opportunity', priority: 'medium' },
    ],
    recommendations: [
      { id: 'rec-1', summary: 'Prioritize onboarding fix before 100K GTM launch', confidence: 91, customerImpact: 'First impression defines lifetime relationship', recommendedAction: 'Block GTM until onboarding score > 85', hasTradeoffs: true },
      { id: 'rec-2', summary: 'Launch reader spotlight community program', confidence: 88, customerImpact: 'Belonging · advocacy · emotional connection', recommendedAction: 'Approve community initiative Q3', hasTradeoffs: false },
      { id: 'rec-3', summary: 'Simplify checkout to 3 steps maximum', confidence: 85, customerImpact: 'Reduce abandonment · trust in purchase moment', recommendedAction: 'Digital Architect collaboration required', hasTradeoffs: true },
    ],
    recommendedNextSteps: [
      'Complete onboarding alignment review with Brand Council',
      'Experience simulation walk-through with founder',
      'Reader Graph friction signals → proactive fixes',
      'Checkout simplification with Digital Architect',
    ],
    futureOpportunities: [
      'Unified experience health score synced to Company Genome',
      'Automatic journey friction detection from Reader Graph',
      'Experience studio live simulations in Architect Studio',
      'Executive compass audit on every touchpoint approval',
    ],
  };
}

export function bootstrapChiefExperienceOfficerPlatform(): void {
  bootstrapChiefExperienceOfficerStore(buildChiefExperienceOfficerSeed());
}
