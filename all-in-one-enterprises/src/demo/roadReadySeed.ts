import { ROAD_READY_RULE_VERSION } from '../road-ready/roadReadyConfig';
import { buildRoadReadyItems } from '../road-ready/roadReadyRules';
import type {
  DriverPlaceholder,
  PowerUnit,
  RoadReadyHistoryEvent,
  RoadReadyItem,
  RoadReadyProfile,
  RoadReadyVerificationEvent,
  Trailer,
} from '../road-ready/roadReadyTypes';

function daysAgo(d: number) {
  return new Date(Date.now() - d * 86400000).toISOString();
}

function daysAhead(d: number) {
  return new Date(Date.now() + d * 86400000).toISOString().slice(0, 10);
}

export function createRoadReadySeedData(): {
  profiles: RoadReadyProfile[];
  items: RoadReadyItem[];
  history: RoadReadyHistoryEvent[];
  verifications: RoadReadyVerificationEvent[];
  powerUnits: PowerUnit[];
  trailers: Trailer[];
  drivers: DriverPlaceholder[];
} {
  // CLIENT A — new owner-operator, 35% setup, mostly unverified, onboarding incomplete
  const profileA: RoadReadyProfile = {
    organizationId: 'client-a',
    mode: 'onboarding',
    onboardingStep: 4,
    onboardingComplete: false,
    ruleVersion: ROAD_READY_RULE_VERSION,
    business: {
      legalName: 'Summit Ridge Hauling LLC',
      structure: 'LLC',
      formationState: 'TX',
      primaryOperatingState: 'TX',
      einStatus: 'in_progress',
      phone: '(512) 555-0100',
      email: 'marcus.demo@summitridge.example',
    },
    operating: {
      operationType: 'owner_operator',
      scope: 'interstate',
      currentlyOperating: 'preparing',
      fleetSize: 1,
    },
    authority: { usdot: 'no', mc: 'not_sure', boc3: 'no' },
    registration: { vehicleRegistration: 'in_progress', irp: 'not_sure', commercialTags: 'no' },
    taxFuel: { ifta: 'not_sure', highwayTax: 'not_sure' },
    insurance: { hasInsurance: 'in_progress' },
    permits: { notSure: true, tripPermits: 'not_sure' },
    createdAt: daysAgo(14),
    updatedAt: daysAgo(1),
    lastCustomerUpdateAt: daysAgo(1),
  };

  const unitsA: PowerUnit[] = [
    {
      id: 'unit-a1',
      organizationId: 'client-a',
      nickname: 'Unit 01',
      year: '2019',
      make: 'Freightliner',
      model: 'Cascadia',
      vin: '1FUJGHDV8KLBC1234',
      plate: 'TX-8821',
      plateState: 'TX',
      ownership: 'financed',
      status: 'active',
      readiness: 'incomplete',
    },
  ];

  let itemsA = buildRoadReadyItems(profileA, unitsA);

  // CLIENT B — operating carrier, 82% setup, 61% verified, insurance expiring
  const profileB: RoadReadyProfile = {
    organizationId: 'client-b',
    mode: 'attention_required',
    onboardingStep: 10,
    onboardingComplete: true,
    ruleVersion: ROAD_READY_RULE_VERSION,
    business: {
      legalName: 'Heartland Freight Co.',
      structure: 'LLC',
      formationState: 'OH',
      primaryOperatingState: 'OH',
      einStatus: 'yes',
    },
    operating: { operationType: 'motor_carrier', scope: 'interstate', currentlyOperating: 'yes', fleetSize: 4 },
    authority: { usdot: 'yes', mc: 'yes', boc3: 'yes', usdotNumber: '3847291', mcNumber: 'MC-128493' },
    registration: { vehicleRegistration: 'yes', irp: 'yes', commercialTags: 'yes' },
    taxFuel: { ifta: 'yes', highwayTax: 'yes' },
    insurance: { hasInsurance: 'yes', carrierName: 'Demo Mutual', expirationDate: daysAhead(21) },
    permits: { tripPermits: 'yes', statePermits: 'not_sure' },
    createdAt: daysAgo(120),
    updatedAt: daysAgo(0),
    lastCustomerUpdateAt: daysAgo(3),
  };

  const unitsB: PowerUnit[] = [
    {
      id: 'unit-b1',
      organizationId: 'client-b',
      nickname: 'Truck 204',
      year: '2018',
      make: 'Freightliner',
      model: 'Cascadia',
      status: 'active',
      readiness: 'ready',
    },
  ];

  let itemsB = buildRoadReadyItems(profileB, unitsB);
  for (const key of ['usdot', 'operating_authority', 'boc3', 'irp', 'ifta', 'vehicle_registration']) {
    const i = itemsB.find((x) => x.requirementKey === key);
    if (i) {
      i.status = 'completed';
      i.verificationStatus = 'verified';
      i.verifiedAt = daysAgo(30);
      i.verifiedByStaffId = 'staff-3';
      i.source = 'staff_verified';
    }
  }
  const insB = itemsB.find((x) => x.requirementKey === 'commercial_insurance');
  if (insB) {
    insB.status = 'completed';
    insB.verificationStatus = 'verified';
    insB.expiresAt = daysAhead(21);
    insB.verifiedAt = daysAgo(60);
    insB.verifiedByStaffId = 'staff-5';
  }
  const bocB = itemsB.find((x) => x.requirementKey === 'boc3');
  if (bocB) {
    bocB.verificationStatus = 'self_reported';
    bocB.status = 'completed';
  }

  // CLIENT C — fleet, 3 trucks, one needs attention
  const profileC: RoadReadyProfile = {
    organizationId: 'client-c',
    mode: 'monitoring',
    onboardingStep: 10,
    onboardingComplete: true,
    ruleVersion: ROAD_READY_RULE_VERSION,
    business: { legalName: 'Pioneer Fleet Services', einStatus: 'yes', primaryOperatingState: 'GA' },
    operating: { operationType: 'fleet', scope: 'interstate', currentlyOperating: 'yes', fleetSize: 8 },
    authority: { usdot: 'yes', mc: 'yes', boc3: 'yes' },
    registration: { vehicleRegistration: 'yes', irp: 'yes', commercialTags: 'yes' },
    taxFuel: { ifta: 'yes', highwayTax: 'yes' },
    insurance: { hasInsurance: 'yes', expirationDate: daysAhead(120) },
    permits: { statePermits: 'yes' },
    createdAt: daysAgo(200),
    updatedAt: daysAgo(0),
    lastCustomerUpdateAt: daysAgo(0),
  };

  const unitsC: PowerUnit[] = [
    { id: 'unit-c1', organizationId: 'client-c', nickname: 'Truck 01', year: '2020', make: 'Kenworth', status: 'active', readiness: 'ready' },
    { id: 'unit-c2', organizationId: 'client-c', nickname: 'Truck 02', year: '2018', make: 'Peterbilt', status: 'active', readiness: 'needs_attention' },
    { id: 'unit-c3', organizationId: 'client-c', nickname: 'Truck 03', year: '2021', make: 'Volvo', status: 'active', readiness: 'incomplete' },
  ];

  let itemsC = buildRoadReadyItems(profileC, unitsC);
  itemsC.forEach((i) => {
    if (i.scopeType === 'organization' && i.requiredForProgress) {
      i.status = 'completed';
      i.verificationStatus = i.requirementKey === 'state_permits' ? 'pending_review' : 'verified';
    }
  });

  // CLIENT D — fully complete, monitoring
  const profileD: RoadReadyProfile = {
    organizationId: 'client-d',
    mode: 'monitoring',
    onboardingStep: 10,
    onboardingComplete: true,
    ruleVersion: ROAD_READY_RULE_VERSION,
    business: { legalName: 'BlueLine Transport', einStatus: 'yes', primaryOperatingState: 'FL' },
    operating: { operationType: 'motor_carrier', scope: 'interstate', currentlyOperating: 'yes', fleetSize: 2 },
    authority: { usdot: 'yes', mc: 'yes', boc3: 'yes' },
    registration: { vehicleRegistration: 'yes', irp: 'yes', commercialTags: 'yes' },
    taxFuel: { ifta: 'yes', highwayTax: 'yes' },
    insurance: { hasInsurance: 'yes', expirationDate: daysAhead(180) },
    permits: { tripPermits: 'yes', statePermits: 'yes' },
    createdAt: daysAgo(90),
    updatedAt: daysAgo(5),
    lastCustomerUpdateAt: daysAgo(5),
  };

  const unitsD: PowerUnit[] = [
    { id: 'unit-d1', organizationId: 'client-d', nickname: 'Unit 7', year: '2019', make: 'Peterbilt', status: 'active', readiness: 'ready' },
    { id: 'unit-d2', organizationId: 'client-d', nickname: 'Unit 8', year: '2020', make: 'Kenworth', status: 'active', readiness: 'ready' },
  ];

  let itemsD = buildRoadReadyItems(profileD, unitsD);
  itemsD.forEach((i) => {
    if (i.requiredForProgress && i.applicable) {
      i.status = 'completed';
      i.verificationStatus = 'verified';
      i.verifiedAt = daysAgo(10);
      i.verifiedByStaffId = 'staff-3';
    }
  });

  const history: RoadReadyHistoryEvent[] = [
    { id: 'rrh-1', organizationId: 'client-b', eventType: 'verified', title: 'Insurance verified by All In One', visibility: 'customer', createdAt: daysAgo(60) },
    { id: 'rrh-2', organizationId: 'client-a', eventType: 'profile_updated', title: 'Business profile updated', visibility: 'customer', createdAt: daysAgo(1) },
    { id: 'rrh-3', organizationId: 'client-c', eventType: 'document_uploaded', title: 'Registration document uploaded — Truck 02', visibility: 'customer', createdAt: daysAgo(2) },
  ];

  const verifications: RoadReadyVerificationEvent[] = [
    {
      id: 'rrv-1',
      organizationId: 'client-b',
      itemId: itemsB.find((i) => i.requirementKey === 'commercial_insurance')?.id ?? '',
      staffId: 'staff-5',
      staffName: 'Alex Rivera',
      previousVerification: 'pending_review',
      newVerification: 'verified',
      previousStatus: 'completed',
      newStatus: 'completed',
      createdAt: daysAgo(60),
      visibility: 'customer',
    },
  ];

  const trailers: Trailer[] = [
    { id: 'trl-c1', organizationId: 'client-c', number: 'T-101', type: 'Dry Van', status: 'active' },
    { id: 'trl-c2', organizationId: 'client-c', number: 'T-102', type: 'Reefer', status: 'active' },
  ];

  const drivers: DriverPlaceholder[] = [
    { id: 'drv-b1', organizationId: 'client-b', name: 'Jordan Hayes', phone: '(614) 555-0202', assignedUnitId: 'unit-b1', status: 'active' },
    { id: 'drv-c1', organizationId: 'client-c', name: 'Demo Driver One', phone: '(404) 555-0101', assignedUnitId: 'unit-c1', status: 'active' },
    { id: 'drv-d1', organizationId: 'client-d', name: 'Casey Brooks', phone: '(904) 555-0303', assignedUnitId: 'unit-d1', status: 'active' },
  ];

  return {
    profiles: [profileA, profileB, profileC, profileD],
    items: [...itemsA, ...itemsB, ...itemsC, ...itemsD],
    history,
    verifications,
    powerUnits: [...unitsA, ...unitsB, ...unitsC, ...unitsD],
    trailers,
    drivers,
  };
}
