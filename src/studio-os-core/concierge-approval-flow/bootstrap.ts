import { APPROVAL_PHILOSOPHY } from './constants';
import { bootstrapConciergeApprovalFlowStore, buildReviewStep } from './store';
import type { ConciergeApprovalFlowStore } from './types';

export function buildConciergeApprovalFlowSeed(): Partial<ConciergeApprovalFlowStore> {
  const laceReviews = [
    buildReviewStep('brand-concierge', 'complete', {
      verdict: 'approved-with-suggestions',
      confidencePct: 92,
      reasoning:
        'Writing DNA preserved · hook refined without losing trust. Thumbnail champagne accent aligns with NDXBOOK Lace Mastery identity.',
      historicalComparison: 'Stronger brand memory vs prior lace cuts (+8% identity recall in internal benchmarks).',
      completedAt: '2026-07-05T15:10:00.000Z',
    }),
    buildReviewStep('experience-concierge', 'complete', {
      verdict: 'approved',
      confidencePct: 94,
      reasoning:
        'Trust-first pacing · step 2 slower cadence approved for beginners. Viewer journey calm · confident · never rushed.',
      historicalComparison: 'Viewer completion predicted +14% vs Version A baseline.',
      completedAt: '2026-07-05T15:22:00.000Z',
    }),
    buildReviewStep('digital-concierge', 'complete', {
      verdict: 'approved-with-suggestions',
      confidencePct: 89,
      reasoning:
        'Metadata complete · cross-platform captions synced. Suggest shorter Reels description for TikTok character limits.',
      historicalComparison: 'Platform readiness matches top-performing educational cuts in catalog.',
      completedAt: '2026-07-05T15:35:00.000Z',
    }),
    buildReviewStep('technology-concierge', 'complete', {
      verdict: 'approved',
      confidencePct: 96,
      reasoning: 'Render quality 96% · codec clean · captions synced · no frame drops · export profiles validated.',
      historicalComparison: 'Technical integrity exceeds last three lace productions.',
      completedAt: '2026-07-05T15:48:00.000Z',
    }),
    buildReviewStep('growth-concierge', 'complete', {
      verdict: 'approved-with-suggestions',
      confidencePct: 91,
      reasoning:
        'Predicted +14% retention vs Version A · strong evergreen distribution. Monitor bold hook experiment separately.',
      historicalComparison: 'Engagement forecast in top quartile for Lace Mastery series.',
      completedAt: '2026-07-05T16:00:00.000Z',
    }),
    buildReviewStep('chief-concierge', 'complete', {
      verdict: 'approved',
      confidencePct: 93,
      reasoning:
        'Organizational alignment confirmed · founder promise intact · final readiness achieved. Unified brief prepared for founder.',
      historicalComparison: 'Executive review cycle completed faster than Q2 average editorial board.',
      completedAt: '2026-07-05T16:12:00.000Z',
    }),
    buildReviewStep('founder', 'in-review'),
  ];

  const slayReviews = [
    buildReviewStep('brand-concierge', 'complete', {
      verdict: 'approved',
      confidencePct: 90,
      reasoning: 'Weekly ritual tone preserved · marble desk aesthetic · gold type consistent with Slay Report brand.',
      historicalComparison: 'Brand consistency matches Week 11 broadcast cut.',
      completedAt: '2026-07-05T14:00:00.000Z',
    }),
    buildReviewStep('experience-concierge', 'complete', {
      verdict: 'approved-with-suggestions',
      confidencePct: 87,
      reasoning: 'Community proof first · reader spotlight pacing strong. Consider softer CTA on membership mention.',
      historicalComparison: 'Emotional arc aligns with weekly ritual expectations.',
      completedAt: '2026-07-05T14:15:00.000Z',
    }),
    buildReviewStep('digital-concierge', 'complete', {
      verdict: 'approved',
      confidencePct: 88,
      reasoning: 'Metadata · chapter markers · newsletter embed ready. Short-form vertical cut metadata prepared.',
      historicalComparison: 'Cross-platform package matches Growth Concierge distribution plan.',
      completedAt: '2026-07-05T14:30:00.000Z',
    }),
    buildReviewStep('technology-concierge', 'complete', {
      verdict: 'approved',
      confidencePct: 95,
      reasoning: 'Broadcast render 95% · Reels cut codec optimized · no sync issues.',
      historicalComparison: 'Render quality on par with highest-rated Slay Report exports.',
      completedAt: '2026-07-05T14:45:00.000Z',
    }),
    buildReviewStep('growth-concierge', 'in-review'),
    buildReviewStep('chief-concierge', 'pending'),
    buildReviewStep('founder', 'pending'),
  ];

  const membershipReviews = [
    buildReviewStep('brand-concierge', 'in-review'),
    buildReviewStep('experience-concierge', 'pending'),
    buildReviewStep('digital-concierge', 'pending'),
    buildReviewStep('technology-concierge', 'pending'),
    buildReviewStep('growth-concierge', 'pending'),
    buildReviewStep('chief-concierge', 'pending'),
    buildReviewStep('founder', 'pending'),
  ];

  return {
    companyName: 'NDXBOOK',
    selectedItemId: 'caf-lace-mastery',
    futureTrustVision:
      'Routine content may auto-approve via customizable trust thresholds. Major campaigns, launches, brand announcements, and high-impact organizational communications always require founder approval unless explicitly delegated.',
    dashboard: {
      summary:
        'CONCIERGE APPROVAL FLOW V1.0 · NDXBOOK · editorial board — concierges review first, founder reviews last.',
      inConciergeReview: 2,
      awaitingFounder: 1,
      approvedToday: 3,
      avgConfidencePct: 91,
    },
    philosophy: [...APPROVAL_PHILOSOPHY],
    items: [
      {
        id: 'caf-lace-mastery',
        title: 'CUTTING YOUR LACE · LACE MASTERY',
        pageRoute: '/ndxbook/lace-mastery/cutting-your-lace',
        contentType: 'EDUCATIONAL VIDEO · EVERGREEN',
        submittedAt: '2026-07-05T14:00:00.000Z',
        requiresFounderAlways: false,
        trustAutoEligible: true,
        currentStepIndex: 6,
        reviews: laceReviews,
        founderBrief: {
          chiefSummary:
            'Chief Concierge unified brief — six discipline reviews consolidated. Version B is the recommended publication cut. Founder receives finished organizational judgment.',
          overallReadiness: 'READY FOR FOUNDER — all concierges complete. Optional digital metadata polish noted.',
          recommendedChanges: [
            'DIGITAL CONCIERGE: Shorten Reels description for TikTok character limits.',
            'GROWTH CONCIERGE: Monitor bold hook experiment separately from evergreen cut.',
          ],
          confidencePct: 93,
          predictedOutcome: 'STRONG — high confidence evergreen performance with brand-safe distribution.',
          remainingConcerns: ['No outstanding organizational blockers.'],
          preparedAt: '2026-07-05T16:12:00.000Z',
        },
      },
      {
        id: 'caf-slay-report',
        title: 'SLAY REPORT · WEEK 12',
        pageRoute: '/ndxbook/slay-report/week-12',
        contentType: 'WEEKLY EDITORIAL · BROADCAST',
        submittedAt: '2026-07-05T12:30:00.000Z',
        requiresFounderAlways: false,
        trustAutoEligible: true,
        currentStepIndex: 4,
        reviews: slayReviews,
      },
      {
        id: 'caf-membership-guide',
        title: 'MEMBERSHIP VALUE GUIDE · PREMIUM PATH',
        pageRoute: '/ndxbook/membership/value-guide',
        contentType: 'BRAND ANNOUNCEMENT · HIGH IMPACT',
        submittedAt: '2026-07-05T10:00:00.000Z',
        requiresFounderAlways: true,
        trustAutoEligible: false,
        currentStepIndex: 0,
        reviews: membershipReviews,
      },
    ],
  };
}

export function bootstrapConciergeApprovalFlowPlatform(): void {
  bootstrapConciergeApprovalFlowStore(buildConciergeApprovalFlowSeed());
}
