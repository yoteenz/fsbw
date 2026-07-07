import { getOrganizationExpertMarketplaceProfile } from '../expert-marketplace/store';
import { getOrganizationIdentityGraphProfile } from '../identity-graph/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { getOrganizationStudioInstituteProfile } from '../studio-institute/org-store';
import { getOrganizationWisdomProfile } from '../wisdom-capture/store';
import {
  PROFILE_DOMAIN_LABELS,
  PROFILE_DOMAINS,
  TIMELINE_EVENT_LABELS,
} from './constants';
import type {
  AcademyProgressEntry,
  LivingProfessionalProfile,
  OrganizationProfessionalProfilesProfile,
  ProfessionalTimelineEvent,
  ProfileDomainStatus,
  TimelineEventType,
} from './types';

function profileId(orgId: string, personId: string): string {
  return `pro-${orgId}-${personId.replace(`identity-${orgId}-`, '')}`;
}

function monthsAgo(n: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d.toISOString();
}

function buildTimelineForFounder(
  organizationId: string,
  companyName: string,
  brainProfile: ReturnType<typeof getOrganizationProfessionBrainProfile>,
  institute: ReturnType<typeof getOrganizationStudioInstituteProfile>,
  marketplace: ReturnType<typeof getOrganizationExpertMarketplaceProfile>
): ProfessionalTimelineEvent[] {
  const events: ProfessionalTimelineEvent[] = [
    {
      id: `tl-${organizationId}-founded`,
      eventType: 'business-founded',
      eventTypeLabel: TIMELINE_EVENT_LABELS['business-founded'],
      title: `Founded ${companyName}`,
      description: 'Organizational legacy begins — expertise preservation mission activated.',
      occurredAt: monthsAgo(36),
      impactScore: 98,
    },
    {
      id: `tl-${organizationId}-leadership`,
      eventType: 'leadership-role',
      eventTypeLabel: TIMELINE_EVENT_LABELS['leadership-role'],
      title: 'Founder & CEO',
      description: 'Executive leadership — vision, judgment, and organizational trust stewardship.',
      occurredAt: monthsAgo(36),
      impactScore: 95,
    },
  ];

  for (const [i, brain] of (brainProfile?.brains ?? []).entries()) {
    events.push({
      id: `tl-${organizationId}-brain-${brain.id}`,
      eventType: 'profession-brain-created',
      eventTypeLabel: TIMELINE_EVENT_LABELS['profession-brain-created'],
      title: `Profession Brain™ — ${brain.label}`,
      description: `${brain.label} institutional intelligence encoded — ${brain.knowledgeEntries.length} knowledge entries.`,
      occurredAt: monthsAgo(24 - i * 4),
      impactScore: 80 + i * 3,
    });
  }

  for (const cert of institute?.certifications?.filter((c) => c.status === 'earned').slice(0, 3) ?? []) {
    events.push({
      id: `tl-${organizationId}-cert-${cert.id}`,
      eventType: 'certification',
      eventTypeLabel: TIMELINE_EVENT_LABELS.certification,
      title: cert.name,
      description: cert.requirement,
      occurredAt: monthsAgo(12),
      impactScore: 75,
    });
  }

  for (const listing of marketplace?.listings?.filter((l) => l.profile.published).slice(0, 2) ?? []) {
    events.push({
      id: `tl-${organizationId}-mp-${listing.profile.id}`,
      eventType: 'marketplace-product-published',
      eventTypeLabel: TIMELINE_EVENT_LABELS['marketplace-product-published'],
      title: `Published — ${listing.profile.expertName}`,
      description: listing.profile.specialties.join(' · '),
      occurredAt: monthsAgo(6),
      impactScore: 82,
    });
  }

  events.push({
    id: `tl-${organizationId}-skill-studio`,
    eventType: 'skill-learned',
    eventTypeLabel: TIMELINE_EVENT_LABELS['skill-learned'],
    title: 'Organizational Intelligence Architecture',
    description: 'Mastered Studio OS governance, Profession Brain™ stewardship, and executive systems.',
    occurredAt: monthsAgo(8),
    impactScore: 88,
  });

  return events.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
}

function buildTimelineForEmployee(
  organizationId: string,
  displayName: string,
  role: string,
  department: string,
  index: number
): ProfessionalTimelineEvent[] {
  return [
    {
      id: `tl-${organizationId}-emp-${index}-join`,
      eventType: 'promotion',
      eventTypeLabel: TIMELINE_EVENT_LABELS.promotion,
      title: `Joined as ${role}`,
      description: `${displayName} assumed ${role} responsibilities in ${department}.`,
      occurredAt: monthsAgo(18 + index * 2),
      impactScore: 70,
    },
    {
      id: `tl-${organizationId}-emp-${index}-project`,
      eventType: 'project',
      eventTypeLabel: TIMELINE_EVENT_LABELS.project,
      title: `${department} initiative`,
      description: `Led cross-functional delivery — ${displayName} expanded organizational capability.`,
      occurredAt: monthsAgo(10 + index),
      impactScore: 65 + index * 2,
    },
    {
      id: `tl-${organizationId}-emp-${index}-skill`,
      eventType: 'skill-learned',
      eventTypeLabel: TIMELINE_EVENT_LABELS['skill-learned'],
      title: 'Studio OS operational fluency',
      description: 'Completed role training path — confident in organizational systems and workflows.',
      occurredAt: monthsAgo(6),
      impactScore: 60,
    },
  ];
}

function buildTimelineForExpert(
  organizationId: string,
  name: string,
  specialty: string
): ProfessionalTimelineEvent[] {
  return [
    {
      id: `tl-${organizationId}-expert-mp`,
      eventType: 'marketplace-product-published',
      eventTypeLabel: TIMELINE_EVENT_LABELS['marketplace-product-published'],
      title: `Expert Marketplace™ — ${specialty}`,
      description: `${name} published governed expertise to the marketplace.`,
      occurredAt: monthsAgo(9),
      impactScore: 78,
    },
    {
      id: `tl-${organizationId}-expert-cert`,
      eventType: 'certification',
      eventTypeLabel: TIMELINE_EVENT_LABELS.certification,
      title: `${specialty} certification`,
      description: 'Professional trust framework verified expertise credentials.',
      occurredAt: monthsAgo(14),
      impactScore: 72,
    },
  ];
}

function buildLivingProfileFromPerson(
  organizationId: string,
  person: NonNullable<ReturnType<typeof getOrganizationIdentityGraphProfile>>['people'][number],
  index: number,
  brainProfile: ReturnType<typeof getOrganizationProfessionBrainProfile>,
  institute: ReturnType<typeof getOrganizationStudioInstituteProfile>,
  marketplace: ReturnType<typeof getOrganizationExpertMarketplaceProfile>,
  wisdom: ReturnType<typeof getOrganizationWisdomProfile>
): LivingProfessionalProfile {
  const isFounder = person.identityType === 'founder';
  const isExpert = person.identityType === 'expert';
  const companyName = brainProfile?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();

  const professionBrains: LivingProfessionalProfile['professionBrains'] = (brainProfile?.brains ?? []).map((b) => ({
    brainId: b.id,
    label: b.label,
    maturityPct: b.maturityPct,
    knowledgeCount: b.knowledgeEntries.length,
    role: isFounder ? 'creator' : 'contributor',
  }));

  const academyProgress: AcademyProgressEntry[] = (institute?.certifications ?? []).slice(0, 4).map((c) => ({
    id: c.id,
    title: c.name,
    type: 'certification',
    progressPct: c.progressPct,
    status: c.status,
  }));

  for (const artifact of institute?.artifacts?.filter((a) => a.type === 'course').slice(0, 3) ?? []) {
    const brainMaturity = brainProfile?.brains.find((b) => b.id === artifact.brainId)?.maturityPct ?? 50;
    academyProgress.push({
      id: artifact.id,
      title: artifact.title,
      type: 'course',
      progressPct: Math.min(100, brainMaturity + 10),
      status: brainMaturity >= 80 ? 'earned' : 'in-progress',
    });
  }

  const timeline = isFounder
    ? buildTimelineForFounder(organizationId, companyName, brainProfile, institute, marketplace)
    : isExpert
      ? buildTimelineForExpert(organizationId, person.displayName, person.expertise[0] ?? 'Expert')
      : buildTimelineForEmployee(organizationId, person.displayName, person.role, person.department, index);

  const certifications = (institute?.certifications ?? []).slice(0, 5).map((c) => ({
    id: c.id,
    name: c.name,
    issuer: 'Studio Institute™',
    earnedAt: c.status === 'earned' ? monthsAgo(6) : monthsAgo(1),
    status: c.status,
  }));

  const portfolio: LivingProfessionalProfile['portfolio'] = [];
  for (const brain of professionBrains.slice(0, 3)) {
    portfolio.push({
      id: `port-brain-${brain.brainId}`,
      title: brain.label,
      type: 'brain',
      summary: `Profession Brain™ — ${brain.knowledgeCount} knowledge entries · ${brain.maturityPct}% maturity`,
    });
  }
  for (const listing of marketplace?.listings?.slice(0, 2) ?? []) {
    portfolio.push({
      id: `port-mp-${listing.profile.id}`,
      title: listing.profile.expertName,
      type: 'product',
      summary: listing.profile.specialties.join(' · '),
    });
  }

  const knowledgeContributions = [
    ...person.knowledgeContributions.map((k) => k.title),
    ...(wisdom?.wisdomLibrary?.slice(0, 2).map((w) => w.wisdom.slice(0, 80)) ?? []),
  ];

  const evolutionScore = Math.min(
    98,
    40 +
      timeline.length * 4 +
      professionBrains.length * 5 +
      certifications.filter((c) => c.status === 'earned').length * 6 +
      portfolio.length * 3
  );

  return {
    id: profileId(organizationId, person.id),
    personId: person.id,
    displayName: person.displayName,
    headline: isFounder
      ? `Founder building ${companyName} — preserving expertise into lasting legacy`
      : `${person.role} · ${person.department} — evolving professional identity`,
    careerSummary: person.personalSummary,
    currentRole: person.role,
    department: person.department,
    evolutionScore,
    timelineEventCount: timeline.length,
    experience: [
      {
        id: `exp-${person.id}-current`,
        title: person.role,
        organization: isFounder ? companyName : companyName,
        period: 'Present',
        summary: person.organizationSummary,
        highlights: person.responsibilities.slice(0, 3),
      },
      ...(isFounder
        ? [
            {
              id: `exp-${person.id}-prior`,
              title: 'Industry practitioner',
              organization: 'Prior experience',
              period: 'Earlier career',
              summary: 'Domain expertise accumulated before founding — judgment encoded into Profession Brain™.',
              highlights: person.expertise.slice(0, 3),
            },
          ]
        : []),
    ],
    skills: [...person.skills, ...person.expertise],
    certifications,
    professionBrains,
    projects: person.projects.map((p, i) => ({
      id: `proj-${person.id}-${i}`,
      title: p,
      period: 'Recent',
      outcome: `Delivered ${p} with measurable organizational impact.`,
      skillsApplied: person.skills.slice(0, 2),
    })),
    achievements: person.achievements.map((a) => a.title),
    learning: person.learningHistory.map((l) => l.title),
    coursesCompleted: academyProgress.filter((a) => a.status === 'earned').map((a) => a.title),
    academyProgress,
    knowledgeContributions,
    mentorship: isFounder
      ? [
          {
            id: `mentor-${person.id}`,
            role: 'mentor',
            counterpart: 'Executive team',
            focus: 'Organizational judgment and legacy preservation',
            since: monthsAgo(24),
          },
        ]
      : [],
    recommendations: isFounder
      ? [
          {
            id: `rec-${person.id}`,
            from: 'Executive Advisor',
            relationship: 'Advisory board',
            excerpt: 'Demonstrates rare combination of vision, operational discipline, and institutional memory stewardship.',
            receivedAt: monthsAgo(4),
          },
        ]
      : [],
    leadershipHistory: isFounder
      ? [
          {
            id: `lead-${person.id}`,
            title: 'Founder & CEO',
            scope: companyName,
            period: 'Present',
            impact: 'Built organizational intelligence platform — people and expertise first-class citizens.',
          },
        ]
      : person.identityType === 'employee'
        ? [
            {
              id: `lead-${person.id}`,
              title: `${person.department} contributor`,
              scope: person.department,
              period: 'Current role',
              impact: person.responsibilities[0] ?? 'Cross-functional delivery',
            },
          ]
        : [],
    portfolio,
    industries: brainProfile?.industryId ? [brainProfile.industryId, 'Organizational Intelligence'] : ['Organizational Intelligence'],
    languages: ['English'],
    communicationStyle: person.communicationPreferences,
    workPreferences: person.lifeCulturePreferences.map((l) => ({
      id: l.id,
      category: l.category,
      preference: l.preference,
    })),
    professionalTimeline: timeline,
    lastEvolvedAt: new Date().toISOString(),
    livingNotStatic: true,
  };
}

function buildDomainStatuses(profiles: LivingProfessionalProfile[]): ProfileDomainStatus[] {
  const totalExp = profiles.reduce((s, p) => s + p.experience.length, 0);
  const totalSkills = profiles.reduce((s, p) => s + p.skills.length, 0);
  const totalLearning = profiles.reduce((s, p) => s + p.academyProgress.length + p.coursesCompleted.length, 0);
  const totalLeadership = profiles.reduce((s, p) => s + p.leadershipHistory.length + p.mentorship.length, 0);
  const totalPortfolio = profiles.reduce((s, p) => s + p.portfolio.length + p.projects.length, 0);
  const totalBrains = profiles.reduce((s, p) => s + p.professionBrains.length, 0);

  const scores: Record<(typeof PROFILE_DOMAINS)[number], { count: number; score: number; summary: string }> = {
    experience: { count: totalExp, score: Math.min(96, 45 + totalExp * 5), summary: `${totalExp} experience entries across living profiles.` },
    skills: { count: totalSkills, score: Math.min(94, 50 + totalSkills * 2), summary: `${totalSkills} skills and certifications indexed — evolving continuously.` },
    learning: { count: totalLearning, score: Math.min(92, 40 + totalLearning * 4), summary: 'Academy progress and courses completed tracked per person.' },
    leadership: { count: totalLeadership, score: Math.min(90, 55 + totalLeadership * 5), summary: 'Leadership history and mentorship relationships preserved.' },
    portfolio: { count: totalPortfolio, score: Math.min(88, 45 + totalPortfolio * 3), summary: 'Projects and portfolio items — career evidence, not static resume bullets.' },
    marketplace: { count: totalBrains, score: Math.min(95, 50 + totalBrains * 8), summary: `${totalBrains} Profession Brains™ linked — expertise as living career assets.` },
  };

  return PROFILE_DOMAINS.map((domain) => ({
    domain,
    label: PROFILE_DOMAIN_LABELS[domain],
    score: scores[domain].score,
    count: scores[domain].count,
    summary: scores[domain].summary,
  }));
}

export function computeRegistryScore(domains: ProfileDomainStatus[], profiles: LivingProfessionalProfile[]): number {
  const avgEvolution = profiles.reduce((s, p) => s + p.evolutionScore, 0) / Math.max(1, profiles.length);
  const avgDomain = domains.reduce((s, d) => s + d.score, 0) / Math.max(1, domains.length);
  return Math.min(98, Math.round(avgEvolution * 0.55 + avgDomain * 0.45));
}

export function buildDockProfessionalLine(profile: OrganizationProfessionalProfilesProfile): string {
  const top = profile.profiles.find((p) => p.evolutionScore === Math.max(...profile.profiles.map((x) => x.evolutionScore)));
  if (top) {
    return `${profile.profilesCount} living profiles · ${profile.timelineEventsTotal} timeline events — ${top.displayName} evolution ${top.evolutionScore}%. Careers grow; resumes do not freeze.`;
  }
  return `${profile.profilesCount} professional profiles evolving — dynamic career identities, not static snapshots.`;
}

export function buildOrganizationProfessionalProfilesProfile(
  organizationId: string
): OrganizationProfessionalProfilesProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const identity = getOrganizationIdentityGraphProfile(organizationId);
  const institute = getOrganizationStudioInstituteProfile(organizationId);
  const marketplace = getOrganizationExpertMarketplaceProfile(organizationId);
  const wisdom = getOrganizationWisdomProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();

  const people = identity?.people ?? [];
  const livingProfiles = people.map((person, index) =>
    buildLivingProfileFromPerson(organizationId, person, index, brain, institute, marketplace, wisdom)
  );

  const domainStatuses = buildDomainStatuses(livingProfiles);
  const timelineEventsTotal = livingProfiles.reduce((s, p) => s + p.professionalTimeline.length, 0);
  const brainsLinked = livingProfiles.reduce((s, p) => s + p.professionBrains.length, 0);
  const certificationsEarned = livingProfiles.reduce(
    (s, p) => s + p.certifications.filter((c) => c.status === 'earned').length,
    0
  );

  const registry: OrganizationProfessionalProfilesProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    registryScore: 0,
    profilesCount: livingProfiles.length,
    timelineEventsTotal,
    brainsLinked,
    certificationsEarned,
    profiles: livingProfiles,
    domainStatuses,
    selectedProfileId: livingProfiles.find((p) => p.personId.includes('founder'))?.id ?? livingProfiles[0]?.id ?? null,
    dockProfessionalLine: '',
    dynamicNotFrozen: true,
    syncedSources: [
      'identity-graph',
      'profession-brain',
      'studio-institute',
      'expert-marketplace',
      'wisdom-capture',
    ],
    lastSyncedAt: now,
  };

  registry.registryScore = computeRegistryScore(domainStatuses, livingProfiles);
  registry.dockProfessionalLine = buildDockProfessionalLine(registry);
  return registry;
}

export function summarizeProfessionalProfiles(profile: OrganizationProfessionalProfilesProfile): string {
  return [
    profile.dockProfessionalLine,
    `${profile.profilesCount} profiles · ${profile.timelineEventsTotal} timeline events · ${profile.brainsLinked} Profession Brains™ · registry ${profile.registryScore}%.`,
    'Professional Profiles™ — dynamic career identities that evolve, not snapshots frozen in time.',
  ].join(' ');
}

export function getSelectedProfessionalProfile(profile: OrganizationProfessionalProfilesProfile) {
  return profile.profiles.find((p) => p.id === profile.selectedProfileId) ?? profile.profiles[0] ?? null;
}

export function timelineEventsByType(
  events: ProfessionalTimelineEvent[],
  eventType: TimelineEventType
): ProfessionalTimelineEvent[] {
  return events.filter((e) => e.eventType === eventType);
}
