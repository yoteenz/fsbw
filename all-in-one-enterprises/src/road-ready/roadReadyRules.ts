import { REQUIREMENT_DEFINITIONS, ROAD_READY_RULE_VERSION } from './roadReadyConfig';
import { evaluateRoadReadyApplicability } from '../services/catalog/roadReadyApplicability';
import type {
  OperatingProfile,
  RoadReadyItem,
  RoadReadyProfile,
  VerificationStatus,
  YesNoProgress,
  RoadReadyItemStatus,
  PowerUnit,
} from './roadReadyTypes';

function uid(): string {
  return crypto.randomUUID();
}

function mapYesNoToStatus(val?: YesNoProgress): { status: RoadReadyItemStatus; verification: VerificationStatus } {
  switch (val) {
    case 'yes':
      return { status: 'completed', verification: 'self_reported' };
    case 'in_progress':
      return { status: 'in_progress', verification: 'unverified' };
    case 'not_sure':
      return { status: 'needs_review', verification: 'pending_review' };
    case 'no':
      return { status: 'action_needed', verification: 'unverified' };
    default:
      return { status: 'not_started', verification: 'unverified' };
  }
}

function mkItem(
  orgId: string,
  key: string,
  overrides: Partial<RoadReadyItem> & { title?: string },
): RoadReadyItem {
  const def = REQUIREMENT_DEFINITIONS[key];
  return {
    id: overrides.id ?? uid(),
    organizationId: orgId,
    scopeType: overrides.scopeType ?? 'organization',
    scopeId: overrides.scopeId,
    category: (def?.category as RoadReadyItem['category']) ?? 'business',
    requirementKey: key,
    title: overrides.title ?? def?.title ?? key,
    description: overrides.description,
    status: overrides.status ?? 'not_started',
    verificationStatus: overrides.verificationStatus ?? 'unverified',
    source: overrides.source ?? 'system_recommendation',
    reason: overrides.reason,
    applicable: overrides.applicable ?? true,
    requiredForProgress: def?.optional ? false : (overrides.requiredForProgress ?? true),
    weight: def?.weight ?? 5,
    expiresAt: overrides.expiresAt,
    verifiedAt: overrides.verifiedAt,
    verifiedByStaffId: overrides.verifiedByStaffId,
    serviceSlug: overrides.serviceSlug ?? def?.serviceSlug,
    serviceRequestId: overrides.serviceRequestId,
    documentId: overrides.documentId,
    updatedAt: overrides.updatedAt ?? new Date().toISOString(),
  };
}

function itemFromField(orgId: string, key: string, val?: YesNoProgress, reason?: string): RoadReadyItem {
  const mapped = mapYesNoToStatus(val);
  return mkItem(orgId, key, { ...mapped, reason, source: 'customer_reported' });
}

export function buildRoadReadyItems(profile: RoadReadyProfile, units: PowerUnit[] = []): RoadReadyItem[] {
  const orgId = profile.organizationId;
  const items: RoadReadyItem[] = [];
  const interstate =
    profile.operating.scope === 'interstate' ||
    profile.operating.scope === 'both';

  items.push(itemFromField(orgId, 'business_formation', profile.business.legalName ? 'yes' : undefined));
  items.push(itemFromField(orgId, 'business_structure', profile.business.structure ? 'yes' : 'not_sure'));
  items.push(itemFromField(orgId, 'ein_status', profile.business.einStatus));

  items.push(itemFromField(orgId, 'usdot', profile.authority.usdot, interstate ? 'Interstate operation may require USDOT.' : undefined));
  items.push(itemFromField(orgId, 'operating_authority', profile.authority.mc, interstate ? 'Interstate carriers often need operating authority.' : undefined));
  items.push(itemFromField(orgId, 'boc3', profile.authority.boc3));

  items.push(itemFromField(orgId, 'vehicle_registration', profile.registration.vehicleRegistration));
  if (interstate) {
    items.push(itemFromField(orgId, 'irp', profile.registration.irp, 'Interstate apportioned registration may apply.'));
  } else {
    items.push(mkItem(orgId, 'irp', { status: 'not_applicable', verificationStatus: 'unverified', applicable: false, requiredForProgress: false }));
  }
  items.push(itemFromField(orgId, 'commercial_tags', profile.registration.commercialTags));

  if (interstate) {
    items.push(itemFromField(orgId, 'ifta', profile.taxFuel.ifta, 'You indicated interstate operation and IFTA status is relevant.'));
  } else {
    items.push(mkItem(orgId, 'ifta', { status: 'not_applicable', applicable: false, requiredForProgress: false, verificationStatus: 'unverified' }));
  }
  items.push(itemFromField(orgId, 'highway_tax', profile.taxFuel.highwayTax));

  const ins = itemFromField(orgId, 'commercial_insurance', profile.insurance.hasInsurance);
  if (profile.insurance.expirationDate) ins.expiresAt = profile.insurance.expirationDate;
  items.push(ins);

  items.push(itemFromField(orgId, 'trip_permits', profile.permits.tripPermits));
  items.push(itemFromField(orgId, 'state_permits', profile.permits.statePermits));

  for (const unit of units) {
    items.push(
      mkItem(orgId, 'vehicle_registration', {
        id: `${unit.id}-reg`,
        scopeType: 'vehicle',
        scopeId: unit.id,
        title: `Registration — ${unit.nickname}`,
        status: unit.readiness === 'ready' ? 'completed' : unit.readiness === 'needs_attention' ? 'action_needed' : 'needs_review',
        verificationStatus: unit.readiness === 'ready' ? 'verified' : 'unverified',
        reason: `Vehicle-level registration for ${unit.nickname}.`,
      }),
    );
  }

  items.push(mkItem(orgId, 'dispatching', { status: 'optional', verificationStatus: 'unverified', applicable: true, requiredForProgress: false }));
  items.push(mkItem(orgId, 'factoring', { status: 'optional', verificationStatus: 'unverified', applicable: true, requiredForProgress: false }));
  items.push(mkItem(orgId, 'bookkeeping', { status: 'optional', verificationStatus: 'unverified', applicable: true, requiredForProgress: false }));

  const applicabilityInput = {
    interstate,
    intrastate: profile.operating.scope === 'intrastate',
    vehicleCount: units.length || profile.operating.fleetSize,
    hasCdlDrivers: undefined as boolean | undefined,
    vehicleWeightOver26000: units.some((u) => {
      const gvwr = Number.parseInt(u.gvwr ?? '', 10);
      return Number.isFinite(gvwr) && gvwr > 26000;
    }),
    newEntrant: profile.operating.currentlyOperating === 'preparing',
  };
  const applicability = evaluateRoadReadyApplicability(applicabilityInput);
  const applicabilityKeys = ['ucr', 'hvut', 'mcs150', 'drug_alcohol_consortium', 'clearinghouse', 'dq_files', 'eld', 'new_entrant_audit'] as const;

  for (const key of applicabilityKeys) {
    const def = REQUIREMENT_DEFINITIONS[key];
    const rule = applicability.find((a) => a.requirementKey === key);
    if (!def) continue;

    const notApplicable = rule?.result === 'NOT_APPLICABLE';
    const optional = def.optional || rule?.result === 'OPTIONAL' || rule?.result === 'RECOMMENDED';
    const needsReview = rule?.result === 'NEEDS_REVIEW';

    items.push(
      mkItem(orgId, key, {
        status: notApplicable ? 'not_applicable' : needsReview ? 'needs_review' : optional ? 'optional' : 'not_started',
        verificationStatus: 'unverified',
        applicable: !notApplicable,
        requiredForProgress: !optional && !notApplicable && rule?.result !== 'RECOMMENDED',
        reason: rule?.reason,
        serviceSlug: def.serviceSlug,
      }),
    );
  }

  items.push(
    mkItem(orgId, 'title_tags', {
      status: 'optional',
      verificationStatus: 'unverified',
      applicable: true,
      requiredForProgress: false,
      reason: 'Title and tag needs vary by jurisdiction and vehicle status.',
      serviceSlug: 'tag-services',
    }),
  );

  return items;
}

export function mergeVerifiedItems(existing: RoadReadyItem[], rebuilt: RoadReadyItem[]): RoadReadyItem[] {
  const byKey = new Map(existing.map((i) => [`${i.requirementKey}:${i.scopeId ?? 'org'}`, i]));
  return rebuilt.map((item) => {
    const prev = byKey.get(`${item.requirementKey}:${item.scopeId ?? 'org'}`);
    if (!prev) return item;
    if (prev.verificationStatus === 'verified') {
      return {
        ...item,
        verificationStatus: 'verified',
        verifiedAt: prev.verifiedAt,
        verifiedByStaffId: prev.verifiedByStaffId,
        status: prev.status === 'completed' ? 'completed' : item.status,
      };
    }
    if (prev.serviceRequestId) {
      return { ...item, serviceRequestId: prev.serviceRequestId, status: prev.status, verificationStatus: prev.verificationStatus };
    }
    return { ...item, ...prev, title: item.title, reason: item.reason ?? prev.reason };
  });
}

export function createEmptyProfile(organizationId: string, legalName = ''): RoadReadyProfile {
  const now = new Date().toISOString();
  return {
    organizationId,
    mode: 'onboarding',
    onboardingStep: 0,
    onboardingComplete: false,
    ruleVersion: ROAD_READY_RULE_VERSION,
    business: { legalName },
    operating: {},
    authority: {},
    registration: {},
    taxFuel: {},
    insurance: {},
    permits: {},
    createdAt: now,
    updatedAt: now,
  };
}

export function detectProfileChangeRequiresRecalc(prev: OperatingProfile, next: OperatingProfile): boolean {
  return prev.scope !== next.scope && (next.scope === 'interstate' || next.scope === 'both');
}

export function explanationForItem(item: RoadReadyItem): string {
  if (item.reason) return item.reason;
  return `This item appears in your ${item.title} category based on the information available to All In One. It is a preliminary recommendation — not a legal determination.`;
}
