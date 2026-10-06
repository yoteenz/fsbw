import type { Client, DemoStore } from '../../demo/demoTypes';
import { lifecycleFromLegacyAccountStatus } from '../lifecycle';
import type { ActivationConditions } from '../types';

const ACTIVE_CONDITIONS: Partial<ActivationConditions> = {
  canonicalIdentityExists: true,
  reviewOrIntakeComplete: true,
  authIdentityLinked: true,
  invitationCompleted: true,
  clientReviewedRequiredSections: true,
  clientConfirmedCurrentTruth: true,
  requiredConsentsAccepted: true,
  officeProvisioningSucceeded: true,
};

function patchClient(client: Client): Client {
  const lifecycle =
    client.clientLifecycle ??
    lifecycleFromLegacyAccountStatus(client.accountStatus, client.archiveMigrationStatus);
  const clientReviewState =
    client.clientReviewState ?? (client.accountStatus === 'active' ? 'COMPLETE' : 'NOT_STARTED');
  const activationConditions =
    client.activationConditions ??
    (lifecycle === 'ACTIVE' ? ACTIVE_CONDITIONS : { canonicalIdentityExists: lifecycle !== 'KNOWN_UNMIGRATED' });

  return {
    ...client,
    clientLifecycle: lifecycle,
    clientReviewState,
    activationConditions,
    accountStatus:
      lifecycle === 'ACTIVE'
        ? 'active'
        : lifecycle === 'PAUSED' || lifecycle === 'ENDED'
          ? 'inactive'
          : 'pending',
  };
}

export function ensureClientMigrationFields(store: DemoStore): DemoStore {
  store.clients = store.clients.map(patchClient);
  store.version = 26;
  store.clientExtractedFacts = store.clientExtractedFacts ?? [];
  store.clientActivationInvites = store.clientActivationInvites ?? [];
  store.clientReviewSections = store.clientReviewSections ?? [];
  store.clientReportedChanges = store.clientReportedChanges ?? [];
  store.clientLifecycleEvents = store.clientLifecycleEvents ?? [];
  store.officeWorkspaceEntitlements = store.officeWorkspaceEntitlements ?? [];
  store.clientMigrationCommitKeys = store.clientMigrationCommitKeys ?? [];
  store.clientActivationCommitKeys = store.clientActivationCommitKeys ?? [];
  return store;
}
