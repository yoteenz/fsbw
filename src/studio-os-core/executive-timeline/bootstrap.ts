/**
 * Executive Timeline V1.0 bootstrap — temporal intelligence demo seed (Milestone 81).
 */

import { TIMELINE_PHILOSOPHY } from './constants';
import { bootstrapExecutiveTimelineStore } from './store';
import type {
  MorningBriefing,
  ProactiveRecommendation,
  TimelineEvent,
  TimelineMemoryPreference,
} from './types';

function daysFromNow(days: number, hour = 10, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function hoursFromNow(hours: number, durationMins = 60): { startAt: string; endAt: string } {
  const start = new Date(Date.now() + hours * 3600_000);
  const end = new Date(start.getTime() + durationMins * 60_000);
  return { startAt: start.toISOString(), endAt: end.toISOString() };
}

function buildEvent(partial: Omit<TimelineEvent, 'dependsOn' | 'blocks' | 'dependencies'> & {
  dependsOn?: string[];
  blocks?: string[];
  dependencies?: TimelineEvent['dependencies'];
}): TimelineEvent {
  return {
    dependsOn: [],
    blocks: [],
    dependencies: [],
    ...partial,
  };
}

export function buildExecutiveTimelineSeed() {
  const designerMeeting = buildEvent({
    id: 'evt-fs-designer-meeting',
    organizationId: 'frontal-slayer',
    title: 'DESIGNER MEETING · NOIR COLLECTION REVIEW',
    layerId: 'executive-meetings',
    ...hoursFromNow(26, 90),
    priority: 'high',
    status: 'scheduled',
    confidencePct: 91,
    estimatedEffortMins: 90,
    assignedConcierge: 'Brand Concierge',
    assignedExecutive: 'Chief Brand Officer',
    relatedProjects: ['Noir Collection Q3'],
    relatedContent: ['Noir hero shoot brief', 'Packaging mockups'],
    relatedMeetings: ['Executive Council — brand alignment'],
    blocks: ['evt-fs-noir-photoshoot', 'evt-fs-noir-campaign'],
    dependencies: [
      { id: 'dep-1', label: 'Packaging samples arrive', category: 'inventory', impactLevel: 'high' },
      { id: 'dep-2', label: 'Creative brief approved', category: 'content', impactLevel: 'medium' },
    ],
  });

  const noirPhotoshoot = buildEvent({
    id: 'evt-fs-noir-photoshoot',
    organizationId: 'frontal-slayer',
    title: 'NOIR COLLECTION PHOTOSHOOT',
    layerId: 'photoshoots',
    startAt: daysFromNow(4, 9),
    endAt: daysFromNow(4, 17),
    priority: 'critical',
    status: 'scheduled',
    confidencePct: 88,
    estimatedEffortMins: 480,
    assignedConcierge: 'Experience Concierge',
    assignedExecutive: 'Chief Creative Officer',
    relatedProjects: ['Noir Collection Q3'],
    relatedContent: ['Hero imagery', 'Lookbook assets'],
    relatedMeetings: ['Designer meeting'],
    dependsOn: ['evt-fs-designer-meeting'],
    blocks: ['evt-fs-noir-render', 'evt-fs-noir-launch'],
    dependencies: [
      { id: 'dep-3', label: 'Studio lot reserved', category: 'production', impactLevel: 'high' },
      { id: 'dep-4', label: 'Talent confirmed', category: 'photoshoot', impactLevel: 'medium' },
    ],
  });

  const noirRender = buildEvent({
    id: 'evt-fs-noir-render',
    organizationId: 'frontal-slayer',
    title: 'NOIR RENDER QUEUE · HERO CUTS',
    layerId: 'content',
    startAt: daysFromNow(5, 8),
    endAt: daysFromNow(6, 18),
    priority: 'high',
    status: 'scheduled',
    confidencePct: 86,
    estimatedEffortMins: 960,
    assignedConcierge: 'Technology Concierge',
    assignedExecutive: 'Chief Technology Officer',
    relatedProjects: ['Noir Collection Q3'],
    relatedContent: ['Hero video', 'Social cuts'],
    relatedMeetings: [],
    dependsOn: ['evt-fs-noir-photoshoot'],
    blocks: ['evt-fs-noir-campaign', 'evt-fs-noir-publishing'],
    dependencies: [
      { id: 'dep-5', label: 'Raw footage ingest', category: 'rendering', impactLevel: 'high' },
      { id: 'dep-6', label: 'Color grade preset', category: 'production', impactLevel: 'medium' },
    ],
  });

  const noirCampaign = buildEvent({
    id: 'evt-fs-noir-campaign',
    organizationId: 'frontal-slayer',
    title: 'NOIR CAMPAIGN · MULTI-CHANNEL LAUNCH',
    layerId: 'campaigns',
    startAt: daysFromNow(7, 6),
    endAt: daysFromNow(14, 23),
    priority: 'critical',
    status: 'at-risk',
    confidencePct: 79,
    estimatedEffortMins: 2400,
    assignedConcierge: 'Growth Concierge',
    assignedExecutive: 'Chief Growth Officer',
    relatedProjects: ['Noir Collection Q3'],
    relatedContent: ['Email sequence', 'Paid social', 'Landing page'],
    relatedMeetings: ['Growth Council review'],
    dependsOn: ['evt-fs-designer-meeting', 'evt-fs-noir-render'],
    blocks: ['evt-fs-noir-launch'],
    dependencies: [
      { id: 'dep-7', label: 'Creative assets approved', category: 'campaign', impactLevel: 'high' },
      { id: 'dep-8', label: 'Inventory synced', category: 'inventory', impactLevel: 'high' },
      { id: 'dep-9', label: 'Customer email templates', category: 'email', impactLevel: 'medium' },
    ],
  });

  const noirLaunch = buildEvent({
    id: 'evt-fs-noir-launch',
    organizationId: 'frontal-slayer',
    title: 'NOIR COLLECTION PRODUCT LAUNCH',
    layerId: 'launches',
    startAt: daysFromNow(15, 10),
    endAt: daysFromNow(15, 14),
    priority: 'critical',
    status: 'scheduled',
    confidencePct: 82,
    estimatedEffortMins: 240,
    assignedConcierge: 'Chief Concierge',
    assignedExecutive: 'Chief of Staff',
    relatedProjects: ['Noir Collection Q3'],
    relatedContent: ['Launch announcement', 'Press kit'],
    relatedMeetings: ['Executive Council — launch readiness'],
    dependsOn: ['evt-fs-noir-photoshoot', 'evt-fs-noir-campaign'],
    blocks: [],
    dependencies: [
      { id: 'dep-10', label: 'Executive review complete', category: 'review', impactLevel: 'high' },
      { id: 'dep-11', label: 'Publishing queue cleared', category: 'publishing', impactLevel: 'high' },
    ],
  });

  const noirPublishing = buildEvent({
    id: 'evt-fs-noir-publishing',
    organizationId: 'frontal-slayer',
    title: 'NOIR PUBLISHING WINDOW · 6 ASSETS',
    layerId: 'marketing',
    startAt: daysFromNow(8, 12),
    endAt: daysFromNow(10, 18),
    priority: 'high',
    status: 'scheduled',
    confidencePct: 90,
    estimatedEffortMins: 480,
    assignedConcierge: 'Digital Concierge',
    assignedExecutive: 'Chief Digital Officer',
    relatedProjects: ['Noir Collection Q3'],
    relatedContent: ['Instagram carousel', 'TikTok cuts', 'Newsletter'],
    relatedMeetings: [],
    dependsOn: ['evt-fs-noir-render'],
    blocks: [],
    dependencies: [
      { id: 'dep-12', label: 'Screening room approval', category: 'publishing', impactLevel: 'high' },
      { id: 'dep-13', label: 'Concierge editorial board', category: 'concierge', impactLevel: 'medium' },
    ],
  });

  const founderVacation = buildEvent({
    id: 'evt-founder-vacation',
    organizationId: 'portfolio',
    title: 'FOUNDER VACATION · ATTENTION PROTECTION',
    layerId: 'personal',
    startAt: daysFromNow(6, 0),
    endAt: daysFromNow(13, 23),
    priority: 'critical',
    status: 'scheduled',
    confidencePct: 100,
    estimatedEffortMins: 0,
    assignedConcierge: 'Chief Concierge',
    assignedExecutive: 'Chief of Staff',
    relatedProjects: [],
    relatedContent: [],
    relatedMeetings: [],
    personalLifeTag: 'Vacation',
    notes: 'Personal assistant mode — auto-adapt publishing, meetings, and executive reviews.',
    dependencies: [
      { id: 'dep-14', label: 'Soft approvals enabled', category: 'executive', impactLevel: 'high' },
    ],
  });

  const ndxbookLace = buildEvent({
    id: 'evt-ndx-lace-publish',
    organizationId: 'ndxbook',
    title: 'LACE MASTERY · CUTTING YOUR LACE PUBLISH',
    layerId: 'content',
    startAt: daysFromNow(1, 14),
    endAt: daysFromNow(1, 15),
    priority: 'high',
    status: 'scheduled',
    confidencePct: 93,
    estimatedEffortMins: 60,
    assignedConcierge: 'Digital Concierge',
    assignedExecutive: 'Chief Content Officer',
    relatedProjects: ['Lace Mastery Series'],
    relatedContent: ['Educational video · evergreen'],
    relatedMeetings: ['Concierge approval flow complete'],
    dependencies: [
      { id: 'dep-15', label: 'Editorial board approved', category: 'concierge', impactLevel: 'high' },
      { id: 'dep-16', label: 'Render queue complete', category: 'rendering', impactLevel: 'medium' },
    ],
  });

  const vxdProductReview = buildEvent({
    id: 'evt-vxd-product-review',
    organizationId: 'vxd-inc',
    title: 'VXD PRODUCT DEVELOPMENT SPRINT REVIEW',
    layerId: 'product-development',
    startAt: daysFromNow(3, 11),
    endAt: daysFromNow(3, 13),
    priority: 'medium',
    status: 'scheduled',
    confidencePct: 87,
    estimatedEffortMins: 120,
    assignedConcierge: 'Technology Concierge',
    assignedExecutive: 'Chief Technology Officer',
    relatedProjects: ['VXD Platform v2'],
    relatedContent: [],
    relatedMeetings: ['Engineering standup'],
    dependencies: [
      { id: 'dep-17', label: 'Sprint demo ready', category: 'production', impactLevel: 'medium' },
    ],
  });

  const aioStrategy = buildEvent({
    id: 'evt-aio-strategy-day',
    organizationId: 'all-in-one-enterprise',
    title: 'ALL IN ONE · STRATEGY DAY',
    layerId: 'organization',
    startAt: daysFromNow(9, 9),
    endAt: daysFromNow(9, 17),
    priority: 'high',
    status: 'proposed',
    confidencePct: 74,
    estimatedEffortMins: 480,
    assignedConcierge: 'Chief Concierge',
    assignedExecutive: 'Chief of Staff',
    relatedProjects: ['Enterprise roadmap Q3'],
    relatedContent: [],
    relatedMeetings: ['Executive Council'],
    dependencies: [],
  });

  const deepWork = buildEvent({
    id: 'evt-founder-deep-work',
    organizationId: 'portfolio',
    title: 'DEEP WORK · FRIDAY MORNING BLOCK',
    layerId: 'personal',
    startAt: daysFromNow(2, 8),
    endAt: daysFromNow(2, 12),
    priority: 'high',
    status: 'scheduled',
    confidencePct: 95,
    estimatedEffortMins: 240,
    assignedConcierge: 'PSA',
    relatedProjects: [],
    relatedContent: [],
    relatedMeetings: [],
    personalLifeTag: 'Creative hours',
    notes: 'Recurring preference — timeline memory protects Friday mornings.',
  });

  const executiveCouncil = buildEvent({
    id: 'evt-exec-council',
    organizationId: 'portfolio',
    title: 'EXECUTIVE COUNCIL · WEEKLY ALIGNMENT',
    layerId: 'executive-meetings',
    startAt: daysFromNow(1, 10),
    endAt: daysFromNow(1, 11, 30),
    priority: 'critical',
    status: 'scheduled',
    confidencePct: 94,
    estimatedEffortMins: 90,
    assignedConcierge: 'Chief Concierge',
    assignedExecutive: 'Chief of Staff',
    relatedProjects: ['Portfolio operations'],
    relatedContent: [],
    relatedMeetings: ['All executives'],
    dependencies: [
      { id: 'dep-18', label: 'Department briefs submitted', category: 'executive', impactLevel: 'medium' },
    ],
  });

  const events: TimelineEvent[] = [
    designerMeeting,
    noirPhotoshoot,
    noirRender,
    noirCampaign,
    noirLaunch,
    noirPublishing,
    founderVacation,
    ndxbookLace,
    vxdProductReview,
    aioStrategy,
    deepWork,
    executiveCouncil,
  ];

  const morningBriefing: MorningBriefing = {
    generatedAt: new Date().toISOString(),
    todaysPriorities: [
      'Executive Council alignment at 10 AM — all department briefs required',
      'NDXBOOK Lace Mastery publish window — editorial board complete',
      'Noir designer meeting tomorrow — packaging dependency check',
    ],
    upcomingDeadlines: [
      'Noir campaign assets — 7 days',
      'Lace Mastery publish — tomorrow 2 PM',
      'VXD sprint review — 3 days',
    ],
    executiveMeetings: [
      'Executive Council · 10 AM · Portfolio',
      'Designer meeting · Noir collection · tomorrow',
      'Growth Council · campaign timing review · Thursday',
    ],
    publishingSchedule: [
      'NDXBOOK Lace Mastery — tomorrow afternoon',
      'Noir publishing window — 6 assets queued post-render',
      'Slay Report Week 12 — Friday broadcast slot',
    ],
    travel: ['Founder vacation block starts in 6 days — schedule adaptation recommended'],
    personalCommitments: [
      'Deep work block Friday 8 AM – 12 PM',
      'Founder vacation next week — personal assistant mode active',
    ],
    recommendedAdjustments: [
      'Move Noir designer meeting if packaging delayed — 6 downstream tasks affected',
      'Rebalance publishing volume during vacation week — Chief Concierge soft approvals ready',
      'Protect Friday morning deep work — defer non-critical client meetings',
    ],
    potentialConflicts: [
      'Launch overlaps with founder vacation — recommend delegate executive reviews',
      'Three major approvals clustered on launch day',
      'Publishing volume unusually high during vacation week',
    ],
    organizationalHealth: 'Portfolio operating at 87% alignment — Noir campaign at-risk due to packaging dependency.',
    chiefConciergeSummary:
      'Good morning. Today centers on Executive Council alignment and NDXBOOK publication readiness. Noir campaign remains at-risk — designer meeting tomorrow gates six downstream tasks. Your vacation begins in six days; I recommend we finalize soft approval routing before you leave. Would you like me to rebalance next week\'s publishing load?',
  };

  const proactiveRecommendations: ProactiveRecommendation[] = [
    {
      id: 'rec-vacation-launch',
      insight: 'Launch overlaps with your vacation.',
      reasoning: 'Noir Collection launch day falls during founder vacation block — executive reviews may require delegation.',
      suggestedAction: 'Enable Chief of Staff soft approvals for launch day and pre-schedule Executive Council delegate.',
      requiresApproval: true,
    },
    {
      id: 'rec-approval-cluster',
      insight: 'Three major approvals on the same day.',
      reasoning: 'Launch day clusters executive review, campaign approval, and publishing sign-off.',
      suggestedAction: 'Spread approvals across two days with concierge pre-briefs.',
      requiresApproval: true,
    },
    {
      id: 'rec-publishing-volume',
      insight: 'Publishing volume unusually high next week.',
      reasoning: 'Six Noir assets plus NDXBOOK evergreen cut exceed typical weekly cadence during vacation.',
      suggestedAction: 'Defer two social cuts to following week — maintain quality over volume.',
      requiresApproval: true,
    },
  ];

  const timelineMemory: TimelineMemoryPreference[] = [
    { id: 'mem-1', category: 'Deep work', preference: 'Block every Friday morning 8 AM – 12 PM', learnedFrom: 'Founder command · recurring', confidencePct: 96 },
    { id: 'mem-2', category: 'Meeting times', preference: 'Executive meetings preferred 10 AM – 2 PM', learnedFrom: 'Executive Council cadence', confidencePct: 91 },
    { id: 'mem-3', category: 'Publishing cadence', preference: 'Max 4 major publishes per week during travel', learnedFrom: 'Vacation adaptation pattern', confidencePct: 88 },
    { id: 'mem-4', category: 'Creative hours', preference: 'No meetings before 9 AM on production days', learnedFrom: 'Photoshoot scheduling history', confidencePct: 85 },
    { id: 'mem-5', category: 'Travel habits', preference: 'Clear afternoons before departure for strategy work', learnedFrom: 'Chief Concierge observation', confidencePct: 82 },
  ];

  return {
    philosophy: [...TIMELINE_PHILOSOPHY],
    events,
    morningBriefing,
    proactiveRecommendations,
    timelineMemory,
    activeOrganizationId: 'portfolio' as const,
    activeView: 'agenda' as const,
  };
}

export function bootstrapExecutiveTimelinePlatform(): void {
  bootstrapExecutiveTimelineStore(buildExecutiveTimelineSeed());
}
