import type { ClientActivationInvite } from '../types';
import type { DemoStore } from '../../demo/demoTypes';
import { transitionClientLifecycle } from './lifecycleEvents';

function uid(): string {
  return crypto.randomUUID();
}

export async function hashActivationToken(token: string): Promise<string> {
  const data = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function generateActivationToken(): string {
  return crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
}

export async function createActivationInvite(
  store: DemoStore,
  organizationId: string,
  email: string,
  staffId?: string,
  ttlHours = 72,
): Promise<{ store: DemoStore; invite: ClientActivationInvite; rawToken: string }> {
  const rawToken = generateActivationToken();
  const tokenHash = await hashActivationToken(rawToken);
  const expiresAt = new Date(Date.now() + ttlHours * 3600_000).toISOString();
  const invite: ClientActivationInvite = {
    id: uid(),
    organizationId,
    email: email.trim().toLowerCase(),
    tokenHash,
    expiresAt,
    sentByStaffId: staffId,
    deliveryStatus: 'sent',
    createdAt: new Date().toISOString(),
  };
  if (!store.clientActivationInvites) store.clientActivationInvites = [];
  store.clientActivationInvites.unshift(invite);

  store = transitionClientLifecycle(store, organizationId, 'INVITED', 'INVITATION_SENT', 'STAFF', staffId);

  const client = store.clients.find((c) => c.id === organizationId);
  if (client) {
    client.invitedAt = invite.createdAt;
    client.activationConditions = {
      ...(client.activationConditions ?? {}),
      invitationCompleted: false,
    };
  }

  return { store, invite, rawToken };
}

export async function redeemActivationInvite(
  store: DemoStore,
  rawToken: string,
): Promise<{ store: DemoStore; organizationId?: string; error?: string }> {
  const tokenHash = await hashActivationToken(rawToken);
  const invite = store.clientActivationInvites?.find(
    (i) => i.tokenHash === tokenHash && !i.usedAt && !i.revokedAt,
  );
  if (!invite) return { store, error: 'Invalid or unknown activation link' };
  if (new Date(invite.expiresAt).getTime() < Date.now()) {
    invite.deliveryStatus = 'expired';
    return { store, error: 'Activation link expired' };
  }

  invite.usedAt = new Date().toISOString();
  invite.deliveryStatus = 'sent';

  store = transitionClientLifecycle(
    store,
    invite.organizationId,
    'CLIENT_CONFIRMATION_REQUIRED',
    'CLIENT_REVIEW_STARTED',
    'EXISTING_CLIENT',
  );

  const client = store.clients.find((c) => c.id === invite.organizationId);
  if (client) {
    client.clientReviewState = 'REQUIRED';
    client.activationConditions = {
      ...(client.activationConditions ?? {}),
      authIdentityLinked: true,
      invitationCompleted: true,
    };
  }

  return { store, organizationId: invite.organizationId };
}

export function findInviteByRawToken(store: DemoStore, rawToken: string): Promise<ClientActivationInvite | undefined> {
  return hashActivationToken(rawToken).then((hash) =>
    store.clientActivationInvites?.find((i) => i.tokenHash === hash),
  );
}
