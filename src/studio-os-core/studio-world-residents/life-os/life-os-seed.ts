import { getResidentById } from '../registry';
import type { ResidentId } from '../types';
import { RESIDENT_LIFE_OS_VERSION, STUDIO_WORLD_DEFAULT_ORG_SLUG, STUDIO_WORLD_DEFAULT_WORLD_ID } from './constants';
import type { ResidentLifeEventEnvelope } from './event-envelope';
import type {
  ApproachProfile,
  PersonalityDecisionWeights,
  ResidentAutonomyProfile,
  ResidentCareerSnapshot,
  ResidentCurrentState,
  ResidentGoalStack,
  ResidentHomeRef,
  ResidentLifeRhythm,
  ResidentNeedSnapshot,
  ResidentWorkNow,
} from './life-twin-model';

const SEED_TIME = '2026-10-02T18:00:00.000Z';

const LOCATIONS: Record<string, { id: string; label: string }> = {
  creative_floor: { id: 'loc-creative-floor', label: 'Creative Direction Floor' },
  systems_nook: { id: 'loc-systems-nook', label: 'Systems Nook' },
  front_desk: { id: 'loc-front-desk', label: 'Front Desk / Concierge' },
  world_lab: { id: 'loc-world-lab', label: 'World Lab' },
  fab_lab: { id: 'loc-fab-lab', label: 'Fabrication Lab' },
  casting_suite: { id: 'loc-casting-suite', label: 'Casting Suite' },
  strategy_room: { id: 'loc-strategy-room', label: 'Strategy Room' },
  tenancy_office: { id: 'loc-tenancy', label: 'Tenancy Office' },
};

type SeedBundle = {
  current: ResidentCurrentState;
  needs: ResidentNeedSnapshot;
  approach: ApproachProfile;
  weights: PersonalityDecisionWeights;
  autonomy: ResidentAutonomyProfile;
  career: ResidentCareerSnapshot;
  workNow: ResidentWorkNow;
  goals: ResidentGoalStack;
  rhythm: ResidentLifeRhythm;
  home: ResidentHomeRef;
};

function weightsFor(id: ResidentId): PersonalityDecisionWeights {
  const map: Partial<Record<ResidentId, Partial<PersonalityDecisionWeights>>> = {
    'SW-RESIDENT-001': { detailOrientation: 0.92, founderCandor: 0.7, spectacleAppetite: 0.35 },
    'SW-RESIDENT-002': { detailOrientation: 0.78, socialInitiative: 0.45, riskTolerance: 0.55 },
    'SW-RESIDENT-003': { socialInitiative: 0.9, conflictAvoidance: 0.4, spectacleAppetite: 0.5 },
    'SW-RESIDENT-004': { detailOrientation: 0.95, socialInitiative: 0.25, conflictAvoidance: 0.65 },
    'SW-RESIDENT-005': { spectacleAppetite: 0.95, riskTolerance: 0.75, detailOrientation: 0.5 },
    'SW-RESIDENT-006': { detailOrientation: 0.88, socialInitiative: 0.35, autonomyPreference: 0.7 },
    'SW-RESIDENT-007': { socialInitiative: 0.85, founderCandor: 0.65, conflictAvoidance: 0.35 },
    'SW-RESIDENT-008': { riskTolerance: 0.7, spectacleAppetite: 0.6, founderCandor: 0.55 },
  };
  const w = map[id] ?? {};
  return {
    residentId: id,
    riskTolerance: w.riskTolerance ?? 0.5,
    conflictAvoidance: w.conflictAvoidance ?? 0.5,
    founderCandor: w.founderCandor ?? 0.5,
    socialInitiative: w.socialInitiative ?? 0.5,
    detailOrientation: w.detailOrientation ?? 0.5,
    spectacleAppetite: w.spectacleAppetite ?? 0.4,
    autonomyPreference: w.autonomyPreference ?? 0.55,
  };
}

function bundleFor(id: ResidentId): SeedBundle {
  const resident = getResidentById(id);
  if (!resident) throw new Error(`Missing season1 resident ${id}`);
  const dept = resident.worldDepartment ?? 'Studio World';
  const locKey =
    id === 'SW-RESIDENT-001'
      ? 'creative_floor'
      : id === 'SW-RESIDENT-002'
        ? 'strategy_room'
        : id === 'SW-RESIDENT-003'
          ? 'front_desk'
          : id === 'SW-RESIDENT-004'
            ? 'systems_nook'
            : id === 'SW-RESIDENT-005'
              ? 'world_lab'
              : id === 'SW-RESIDENT-006'
                ? 'fab_lab'
                : id === 'SW-RESIDENT-007'
                  ? 'casting_suite'
                  : 'tenancy_office';
  const loc = LOCATIONS[locKey]!;

  const presence =
    id === 'SW-RESIDENT-003'
      ? 'SOCIAL'
      : id === 'SW-RESIDENT-004'
        ? 'FOCUSED'
        : id === 'SW-RESIDENT-001'
          ? 'FOCUSED'
          : 'AVAILABLE';

  const activity =
    id === 'SW-RESIDENT-001'
      ? 'Reviewing campaign direction notes — self-initiated'
      : id === 'SW-RESIDENT-004'
        ? 'Unblocking delivery pipeline checklist'
        : id === 'SW-RESIDENT-003'
          ? 'Routing internal visitor + updating office pulse'
          : `${dept} — active work block`;

  return {
    current: {
      residentId: id,
      presence,
      locationId: loc.id,
      locationLabel: loc.label,
      movementState: 'STATIONARY',
      activity,
      currentIntent: 'Advance assigned work without waiting for founder prompt',
      nearbyResidentIds: id === 'SW-RESIDENT-003' ? ['SW-RESIDENT-002'] : [],
      blockers: id === 'SW-RESIDENT-005' ? ['Waiting on asset lock from fabrication'] : [],
      availability: presence === 'FOCUSED' ? 'LIMITED' : 'OPEN',
      updatedAt: SEED_TIME,
    },
    needs: {
      residentId: id,
      levels: {
        ENERGY: 3,
        FOCUS: presence === 'FOCUSED' ? 4 : 3,
        PURPOSE: 4,
        AUTONOMY: 3,
        RECOGNITION: id === 'SW-RESIDENT-001' ? 2 : 3,
      },
      emotional: { CALM: 3, CONFIDENCE: 3, PRESSURE: id === 'SW-RESIDENT-004' ? 2 : 2 },
      causes: [
        {
          causeType: 'TIME',
          summary: 'Mid workday rhythm — not idle default',
          at: SEED_TIME,
        },
        {
          causeType: 'WORKLOAD',
          summary: 'Active project commitments on calendar',
          at: SEED_TIME,
        },
      ],
      updatedAt: SEED_TIME,
    },
    approach: {
      residentId: id,
      whenApproachFounder: id === 'SW-RESIDENT-004' ? ['When logic breaks or scope is ambiguous'] : ['When stakes exceed role authority'],
      howApproach: id === 'SW-RESIDENT-003' ? 'Warm, contextual, often with a social preamble' : 'Direct with prepared context',
      contextPrepared: id === 'SW-RESIDENT-004' ? 'extensive' : id === 'SW-RESIDENT-003' ? 'moderate' : 'moderate',
      preferPrivate: id === 'SW-RESIDENT-001' || id === 'SW-RESIDENT-004',
      solveFirstReportLater: id === 'SW-RESIDENT-004' || id === 'SW-RESIDENT-002',
      askBeforeActing: id === 'SW-RESIDENT-001' || id === 'SW-RESIDENT-008',
      escalationStyle: id === 'SW-RESIDENT-004' ? 'Minimal words, high signal' : 'Relationship-aware',
      whenUncertain: 'Gather one more data point before committing',
      whenMistake: 'Own it quickly with a fix plan',
      whenExcited: id === 'SW-RESIDENT-005' ? 'Becomes theatrical — still actionable' : 'Channels into proposal',
      whenWorried: id === 'SW-RESIDENT-003' ? 'Seeks ally first' : 'Escalates or narrows scope',
    },
    weights: weightsFor(id),
    autonomy: {
      residentId: id,
      level: id === 'SW-RESIDENT-001' || id === 'SW-RESIDENT-004' ? 'HIGH' : 'ROLE_BOUND',
      allowedVerbs: ['OBSERVE', 'INTERPRET', 'INITIATE', 'PROPOSE', 'COLLABORATE', 'DELEGATE', 'EXECUTE', 'ESCALATE'],
      founderGatedCategories: ['SPEND_MONEY', 'PUBLIC_PUBLISH', 'HIRE_HUMAN', 'EXTERNAL_CONTRACT'],
    },
    career: {
      residentId: id,
      careerState: 'ESTABLISHED',
      title: resident.coreWorldRole.split('/')[0]?.trim() ?? resident.coreWorldRole,
      department: dept,
      scopeSummary: resident.coreWorldRole,
      employmentActive: true,
    },
    workNow: {
      residentId: id,
      currentActivity: activity,
      activeProjectIds: ['proj-studio-world-s1'],
      waitingOn: id === 'SW-RESIDENT-005' ? ['Fabrication lock'] : [],
      delegatedOut: id === 'SW-RESIDENT-001' ? ['Creative review → Marlowe'] : [],
      selfInitiated: id === 'SW-RESIDENT-001' ? ['Campaign direction refinement'] : [],
      completedToday: id === 'SW-RESIDENT-004' ? ['Resolved two internal blockers (simulated seed)'] : [],
      founderBlockers: [],
      teamBlockers: [],
    },
    goals: {
      residentId: id,
      aspirations: [`Grow ${dept} influence without diluting canon`],
      mediumGoals: ['Ship next Studio World milestone with team'],
      currentWants: ['Clear authority on in-scope decisions'],
      fears: ['Unearned scope creep', 'Weak taste masquerading as boldness'],
      personalObjectives:
        id === 'SW-RESIDENT-006'
          ? ['Perfect fabrication method for Season 1 cast']
          : id === 'SW-RESIDENT-008'
            ? ['Expand tenancy pipeline']
            : ['Raise creative standard for next launch'],
    },
    rhythm: {
      residentId: id,
      coreObligations: ['Core department hours', 'Team sync as needed'],
      preferredRoutes: [loc.label],
      optionalStops: id === 'SW-RESIDENT-003' ? ['Front desk social orbit'] : [],
      socialDependencies: id === 'SW-RESIDENT-003' ? ['Office pulse check-ins'] : [],
      varianceNotes: 'Life rhythm — not rigid scripted loop',
    },
    home: {
      residentId: id,
      homeId: `home-${id.toLowerCase()}`,
      label: `${resident.displayName} — private residence (schema)`,
      publicRooms: ['entry'],
      privateRooms: ['bedroom', 'study'],
      meaningfulObjectIds: [],
    },
  };
}

export function buildSeason1LifeOsSeed(): {
  version: string;
  worldId: string;
  organizationId: string;
  bundles: Map<ResidentId, SeedBundle>;
  seedEvents: ResidentLifeEventEnvelope[];
} {
  const bundles = new Map<ResidentId, SeedBundle>();
  for (const id of [
    'SW-RESIDENT-001',
    'SW-RESIDENT-002',
    'SW-RESIDENT-003',
    'SW-RESIDENT-004',
    'SW-RESIDENT-005',
    'SW-RESIDENT-006',
    'SW-RESIDENT-007',
    'SW-RESIDENT-008',
  ] as ResidentId[]) {
    bundles.set(id, bundleFor(id));
  }

  const seedEvents: ResidentLifeEventEnvelope[] = [
    {
      eventId: 'evt-seed-noa-blockers',
      eventType: 'WORK_DELEGATED',
      timestamp: SEED_TIME,
      worldId: STUDIO_WORLD_DEFAULT_WORLD_ID,
      organizationId: STUDIO_WORLD_DEFAULT_ORG_SLUG,
      residentIds: ['SW-RESIDENT-004'],
      visibility: 'OFFICE_KNOWN',
      source: 'simulation',
      payload: { summary: 'Resolved two internal blockers', selfInitiated: true },
      truthStatus: 'AUTHORITATIVE',
      canonVersion: RESIDENT_LIFE_OS_VERSION,
    },
    {
      eventId: 'evt-seed-etta-direction',
      eventType: 'ACTIVITY_STARTED',
      timestamp: SEED_TIME,
      worldId: STUDIO_WORLD_DEFAULT_WORLD_ID,
      organizationId: STUDIO_WORLD_DEFAULT_ORG_SLUG,
      residentIds: ['SW-RESIDENT-001'],
      visibility: 'TEAM_ONLY',
      source: 'simulation',
      payload: { summary: 'Self-initiated campaign direction refinement' },
      truthStatus: 'AUTHORITATIVE',
      canonVersion: RESIDENT_LIFE_OS_VERSION,
    },
  ];

  return {
    version: RESIDENT_LIFE_OS_VERSION,
    worldId: STUDIO_WORLD_DEFAULT_WORLD_ID,
    organizationId: STUDIO_WORLD_DEFAULT_ORG_SLUG,
    bundles,
    seedEvents,
  };
}
