export type BusinessEligibilityRecord = {
  eligible: boolean;
  requiredPhase: string;
  currentPhase: string;
  unlockReasons: string[];
};

export type LegacyBusinessStaffKind = 'ai' | 'citizen';

export type LegacyBusinessStaffMember = {
  staffId: string;
  kind: LegacyBusinessStaffKind;
  displayName: string;
  role: string;
  hiredAt: string;
};

export type LegacyBusinessLocation = {
  locationId: string;
  label: string;
  districtId?: string;
  openedAt: string;
};

export type LegacyBusinessTimelineEvent = {
  eventId: string;
  label: string;
  recordedAt: string;
  summary: string;
};

export type LegacyBusiness = {
  businessId: string;
  licenseId: string;
  careerWorldId: string;
  displayName: string;
  reputation: number;
  growthScore: number;
  employees: LegacyBusinessStaffMember[];
  locations: LegacyBusinessLocation[];
  timeline: LegacyBusinessTimelineEvent[];
  foundedAt: string;
};
