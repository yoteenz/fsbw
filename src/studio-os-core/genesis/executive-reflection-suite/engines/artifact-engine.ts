import { readExecutiveReflectionSuiteStore, mutateExecutiveReflectionSuiteStore } from '../persistence';
import type { ErsDelightMoment, ErsVictoryArtifact, ErsLessonArtifact, ErsFailureStudy, ErsInnovationIdea } from '../types';
import type { ErsRoomPath } from '../constants';

function id(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const SEED_VICTORIES: Omit<ErsVictoryArtifact, 'artifactId'>[] = [
  {
    title: 'Live Validation System™ Phase 2',
    category: 'platform',
    narrative: 'Continuous invisible validation shipped — founder diary, escape velocity, Genesis learning.',
    impact: 'Studio OS learns while founders operate without feeling tested.',
    date: '2026-06-01T00:00:00.000Z',
    evidence: ['Architecture approved', 'Runtime implemented'],
  },
  {
    title: 'Evolution Room™ Monthly Heartbeat',
    category: 'architecture',
    narrative: 'Executive strategy chamber replaces dashboard retrospectives.',
    impact: 'Monthly founder + Studio OS co-evolution ritual established.',
    date: '2026-07-01T00:00:00.000Z',
    evidence: ['Orb Presentation Mode', '11-stage meeting flow'],
  },
  {
    title: 'Executive Reflection Suite™ Canon',
    category: 'milestone',
    narrative: 'Complete reflection wing architecture approved.',
    impact: 'Boardroom, Annual Summit, Victory Gallery, Lessons Library defined.',
    date: '2026-07-09T00:00:00.000Z',
    evidence: ['Genesis §9B.11', 'Suite wing doctrine'],
  },
];

const SEED_LESSONS: Omit<ErsLessonArtifact, 'lessonId'>[] = [
  {
    title: 'One room cannot carry all reflection',
    category: 'architecture',
    context: 'Evolution Room architecture review',
    whatHappened: 'Monthly room alone insufficient for daily/annual/constitutional reflection.',
    whatWorked: 'Multi-cadence Suite with dedicated rooms for each emotional need.',
    whatFailed: 'Treating Evolution Room as entire reflection product.',
    recommendation: 'Build Suite as parent wing; Evolution Room remains monthly chamber.',
    confidence: 0.92,
    recordedAt: '2026-07-09T00:00:00.000Z',
    relatedSystems: ['evolution-room', 'executive-reflection-suite'],
  },
  {
    title: 'Nothing auto-canonizes',
    category: 'architecture',
    context: 'Genesis Learning Loop',
    whatHappened: 'Validation insights attempted to flow directly to Genesis.',
    whatWorked: 'Proposal queue with founder review in Evolution Council.',
    whatFailed: 'Auto-modification of canonical architecture.',
    recommendation: 'Always draft proposals; founder approves in Boardroom or Council.',
    confidence: 0.98,
    recordedAt: '2026-06-15T00:00:00.000Z',
    relatedSystems: ['genesis', 'live-validation-system'],
  },
];

const SEED_FAILURES: Omit<ErsFailureStudy, 'studyId'>[] = [
  {
    title: 'Dashboard retrospective rejected',
    assumption: 'Founders want KPI panels for monthly review.',
    whatHappened: 'Architecture explicitly rejected analytics dashboard pattern.',
    lessonExtracted: 'Reflection must feel ceremonial and spatial, not like reporting software.',
    shameRemoved: true,
    recordedAt: '2026-07-01T00:00:00.000Z',
  },
];

const SEED_INNOVATION: Omit<ErsInnovationIdea, 'ideaId'>[] = [
  {
    title: 'Annual Summit cinematic transformation',
    problem: 'Year-end review feels administrative',
    opportunity: 'Headquarters transforms with lighting, music, guided journey',
    evidence: ['Founder psychology research', 'Luxury hospitality patterns'],
    confidence: 0.88,
    status: 'approved',
  },
  {
    title: 'Failure Laboratory shame-free protocol',
    problem: 'Founders avoid examining failures',
    opportunity: 'Neutral lab reframes failure as institutional material',
    evidence: ['Lessons Learned Library doctrine'],
    confidence: 0.9,
    status: 'researching',
  },
];

export function seedReflectionArtifacts(): void {
  const store = readExecutiveReflectionSuiteStore();
  if (store.victories.length > 0) return;

  mutateExecutiveReflectionSuiteStore((s) => ({
    ...s,
    victories: SEED_VICTORIES.map((v) => ({ ...v, artifactId: id('victory') })),
    lessons: SEED_LESSONS.map((l) => ({ ...l, lessonId: id('lesson') })),
    failureStudies: SEED_FAILURES.map((f) => ({ ...f, studyId: id('failure') })),
    innovationIdeas: SEED_INNOVATION.map((i) => ({ ...i, ideaId: id('innovation') })),
    delightMoments: [
      {
        momentId: id('delight'),
        roomPath: 'evolution-room' as ErsRoomPath,
        title: 'Orb Executive Greeting',
        emotionalTags: ['clarity', 'calm', 'prepared'],
        memorable: true,
        recordedAt: new Date().toISOString(),
      },
    ],
  }));
}

export function listVictories(): ErsVictoryArtifact[] {
  seedReflectionArtifacts();
  return readExecutiveReflectionSuiteStore().victories.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function listLessons(): ErsLessonArtifact[] {
  seedReflectionArtifacts();
  return readExecutiveReflectionSuiteStore().lessons;
}

export function listFailureStudies(): ErsFailureStudy[] {
  seedReflectionArtifacts();
  return readExecutiveReflectionSuiteStore().failureStudies;
}

export function listInnovationIdeas(): ErsInnovationIdea[] {
  seedReflectionArtifacts();
  return readExecutiveReflectionSuiteStore().innovationIdeas;
}

export function listDelightMoments(): ErsDelightMoment[] {
  seedReflectionArtifacts();
  return readExecutiveReflectionSuiteStore().delightMoments;
}

export function computeDelightScore(): number {
  const moments = listDelightMoments();
  if (moments.length === 0) return 0;
  const memorable = moments.filter((m) => m.memorable).length;
  return Math.round((memorable / moments.length) * 100);
}

export function recordDelightMoment(input: {
  roomPath: ErsRoomPath;
  title: string;
  emotionalTags: string[];
  memorable?: boolean;
}): ErsDelightMoment {
  const moment: ErsDelightMoment = {
    momentId: id('delight'),
    roomPath: input.roomPath,
    title: input.title,
    emotionalTags: input.emotionalTags,
    memorable: input.memorable ?? true,
    recordedAt: new Date().toISOString(),
  };
  mutateExecutiveReflectionSuiteStore((s) => ({
    ...s,
    delightMoments: [moment, ...s.delightMoments],
  }));
  return moment;
}
