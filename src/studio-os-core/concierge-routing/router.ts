import {
  CONCIERGE_DISPLAY_NAMES,
  INTENT_CONCIERGE_MAP,
  ROUTING_CONFIDENCE_THRESHOLD,
} from './constants';
import type {
  ConciergeRoutingId,
  FounderCommandRoute,
  OrganizationInference,
  RouteCommandContext,
  RoutingImpactPreview,
  RoutingIntent,
  RoutingPreference,
  RoutingRiskLevel,
  RoutingUrgency,
  TimelineOrganizationId,
} from './types';

type PatternRule = {
  pattern: RegExp;
  intent: RoutingIntent;
  layer?: string;
  urgency?: RoutingUrgency;
  action: (match: RegExpMatchArray, text: string) => string;
  supportingOverride?: ConciergeRoutingId[];
  requiresApproval?: boolean;
  riskLevel?: RoutingRiskLevel;
  confidence?: number;
  wouldCreateEvents?: boolean;
  clarificationIfUncertain?: string;
};

const ORG_PATTERNS: Array<{ pattern: RegExp; org: TimelineOrganizationId }> = [
  { pattern: /\bndxbook\b|\blace mastery\b|\bslay report\b|\bfirst ndxbook\b/i, org: 'ndxbook' },
  { pattern: /\bnoir\b|\bfrontal slayer\b|\bfrontal\b/i, org: 'frontal-slayer' },
  { pattern: /\bvxd\b/i, org: 'vxd-inc' },
  { pattern: /\ball in one\b|\benterprise\b/i, org: 'all-in-one-enterprise' },
];

const WORKSPACE_TO_ORG: Record<string, TimelineOrganizationId> = {
  'frontal-slayer': 'frontal-slayer',
  'ai-media': 'ndxbook',
  'vxd-inc': 'vxd-inc',
  'all-in-one-enterprise': 'all-in-one-enterprise',
};

const ROUTING_PATTERNS: PatternRule[] = [
  {
    pattern: /move every product launch back/i,
    intent: 'campaign-change',
    layer: 'launches',
    urgency: 'critical',
    action: () => 'Delay product launches portfolio-wide with portfolio impact summary — founder approval required',
    supportingOverride: ['brand-concierge', 'growth-concierge'],
    requiresApproval: true,
    riskLevel: 'high',
    confidence: 85,
  },
  {
    pattern: /move tomorrow'?s meeting/i,
    intent: 'schedule-change',
    layer: 'executive-meetings',
    urgency: 'high',
    action: () => 'Reschedule tomorrow\'s meeting with dependency scan',
    requiresApproval: true,
    confidence: 87,
  },
  {
    pattern: /schedule a photoshoot/i,
    intent: 'content-production',
    layer: 'photoshoots',
    urgency: 'medium',
    action: () => 'Find photoshoot window with production and concierge alignment',
    supportingOverride: ['brand-concierge', 'production-concierge'],
    confidence: 84,
  },
  {
    pattern: /prepare launch assets/i,
    intent: 'content-production',
    layer: 'launches',
    urgency: 'high',
    action: () => 'Coordinate launch asset production across brand, growth, and technology concierges',
    supportingOverride: ['brand-concierge', 'growth-concierge', 'technology-concierge'],
    requiresApproval: true,
    confidence: 86,
  },
  {
    pattern: /delay noir by (?:two|2) weeks?/i,
    intent: 'campaign-change',
    layer: 'campaigns',
    urgency: 'high',
    action: () => 'Delay Noir campaign by two weeks with full dependency scan',
    supportingOverride: ['brand-concierge'],
    requiresApproval: true,
    riskLevel: 'high',
    confidence: 90,
  },
  {
    pattern: /review today'?s content/i,
    intent: 'publishing-change',
    layer: 'content',
    urgency: 'medium',
    action: () => 'Surface today\'s content for founder review via Screening Room and Editorial Board',
    supportingOverride: ['brand-concierge', 'digital-concierge'],
    confidence: 88,
  },
  {
    pattern: /generate tomorrow'?s publishing schedule/i,
    intent: 'publishing-change',
    layer: 'marketing',
    urgency: 'medium',
    action: () => 'Draft tomorrow\'s publishing schedule for founder approval — no auto-publish',
    supportingOverride: ['digital-concierge'],
    confidence: 87,
  },
  {
    pattern: /prepare for black friday/i,
    intent: 'campaign-change',
    layer: 'campaigns',
    urgency: 'medium',
    action: () => 'Draft Black Friday timeline for founder review — tentative until approved',
    wouldCreateEvents: true,
    clarificationIfUncertain: 'I don\'t have a Black Friday launch week confirmed yet. Would you like me to create a tentative planning window?',
    confidence: 70,
  },
  {
    pattern: /find time for a vacation/i,
    intent: 'personal-life',
    layer: 'personal',
    urgency: 'medium',
    action: () => 'Analyze personal and organizational calendar for vacation window — recommend adjustments only',
    confidence: 85,
  },
  {
    pattern: /move everything affected/i,
    intent: 'workflow-dependency',
    urgency: 'critical',
    action: () => 'Cascade reschedule for all dependent timeline items with impact preview',
    requiresApproval: true,
    riskLevel: 'high',
    confidence: 83,
  },
  {
    pattern: /block friday morning for strategy/i,
    intent: 'personal-life',
    layer: 'personal',
    urgency: 'medium',
    action: () => 'Block Friday morning for strategy deep work — defer non-critical meetings',
    confidence: 89,
  },
  {
    pattern: /move (?:my )?(?:the )?.+ meeting to (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
    intent: 'schedule-change',
    layer: 'executive-meetings',
    urgency: 'high',
    action: (m) => `Reschedule meeting to ${m[1]}`,
    requiresApproval: true,
    riskLevel: 'medium',
    confidence: 88,
  },
  {
    pattern: /move this to next week/i,
    intent: 'schedule-change',
    urgency: 'high',
    action: () => 'Move selected timeline item to next week with dependency scan',
    requiresApproval: true,
    confidence: 85,
  },
  {
    pattern: /clear my afternoon|give me a free afternoon|free afternoon/i,
    intent: 'schedule-change',
    layer: 'personal',
    urgency: 'medium',
    action: () => 'Clear afternoon blocks and rebalance publishing load',
    confidence: 90,
  },
  {
    pattern: /clear my mornings|block every (?:friday )?morning|deep work/i,
    intent: 'personal-life',
    layer: 'personal',
    urgency: 'medium',
    action: () => 'Protect morning blocks for deep work — defer non-critical meetings',
    confidence: 87,
  },
  {
    pattern: /give me friday off|friday off/i,
    intent: 'personal-life',
    layer: 'personal',
    urgency: 'medium',
    action: () => 'Block Friday on personal layer and recommend business schedule adjustments',
    confidence: 86,
  },
  {
    pattern: /push (?:the )?.+ campaign back(?: (\d+) weeks?)?/i,
    intent: 'campaign-change',
    layer: 'campaigns',
    urgency: 'high',
    action: (m) => `Delay campaign timeline by ${m[1] ?? 'one'} week(s) with dependency scan`,
    supportingOverride: ['brand-concierge'],
    requiresApproval: true,
    riskLevel: 'high',
    confidence: 89,
  },
  {
    pattern: /prepare a (?:holiday|black friday) (?:content )?calendar/i,
    intent: 'campaign-change',
    layer: 'campaigns',
    urgency: 'medium',
    action: () => 'Draft campaign timeline for founder review — no dates committed until approved',
    wouldCreateEvents: true,
    clarificationIfUncertain: 'I don\'t have a launch week confirmed yet. Would you like me to create a tentative planning window?',
    confidence: 68,
  },
  {
    pattern: /find (?:the )?best day to post|first ndxbook video|schedule (?:the )?first ndxbook/i,
    intent: 'publishing-change',
    layer: 'marketing',
    urgency: 'medium',
    action: () => 'Analyze publishing cadence and recommend optimal NDXBOOK video post date',
    supportingOverride: ['digital-concierge'],
    confidence: 84,
  },
  {
    pattern: /pause publishing|out of town|traveling|vacation|unavailable after/i,
    intent: 'approval-deferral',
    layer: 'personal',
    urgency: 'high',
    action: () => 'Adapt publishing, meetings, and approvals around personal availability',
    requiresApproval: true,
    riskLevel: 'medium',
    confidence: 86,
  },
  {
    pattern: /delay anything that needs my approval/i,
    intent: 'approval-deferral',
    urgency: 'high',
    action: () => 'Defer founder-required approvals and route soft approvals to Chief Concierge',
    requiresApproval: true,
    confidence: 88,
  },
  {
    pattern: /move all approvals to (monday|tuesday|wednesday|thursday|friday)/i,
    intent: 'approval-deferral',
    urgency: 'high',
    action: (m) => `Consolidate pending approvals to ${m[1]}`,
    requiresApproval: true,
    confidence: 87,
  },
  {
    pattern: /shift everything affected by (?:the )?photoshoot|photoshoot/i,
    intent: 'workflow-dependency',
    layer: 'photoshoots',
    urgency: 'high',
    action: () => 'Cascade reschedule for all photoshoot-dependent timeline items',
    requiresApproval: true,
    riskLevel: 'high',
    confidence: 85,
  },
  {
    pattern: /schedule (?:the )?.+ video review|customer interviews/i,
    intent: 'content-production',
    layer: 'content',
    urgency: 'medium',
    action: () => 'Find review slot with production and concierge alignment',
    supportingOverride: ['brand-concierge', 'growth-concierge'],
    confidence: 83,
  },
  {
    pattern: /find space for a strategy day|strategy day/i,
    intent: 'schedule-change',
    layer: 'organization',
    urgency: 'medium',
    action: () => 'Identify strategy day window across executive and personal calendars',
    confidence: 82,
  },
  {
    pattern: /doctor'?s appointment|sister'?s event|moving next month|unavailable/i,
    intent: 'personal-life',
    layer: 'personal',
    urgency: 'medium',
    action: () => 'Update personal layer and recommend business schedule adjustments — no new events without confirmation',
    confidence: 84,
  },
  {
    pattern: /reschedule anything that conflicts/i,
    intent: 'workflow-dependency',
    urgency: 'high',
    action: () => 'Scan timeline for conflicts and propose coordinated reschedule',
    requiresApproval: true,
    riskLevel: 'medium',
    confidence: 80,
  },
  {
    pattern: /render queue|technology|maintenance/i,
    intent: 'technology',
    layer: 'product-development',
    urgency: 'medium',
    action: () => 'Coordinate technology concierge review of render and platform dependencies',
    confidence: 78,
  },
  {
    pattern: /brand|creative|designer|messaging/i,
    intent: 'brand-creative',
    layer: 'content',
    urgency: 'medium',
    action: () => 'Route to brand concierge for creative review and alignment',
    confidence: 76,
  },
  {
    pattern: /customer journey|experience|interview/i,
    intent: 'customer-journey',
    layer: 'client-meetings',
    urgency: 'medium',
    action: () => 'Experience concierge will coordinate customer-facing timeline adjustments',
    confidence: 77,
  },
  {
    pattern: /documentation|knowledge|playbook/i,
    intent: 'knowledge',
    layer: 'learning',
    urgency: 'low',
    action: () => 'Knowledge concierge will align documentation with timeline changes',
    confidence: 75,
  },
];

function detectOrganization(
  text: string,
  context: RouteCommandContext
): { orgId: TimelineOrganizationId | null; inference: OrganizationInference } {
  for (const { pattern, org } of ORG_PATTERNS) {
    if (pattern.test(text)) return { orgId: org, inference: 'explicit' };
  }

  if (context.activeOrganizationId && context.activeOrganizationId !== 'portfolio') {
    return { orgId: context.activeOrganizationId, inference: 'workspace-default' };
  }

  const wsOrg = WORKSPACE_TO_ORG[context.workspaceId];
  if (wsOrg && context.activeOrganizationId !== 'portfolio') {
    return { orgId: wsOrg, inference: 'workspace-default' };
  }

  if (wsOrg && !context.activeOrganizationId) {
    return { orgId: wsOrg, inference: 'workspace-default' };
  }

  if (context.activeOrganizationId === 'portfolio' || context.workspaceId === 'sandbox') {
    return { orgId: null, inference: 'portfolio-ambiguous' };
  }

  return { orgId: wsOrg ?? null, inference: wsOrg ? 'inferred' : 'portfolio-ambiguous' };
}

function applyPreferences(
  intent: RoutingIntent,
  primary: ConciergeRoutingId,
  preferences: RoutingPreference[]
): ConciergeRoutingId {
  const pref = preferences.find((p) => p.intent === intent);
  if (pref && pref.confidenceBoost > 0) return pref.preferredConciergeId;
  return primary;
}

function buildRoutingNote(primary: string, supporting: string[], fallback: boolean): string {
  if (fallback) {
    return supporting.length
      ? `Handled by ${primary} with support from ${supporting.join(' and ')}.`
      : `Routed to ${primary} for clarification.`;
  }
  return supporting.length
    ? `Handled by ${primary} with support from ${supporting.join(' and ')}.`
    : `Routed to ${primary}.`;
}

function buildImpactPreview(
  rule: PatternRule | null,
  action: string,
  context: RouteCommandContext,
  concierges: string[],
  executives: string[]
): RoutingImpactPreview {
  const events = context.events ?? [];
  const selected = context.selectedEventId
    ? events.find((e) => e.id === context.selectedEventId)
    : events[0];

  const affectedEvents = selected ? [selected] : events.slice(0, 3);
  const downstreamIds = selected?.blocks ?? [];
  const downstream = events.filter((e) => downstreamIds.includes(e.id));

  const allAffected = [...affectedEvents, ...downstream];
  const deps = new Set<string>();
  for (const e of allAffected) {
    for (const d of e.dependencies ?? []) deps.add(d.label);
  }

  const risks: string[] = [];
  if (downstream.length > 0) risks.push(`${downstream.length} downstream item(s) may shift`);
  if (rule?.requiresApproval) risks.push('Founder approval required before applying');
  if (rule?.wouldCreateEvents) risks.push('Would create tentative planning window only with approval');

  return {
    primaryAction: action,
    affectedEventIds: allAffected.map((e) => e.id),
    affectedEventTitles: allAffected.map((e) => e.title),
    affectedDependencies: [...deps],
    conciergesInvolved: concierges,
    executivesInvolved: executives,
    risks,
    recommendedAdjustments:
      downstream.length > 0
        ? ['Review downstream publishing and campaign timing before approving']
        : ['Low-impact change — safe to apply with concierge confirmation'],
    confidencePct: rule?.confidence ?? 70,
    requiresFounderApproval: rule?.requiresApproval ?? downstream.length > 2,
    wouldCreateEvents: rule?.wouldCreateEvents ?? false,
  };
}

function matchRule(text: string): { rule: PatternRule; match: RegExpMatchArray } | null {
  for (const rule of ROUTING_PATTERNS) {
    const match = text.match(rule.pattern);
    if (match) return { rule, match };
  }
  return null;
}

/** Route a natural-language founder command — voice-ready, no concierge selection required. */
export function routeFounderCommand(
  rawText: string,
  context: RouteCommandContext,
  preferences: RoutingPreference[] = []
): FounderCommandRoute {
  const trimmed = rawText.trim();
  const matched = matchRule(trimmed);
  const { orgId, inference } = detectOrganization(trimmed, context);

  const intent: RoutingIntent = matched?.rule.intent ?? 'general';
  const map = INTENT_CONCIERGE_MAP[intent] ?? INTENT_CONCIERGE_MAP.general;
  let primaryId = applyPreferences(intent, map.primary, preferences);
  let supportingIds = matched?.rule.supportingOverride ?? map.supporting;

  let confidence = matched?.rule.confidence ?? 55;
  let chiefConciergeFallback = false;
  let clarificationQuestion: string | undefined;

  if (!matched) {
    confidence = 48;
    chiefConciergeFallback = true;
    primaryId = 'chief-concierge';
    supportingIds = [];
    clarificationQuestion = 'I can help with that. Which organization should this apply to — Frontal Slayer, NDXBOOK, or portfolio-wide?';
  } else if (confidence < ROUTING_CONFIDENCE_THRESHOLD) {
    chiefConciergeFallback = true;
    primaryId = 'chief-concierge';
    if (!supportingIds.includes(map.primary)) supportingIds = [map.primary, ...supportingIds];
  }

  if (inference === 'portfolio-ambiguous' && !matched?.rule) {
    clarificationQuestion =
      clarificationQuestion ??
      'Which organization should handle this — Frontal Slayer, NDXBOOK, VXD, or All In One Enterprise?';
    confidence = Math.min(confidence, 60);
    chiefConciergeFallback = true;
  }

  if (matched?.rule.clarificationIfUncertain && matched.rule.wouldCreateEvents) {
    clarificationQuestion = matched.rule.clarificationIfUncertain;
    confidence = Math.min(confidence, 65);
  }

  const primaryConcierge = CONCIERGE_DISPLAY_NAMES[primaryId];
  const supportingConcierges = supportingIds.map((id) => CONCIERGE_DISPLAY_NAMES[id]);
  const action = matched
    ? matched.rule.action(matched.match, trimmed)
    : 'Analyze intent and propose organizational response with impact preview';

  const events = context.events ?? [];
  const selected = context.selectedEventId
    ? events.find((e) => e.id === context.selectedEventId)
    : events[0];
  const executives = selected?.assignedExecutive ? [selected.assignedExecutive] : [];

  const allConcierges = [primaryConcierge, ...supportingConcierges.filter((c) => c !== primaryConcierge)];

  const impactPreview = buildImpactPreview(
    matched?.rule ?? null,
    action,
    context,
    allConcierges,
    executives
  );

  if (chiefConciergeFallback && matched && orgId === 'ndxbook' && /publishing|video/i.test(trimmed)) {
    clarificationQuestion =
      'I can handle that. This affects NDXBOOK publishing and your personal timeline. Should I move the related render queue as well?';
  }

  const routingNote = buildRoutingNote(primaryConcierge, supportingConcierges, chiefConciergeFallback);

  return {
    id: `route-${Date.now()}`,
    rawText: trimmed,
    intent,
    organizationId: orgId,
    organizationInference: inference,
    timelineLayer: matched?.rule.layer,
    urgency: matched?.rule.urgency ?? 'medium',
    affectedProjects: selected?.relatedProjects,
    affectedContent: selected?.relatedContent,
    primaryConciergeId: primaryId,
    primaryConcierge,
    supportingConciergeIds: supportingIds,
    supportingConcierges,
    riskLevel: matched?.rule.riskLevel ?? (impactPreview.affectedEventIds.length > 2 ? 'medium' : 'low'),
    requiresFounderApproval: impactPreview.requiresFounderApproval,
    confidencePct: confidence,
    primaryAction: action,
    routingNote,
    chiefConciergeFallback,
    clarificationQuestion,
    impactPreview,
    status: 'pending-approval',
    createdAt: new Date().toISOString(),
  };
}

/** Parse founder routing correction — "no, this should go to growth". */
export function parseRoutingCorrection(rawText: string): ConciergeRoutingId | null {
  const lower = rawText.toLowerCase();
  if (/should go to growth|route to growth|growth concierge/i.test(lower)) return 'growth-concierge';
  if (/should go to brand|brand concierge/i.test(lower)) return 'brand-concierge';
  if (/experience concierge/i.test(lower)) return 'experience-concierge';
  if (/digital concierge/i.test(lower)) return 'digital-concierge';
  if (/technology concierge/i.test(lower)) return 'technology-concierge';
  if (/production concierge/i.test(lower)) return 'production-concierge';
  if (/knowledge concierge/i.test(lower)) return 'knowledge-concierge';
  if (/chief concierge/i.test(lower)) return 'chief-concierge';
  return null;
}

export function buildAskWhyExplanation(route: FounderCommandRoute): string {
  const parts = [
    `Intent detected: ${route.intent.replace(/-/g, ' ')}.`,
    route.organizationId
      ? `Organization: ${route.organizationId.replace(/-/g, ' ')} (${route.organizationInference}).`
      : 'Organization: not yet determined.',
    `Primary concierge: ${route.primaryConcierge} (${route.confidencePct}% confidence).`,
  ];
  if (route.supportingConcierges.length) {
    parts.push(`Supporting: ${route.supportingConcierges.join(', ')}.`);
  }
  if (route.chiefConciergeFallback) {
    parts.push('Chief Concierge engaged due to routing confidence or portfolio ambiguity.');
  }
  return parts.join(' ');
}
