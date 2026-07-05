import { bootstrapExecutiveApprenticeshipStore } from './store';
import type { ExecutiveApprenticeshipStore } from './types';

export function buildExecutiveApprenticeshipSeed(): Partial<ExecutiveApprenticeshipStore> {
  return {
    companyName: 'NDXBOOK',
    activeWorkspaceId: 'ndxbook',
    dashboard: {
      summary:
        'EXECUTIVE APPRENTICESHIP V1.0 — NDXBOOK · 6 executives in calibration · 94% avg alignment · trust earned not assumed.',
      organizationalConfidencePct: 91,
      executivesInApprenticeship: 6,
      averageAlignmentPct: 94,
      averageLearningVelocity: '+2.3% / month',
      softApprovalsActive: 4,
    },
    founderCalibration: [
      { id: 'fc-1', dimension: 'Creative preferences', description: 'Stat-forward editorial · no generic templates · Writing DNA quality gates', signalsCaptured: 847, alignmentPct: 96 },
      { id: 'fc-2', dimension: 'Communication style', description: 'Direct · evidence-based · trust-before-scale language · no vanity metrics', signalsCaptured: 612, alignmentPct: 93 },
      { id: 'fc-3', dimension: 'Approval patterns', description: 'Founder final authority · council synthesis · constitutional governance check', signalsCaptured: 534, alignmentPct: 95 },
      { id: 'fc-4', dimension: 'Decision-making', description: 'Evidence-based · long-term stewardship · relationship over transaction', signalsCaptured: 489, alignmentPct: 94 },
      { id: 'fc-5', dimension: 'Leadership philosophy', description: 'Master craftsman refinement · continuous learning · healthy disagreement', signalsCaptured: 378, alignmentPct: 92 },
      { id: 'fc-6', dimension: 'Risk tolerance', description: 'Conservative on GTM · aggressive on editorial quality · auth debt unacceptable', signalsCaptured: 291, alignmentPct: 91 },
      { id: 'fc-7', dimension: 'Brand standards', description: 'Writing DNA · stat-forward identity · zero engagement bait · trust preserved', signalsCaptured: 723, alignmentPct: 97 },
      { id: 'fc-8', dimension: 'Experience expectations', description: 'Belonging over volume · onboarding friction unacceptable · reader understood', signalsCaptured: 456, alignmentPct: 93 },
      { id: 'fc-9', dimension: 'Technology philosophy', description: 'Build for decades · master craftsman engineering · auth refactor critical', signalsCaptured: 334, alignmentPct: 90 },
      { id: 'fc-10', dimension: 'Growth philosophy', description: 'Relationship-driven · trust gates before GTM · never premature paid acquisition', signalsCaptured: 412, alignmentPct: 95 },
      { id: 'fc-11', dimension: 'Organizational values', description: 'Trust · relationships · wisdom · belonging · editorial integrity', signalsCaptured: 567, alignmentPct: 96 },
      { id: 'fc-12', dimension: 'Long-term vision', description: 'Institutional wisdom preserved · readers trust NDXBOOK for decades', signalsCaptured: 298, alignmentPct: 94 },
    ],
    shadowingObservations: [
      { id: 'so-1', context: 'Creative review', observed: 'Founder rejected generic headline template · chose stat-forward alternative', captured: 'Never sacrifice editorial integrity for engagement metrics', executive: 'Chief Brand Officer' },
      { id: 'so-2', context: 'Executive meeting', observed: 'Founder deferred GTM launch until onboarding score > 85', captured: 'Trust-before-scale is non-negotiable · maturity gates enforced', executive: 'Chief Growth Officer' },
      { id: 'so-3', context: 'Strategy session', observed: 'Founder prioritized auth refactor over feature velocity', captured: 'Technical debt blocking enterprise readiness takes precedence', executive: 'Chief Technology Officer' },
      { id: 'so-4', context: 'Customer conversation', observed: 'Founder asked about reader belonging not conversion rate', captured: 'Relationship quality measured · not vanity funnel metrics', executive: 'Chief Experience Officer' },
      { id: 'so-5', context: 'Campaign review', observed: 'Founder required Writing DNA check before distribution approval', captured: 'Every published piece passes editorial genome validation', executive: 'Chief Digital Officer' },
      { id: 'so-6', context: 'Organizational discussion', observed: 'Founder invoked founder\'s promise before council vote', captured: 'Constitutional alignment precedes expedient decisions', executive: 'Chief of Staff' },
    ],
    learningConversations: [
      { id: 'lc-1', executive: 'Chief Brand Officer', question: 'I noticed you consistently choose stat-forward design directions. Could you explain what you\'re optimizing for?', status: 'answered', insight: 'Reader trust compounds · every visual must earn credibility before scale' },
      { id: 'lc-2', executive: 'Chief Growth Officer', question: 'I\'ve observed you rarely prioritize short-term growth over customer trust. Is that an intentional leadership principle?', status: 'answered', insight: 'Trust gates are constitutional · GTM follows maturity not calendar' },
      { id: 'lc-3', executive: 'Chief Experience Officer', question: 'When you reject onboarding shortcuts, what experience signal are you protecting?', status: 'answered', insight: 'First impression encodes brand promise · friction at Step 3 erodes belonging' },
      { id: 'lc-4', executive: 'Chief Technology Officer', question: 'Why does auth infrastructure outrank visible features in your priority stack?', status: 'answered', insight: 'Enterprise readiness requires foundation · shortcuts create generational debt' },
      { id: 'lc-5', executive: 'Chief Digital Officer', question: 'Recommended: explore how Writing DNA gates differ from typical content approval workflows', status: 'recommended' },
    ],
    calibrationMeasurements: [
      { id: 'cm-1', domain: 'Brand judgment', alignmentScorePct: 97, confidencePct: 94, learningVelocity: '+1.8% / month', observationNeeded: 'International brand adaptation scenarios' },
      { id: 'cm-2', domain: 'Creative judgment', alignmentScorePct: 96, confidencePct: 93, learningVelocity: '+2.1% / month', observationNeeded: 'Creator marketplace quality gate edge cases' },
      { id: 'cm-3', domain: 'Writing', alignmentScorePct: 98, confidencePct: 96, learningVelocity: '+1.5% / month', observationNeeded: 'Long-form editorial vs stat-forward micro-content' },
      { id: 'cm-4', domain: 'Leadership', alignmentScorePct: 92, confidencePct: 88, learningVelocity: '+2.4% / month', observationNeeded: 'Cross-functional council dissent patterns' },
      { id: 'cm-5', domain: 'Customer experience', alignmentScorePct: 93, confidencePct: 91, learningVelocity: '+2.6% / month', observationNeeded: 'Enterprise onboarding persona journeys' },
      { id: 'cm-6', domain: 'Technology', alignmentScorePct: 90, confidencePct: 87, learningVelocity: '+3.1% / month', observationNeeded: 'Auth refactor trade-off decisions' },
      { id: 'cm-7', domain: 'Growth', alignmentScorePct: 95, confidencePct: 92, learningVelocity: '+2.0% / month', observationNeeded: 'Paid acquisition temptation scenarios' },
      { id: 'cm-8', domain: 'Organizational philosophy', alignmentScorePct: 96, confidencePct: 94, learningVelocity: '+1.9% / month', observationNeeded: 'Holding company portfolio governance' },
      { id: 'cm-9', domain: 'Founder\'s promise', alignmentScorePct: 97, confidencePct: 95, learningVelocity: '+1.4% / month', observationNeeded: 'Legacy campus stewardship transitions' },
    ],
    practiceReviews: [
      { id: 'pr-1', type: 'Design review', executive: 'Chief Brand Officer', task: 'Evaluate homepage hero variant A vs B', founderChoice: 'Variant B — stat-forward headline · no engagement bait', executiveRecommendation: 'Variant B — aligns with Writing DNA · 97% match', matchPct: 97 },
      { id: 'pr-2', type: 'Campaign evaluation', executive: 'Chief Digital Officer', task: 'Approve NDXBOOK newsletter subject line batch', founderChoice: 'Reject 3 of 5 · require stat-forward rewrite', executiveRecommendation: 'Reject 3 of 5 · editorial integrity gates · 94% match', matchPct: 94 },
      { id: 'pr-3', type: 'Feature prioritization', executive: 'Chief Technology Officer', task: 'Rank Q3 engineering priorities', founderChoice: 'Auth refactor #1 · onboarding API #2 · defer cosmetic', executiveRecommendation: 'Auth refactor #1 · enterprise readiness blocker · 91% match', matchPct: 91 },
      { id: 'pr-4', type: 'Executive summary', executive: 'Chief of Staff', task: 'Summarize council recommendation on GTM timing', founderChoice: 'Defer until onboarding gate cleared · trust-before-scale', executiveRecommendation: 'Defer GTM · maturity gate not met · 96% match', matchPct: 96 },
      { id: 'pr-5', type: 'Strategy recommendation', executive: 'Chief Growth Officer', task: 'Recommend spotlight program scale approach', founderChoice: 'Pilot expansion · relationship metrics only · no paid boost', executiveRecommendation: 'Organic spotlight scale · advocacy +15% pilot · 95% match', matchPct: 95 },
    ],
    trustProgressions: [
      { id: 'tp-1', executive: 'Chief Brand Officer', currentLevel: 'soft-approval', alignmentPct: 97, reviewsCompleted: 512, nextLevelRequirement: '500+ creative reviews at 95%+ alignment · council endorsement' },
      { id: 'tp-2', executive: 'Chief Experience Officer', currentLevel: 'co-review', alignmentPct: 93, reviewsCompleted: 287, nextLevelRequirement: 'Predict CX decisions at 90%+ for 100 consecutive reviews' },
      { id: 'tp-3', executive: 'Chief Digital Officer', currentLevel: 'co-review', alignmentPct: 92, reviewsCompleted: 234, nextLevelRequirement: 'Campaign approval alignment 92%+ sustained 90 days' },
      { id: 'tp-4', executive: 'Chief Technology Officer', currentLevel: 'recommend', alignmentPct: 90, reviewsCompleted: 156, nextLevelRequirement: 'Auth refactor decisions aligned · 85%+ on architecture trade-offs' },
      { id: 'tp-5', executive: 'Chief Growth Officer', currentLevel: 'soft-approval', alignmentPct: 95, reviewsCompleted: 378, nextLevelRequirement: 'Trust gate enforcement record · zero premature GTM recommendations' },
      { id: 'tp-6', executive: 'Chief of Staff', currentLevel: 'trusted-approval', alignmentPct: 96, reviewsCompleted: 891, nextLevelRequirement: 'Organizational stewardship · portfolio governance readiness' },
    ],
    softApprovalExamples: [
      { id: 'sa-1', executive: 'Chief Brand Officer', statement: 'I believe this headline aligns with your historical preferences with 96% confidence.', confidencePct: 96, reasoning: 'Stat-forward structure · Writing DNA vocabulary · no engagement bait pattern', historicalComparisons: '847 creative reviews · 94% prior alignment on similar decisions', evidence: 'Matches approved campaigns from Q1 editorial sprint · council pre-validated tone' },
      { id: 'sa-2', executive: 'Chief Growth Officer', statement: 'I recommend deferring paid acquisition — this aligns with trust-before-scale with 94% confidence.', confidencePct: 94, reasoning: 'Onboarding gate score 82% · maturity prerequisite not met', historicalComparisons: 'Founder rejected 3 GTM proposals at similar maturity scores', evidence: 'OGS constitutional safeguard · OMM SCALE stage requirements' },
      { id: 'sa-3', executive: 'Chief of Staff', statement: 'Council synthesis recommends auth refactor priority — 97% alignment with founder decision patterns.', confidencePct: 97, reasoning: 'Enterprise readiness blocker · technical debt precedes features', historicalComparisons: 'Founder chose infrastructure 8 of last 10 priority conflicts', evidence: 'CTO assessment · OI maturity signal · first executive briefing priority' },
    ],
    chiefOfStaffMentorship: [
      { id: 'cm-1', recommendation: 'Additional shadowing on international brand adaptation', category: 'Observation', targetExecutive: 'Chief Brand Officer', rationale: 'Edge cases not yet observed · alignment strong but narrow context' },
      { id: 'cm-2', recommendation: 'Practice review: enterprise onboarding persona journeys', category: 'Practice', targetExecutive: 'Chief Experience Officer', rationale: 'CX alignment 93% · enterprise segment under-observed' },
      { id: 'cm-3', recommendation: 'Cross-functional learning: OGS constitutional decision walkthrough', category: 'Cross-functional', targetExecutive: 'All C-suite', rationale: 'Governance context deepens calibration across disciplines' },
      { id: 'cm-4', recommendation: 'Leadership discussion: council dissent patterns', category: 'Leadership', targetExecutive: 'Chief of Staff', rationale: 'Stewardship level requires healthy disagreement mastery' },
      { id: 'cm-5', recommendation: 'Knowledge review: Writing DNA evolution archive', category: 'Knowledge', targetExecutive: 'Chief Digital Officer', rationale: 'Editorial genome changes inform campaign calibration' },
      { id: 'cm-6', recommendation: 'Executive mentorship pairing: CBO mentors CDO on brand-campaign alignment', category: 'Mentorship', targetExecutive: 'Chief Digital Officer', rationale: 'Accelerate creative judgment through peer apprenticeship' },
    ],
    learningLibrary: [
      { id: 'll-1', category: 'Design review', title: 'Homepage hero rejection — engagement bait vs stat-forward', preservedFor: 'Future CBO calibration · editorial integrity patterns' },
      { id: 'll-2', category: 'Writing example', title: 'Approved NDXBOOK editorial — trust-before-scale framing', preservedFor: 'Writing DNA reference · creative judgment training' },
      { id: 'll-3', category: 'Approved campaign', title: 'Spotlight program pilot — relationship metrics only', preservedFor: 'CGO growth philosophy · trust gate enforcement' },
      { id: 'll-4', category: 'Rejected idea', title: 'Premature paid acquisition proposal — maturity gate blocked', preservedFor: 'Growth calibration · founder risk tolerance' },
      { id: 'll-5', category: 'Executive discussion', title: 'Council GTM timing dissent — constitutional synthesis', preservedFor: 'Leadership philosophy · decision-making patterns' },
      { id: 'll-6', category: 'Leadership reflection', title: 'Auth refactor priority over feature velocity — founder rationale', preservedFor: 'CTO technology philosophy · enterprise readiness' },
      { id: 'll-7', category: 'Organizational lesson', title: 'Onboarding Step 3 friction — belonging signal protected', preservedFor: 'CEO CX expectations · customer trust gates' },
      { id: 'll-8', category: 'Major decision', title: 'Trust-before-scale GTM deferral — founder promise invoked', preservedFor: 'Institutional wisdom · future executive inheritance' },
    ],
    executiveGraduations: [
      { id: 'eg-1', executive: 'Chief Brand Officer', recommendation: 'Expand to trusted approval on creative reviews — 98% alignment across 512 reviews', alignmentPct: 98, evidenceBasis: '500+ creative reviews · 97% sustained alignment · soft approval record clean', founderAction: 'pending' },
      { id: 'eg-2', executive: 'Chief Growth Officer', recommendation: 'Maintain soft approval · demonstrate trust gate enforcement for 90 more days', alignmentPct: 95, evidenceBasis: 'Zero premature GTM recommendations · maturity gate respected consistently', founderAction: 'maintain' },
      { id: 'eg-3', executive: 'Chief Experience Officer', recommendation: 'Advance to soft approval after 50 more co-review matches at 90%+', alignmentPct: 93, evidenceBasis: 'CX decision prediction improving · onboarding sprint observation active', founderAction: 'pending' },
      { id: 'eg-4', executive: 'Chief of Staff', recommendation: 'Recommend organizational stewardship level — 96% alignment across 891 reviews', alignmentPct: 96, evidenceBasis: 'Trusted approval sustained · council coordination exemplary · founder visibility preserved', founderAction: 'approve' },
    ],
    founderDashboardHighlights: {
      executiveStrengths: [
        'Chief Brand Officer — 97% creative alignment · Writing DNA mastery',
        'Chief of Staff — 96% decision prediction · trusted approval sustained',
        'Chief Growth Officer — trust gate enforcement · zero premature GTM',
        'Institutional learning compounding · +2.3% avg learning velocity',
      ],
      recommendedAuthorityChanges: [
        'Approve CBO trusted approval expansion — 512 reviews · 98% alignment',
        'Approve CoS organizational stewardship — council coordination ready',
        'Maintain CGO soft approval — 90-day trust gate track record building',
        'Extend CTO observation on architecture trade-offs before co-review advance',
      ],
      recentCalibrationImprovements: [
        'CEO CX alignment +2.6% this month — onboarding sprint shadowing',
        'CTO technology philosophy +3.1% — auth refactor decision observation',
        'CDO campaign alignment +1.9% — Writing DNA library review completed',
        'Organizational confidence 91% — up from 87% post-arrival',
      ],
    },
    futureOpportunities: [
      'Continuous calibration as founder leadership style evolves over decades',
      'Cross-company apprenticeship patterns at holding company maturity stage',
      'Executive learning library inheritance via Organizational Inheritance framework',
    ],
  };
}

export function bootstrapExecutiveApprenticeshipPlatform(): void {
  bootstrapExecutiveApprenticeshipStore(buildExecutiveApprenticeshipSeed());
}
