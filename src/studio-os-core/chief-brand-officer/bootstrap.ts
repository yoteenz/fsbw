import { EXECUTIVE_COMPASS_QUESTION } from './constants';
import { bootstrapChiefBrandOfficerStore } from './store';
import type { ChiefBrandOfficerStore } from './types';

export function buildChiefBrandOfficerSeed(): Partial<ChiefBrandOfficerStore> {
  return {
    companyName: 'NDXBOOK',
    activeWorkspaceId: 'ndxbook',
    dashboard: {
      summary:
        'CHIEF BRAND OFFICER V2.0 — lifelong guardian of organizational identity · protect meaning · not logos.',
      brandHealthPct: 89,
      consistencyScorePct: 92,
      pendingReviews: 4,
      protectionAlerts: 2,
      councilCollaborations: 3,
      brandEquityTrend: 'up',
    },
    executiveCompass: EXECUTIVE_COMPASS_QUESTION,
    brandGovernance: [
      { id: 'bg-1', initiative: '100K readers GTM campaign', category: 'Marketing campaigns', status: 'pending', alignmentScore: 88 },
      { id: 'bg-2', initiative: 'Creator marketplace pilot content', category: 'Creator partnerships', status: 'revision', alignmentScore: 74 },
      { id: 'bg-3', initiative: 'Editorial platform homepage refresh', category: 'Websites & apps', status: 'approved', alignmentScore: 94 },
      { id: 'bg-4', initiative: 'LinkedIn stat-forward series', category: 'Social content', status: 'approved', alignmentScore: 91 },
      { id: 'bg-5', initiative: 'First hire recruitment campaign', category: 'Recruitment branding', status: 'pending', alignmentScore: 85 },
      { id: 'bg-6', initiative: 'Community reader spotlight program', category: 'Community initiatives', status: 'approved', alignmentScore: 93 },
    ],
    brandAlignment: [
      {
        id: 'ba-1',
        initiative: '100K readers GTM sequencing',
        alignmentScore: 88,
        strengths: 'Relationship-driven · stat-forward voice preserved · Founder\'s Promise aligned',
        risks: 'Velocity pressure could dilute editorial depth',
        opportunities: 'Reader stories as trust builders',
        recommendation: 'Approve with Writing DNA gate on all copy',
        confidence: 87,
        organizationalImpact: 'High · defines year-two brand perception',
      },
      {
        id: 'ba-2',
        initiative: 'Creator marketplace pilot partner content',
        alignmentScore: 74,
        strengths: 'Platform expansion serves mission',
        risks: 'Creator voice may conflict with Writing Bible standards',
        opportunities: 'Curated creator tier as brand extension',
        recommendation: 'Revision required · onboarding quality gate',
        confidence: 82,
        organizationalImpact: 'Medium · first external brand expression',
      },
      {
        id: 'ba-3',
        initiative: 'Stat-forward identity lock · editorial mode',
        alignmentScore: 96,
        strengths: 'Full DNA alignment · competitive differentiation clear',
        recommendation: 'Approved · institutionalize as standard',
        confidence: 95,
        organizationalImpact: 'Foundational · all future touchpoints inherit',
      },
    ],
    brandIntelligence: [
      { id: 'bi-1', dimension: 'Messaging consistency', status: 'strong', insight: 'Writing Bible enforcement · 94% copy alignment', recommendation: 'Extend to creator onboarding templates' },
      { id: 'bi-2', dimension: 'Visual consistency', status: 'strong', insight: 'Stat-forward identity locked · editorial form consistent' },
      { id: 'bi-3', dimension: 'Community sentiment', status: 'watch', insight: '12K readers engaged · advocacy growing · monitor onboarding friction narrative' },
      { id: 'bi-4', dimension: 'Competitive differentiation', status: 'strong', insight: 'Editorial intelligence positioning unique vs generic media' },
      { id: 'bi-5', dimension: 'Trust & recognition', status: 'watch', insight: 'Early stage · first customers loyal · scale without dilution' },
      { id: 'bi-6', dimension: 'Emotional resonance', status: 'strong', insight: 'Readers who think · depth over hype resonates' },
    ],
    brandEvolution: [
      { id: 'be-1', category: 'Messaging refresh', recommendation: 'Refine 100K initiative narrative · relationship metrics front', intent: 'intentional' },
      { id: 'be-2', category: 'Storytelling expansion', recommendation: 'Reader story gallery · community as brand proof', intent: 'proactive' },
      { id: 'be-3', category: 'Communication systems', recommendation: 'Creator tier voice guidelines · sub-brand architecture', intent: 'intentional' },
    ],
    brandCouncil: [
      { id: 'bc-1', executive: 'Chief Experience Officer', collaboration: 'Onboarding journey brand expression review', status: 'active' },
      { id: 'bc-2', executive: 'Chief Growth Officer', collaboration: 'GTM forum brand validation before founder escalation', status: 'active' },
      { id: 'bc-3', executive: 'Chief Digital Officer', collaboration: 'Editorial mode ecosystem brand coherence', status: 'scheduled' },
      { id: 'bc-4', executive: 'Chief of Staff', collaboration: 'Coordinate brand council before major decisions', status: 'active' },
    ],
    creativeReviewStudio: [
      { id: 'crs-1', element: 'Identity walls', description: 'Stat-forward voice · verbal/visual systems on display', location: 'Brand Studio · Architect Studio north wing' },
      { id: 'crs-2', element: 'Campaign galleries', description: '100K initiative · live creative reviews', location: 'Brand Studio atelier' },
      { id: 'crs-3', element: 'Brand timelines', description: 'Evolution from conception to stat-forward lock', location: 'Identity wall · east' },
      { id: 'crs-4', element: 'Competitive landscape', description: 'Editorial intelligence vs generic media positioning', location: 'Strategy corner' },
      { id: 'crs-5', element: 'Side-by-side comparisons', description: 'Approve/revise workflow · moodboards · typography explorations', location: 'Review table · center' },
    ],
    brandMemory: [
      { id: 'bm-1', category: 'CREATIVE DECISION', memory: 'Rejected generic media templates · stat-forward voice preserved', date: '2025-12' },
      { id: 'bm-2', category: 'CAMPAIGN', memory: 'First paying reader validation · trust before scale messaging', date: '2026-01' },
      { id: 'bm-3', category: 'POSITIONING', memory: 'Editorial intelligence over hype · institutionalized in Brand Architect', date: '2026-03' },
      { id: 'bm-4', category: 'LESSON', memory: 'Almost launched before onboarding fix · experience protects brand', date: '2026-06' },
      { id: 'bm-5', category: 'CUSTOMER REACTION', memory: '12K engaged readers · advocacy validates relationship-driven brand', date: '2026-06' },
    ],
    brandProtection: [
      { id: 'bp-1', alertType: 'Tone inconsistency', severity: 'medium', description: 'Creator pilot draft copy uses hype language', correction: 'Writing DNA review gate before publish' },
      { id: 'bp-2', alertType: 'Message dilution', severity: 'low', description: 'GTM velocity pressure on social snippets', correction: 'Stat-forward checklist on all campaign assets' },
    ],
    dailyBriefing: [
      { id: 'db-1', category: 'BRAND HEALTH', summary: '89% health · 92% consistency · equity trending up', priority: 'high' },
      { id: 'db-2', category: 'CAMPAIGN APPROVALS', summary: '2 pending · GTM campaign · recruitment branding', priority: 'high' },
      { id: 'db-3', category: 'CREATIVE REVIEWS', summary: 'Creator marketplace content revision required', priority: 'medium' },
      { id: 'db-4', category: 'BRAND OPPORTUNITIES', summary: 'Reader story gallery · community proof expansion', priority: 'medium' },
      { id: 'db-5', category: 'ORGANIZATIONAL RISKS', summary: 'Scale velocity vs voice integrity · monitor closely', priority: 'high' },
    ],
    recommendations: [
      { id: 'rec-1', summary: 'Approve GTM with Writing DNA gate · relationship-first narrative', confidence: 87, alignmentScore: 88, recommendedAction: 'Conditional approval · copy review checkpoint', hasTradeoffs: true },
      { id: 'rec-2', summary: 'Block creator content until voice guidelines onboarded', confidence: 91, alignmentScore: 74, recommendedAction: 'Revision cycle · Brand Council with Growth', hasTradeoffs: true },
      { id: 'rec-3', summary: 'Launch reader story gallery as brand proof program', confidence: 85, alignmentScore: 93, recommendedAction: 'Proactive evolution · Q3 initiative', hasTradeoffs: false },
    ],
    recommendedNextSteps: [
      'Complete GTM brand alignment review with Growth Architect',
      'Resolve creator marketplace tone inconsistency',
      'Brand Council session · onboarding brand expression',
      'Extend Writing DNA gate to all creator templates',
    ],
    futureOpportunities: [
      'Automatic brand alignment scoring on all Campaign Engine initiatives',
      'Brand equity sync with Company Genome genetic layers',
      'Creative review studio live side-by-side in Architect Studio',
      'Executive compass audit trail on every approval',
    ],
  };
}

export function bootstrapChiefBrandOfficerPlatform(): void {
  bootstrapChiefBrandOfficerStore(buildChiefBrandOfficerSeed());
}
