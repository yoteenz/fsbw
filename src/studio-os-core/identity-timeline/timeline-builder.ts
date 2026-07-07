import { getOrganizationExpertMarketplaceProfile } from '../expert-marketplace/store';
import { getOrganizationIdentityGraphProfile } from '../identity-graph/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { getOrganizationProfessionalProfilesProfile } from '../professional-profile/store';
import { getOrganizationStudioInstituteProfile } from '../studio-institute/org-store';
import { getOrganizationWisdomProfile } from '../wisdom-capture/store';
import type { LivingProfessionalProfile } from '../professional-profile/types';
import {
  IDENTITY_TIMELINE_DOMAIN_LABELS,
  IDENTITY_TIMELINE_DOMAINS,
  IDENTITY_TIMELINE_EVENT_LABELS,
} from './constants';
import type {
  IdentityTimelineDomainStatus,
  IdentityTimelineEvent,
  IdentityTimelineEventType,
  IdentityTimelineInsight,
  IdentityTimelineStats,
  OrganizationIdentityTimelineProfile,
  PersonIdentityTimeline,
} from './types';

function timelineId(orgId: string, personId: string): string {
  return `itl-${orgId}-${personId.replace(`identity-${orgId}-`, '')}`;
}

function monthsAgo(n: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d.toISOString();
}


function event(
  id: string,
  eventType: IdentityTimelineEventType,
  title: string,
  description: string,
  occurredAt: string,
  impactScore: number
): IdentityTimelineEvent {
  return {
    id,
    eventType,
    eventTypeLabel: IDENTITY_TIMELINE_EVENT_LABELS[eventType],
    title,
    description,
    occurredAt,
    impactScore,
    permanent: true,
  };
}

function emptyStats(): IdentityTimelineStats {
  return {
    mentorshipCount: 0,
    knowledgeAssetsPublished: 0,
    promotions: 0,
    awards: 0,
    expertSessions: 0,
    marketplaceContributions: 0,
    brainContributions: 0,
    trainingCompleted: 0,
    leadershipRoles: 0,
    projectsDelivered: 0,
    departmentsServed: 0,
  };
}

function computeStatsFromEvents(events: IdentityTimelineEvent[]): IdentityTimelineStats {
  const stats = emptyStats();
  for (const e of events) {
    switch (e.eventType) {
      case 'mentorship':
        stats.mentorshipCount += 1;
        break;
      case 'knowledge-published':
        stats.knowledgeAssetsPublished += 1;
        break;
      case 'promotion':
        stats.promotions += 1;
        break;
      case 'award':
        stats.awards += 1;
        break;
      case 'expert-session':
        stats.expertSessions += 1;
        break;
      case 'marketplace-contribution':
        stats.marketplaceContributions += 1;
        break;
      case 'profession-brain-contribution':
        stats.brainContributions += 1;
        break;
      case 'training-completed':
        stats.trainingCompleted += 1;
        break;
      case 'leadership-role':
        stats.leadershipRoles += 1;
        break;
      case 'project':
        stats.projectsDelivered += 1;
        break;
      case 'department':
        stats.departmentsServed += 1;
        break;
      default:
        break;
    }
  }
  return stats;
}

function buildFounderTimeline(
  organizationId: string,
  companyName: string,
  brain: ReturnType<typeof getOrganizationProfessionBrainProfile>,
  institute: ReturnType<typeof getOrganizationStudioInstituteProfile>,
  marketplace: ReturnType<typeof getOrganizationExpertMarketplaceProfile>,
  wisdom: ReturnType<typeof getOrganizationWisdomProfile>
): IdentityTimelineEvent[] {
  const events: IdentityTimelineEvent[] = [
    event(
      `ite-${organizationId}-founder-join`,
      'joined-organization',
      `Founded ${companyName}`,
      'Organizational journey begins — permanent Identity Timeline™ activated.',
      monthsAgo(36),
      98
    ),
    event(
      `ite-${organizationId}-founder-login`,
      'first-login',
      'First Studio OS Login',
      'Founder activated Studio OS Headquarters — identity permanently recorded.',
      monthsAgo(36),
      95
    ),
    event(
      `ite-${organizationId}-founder-leadership`,
      'leadership-role',
      'Founder & CEO',
      'Executive leadership role — vision, judgment, and trust stewardship.',
      monthsAgo(36),
      96
    ),
    event(
      `ite-${organizationId}-founder-dept`,
      'department',
      'Executive Department',
      'Established executive department — organizational anchor point.',
      monthsAgo(34),
      88
    ),
    event(
      `ite-${organizationId}-founder-milestone`,
      'company-milestone',
      `${companyName} Headquarters Inaugurated`,
      'Company milestone — Studio OS organizational intelligence layer live.',
      monthsAgo(24),
      94
    ),
  ];

  for (const [i, brainNode] of (brain?.brains ?? []).entries()) {
    events.push(
      event(
        `ite-${organizationId}-brain-${brainNode.id}`,
        'profession-brain-contribution',
        `Profession Brain™ — ${brainNode.label}`,
        `Encoded ${brainNode.knowledgeEntries.length} knowledge entries into institutional memory.`,
        monthsAgo(22 - i * 3),
        82 + i * 2
      )
    );
  }

  const wisdomEntries = wisdom?.wisdomLibrary ?? [];
  for (const [i, entry] of wisdomEntries.slice(0, 8).entries()) {
    events.push(
      event(
        `ite-${organizationId}-wisdom-${entry.id}`,
        'knowledge-published',
        entry.wisdom.slice(0, 64),
        entry.whyItMatters,
        monthsAgo(18 - i),
        75 + (i % 3) * 2
      )
    );
  }

  for (let i = 0; i < 12; i++) {
    events.push(
      event(
        `ite-${organizationId}-knowledge-bulk-${i}`,
        'knowledge-published',
        `Knowledge asset #${i + 1}`,
        'Documented operational expertise for organizational continuity.',
        monthsAgo(14 - Math.floor(i / 2)),
        68
      )
    );
  }

  for (const cert of institute?.certifications?.filter((c) => c.status === 'earned').slice(0, 4) ?? []) {
    events.push(
      event(
        `ite-${organizationId}-training-${cert.id}`,
        'training-completed',
        cert.name,
        cert.requirement,
        monthsAgo(10),
        78
      )
    );
  }

  for (const listing of marketplace?.listings?.filter((l) => l.profile.published).slice(0, 3) ?? []) {
    events.push(
      event(
        `ite-${organizationId}-mp-${listing.profile.id}`,
        'marketplace-contribution',
        `Marketplace — ${listing.profile.expertName}`,
        listing.profile.specialties.join(' · '),
        monthsAgo(8),
        80
      )
    );
  }

  for (let i = 0; i < 5; i++) {
    events.push(
      event(
        `ite-${organizationId}-expert-${i}`,
        'expert-session',
        `Expert session #${i + 1}`,
        'Led governed expertise session — knowledge transferred to organization.',
        monthsAgo(6 - i),
        72
      )
    );
  }

  for (let i = 0; i < 17; i++) {
    events.push(
      event(
        `ite-${organizationId}-mentor-${i}`,
        'mentorship',
        `Mentored employee #${i + 1}`,
        'Permanent mentorship record — professional growth supported.',
        monthsAgo(20 - i),
        70 + (i % 4)
      )
    );
  }

  events.push(
    event(
      `ite-${organizationId}-award-top`,
      'award',
      'Top Organizational Contributor',
      'Recognized as the organization\'s leading knowledge and mentorship contributor.',
      monthsAgo(2),
      97
    ),
    event(
      `ite-${organizationId}-project-hq`,
      'project',
      'Studio OS Headquarters',
      'Led end-to-end organizational intelligence platform delivery.',
      monthsAgo(12),
      90
    ),
    event(
      `ite-${organizationId}-promotion-cos`,
      'promotion',
      'Chief of Staff Architecture',
      'Expanded leadership scope — executive systems and organizational governance.',
      monthsAgo(16),
      85
    )
  );

  return events.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
}

function buildEmployeeTimeline(
  organizationId: string,
  personId: string,
  displayName: string,
  role: string,
  department: string,
  index: number,
  profProfile: LivingProfessionalProfile | undefined
): IdentityTimelineEvent[] {
  const events: IdentityTimelineEvent[] = [
    event(
      `ite-${organizationId}-${personId}-join`,
      'joined-organization',
      `Joined as ${role}`,
      `${displayName} began their permanent Identity Timeline™ in ${department}.`,
      monthsAgo(18 + index * 2),
      72
    ),
    event(
      `ite-${organizationId}-${personId}-login`,
      'first-login',
      'First Studio OS Login',
      `${displayName} first accessed Studio OS — journey permanently recorded.`,
      monthsAgo(18 + index * 2 - 1),
      68
    ),
    event(
      `ite-${organizationId}-${personId}-dept`,
      'department',
      department,
      `Assigned to ${department} — departmental history preserved.`,
      monthsAgo(17 + index * 2),
      65
    ),
    event(
      `ite-${organizationId}-${personId}-training`,
      'training-completed',
      'Role onboarding path',
      'Completed organizational training — operational fluency certified.',
      monthsAgo(14 + index),
      62
    ),
    event(
      `ite-${organizationId}-${personId}-project`,
      'project',
      `${department} initiative`,
      `${displayName} delivered cross-functional project outcomes.`,
      monthsAgo(10 + index),
      64 + index
    ),
  ];

  if (profProfile?.mentorship.length) {
    for (const [i, m] of profProfile.mentorship.slice(0, 2).entries()) {
      events.push(
        event(
          `ite-${organizationId}-${personId}-mentor-${i}`,
          'mentorship',
          m.role === 'mentor' ? `Mentored ${m.counterpart}` : `Mentored by ${m.counterpart}`,
          m.focus,
          monthsAgo(8 - i),
          70
        )
      );
    }
  }

  if (index === 0) {
    events.push(
      event(
        `ite-${organizationId}-${personId}-brain`,
        'profession-brain-contribution',
        'Profession Brain™ contribution',
        'Contributed operational knowledge to institutional brain.',
        monthsAgo(7),
        74
      ),
      event(
        `ite-${organizationId}-${personId}-knowledge`,
        'knowledge-published',
        'Process documentation published',
        'Knowledge asset added to organizational library.',
        monthsAgo(5),
        71
      )
    );
  }

  if (index === 1) {
    events.push(
      event(
        `ite-${organizationId}-${personId}-promotion`,
        'promotion',
        `Promoted to Senior ${role}`,
        `${displayName} advanced within ${department}.`,
        monthsAgo(6),
        78
      )
    );
  }

  return events.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
}

function buildExpertTimeline(
  organizationId: string,
  personId: string,
  name: string,
  specialty: string
): IdentityTimelineEvent[] {
  return [
    event(
      `ite-${organizationId}-${personId}-join`,
      'joined-organization',
      'Joined Expert Network',
      `${name} connected to organizational expert ecosystem.`,
      monthsAgo(14),
      75
    ),
    event(
      `ite-${organizationId}-${personId}-session`,
      'expert-session',
      `Expert session — ${specialty}`,
      'Governed expertise session delivered to organization.',
      monthsAgo(9),
      80
    ),
    event(
      `ite-${organizationId}-${personId}-mp`,
      'marketplace-contribution',
      `Marketplace — ${specialty}`,
      'Published governed expertise to Expert Marketplace™.',
      monthsAgo(7),
      82
    ),
    event(
      `ite-${organizationId}-${personId}-knowledge`,
      'knowledge-published',
      `${specialty} knowledge pack`,
      'Expert knowledge asset published for organizational learning.',
      monthsAgo(5),
      76
    ),
  ].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
}

function buildAdvisorTimeline(
  organizationId: string,
  personId: string,
  name: string
): IdentityTimelineEvent[] {
  return [
    event(
      `ite-${organizationId}-${personId}-join`,
      'joined-organization',
      'Advisor engagement',
      `${name} joined as organizational advisor.`,
      monthsAgo(20),
      70
    ),
    event(
      `ite-${organizationId}-${personId}-session`,
      'expert-session',
      'Advisory session',
      'Strategic advisory session with founder leadership.',
      monthsAgo(8),
      72
    ),
    event(
      `ite-${organizationId}-${personId}-milestone`,
      'company-milestone',
      'Advisory council milestone',
      'Contributed to organizational strategic milestone review.',
      monthsAgo(4),
      68
    ),
  ].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
}

function buildPersonTimeline(
  organizationId: string,
  person: NonNullable<ReturnType<typeof getOrganizationIdentityGraphProfile>>['people'][number],
  index: number,
  companyName: string,
  profProfiles: ReturnType<typeof getOrganizationProfessionalProfilesProfile>,
  brain: ReturnType<typeof getOrganizationProfessionBrainProfile>,
  institute: ReturnType<typeof getOrganizationStudioInstituteProfile>,
  marketplace: ReturnType<typeof getOrganizationExpertMarketplaceProfile>,
  wisdom: ReturnType<typeof getOrganizationWisdomProfile>
): PersonIdentityTimeline {
  const profProfile = profProfiles?.profiles.find((p) => p.personId === person.id);

  let events: IdentityTimelineEvent[];
  if (person.identityType === 'founder') {
    events = buildFounderTimeline(organizationId, companyName, brain, institute, marketplace, wisdom);
  } else if (person.identityType === 'expert') {
    events = buildExpertTimeline(
      organizationId,
      person.id,
      person.displayName,
      person.expertise[0] ?? 'Expertise'
    );
  } else if (person.identityType === 'advisor') {
    events = buildAdvisorTimeline(organizationId, person.id, person.displayName);
  } else {
    events = buildEmployeeTimeline(
      organizationId,
      person.id,
      person.displayName,
      person.role,
      person.department,
      index,
      profProfile
    );
  }

  const stats = computeStatsFromEvents(events);
  if (person.identityType === 'founder') {
    stats.mentorshipCount = 17;
    stats.knowledgeAssetsPublished = Math.max(stats.knowledgeAssetsPublished, 246);
    stats.brainContributions = brain?.brains.length ?? stats.brainContributions;
    stats.expertSessions = Math.max(stats.expertSessions, 5);
    stats.leadershipRoles = Math.max(stats.leadershipRoles, 1);
    stats.departmentsServed = Math.max(stats.departmentsServed, 1);
  }

  const journeyScore = Math.min(
    98,
    45 + events.length * 2 + stats.knowledgeAssetsPublished * 0.1 + stats.mentorshipCount * 2
  );

  return {
    id: timelineId(organizationId, person.id),
    personId: person.id,
    displayName: person.displayName,
    headline: profProfile?.headline ?? person.organizationSummary.slice(0, 80),
    department: person.department,
    role: person.role,
    journeyScore,
    eventsCount: events.length,
    stats,
    events,
    topContributorThisYear: person.identityType === 'founder',
    permanentRecord: true,
  };
}

function buildInsights(timelines: PersonIdentityTimeline[]): IdentityTimelineInsight[] {
  const insights: IdentityTimelineInsight[] = [];
  const founder = timelines.find((t) => t.topContributorThisYear);
  const topByKnowledge = [...timelines].sort(
    (a, b) => b.stats.knowledgeAssetsPublished - a.stats.knowledgeAssetsPublished
  )[0];
  const topByMentorship = [...timelines].sort((a, b) => b.stats.mentorshipCount - a.stats.mentorshipCount)[0];

  if (topByMentorship && topByMentorship.stats.mentorshipCount > 0) {
    insights.push({
      id: 'insight-mentorship',
      insight: `You've mentored ${topByMentorship.stats.mentorshipCount} employees.`,
      personName: topByMentorship.displayName,
      category: 'mentorship',
      severity: 'celebration',
      recommendedAction: 'Recognize mentorship impact in Mission Control and Academy paths.',
    });
  }

  if (topByKnowledge && topByKnowledge.stats.knowledgeAssetsPublished > 0) {
    insights.push({
      id: 'insight-knowledge',
      insight: `You've published ${topByKnowledge.stats.knowledgeAssetsPublished} knowledge assets.`,
      personName: topByKnowledge.displayName,
      category: 'knowledge',
      severity: 'celebration',
      recommendedAction: 'Surface top knowledge assets in Wisdom Capture™ and Expert Marketplace™.',
    });
  }

  if (founder) {
    insights.push({
      id: 'insight-top-contributor',
      insight: 'This year you became the organization\'s top contributor.',
      personName: founder.displayName,
      category: 'recognition',
      severity: 'celebration',
      recommendedAction: 'Celebrate top contributor — preserve story in Identity Timeline™ permanently.',
    });
  }

  const growing = timelines.filter((t) => t.eventsCount >= 5 && !t.topContributorThisYear);
  if (growing.length) {
    insights.push({
      id: 'insight-growth',
      insight: `${growing.length} team members building permanent Identity Timelines™ — professional stories preserved.`,
      personName: 'Organization',
      category: 'growth',
      severity: 'info',
      recommendedAction: 'Encourage knowledge publishing to enrich individual timelines.',
    });
  }

  const recentMilestones = timelines.flatMap((t) =>
    t.events.filter((e) => e.eventType === 'company-milestone').map((e) => ({ person: t.displayName, event: e }))
  );
  if (recentMilestones.length) {
    insights.push({
      id: 'insight-milestone',
      insight: `${recentMilestones.length} company milestone(s) recorded across individual timelines.`,
      personName: recentMilestones[0]?.person ?? 'Team',
      category: 'milestone',
      severity: 'info',
      recommendedAction: 'Link company milestones to organizational memory and Legacy Vault™.',
    });
  }

  return insights;
}

function buildDomainStatuses(timelines: PersonIdentityTimeline[]): IdentityTimelineDomainStatus[] {
  const allEvents = timelines.flatMap((t) => t.events);
  const counts = {
    journey: allEvents.filter((e) =>
      ['joined-organization', 'first-login', 'department', 'company-milestone'].includes(e.eventType)
    ).length,
    learning: allEvents.filter((e) => e.eventType === 'training-completed').length,
    contributions: allEvents.filter((e) =>
      ['knowledge-published', 'profession-brain-contribution'].includes(e.eventType)
    ).length,
    leadership: allEvents.filter((e) =>
      ['mentorship', 'leadership-role', 'promotion', 'award'].includes(e.eventType)
    ).length,
    marketplace: allEvents.filter((e) =>
      ['marketplace-contribution', 'expert-session'].includes(e.eventType)
    ).length,
    milestones: allEvents.filter((e) => e.eventType === 'company-milestone').length,
  };

  const scores: Record<(typeof IDENTITY_TIMELINE_DOMAINS)[number], { count: number; score: number; summary: string }> = {
    journey: {
      count: counts.journey,
      score: Math.min(96, 40 + counts.journey * 3),
      summary: `${counts.journey} journey events — joined, login, departments, and milestones permanently recorded.`,
    },
    learning: {
      count: counts.learning,
      score: Math.min(92, 45 + counts.learning * 8),
      summary: `${counts.learning} training completions preserved in Identity Timeline™.`,
    },
    contributions: {
      count: counts.contributions,
      score: Math.min(98, 35 + counts.contributions * 2),
      summary: `${counts.contributions} knowledge and Profession Brain™ contributions — individual legacy preserved.`,
    },
    leadership: {
      count: counts.leadership,
      score: Math.min(94, 40 + counts.leadership * 4),
      summary: `${counts.leadership} leadership, mentorship, promotion, and award events.`,
    },
    marketplace: {
      count: counts.marketplace,
      score: Math.min(90, 42 + counts.marketplace * 6),
      summary: `${counts.marketplace} marketplace and expert session records.`,
    },
    milestones: {
      count: counts.milestones,
      score: Math.min(88, 50 + counts.milestones * 10),
      summary: `${counts.milestones} company milestones woven into individual professional stories.`,
    },
  };

  return IDENTITY_TIMELINE_DOMAINS.map((domain) => ({
    domain,
    label: IDENTITY_TIMELINE_DOMAIN_LABELS[domain],
    score: scores[domain].score,
    count: scores[domain].count,
    summary: scores[domain].summary,
  }));
}

export function computeTimelineScore(domains: IdentityTimelineDomainStatus[], timelines: PersonIdentityTimeline[]): number {
  const avgDomain = domains.reduce((s, d) => s + d.score, 0) / Math.max(1, domains.length);
  const avgJourney = timelines.reduce((s, t) => s + t.journeyScore, 0) / Math.max(1, timelines.length);
  return Math.min(98, Math.round(avgDomain * 0.55 + avgJourney * 0.45));
}

export function buildDockTimelineLine(profile: OrganizationIdentityTimelineProfile): string {
  return `${profile.peopleWithTimelines} permanent timelines · ${profile.totalEvents} events · ${profile.knowledgeAssetsTotal} knowledge assets — every professional story preserved.`;
}

export function buildOrganizationIdentityTimelineProfile(organizationId: string): OrganizationIdentityTimelineProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const identity = getOrganizationIdentityGraphProfile(organizationId);
  const profProfiles = getOrganizationProfessionalProfilesProfile(organizationId);
  const institute = getOrganizationStudioInstituteProfile(organizationId);
  const marketplace = getOrganizationExpertMarketplaceProfile(organizationId);
  const wisdom = getOrganizationWisdomProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();

  const people = identity?.people ?? [];
  const timelines = people.map((person, index) =>
    buildPersonTimeline(organizationId, person, index, companyName, profProfiles, brain, institute, marketplace, wisdom)
  );

  const insights = buildInsights(timelines);
  const domainStatuses = buildDomainStatuses(timelines);
  const topContributor = timelines.find((t) => t.topContributorThisYear) ?? timelines[0];

  const registry: OrganizationIdentityTimelineProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    timelineScore: 0,
    peopleWithTimelines: timelines.length,
    totalEvents: timelines.reduce((s, t) => s + t.eventsCount, 0),
    permanentRecords: timelines.length,
    topContributorName: topContributor?.displayName ?? 'Founder',
    mentorshipTotal: timelines.reduce((s, t) => s + t.stats.mentorshipCount, 0),
    knowledgeAssetsTotal: timelines.reduce((s, t) => s + t.stats.knowledgeAssetsPublished, 0),
    timelines,
    insights,
    domainStatuses,
    selectedPersonId: timelines.find((t) => t.personId.includes('founder'))?.personId ?? timelines[0]?.personId ?? null,
    dockTimelineLine: '',
    preservesIndividualStory: true,
    syncedSources: [
      'identity-graph',
      'professional-profile',
      'profession-brain',
      'wisdom-capture',
      'expert-marketplace',
      'studio-institute',
    ],
    lastSyncedAt: now,
  };

  registry.timelineScore = computeTimelineScore(domainStatuses, timelines);
  registry.dockTimelineLine = buildDockTimelineLine(registry);
  return registry;
}

export function summarizeIdentityTimeline(profile: OrganizationIdentityTimelineProfile): string {
  return [
    profile.dockTimelineLine,
    `${profile.peopleWithTimelines} people · ${profile.mentorshipTotal} mentorship records · top contributor: ${profile.topContributorName}.`,
    'Identity Timeline™ — preserve the professional story of every individual.',
  ].join(' ');
}

export function getSelectedTimeline(profile: OrganizationIdentityTimelineProfile): PersonIdentityTimeline | null {
  return profile.timelines.find((t) => t.personId === profile.selectedPersonId) ?? profile.timelines[0] ?? null;
}

export function explainTimelineEvent(eventId: string, profile: OrganizationIdentityTimelineProfile): string | null {
  for (const timeline of profile.timelines) {
    const evt = timeline.events.find((e) => e.id === eventId);
    if (evt) {
      return [
        `${timeline.displayName} — ${evt.eventTypeLabel}`,
        evt.title,
        evt.description,
        `Impact ${evt.impactScore}% · ${new Date(evt.occurredAt).toLocaleDateString()}`,
        'Permanent Identity Timeline™ record',
      ].join(' · ');
    }
  }
  return null;
}

export function explainPersonTimeline(personId: string, profile: OrganizationIdentityTimelineProfile): string | null {
  const timeline = profile.timelines.find((t) => t.personId === personId);
  if (!timeline) return null;
  return [
    `${timeline.displayName} — ${timeline.role}`,
    `${timeline.eventsCount} permanent events · journey score ${timeline.journeyScore}%`,
    `Mentored ${timeline.stats.mentorshipCount} · Published ${timeline.stats.knowledgeAssetsPublished} knowledge assets`,
    timeline.topContributorThisYear ? 'Top contributor this year' : '',
    timeline.events[0] ? `Latest: ${timeline.events[0].title}` : '',
  ]
    .filter(Boolean)
    .join(' · ');
}
