/** Sprint 24 — launch and operations control model */

export type OverallLaunchState =
  | 'NOT_READY'
  | 'PREPARING'
  | 'PILOT_READY'
  | 'PILOT_ACTIVE'
  | 'PUBLIC_LAUNCH_READY'
  | 'LIVE'
  | 'STABILIZING'
  | 'PAUSED'
  | 'INCIDENT_MODE';

export type LaunchReadinessStatus = 'READY' | 'PARTIAL' | 'BLOCKED';

export type LaunchBlockerCategory =
  | 'TECHNICAL'
  | 'SECURITY'
  | 'BUSINESS'
  | 'LEGAL'
  | 'PROVIDER'
  | 'STAFFING'
  | 'OPERATIONS'
  | 'FINANCIAL'
  | 'DOMAIN'
  | 'COMMUNICATIONS'
  | 'SUPPORT';

export type LaunchBlockerSeverity = 'P0' | 'P1' | 'P2' | 'P3';

export type LaunchBlockerStatus = 'OPEN' | 'MITIGATED' | 'ACCEPTED' | 'RESOLVED';

export type ServiceLaunchState =
  | 'GO'
  | 'LIMITED_PILOT'
  | 'HOLD'
  | 'BLOCKED'
  | 'COMING_SOON'
  | 'INTERNAL_ONLY'
  | 'DISABLED';

export type LaunchMode = 'INTERNAL' | 'PILOT' | 'LIMITED_PUBLIC' | 'PUBLIC';

export type FinalLaunchRecommendation =
  | 'BLOCKED'
  | 'INTERNAL_ONLY'
  | 'PILOT_READY'
  | 'LIMITED_LAUNCH_READY'
  | 'PUBLIC_LAUNCH_READY'
  | 'LIVE_STABILIZING';

export type OperationalHealth = 'HEALTHY' | 'WATCH' | 'DEGRADED' | 'CRITICAL';

export type PricingState = 'NOT_SET' | 'DRAFT' | 'REVIEWED' | 'APPROVED' | 'ACTIVE' | 'PAUSED';

export type StaffLifecycleState =
  | 'INVITED'
  | 'ONBOARDING'
  | 'TRAINING'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'OFFBOARDED';

export type PaymentActivationState =
  | 'DISABLED'
  | 'SANDBOX'
  | 'PRODUCTION_PENDING'
  | 'LIMITED_PILOT'
  | 'ACTIVE';

export interface LaunchBlocker {
  id: string;
  category: LaunchBlockerCategory;
  severity: LaunchBlockerSeverity;
  description: string;
  affectedService?: string;
  ownerCategory: 'TECHNICAL' | 'BUSINESS' | 'PROVIDER' | 'LEGAL' | 'OPERATIONS';
  requiredAction: string;
  status: LaunchBlockerStatus;
  targetDate?: string;
  evidence?: string;
  resolvedAt?: string;
}

export interface LaunchReadinessResult {
  status: LaunchReadinessStatus;
  overallState: OverallLaunchState;
  recommendation: FinalLaunchRecommendation;
  technical: LaunchReadinessStatus;
  business: LaunchReadinessStatus;
  staff: LaunchReadinessStatus;
  security: LaunchReadinessStatus;
  support: LaunchReadinessStatus;
  blockers: LaunchBlocker[];
  warnings: string[];
}

export interface ServiceLaunchEntry {
  id: string;
  label: string;
  softwareStatus: 'READY' | 'PARTIAL' | 'NOT_READY';
  workflowStatus: 'READY' | 'PARTIAL' | 'NOT_READY';
  pricingStatus: PricingState;
  staffProcessStatus: 'DEFINED' | 'DRAFT' | 'NOT_DEFINED';
  providerStatus: 'READY' | 'PENDING' | 'NOT_REQUIRED' | 'BLOCKED';
  businessAuthorizationStatus: 'VERIFIED' | 'PENDING' | 'NOT_APPLICABLE' | 'BLOCKED';
  documentsStatus: 'READY' | 'PARTIAL' | 'NOT_READY';
  customerDisclosureStatus: 'APPROVED' | 'DRAFT' | 'PENDING';
  paymentStatus: PaymentActivationState;
  supportStatus: 'READY' | 'PARTIAL' | 'NOT_READY';
  activationState: ServiceLaunchState;
  publicCta: string;
  notes?: string;
}
