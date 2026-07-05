import { REFLECTIVE_QUESTION_SEEDS } from './constants';
import { bootstrapFoundersPromiseStore } from './store';
import type { FoundersPromiseStore } from './types';

const ORIGINAL_PROMISE_TEXT = `I promise to build NDXBOOK as editorial intelligence for readers who think — not algorithms who optimize.

I will never sacrifice stat-forward voice for velocity. I will serve readers who deserve depth before hype.

I build for the person who reads the footnote. I build for the mentor who taught me that trust compounds.

If this company succeeds but loses its character, I will have failed. If it grows slowly but stays true, I will have succeeded.

Future generations should inherit an organization that honored its readers, its craft, and the people who believed before proof existed.`;

const CURRENT_PROMISE_TEXT = `I promise to build NDXBOOK as editorial intelligence for readers who think — not algorithms who optimize.

I will never sacrifice stat-forward voice for velocity. I will serve readers who deserve depth before hype.

I build for the person who reads the footnote. I build for the mentor who taught me that trust compounds.

Relationships measure success — not vanity metrics. Institutional memory compounds. Document while fresh.

If this company succeeds but loses its character, I will have failed. If it grows slowly but stays true, I will have succeeded.

Future generations should inherit an organization that honored its readers, its craft, and the people who believed before proof existed.`;

export function buildFoundersPromiseSeed(): Partial<FoundersPromiseStore> {
  return {
    companyName: 'NDXBOOK',
    activeWorkspaceId: 'ndxbook',
    dashboard: {
      summary:
        'FOUNDER\'S PROMISE V1.0 — personal north star · emotional foundation · not marketing · optimized for truth.',
      currentVersion: 2,
      totalVersions: 2,
      alignmentScorePct: 91,
      executivesAligned: 5,
      reflectionMomentsPending: 1,
      archiveEntries: 8,
      privacy: 'organization',
    },
    reflectiveQuestions: REFLECTIVE_QUESTION_SEEDS.map((q, i) => ({
      id: `rq-${i + 1}`,
      question: q,
      promptContext: 'Guided reflective conversation · Studio Intelligence · thoughtful not questionnaire',
      explored: i < 6,
    })),
    currentPromise: {
      text: CURRENT_PROMISE_TEXT,
      version: 2,
      lastRevised: '2026-06',
      format: 'text',
    },
    originalPromise: {
      text: ORIGINAL_PROMISE_TEXT,
      date: '2025-11',
      preserved: true,
    },
    promiseVersions: [
      {
        id: 'pv-1',
        version: 1,
        label: 'ORIGINAL PROMISE',
        excerpt: 'Editorial intelligence for readers who think · never sacrifice stat-forward voice',
        date: '2025-11',
        format: 'text',
        isOriginal: true,
      },
      {
        id: 'pv-2',
        version: 2,
        label: 'CURRENT PROMISE',
        excerpt: 'Added relationships measure success · institutional memory compounds',
        date: '2026-06',
        format: 'text',
        isOriginal: false,
        changeReason: '12K readers milestone · relationship-driven growth validated',
      },
    ],
    livingEvolution: [
      {
        id: 'le-1',
        fromVersion: 1,
        toVersion: 2,
        whatChanged: 'Added relationship and institutional memory commitments',
        whyChanged: 'First year proved trust compounds through readers, not acquisition',
        influencingEvent: '12K engaged readers · Growth Architect alignment',
      },
    ],
    organizationalAlignment: [
      {
        id: 'oa-1',
        decision: '100K readers initiative launch',
        category: 'GROWTH',
        alignmentScore: 94,
        reasoning: 'Relationship-driven growth honors promise · not vanity acquisition',
        recommendedAdjustment: 'Ensure GTM sequencing preserves editorial voice',
      },
      {
        id: 'oa-2',
        decision: 'Creator marketplace pilot partnership',
        category: 'PARTNERSHIP',
        alignmentScore: 88,
        reasoning: 'Platform expansion serves readers who think · creator quality gate required',
        potentialConflict: 'Marketplace velocity could pressure editorial standards',
        recommendedAdjustment: 'Writing DNA gate before creator onboarding',
      },
      {
        id: 'oa-3',
        decision: 'Onboarding friction experience pivot',
        category: 'PRODUCT',
        alignmentScore: 96,
        reasoning: 'Experience before scale · reader trust is the product',
      },
      {
        id: 'oa-4',
        decision: 'International expansion exploration',
        category: 'EXPANSION',
        alignmentScore: 72,
        reasoning: 'Stat-forward voice may not translate without local editorial adaptation',
        potentialConflict: 'Speed to market vs. voice integrity',
        recommendedAdjustment: 'Pilot one market · preserve Writing Bible standards',
      },
    ],
    executiveAlignment: [
      { id: 'ea-1', executive: 'Chief of Staff', alignmentQuestion: 'Does this recommendation support the founder\'s promise?', currentAssessment: 'GTM forum decision flagged for promise review · aligned with relationship-first growth', status: 'aligned' },
      { id: 'ea-2', executive: 'Brand Architect', alignmentQuestion: 'Does this identity express the founder\'s promise?', currentAssessment: 'Stat-forward identity locked · editorial form expresses promise', status: 'aligned' },
      { id: 'ea-3', executive: 'Experience Architect', alignmentQuestion: 'Does this experience fulfill the founder\'s promise?', currentAssessment: 'Onboarding pivot honors trust-before-scale · review in progress', status: 'review' },
      { id: 'ea-4', executive: 'Digital Architect', alignmentQuestion: 'Does this ecosystem reflect the founder\'s promise?', currentAssessment: 'Editorial mode selected · immersive not hype-driven', status: 'aligned' },
      { id: 'ea-5', executive: 'Growth Architect', alignmentQuestion: 'Does this growth strategy honor the founder\'s promise?', currentAssessment: '100K initiative relationship-driven · aligned', status: 'aligned' },
    ],
    reflectionMoments: [
      { id: 'rm-1', trigger: 'COMPANY ANNIVERSARY · ONE YEAR', invitation: 'Gently revisit your promise · what still holds true?', status: 'pending' },
      { id: 'rm-2', trigger: '12K READERS MILESTONE', invitation: 'Major milestone · reflect on who you became this year', status: 'completed' },
      { id: 'rm-3', trigger: 'ONBOARDING FRICTION SETBACK', invitation: 'Major lesson · does your promise need refinement?', status: 'completed' },
    ],
    promiseArchive: [
      { id: 'pa-1', type: 'version', title: 'Original promise v1', date: '2025-11', note: 'Day one commitment · preserved forever' },
      { id: 'pa-2', type: 'version', title: 'Promise v2 · relationship addition', date: '2026-06', note: 'Living evolution · 12K readers influence' },
      { id: 'pa-3', type: 'reflection', title: 'Anniversary reflection draft', date: '2026-06', note: 'Who I was vs. who I am becoming' },
      { id: 'pa-4', type: 'milestone', title: 'First customer validation', date: '2026-01', note: 'Promise tested · trust before scale confirmed' },
      { id: 'pa-5', type: 'milestone', title: 'Writing Bible institutionalized', date: '2026-02', note: 'Voice commitment became institutional' },
      { id: 'pa-6', type: 'recording', title: 'Original promise audio (planned)', date: '2025-11', note: 'Future format · voice preservation' },
    ],
    legacyInheritance: [
      { id: 'li-1', recipient: 'Future leadership', subject: 'Before you lead · read this promise', excerpt: 'You inherit an organization with a soul. The promise is not policy — it is perspective...', privacy: 'organization' },
      { id: 'li-2', recipient: 'Future employees', subject: 'Why we exist beyond the product', excerpt: 'We build for readers who think. That is not marketing. That is who we are...', privacy: 'organization' },
      { id: 'li-3', recipient: 'Future customers', subject: 'Our commitment to you', excerpt: 'We will never sacrifice depth for clicks. You deserve intelligence, not hype...', privacy: 'public' },
      { id: 'li-4', recipient: 'Future family', subject: 'What I built and why', excerpt: 'This took years of craft before traction. I built it because...', privacy: 'family' },
      { id: 'li-5', recipient: 'Future founders', subject: 'What I wish I knew on day one', excerpt: 'Trust compounds. Document while fresh. Honor first believers forever...', privacy: 'organization' },
    ],
    campusInstallation: [
      { id: 'ci-1', location: 'Founder Walk entrance', description: 'Architectural installation · not a sign · a place', experience: 'Quiet moment before the marble pathway · pause · remember why you started' },
      { id: 'ci-2', location: 'Remembrance Garden threshold', description: 'Promise inscribed in stone beside the oak', experience: 'Gratitude and conviction meet · honor those who made the promise possible' },
      { id: 'ci-3', location: 'Living Headquarters lobby', description: 'Morning arrival · promise visible before briefing', experience: 'Every day begins with the north star · not metrics first' },
    ],
    recommendedNextSteps: [
      'Complete reflective question exploration · who inspired you',
      'Review GTM forum decision alignment score before launch',
      'Accept anniversary reflection invitation · revisit v1 vs v2',
      'Record original promise audio for archive',
    ],
    futureOpportunities: [
      'Video dictation of promise revisions',
      'Handwritten scan preservation',
      'Automatic alignment scoring on all CoS recommendations',
      'Future generation guided promise tour at campus entrance',
    ],
  };
}

export function bootstrapFoundersPromisePlatform(): void {
  bootstrapFoundersPromiseStore(buildFoundersPromiseSeed());
}
