import { appendIdentityAuditEntry } from '../audit/history';
import { createIdentityRecord } from '../identity/registry';
import { assignIdentityRole } from '../roles/role-engine';
import { createCompanyMembership } from '../memberships/memberships';
import { mutateIdentityEngineStore, readIdentityEngineStore } from '../persistence';
import type { InvitationStatus } from '../constants';
import type { IdentityInvitation } from '../types';

function now(): string {
  return new Date().toISOString();
}

function createInvitationId(): string {
  return `INV-${Date.now().toString(36)}`;
}

const DEFAULT_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

/** Invitation System™ */
export function listIdentityInvitations(): IdentityInvitation[] {
  return [...readIdentityEngineStore().invitations];
}

export function listPendingInvitations(): IdentityInvitation[] {
  return listIdentityInvitations().filter((i) => i.status === 'pending');
}

export function getIdentityInvitation(invitationId: string): IdentityInvitation | undefined {
  return listIdentityInvitations().find((i) => i.invitationId === invitationId);
}

export function issueIdentityInvitation(input: {
  invitationType: IdentityInvitation['invitationType'];
  invitedByIdentityId: string;
  scopeIdentityId: string;
  targetEmail?: string | null;
  targetIdentityId?: string | null;
  roleTemplate?: string;
  expiresAt?: string;
}): IdentityInvitation {
  const timestamp = now();
  const invitation: IdentityInvitation = {
    invitationId: createInvitationId(),
    invitationType: input.invitationType,
    targetEmail: input.targetEmail ?? null,
    targetIdentityId: input.targetIdentityId ?? null,
    invitedByIdentityId: input.invitedByIdentityId,
    scopeIdentityId: input.scopeIdentityId,
    roleTemplate: input.roleTemplate,
    status: 'pending',
    expiresAt: input.expiresAt ?? new Date(Date.now() + DEFAULT_EXPIRY_MS).toISOString(),
    createdAt: timestamp,
  };

  mutateIdentityEngineStore((store) => ({
    ...store,
    invitations: [...store.invitations, invitation],
  }));

  if (input.targetIdentityId) {
    appendIdentityAuditEntry({
      identityId: input.targetIdentityId,
      action: 'invitation_issued',
      actorIdentityId: input.invitedByIdentityId,
      nextSnapshot: { invitationId: invitation.invitationId },
    });
  }

  return invitation;
}

export function acceptIdentityInvitation(
  invitationId: string,
  acceptingActorIdentityId: string
): IdentityInvitation | undefined {
  const invitation = getIdentityInvitation(invitationId);
  if (!invitation || invitation.status !== 'pending') return undefined;
  if (new Date(invitation.expiresAt) < new Date()) {
    revokeIdentityInvitation(invitationId, 'expired');
    return undefined;
  }

  const timestamp = now();
  let updated: IdentityInvitation | undefined;

  mutateIdentityEngineStore((store) => {
    const invitations = store.invitations.map((i) => {
      if (i.invitationId !== invitationId) return i;
      updated = { ...i, status: 'accepted' as InvitationStatus, acceptedAt: timestamp };
      return updated;
    });
    return { ...store, invitations };
  });

  if (updated) {
    if (updated.invitationType === 'membership') {
      createCompanyMembership({
        actorIdentityId: acceptingActorIdentityId,
        companyIdentityId: updated.scopeIdentityId,
        membershipType: 'employee',
        actorIdentityIdForAudit: acceptingActorIdentityId,
      });
    }
    if (updated.roleTemplate) {
      assignIdentityRole({
        identityId: acceptingActorIdentityId,
        roleTemplate: updated.roleTemplate,
        scope: 'company',
        scopeIdentityId: updated.scopeIdentityId,
        source: 'invitation',
        actorIdentityId: acceptingActorIdentityId,
      });
    }

    appendIdentityAuditEntry({
      identityId: acceptingActorIdentityId,
      action: 'invitation_accepted',
      actorIdentityId: acceptingActorIdentityId,
      nextSnapshot: { invitationId },
    });
  }

  return updated;
}

export function revokeIdentityInvitation(
  invitationId: string,
  status: Extract<InvitationStatus, 'revoked' | 'expired'> = 'revoked'
): IdentityInvitation | undefined {
  let updated: IdentityInvitation | undefined;

  mutateIdentityEngineStore((store) => {
    const invitations = store.invitations.map((i) => {
      if (i.invitationId !== invitationId) return i;
      updated = { ...i, status };
      return updated;
    });
    return { ...store, invitations };
  });

  return updated;
}

export function provisionPendingIdentityFromInvitation(input: {
  displayName: string;
  invitationId: string;
}): string | undefined {
  const invitation = getIdentityInvitation(input.invitationId);
  if (!invitation || invitation.status !== 'pending') return undefined;

  const identity = createIdentityRecord({
    identityType: 'user',
    displayName: input.displayName,
    lifecycleState: 'pending',
  });

  mutateIdentityEngineStore((store) => ({
    ...store,
    invitations: store.invitations.map((i) =>
      i.invitationId === input.invitationId ? { ...i, targetIdentityId: identity.identityId } : i
    ),
  }));

  return identity.identityId;
}
