/**
 * Studio Intelligence — AI Media workspace demo seeds & bootstrap.
 */

import { AI_MEDIA_WORKSPACE_ID } from '../../../studio-os-core/ai-media-network/constants';
import { buildConfidenceBreakdown } from '../../../studio-os-core/studio-intelligence/confidenceEngine';
import {
  bootstrapStudioIntelligenceStore,
  mergeStudioIntelligencePatch,
  readStudioIntelligenceStore,
  refreshIntelligenceDashboard,
} from '../../../studio-os-core/studio-intelligence/store';
import type { StudioIntelligenceStore } from '../../../studio-os-core/studio-intelligence/types';

const WS = AI_MEDIA_WORKSPACE_ID;
const now = '2026-07-04T20:00:00.000Z';

export function buildStudioIntelligenceStorePatch(): Partial<StudioIntelligenceStore> {
  const businessHealth = {
    workspaceId: WS,
    overall: 78,
    trend: 'up' as const,
    categoryScores: {
      financial: 72,
      growth: 84,
      operations: 76,
      automation: 81,
      'customer-satisfaction': 88,
      'brand-strength': 85,
      marketplace: 70,
      'team-health': 74,
      'risk-exposure': 68,
      'knowledge-maturity': 82,
    },
    priorityImprovements: [
      'Diversify sponsorship revenue — 62% concentration in top 2 sponsors',
      'Accelerate Labs experiment cadence on underperforming Money Monday episodes',
      'Close pending LearnFlow partnership — high compatibility score 91%',
    ],
    updatedAt: now,
  };

  const opportunities = [
    {
      id: 'opp-sponsor-fintech',
      workspaceId: WS,
      title: 'Fintech sponsorship — LearnFlow EdTech audience overlap',
      category: 'sponsorship' as const,
      why: 'Audience Brain shows 34% overlap with finance-education demographic; Growth Network flagged LearnFlow as warm lead.',
      expectedImpact: '+$18K/mo sponsorship · 12% audience expansion',
      confidence: 82,
      supportingEvidence: ['Audience overlap report Q2', 'LearnFlow inbound inquiry', 'Money Monday CPM +22% vs network avg'],
      knowledgeGraphNodeIds: ['node-growth-network', 'node-audience-brain', 'node-deal-pipeline'],
      createdAt: now,
    },
    {
      id: 'opp-partnership-pulse',
      workspaceId: WS,
      title: 'Pulse Agency co-production — Tech Tuesday expansion',
      category: 'partnership' as const,
      why: 'Marketplace compatibility 89% — agency has SaaS client roster matching Tech Tuesday positioning.',
      expectedImpact: '3 co-branded episodes · shared production costs · new B2B audience',
      confidence: 76,
      supportingEvidence: ['Marketplace match score 89%', 'Tech Tuesday engagement +31% MoM', 'Pulse portfolio review'],
      knowledgeGraphNodeIds: ['node-marketplace', 'node-programming-network'],
      createdAt: now,
    },
    {
      id: 'opp-campaign-expand',
      workspaceId: WS,
      title: 'Expand Finance Myth-Busting campaign — top performer',
      category: 'campaign-expansion' as const,
      why: 'Campaign completion rate 78% vs network avg 52%; Labs experiment EXP-042 validated hook format.',
      expectedImpact: '+40% episode views · newsletter conversion +15%',
      confidence: 88,
      supportingEvidence: ['Labs EXP-042 results', 'Campaign analytics 90d', 'Writing Bible hook library match'],
      knowledgeGraphNodeIds: ['node-studio-os-labs', 'node-experiment-engine', 'node-eco-writing-bible'],
      createdAt: now,
    },
  ];

  const risks = [
    {
      id: 'risk-revenue-concentration',
      workspaceId: WS,
      title: 'Sponsorship revenue concentration — 62% from 2 sponsors',
      category: 'revenue-concentration' as const,
      severity: 'high' as const,
      confidence: 91,
      recommendedAction: 'Activate Growth Network pipeline — target 3 mid-tier sponsors in finance vertical within 60 days',
      supportingEvidence: ['Revenue Center breakdown', 'BME wallet analytics', 'Contract renewal dates Q3'],
      createdAt: now,
    },
    {
      id: 'risk-engagement-decline',
      workspaceId: WS,
      title: 'Wellness Wednesday engagement down 18% over 6 weeks',
      category: 'declining-engagement' as const,
      severity: 'medium' as const,
      confidence: 84,
      recommendedAction: 'Run Labs A/B on host format; review Talent Network for guest host alternatives',
      supportingEvidence: ['Audience Brain trend line', 'Episode completion rates', 'Competitive benchmark'],
      createdAt: now,
    },
    {
      id: 'risk-cash-flow',
      workspaceId: WS,
      title: 'Q3 production spend ahead of sponsorship close rate',
      category: 'cash-flow' as const,
      severity: 'medium' as const,
      confidence: 72,
      recommendedAction: 'Defer 2 non-priority episodes; accelerate Deal Center follow-ups on 4 warm leads',
      supportingEvidence: ['BME usage metrics', 'Deal pipeline stages', 'Production calendar'],
      createdAt: now,
    },
  ];

  const recommendations = [
    {
      id: 'rec-next-campaign',
      workspaceId: WS,
      recommendType: 'campaign' as const,
      title: 'Launch Q3 Finance Myth-Busting mini-series (6 episodes)',
      why: 'Historical evidence: Finance content outperforms network avg by 34%; Writing Bible hooks validated in Labs.',
      historicalEvidence: ['Money Monday 90d performance', 'Labs EXP-042', 'Newsletter open rate +22% on finance topics'],
      confidence: 85,
      relatedExperiments: ['EXP-042', 'EXP-038', 'EXP-031'],
      similarOutcomes: ['Q1 Finance series +41% subs', 'Myth-bust pilot +28% completion'],
      potentialRisks: ['Audience fatigue if over-indexed on finance', 'Production capacity Q3'],
      alternatives: ['Extend Tech Tuesday instead', 'Cross-promote with LearnFlow co-brand'],
      knowledgeGraphNodeIds: ['node-memory-bible', 'node-studio-os-labs', 'node-eco-writing-bible'],
      createdAt: now,
    },
    {
      id: 'rec-next-hire',
      workspaceId: WS,
      recommendType: 'hire' as const,
      title: 'Part-time sponsorship coordinator — Growth Network signal',
      why: 'Deal pipeline has 7 qualified leads; founder response time avg 4.2 days vs marketplace benchmark 1.5 days.',
      historicalEvidence: ['Marketplace trust metrics', 'Deal Center velocity', 'Revenue concentration risk'],
      confidence: 71,
      relatedExperiments: [],
      similarOutcomes: ['Similar networks saw +35% close rate with dedicated BD role'],
      potentialRisks: ['Fixed cost before revenue closes', 'Onboarding time'],
      alternatives: ['Pulse Agency retainer for BD', 'Automate initial outreach via Growth Network'],
      knowledgeGraphNodeIds: ['node-growth-network', 'node-deal-pipeline', 'node-marketplace'],
      createdAt: now,
    },
    {
      id: 'rec-next-automation',
      workspaceId: WS,
      recommendType: 'automation' as const,
      title: 'Publish → Labs pipeline for every episode (ecosystem asset)',
      why: 'Ecosystem asset "Publish → Labs Experiment Pipeline" installed; only 60% of episodes triggering experiments.',
      historicalEvidence: ['Ecosystem install logs', 'Labs experiment coverage', 'Distribution Network publish events'],
      confidence: 79,
      relatedExperiments: ['EXP-auto-labs-v1'],
      similarOutcomes: ['Full automation networks report 2.1x learning velocity'],
      potentialRisks: ['Experiment noise if quality gate skipped'],
      alternatives: ['Manual experiment selection per show', 'Weekly batch only'],
      knowledgeGraphNodeIds: ['node-studio-os-labs', 'node-installation-engine', 'node-eco-asset-auto-labs'],
      createdAt: now,
    },
  ];

  const confidenceBreakdowns = [
    ...opportunities.map(buildConfidenceBreakdown),
    ...recommendations.map(buildConfidenceBreakdown),
  ];

  return {
    briefings: [
      {
        id: 'brief-morning',
        workspaceId: WS,
        cadence: 'morning',
        generatedAt: now,
        topOpportunities: [
          'LearnFlow sponsorship — 82% confidence · $18K/mo potential',
          'Expand Finance Myth-Busting campaign — 88% confidence',
        ],
        topRisks: [
          'Revenue concentration 62% — HIGH severity',
          'Wellness Wednesday engagement -18% — MEDIUM',
        ],
        performanceChanges: [
          'Money Monday views +12% WoW',
          'Newsletter subscribers +340 this week',
          'Marketplace deal velocity +2 closed',
        ],
        recommendedActions: [
          'Follow up LearnFlow within 48h',
          'Schedule Labs review for Wellness Wednesday',
          'Enable full Publish→Labs automation',
        ],
        deadlines: ['Pulse Agency proposal due Jul 8', 'Q3 sponsor renewals Jul 15', 'Certification renewal Pulse Jul 1'],
        marketplaceOpportunities: ['Jordan Reyes developer — ecosystem integration', 'ShipRight fulfillment — merch pilot'],
        revenueInsights: ['MRR trajectory +8% MoM', 'Royalty from Writing Bible +$420/mo', 'Sponsor pipeline $47K weighted'],
        experimentResults: ['EXP-042 hook format WIN — adopt network-wide', 'EXP-039 thumbnail test inconclusive'],
        executiveAiSummaries: [
          'CMO: Prioritize finance vertical sponsorships; defer wellness repositioning 2 weeks',
          'CCO: Approve Finance Myth-Busting visual refresh from Creative DNA v2.1',
        ],
        growthRecommendations: ['Target 3 mid-tier sponsors', 'Co-produce with Pulse on Tech Tuesday', 'Cross-sell Writing Bible to 2 marketplace creators'],
      },
      {
        id: 'brief-weekly',
        workspaceId: WS,
        cadence: 'weekly',
        generatedAt: '2026-06-28T08:00:00.000Z',
        topOpportunities: ['Pulse Agency partnership', 'Affiliate program for finance tools'],
        topRisks: ['Cash flow Q3', 'Team capacity on production'],
        performanceChanges: ['Network avg completion +5%', 'Labs experiments +12 completed'],
        recommendedActions: ['Weekly executive synthesis review', 'Update Memory Bible with Q2 learnings'],
        deadlines: ['Board-style quarterly prep Jul 1'],
        marketplaceOpportunities: ['Casey Lee editor — retainer renewal'],
        revenueInsights: ['ARR run-rate $284K', 'Platform fees optimized -2%'],
        experimentResults: ['Q2 Labs summary — 18 wins, 6 retired'],
        executiveAiSummaries: ['Unified: Growth strong in finance; diversify sponsors; automate Labs pipeline'],
        growthRecommendations: ['Enter edtech adjacency via LearnFlow', 'License Media Blueprint to 2 pilots'],
      },
    ],
    workspaceSignals: [
      { id: 'sig-traffic', workspaceId: WS, category: 'traffic', metric: 'Unique viewers', value: '124K/mo', trend: 'up', trendPct: 12, insight: 'Finance content driving majority of new traffic', updatedAt: now },
      { id: 'sig-conversion', workspaceId: WS, category: 'conversion', metric: 'Newsletter signup rate', value: '4.2%', trend: 'up', trendPct: 8, insight: 'Myth-bust CTAs outperforming generic', updatedAt: now },
      { id: 'sig-engagement', workspaceId: WS, category: 'engagement', metric: 'Avg completion', value: '58%', trend: 'flat', trendPct: 1, insight: 'Wellness Wednesday dragging network average', updatedAt: now },
      { id: 'sig-revenue', workspaceId: WS, category: 'revenue', metric: 'Sponsorship MRR', value: '$23.7K', trend: 'up', trendPct: 6, insight: 'Concentration risk — top 2 sponsors', updatedAt: now },
      { id: 'sig-marketplace', workspaceId: WS, category: 'marketplace', metric: 'Active deals', value: '4', trend: 'up', trendPct: 33, insight: 'Deal Center velocity improving', updatedAt: now },
      { id: 'sig-automation', workspaceId: WS, category: 'automation', metric: 'Labs trigger rate', value: '60%', trend: 'down', trendPct: -5, insight: 'Publish→Labs pipeline not fully enabled', updatedAt: now },
    ],
    opportunities,
    risks,
    executiveSynthesis: [
      {
        id: 'synth-unified',
        workspaceId: WS,
        executiveId: 'exec-unified',
        executiveName: 'Unified Executive Summary',
        role: 'Studio Intelligence Synthesis',
        unifiedSummary: 'Network health strong in finance vertical with growth momentum (+12% traffic, +8% MRR). Primary strategic priority: diversify sponsorship revenue while capitalizing on Finance Myth-Busting performance. Operational gap: Labs automation at 60% — closing this doubles institutional learning velocity. Marketplace pipeline healthy — close LearnFlow and Pulse within 14 days.',
        keyFindings: [
          'CMO + Growth: Finance sponsorship white space $18K/mo',
          'CCO: Creative DNA refresh approved for finance content',
          'CFO signal: Q3 cash timing — defer 2 episodes or close 2 deals',
          'Labs: EXP-042 is network-wide applicable',
        ],
        synthesizedAt: now,
      },
      {
        id: 'synth-cmo',
        workspaceId: WS,
        executiveId: 'exec-cmo-team',
        executiveName: 'CMO · Growth Strategist',
        role: 'Marketing & Partnerships',
        unifiedSummary: 'Synthesized into unified briefing — sponsorship diversification and LearnFlow priority.',
        keyFindings: ['3 mid-tier sponsor targets identified', 'LearnFlow 91% compatibility'],
        synthesizedAt: now,
      },
    ],
    crossWorkspaceInsights: [
      {
        id: 'cross-audience',
        ownerId: 'founder-vxd',
        insightType: 'shared-audience',
        workspaceIds: [WS, 'future-brand'],
        title: 'Finance-education audience overlap with Future Brand pilot',
        recommendation: 'Cross-promote Money Monday clips to Future Brand newsletter — estimated +2.1K subs',
        expectedImpact: 'Audience synergy without new acquisition cost',
        confidence: 74,
      },
      {
        id: 'cross-automation',
        ownerId: 'founder-vxd',
        insightType: 'shared-automation',
        workspaceIds: [WS, 'sandbox'],
        title: 'Publish→Labs automation duplicated in Sandbox — consolidate template',
        recommendation: 'Promote AI Media automation pack to ecosystem; reuse in Sandbox via dependency engine',
        expectedImpact: 'Reduce maintenance · single source of truth',
        confidence: 81,
      },
    ],
    institutionalLearnings: [
      {
        id: 'inst-exp-042',
        workspaceId: WS,
        sourceType: 'experiment',
        title: 'EXP-042 — Myth-bust hook format wins across finance content',
        outcome: 'success',
        learning: 'Question-first hooks ("Is X actually Y?") outperform statement hooks by 28% completion on finance episodes.',
        approvedByFounder: true,
        memoryBibleLinked: true,
        knowledgeGraphNodeId: 'node-studio-intelligence-learning',
        recordedAt: '2026-06-20T00:00:00.000Z',
      },
      {
        id: 'inst-launch-q1',
        workspaceId: WS,
        sourceType: 'launch',
        title: 'Q1 Finance mini-series launch — exceeded subscriber target',
        outcome: 'success',
        learning: '6-episode arcs with consistent visual DNA convert better than one-off episodes for newsletter growth.',
        approvedByFounder: true,
        memoryBibleLinked: true,
        knowledgeGraphNodeId: 'node-studio-intelligence-learning',
        recordedAt: '2026-04-01T00:00:00.000Z',
      },
    ],
    recommendations,
    businessHealth,
    decisionJournal: [
      {
        id: 'dec-journal-labs',
        workspaceId: WS,
        decision: 'Adopt EXP-042 hook format network-wide for finance shows',
        reason: 'Labs validated 28% completion lift; CCO approved Creative DNA alignment',
        expectedOutcome: '+15% avg completion on Money Monday and Finance specials',
        actualOutcome: '+12% after 4 weeks — on track',
        lessonsLearned: 'Roll out to Tech Tuesday after finance validation complete',
        memoryBibleNodeId: 'dec-intelligence-labs-adopt',
        knowledgeGraphNodeId: 'node-studio-intelligence-decision',
        decidedAt: '2026-06-22T00:00:00.000Z',
        reviewedAt: now,
      },
      {
        id: 'dec-journal-learnflow',
        workspaceId: WS,
        decision: 'Pursue LearnFlow co-sponsorship vs exclusive competitor deal',
        reason: 'Audience overlap + brand alignment; competitor offered higher $ but poor fit',
        expectedOutcome: 'Long-term partnership + audience quality over short-term revenue',
        memoryBibleNodeId: 'dec-intelligence-learnflow',
        knowledgeGraphNodeId: 'node-studio-intelligence-decision',
        decidedAt: '2026-07-01T00:00:00.000Z',
      },
    ],
    learningRecords: [
      {
        id: 'learn-exp-pattern',
        workspaceId: WS,
        sourceType: 'experiment',
        title: 'Question-first hooks — durable pattern in finance vertical',
        pattern: 'durable-pattern',
        insight: 'Persists across 3 experiment cycles — not seasonal',
        confidence: 88,
        recordedAt: '2026-06-20T00:00:00.000Z',
      },
      {
        id: 'learn-wellness-trend',
        workspaceId: WS,
        sourceType: 'campaign',
        title: 'Wellness content spike Q1 — temporary trend',
        pattern: 'temporary-trend',
        insight: 'Jan health resolution traffic — reverted by March',
        confidence: 79,
        recordedAt: '2026-03-15T00:00:00.000Z',
      },
    ],
    confidenceBreakdowns,
  };
}

export function bootstrapAiMediaStudioIntelligence(): void {
  bootstrapStudioIntelligenceStore();
  const store = readStudioIntelligenceStore();
  if (store.briefings.length > 0) return;
  mergeStudioIntelligencePatch(buildStudioIntelligenceStorePatch());
  refreshIntelligenceDashboard(WS);
}
