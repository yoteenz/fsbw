/**
 * Organization invitation lifecycle — secure token hash storage.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import {
  generateInvitationToken,
  hashInvitationToken,
  isInvitationExpired,
  assertRoleNotEscalated,
} from '../../../src/studio-os-core/partner-onboarding/invitation-token.js';
import type { InvitationStatus } from '../../../src/studio-os-core/partner-onboarding/types.js';
import { INVITATION_TTL_MS } from '../../../src/studio-os-core/partner-onboarding/types.js';
import { getMembership, recordAuditEvent } from '../productionGovernance/service.js';

function nowIso(): string {
  return new Date().toISOString();
}

export async function createOrganizationInvitation(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    invitedEmail: string;
    inviterEmail: string;
    proposedRole: string;
    entitlementScope?: Record<string, unknown>;
    clientScope?: Record<string, unknown>;
    ttlMs?: number;
  }
): Promise<{ invitationId: string; token: string; expiresAt: string }> {
  const token = generateInvitationToken();
  const tokenHash = hashInvitationToken(token);
  const expiresAt = new Date(Date.now() + (input.ttlMs ?? INVITATION_TTL_MS)).toISOString();

  const { data, error } = await supabase
    .from('studio_world_organization_invitations')
    .insert({
      organization_id: input.organizationId,
      invited_email: input.invitedEmail.toLowerCase(),
      inviter_email: input.inviterEmail.toLowerCase(),
      proposed_role: input.proposedRole,
      token_hash: tokenHash,
      status: 'pending',
      entitlement_scope: input.entitlementScope ?? {},
      client_scope: input.clientScope ?? null,
      expires_at: expiresAt,
      updated_at: nowIso(),
    })
    .select('id')
    .single();

  if (error) throw error;

  await recordAuditEvent(supabase, {
    actorEmail: input.inviterEmail,
    organizationId: input.organizationId,
    eventType: 'INVITATION_CREATED',
    targetType: 'invitation',
    targetId: data.id as string,
    metadata: { invitedEmail: input.invitedEmail, role: input.proposedRole },
  });

  return { invitationId: data.id as string, token, expiresAt };
}

export async function revokeOrganizationInvitation(
  supabase: SupabaseClient,
  invitationId: string,
  actorEmail: string
): Promise<void> {
  const { data } = await supabase
    .from('studio_world_organization_invitations')
    .update({ status: 'revoked', revoked_at: nowIso(), updated_at: nowIso() })
    .eq('id', invitationId)
    .eq('status', 'pending')
    .select('organization_id')
    .maybeSingle();

  if (data?.organization_id) {
    await recordAuditEvent(supabase, {
      actorEmail,
      organizationId: data.organization_id as string,
      eventType: 'INVITATION_REVOKED',
      targetType: 'invitation',
      targetId: invitationId,
    });
  }
}

export async function acceptOrganizationInvitation(
  supabase: SupabaseClient,
  input: {
    token: string;
    acceptorEmail: string;
    acceptorUserId: string;
    requestedRole?: string;
  }
): Promise<
  | { ok: true; organizationId: string; organizationSlug: string; membershipId: string; alreadyAccepted?: boolean }
  | { ok: false; code: string; error: string }
> {
  const tokenHash = hashInvitationToken(input.token);
  const { data: invitation } = await supabase
    .from('studio_world_organization_invitations')
    .select('*, studio_world_organizations(slug, name, organization_type)')
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (!invitation) {
    return { ok: false, code: 'INVITATION_NOT_FOUND', error: 'Invalid invitation token' };
  }

  const status = invitation.status as InvitationStatus;
  if (status === 'revoked') {
    return { ok: false, code: 'INVITATION_REVOKED', error: 'Invitation was revoked' };
  }
  if (status === 'declined') {
    return { ok: false, code: 'INVITATION_DECLINED', error: 'Invitation was declined' };
  }
  if (status === 'accepted') {
    const org = invitation.studio_world_organizations as { slug: string };
    const existing = await getMembership(
      supabase,
      invitation.organization_id as string,
      input.acceptorEmail
    );
    if (existing) {
      return {
        ok: true,
        organizationId: invitation.organization_id as string,
        organizationSlug: org.slug,
        membershipId: existing.id,
        alreadyAccepted: true,
      };
    }
    return { ok: false, code: 'INVITATION_ALREADY_USED', error: 'Invitation already accepted' };
  }

  if (isInvitationExpired(invitation.expires_at as string)) {
    await supabase
      .from('studio_world_organization_invitations')
      .update({ status: 'expired', updated_at: nowIso() })
      .eq('id', invitation.id);
    return { ok: false, code: 'INVITATION_EXPIRED', error: 'Invitation has expired' };
  }

  const invitedEmail = (invitation.invited_email as string).toLowerCase();
  const acceptorEmail = input.acceptorEmail.toLowerCase();
  if (invitedEmail !== acceptorEmail) {
    return { ok: false, code: 'INVITATION_EMAIL_MISMATCH', error: 'Invitation email does not match acceptor' };
  }

  const roleCheck = assertRoleNotEscalated(invitation.proposed_role as string, input.requestedRole);
  if (!roleCheck.ok) {
    return { ok: false, code: 'ROLE_ESCALATION_DENIED', error: roleCheck.error };
  }

  const { data: membership, error: memberErr } = await supabase
    .from('studio_world_organization_memberships')
    .upsert(
      {
        organization_id: invitation.organization_id,
        user_email: acceptorEmail,
        role: invitation.proposed_role,
        status: 'active',
        updated_at: nowIso(),
      },
      { onConflict: 'organization_id,user_email' }
    )
    .select('id')
    .single();

  if (memberErr) {
    return { ok: false, code: 'MEMBERSHIP_CREATE_FAILED', error: memberErr.message };
  }

  await supabase
    .from('studio_world_organization_invitations')
    .update({
      status: 'accepted',
      accepted_at: nowIso(),
      accepted_by_email: acceptorEmail,
      updated_at: nowIso(),
    })
    .eq('id', invitation.id)
    .eq('status', 'pending');

  await supabase.from('studio_world_operator_preferences').upsert(
    {
      user_email: acceptorEmail,
      active_organization_slug: (invitation.studio_world_organizations as { slug: string }).slug,
      updated_at: nowIso(),
    },
    { onConflict: 'user_email' }
  );

  await recordAuditEvent(supabase, {
    actorEmail: acceptorEmail,
    organizationId: invitation.organization_id as string,
    eventType: 'INVITATION_ACCEPTED',
    targetType: 'invitation',
    targetId: invitation.id as string,
    metadata: { membershipId: membership.id, role: invitation.proposed_role },
  });

  await recordAuditEvent(supabase, {
    actorEmail: acceptorEmail,
    organizationId: invitation.organization_id as string,
    eventType: 'MEMBERSHIP_CREATED',
    targetType: 'membership',
    targetId: membership.id as string,
  });

  const org = invitation.studio_world_organizations as { slug: string };
  return {
    ok: true,
    organizationId: invitation.organization_id as string,
    organizationSlug: org.slug,
    membershipId: membership.id as string,
  };
}

export async function listOrganizationInvitations(
  supabase: SupabaseClient,
  organizationId: string
) {
  const { data } = await supabase
    .from('studio_world_organization_invitations')
    .select('id, invited_email, inviter_email, proposed_role, status, expires_at, accepted_at, revoked_at, created_at')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });
  return data ?? [];
}
