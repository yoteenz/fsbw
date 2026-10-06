import type { ActivationConditions, ClientLifecycleState, ClientReviewState } from './types';

export const DEFAULT_ACTIVATION_CONDITIONS: ActivationConditions = {
  canonicalIdentityExists: false,
  reviewOrIntakeComplete: false,
  authIdentityLinked: false,
  invitationCompleted: false,
  clientReviewedRequiredSections: false,
  clientConfirmedCurrentTruth: false,
  requiredConsentsAccepted: false,
  officeProvisioningSucceeded: false,
};

export function deriveAccountStatusFromLifecycle(
  lifecycle: ClientLifecycleState,
): 'active' | 'pending' | 'inactive' {
  if (lifecycle === 'ACTIVE') return 'active';
  if (lifecycle === 'PAUSED' || lifecycle === 'ENDED') return 'inactive';
  return 'pending';
}

export function activationConditionsMet(conditions: Partial<ActivationConditions> | undefined): boolean {
  const c = { ...DEFAULT_ACTIVATION_CONDITIONS, ...conditions };
  return (
    c.canonicalIdentityExists &&
    c.reviewOrIntakeComplete &&
    c.authIdentityLinked &&
    c.invitationCompleted &&
    c.clientReviewedRequiredSections &&
    c.clientConfirmedCurrentTruth &&
    c.requiredConsentsAccepted &&
    c.officeProvisioningSucceeded
  );
}

export function isActiveClient(input: {
  clientLifecycle: ClientLifecycleState;
  activationConditions?: Partial<ActivationConditions>;
}): boolean {
  return input.clientLifecycle === 'ACTIVE' && activationConditionsMet(input.activationConditions);
}

export function lifecycleFromLegacyAccountStatus(
  accountStatus: 'active' | 'pending' | 'inactive',
  archiveMigrationStatus?: string,
): ClientLifecycleState {
  if (accountStatus === 'active') return 'ACTIVE';
  if (accountStatus === 'inactive') return 'ENDED';
  if (archiveMigrationStatus === 'in_progress') return 'MIGRATION_IN_PROGRESS';
  if (archiveMigrationStatus === 'needs_review') return 'MIGRATION_REVIEW_REQUIRED';
  return 'KNOWN_UNMIGRATED';
}

export function founderSegmentForLifecycle(lifecycle: ClientLifecycleState): string {
  switch (lifecycle) {
    case 'ACTIVE':
      return 'ACTIVE';
    case 'CLIENT_CONFIRMATION_REQUIRED':
      return 'WAITING_FOR_CLIENT';
    case 'INVITED':
      return 'INVITATION_SENT';
    case 'PREBUILT':
      return 'PREBUILT_NOT_INVITED';
    case 'MIGRATION_REVIEW_REQUIRED':
      return 'MIGRATION_REVIEW';
    case 'MIGRATION_IN_PROGRESS':
      return 'MIGRATING';
    case 'INTAKE_IN_PROGRESS':
      return 'NEW_CLIENT_INTAKE';
    case 'PAUSED':
      return 'PAUSED';
    case 'ENDED':
      return 'ENDED';
    default:
      return 'KNOWN';
  }
}

export function canAccessClientOffice(lifecycle: ClientLifecycleState): boolean {
  return lifecycle === 'ACTIVE';
}

export function canAccessRawMigrationIntake(_lifecycle: ClientLifecycleState, isInternalStaff: boolean): boolean {
  return isInternalStaff;
}

export function requiredReviewComplete(reviewState: ClientReviewState): boolean {
  return reviewState === 'COMPLETE';
}
