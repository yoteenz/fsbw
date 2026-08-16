import { ROAD_READY_CATEGORIES } from '../road-ready/roadReadyConfig';
import {
  buildRoadReadyItems,
  createEmptyProfile,
  detectProfileChangeRequiresRecalc,
  mergeVerifiedItems,
} from '../road-ready/roadReadyRules';
import { computeRoadReadyScores } from '../road-ready/roadReadyScoring';
import { buildAttentionItems } from '../road-ready/roadReadyPriority';
import type {
  CategorySummary,
  PowerUnit,
  RoadReadyProfile,
  RoadReadyItem,
  Trailer,
  DriverPlaceholder,
} from '../road-ready/roadReadyTypes';
import { updateDemoStore, loadDemoStore } from './demoStore';
import type { DemoStore } from './demoTypes';
import { submitServiceRequest } from './demoActions';
import type { ServicePlanItem } from '../repositories/servicePlanRepository';

function uid(): string {
  return crypto.randomUUID();
}

export function getOrganizationId(store: DemoStore = loadDemoStore()): string {
  return store.portalClientId ?? store.clients[0]?.id ?? 'client-a';
}

export function getRoadReadyProfile(orgId: string, store: DemoStore = loadDemoStore()): RoadReadyProfile | undefined {
  return store.roadReadyProfiles.find((p) => p.organizationId === orgId);
}

export function getRoadReadyItems(orgId: string, store: DemoStore = loadDemoStore()): RoadReadyItem[] {
  return store.roadReadyItems.filter((i) => i.organizationId === orgId && i.applicable);
}

export function getFleetUnits(orgId: string, store: DemoStore = loadDemoStore()): PowerUnit[] {
  return store.powerUnits.filter((u) => u.organizationId === orgId);
}

export function getTrailers(orgId: string, store: DemoStore = loadDemoStore()): Trailer[] {
  return store.trailers.filter((t) => t.organizationId === orgId);
}

export function getRoadReadySummary(orgId: string) {
  const store = loadDemoStore();
  const client = store.clients.find((c) => c.id === orgId);
  if (client?.clientType === 'shipper') return null;

  const profile = getRoadReadyProfile(orgId, store);
  if (!profile) return null;

  const items = getRoadReadyItems(orgId, store);
  const scores = computeRoadReadyScores(items);
  const attention = buildAttentionItems(items);

  const categories: CategorySummary[] = ROAD_READY_CATEGORIES.filter((c) => c.id !== 'operate' as never).map((cat) => {
    const catItems = items.filter((i) => i.category === cat.id);
    const catScores = computeRoadReadyScores(catItems);
    return {
      category: cat.id as CategorySummary['category'],
      label: cat.label,
      setupProgress: catScores.setupProgress,
      verifiedCount: catScores.verifiedCount,
      attentionCount: catItems.filter((i) => i.status === 'action_needed' || i.status === 'needs_review').length,
      nextAction: catItems.find((i) => i.status === 'action_needed')?.title,
      items: catItems,
    };
  });

  return { profile, items, scores, attention, categories, client };
}

export function saveRoadReadyProfile(orgId: string, patch: Partial<RoadReadyProfile>): RoadReadyProfile {
  return updateDemoStore((s) => {
    let profile = s.roadReadyProfiles.find((p) => p.organizationId === orgId);
    const prevOperating = profile?.operating;
    if (!profile) {
      profile = createEmptyProfile(orgId);
      s.roadReadyProfiles.push(profile);
    }
    Object.assign(profile, patch, { updatedAt: new Date().toISOString(), lastCustomerUpdateAt: new Date().toISOString() });

    const units = s.powerUnits.filter((u) => u.organizationId === orgId);
    const rebuilt = buildRoadReadyItems(profile, units);
    const existing = s.roadReadyItems.filter((i) => i.organizationId === orgId);
    const merged = mergeVerifiedItems(existing, rebuilt);
    s.roadReadyItems = [...s.roadReadyItems.filter((i) => i.organizationId !== orgId), ...merged];

    if (prevOperating && patch.operating && detectProfileChangeRequiresRecalc(prevOperating, patch.operating)) {
      s.roadReadyHistory.unshift({
        id: uid(),
        organizationId: orgId,
        eventType: 'profile_changed',
        title: 'Your business profile changed',
        detail: 'Some Road Ready items may need to be reviewed based on your updated operating information.',
        visibility: 'customer',
        createdAt: new Date().toISOString(),
      });
    }

    const scores = computeRoadReadyScores(merged);
    const client = s.clients.find((c) => c.id === orgId);
    if (client) client.roadmapProgress = scores.setupProgress;

    s.activity.unshift({
      id: uid(),
      kind: 'ROAD_READY_UPDATED',
      title: 'Road Ready profile updated',
      clientId: orgId,
      createdAt: new Date().toISOString(),
      visibility: 'customer',
    });

    return s;
  }).roadReadyProfiles.find((p) => p.organizationId === orgId)!;
}

export function completeRoadReadyOnboarding(orgId: string): void {
  updateDemoStore((s) => {
    const profile = s.roadReadyProfiles.find((p) => p.organizationId === orgId);
    if (!profile) return s;
    profile.onboardingComplete = true;
    profile.onboardingStep = 10;
    profile.mode = 'active';
    profile.updatedAt = new Date().toISOString();

    const units = s.powerUnits.filter((u) => u.organizationId === orgId);
    const rebuilt = buildRoadReadyItems(profile, units);
    s.roadReadyItems = [...s.roadReadyItems.filter((i) => i.organizationId !== orgId), ...rebuilt];

    s.roadReadyHistory.unshift({
      id: uid(),
      organizationId: orgId,
      eventType: 'profile_created',
      title: 'Road Ready profile created',
      visibility: 'customer',
      createdAt: new Date().toISOString(),
    });
    return s;
  });
}

export function skipRoadReadyOnboarding(orgId: string): void {
  saveRoadReadyProfile(orgId, { onboardingSkipped: true });
}

export function addPowerUnit(orgId: string, unit: Omit<PowerUnit, 'id' | 'organizationId'>): PowerUnit {
  return updateDemoStore((s) => {
    const u: PowerUnit = { ...unit, id: uid(), organizationId: orgId };
    s.powerUnits.push(u);
    const profile = s.roadReadyProfiles.find((p) => p.organizationId === orgId);
    if (profile) {
      const rebuilt = buildRoadReadyItems(profile, s.powerUnits.filter((x) => x.organizationId === orgId));
      s.roadReadyItems = [...s.roadReadyItems.filter((i) => i.organizationId !== orgId), ...mergeVerifiedItems(s.roadReadyItems.filter((i) => i.organizationId === orgId), rebuilt)];
    }
    return s;
  }).powerUnits.find((u) => u.organizationId === orgId && u.nickname === unit.nickname)!;
}

export function verifyRoadReadyItem(
  itemId: string,
  staffId: string,
  staffName: string,
  verification: 'verified' | 'rejected' | 'pending_review',
  note?: string,
): void {
  updateDemoStore((s) => {
    const item = s.roadReadyItems.find((i) => i.id === itemId);
    if (!item) return s;
    const prev = item.verificationStatus;
    item.verificationStatus = verification;
    if (verification === 'verified') {
      item.status = 'completed';
      item.verifiedAt = new Date().toISOString();
      item.verifiedByStaffId = staffId;
      item.source = 'staff_verified';
    }
    item.updatedAt = new Date().toISOString();

    s.roadReadyVerifications.push({
      id: uid(),
      organizationId: item.organizationId,
      itemId: item.id,
      staffId,
      staffName,
      previousVerification: prev,
      newVerification: verification,
      note,
      createdAt: new Date().toISOString(),
      visibility: verification === 'verified' ? 'customer' : 'internal',
    });

    if (verification === 'verified') {
      s.roadReadyHistory.unshift({
        id: uid(),
        organizationId: item.organizationId,
        eventType: 'verified',
        title: `${item.title} verified by All In One`,
        visibility: 'customer',
        createdAt: new Date().toISOString(),
      });
    }

    s.activity.unshift({
      id: uid(),
      kind: 'ROAD_READY_VERIFIED',
      title: `${item.title} → ${verification}`,
      clientId: item.organizationId,
      staffId,
      createdAt: new Date().toISOString(),
      visibility: 'internal',
    });

    return s;
  });
}

export function requestHelpFromRoadReady(orgId: string, item: RoadReadyItem): string {
  const store = loadDemoStore();
  const planItem: ServicePlanItem = {
    slug: item.serviceSlug ?? item.requirementKey,
    title: item.title,
    division: item.category === 'tax_fuel' || item.category === 'registration' || item.category === 'authority' ? 'permitting' : item.category === 'insurance' ? 'insurance' : 'permitting',
    addedAt: new Date().toISOString(),
    reason: item.reason,
    fromRoadmap: true,
  };

  const req = submitServiceRequest({
    services: [planItem],
    intake: store.intake,
    roadmap: store.roadmap,
    notes: `Road Ready assistance request for: ${item.title}`,
  });

  updateDemoStore((s) => {
    const ri = s.roadReadyItems.find((i) => i.id === item.id);
    if (ri) {
      ri.status = 'in_progress';
      ri.serviceRequestId = req.id;
      ri.source = 'service_request';
    }
    s.roadReadyHistory.unshift({
      id: uid(),
      organizationId: orgId,
      eventType: 'service_started',
      title: `Service request started — ${item.title}`,
      detail: req.requestNumber,
      visibility: 'customer',
      createdAt: new Date().toISOString(),
    });
    return s;
  });

  return req.id;
}

export function syncExpirationDeadlines(orgId: string): void {
  updateDemoStore((s) => {
    const items = s.roadReadyItems.filter((i) => i.organizationId === orgId && i.expiresAt);
    for (const item of items) {
      const exists = s.deadlines.some((d) => d.roadReadyItemId === item.id);
      if (!exists && item.expiresAt) {
        s.deadlines.push({
          id: uid(),
          label: `${item.title} expiration`,
          clientId: orgId,
          dueDate: item.expiresAt.slice(0, 10),
          severity: 'upcoming',
          category: item.category,
          complete: false,
          roadReadyItemId: item.id,
          source: 'road_ready',
          verified: item.verificationStatus === 'verified',
        });
      }
    }
    return s;
  });
}

export function setOnboardingStep(orgId: string, step: number): void {
  saveRoadReadyProfile(orgId, { onboardingStep: step, mode: 'onboarding' });
}

export function addTrailer(orgId: string, trailer: Omit<Trailer, 'id' | 'organizationId'>): Trailer {
  return updateDemoStore((s) => {
    const t: Trailer = { ...trailer, id: uid(), organizationId: orgId };
    s.trailers.push(t);
    return s;
  }).trailers.find((x) => x.organizationId === orgId && x.number === trailer.number)!;
}

export function addDriver(orgId: string, driver: Omit<DriverPlaceholder, 'id' | 'organizationId'>): DriverPlaceholder {
  return updateDemoStore((s) => {
    const d = { ...driver, id: uid(), organizationId: orgId };
    s.drivers.push(d);
    return s;
  }).drivers.find((x) => x.organizationId === orgId && x.name === driver.name)!;
}

export function getOfficeRoadReadyQueue(store: DemoStore = loadDemoStore()) {
  return store.clients
    .filter((c) => c.clientType !== 'shipper')
    .map((client) => {
      const summary = getRoadReadySummary(client.id);
      if (!summary) return null;
      const needsReview = summary.items.filter(
        (i) => i.status === 'needs_review' || i.verificationStatus === 'pending_review',
      ).length;
      const expiring = summary.items.filter((i) => i.expiresAt).length;
      const incomplete = !summary.profile.onboardingComplete;
      return {
        client,
        setupProgress: summary.scores.setupProgress,
        verifiedProgress: summary.scores.verifiedProgress,
        needsReview,
        expiring,
        actionNeeded: summary.scores.needsAttentionCount,
        openRequests: store.requests.filter((r) => r.clientId === client.id && r.status !== 'completed').length,
        assignedStaffId: client.assignedStaffId,
        lastUpdated: summary.profile.lastCustomerUpdateAt ?? summary.profile.updatedAt,
        incompleteOnboarding: incomplete,
        onboardingProgress: incomplete
          ? Math.round((summary.profile.onboardingStep / 10) * 100)
          : 100,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x != null);
}
