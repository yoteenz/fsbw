/**
 * Server-authoritative operator organization context.
 * Client org hints are validated against membership — never trusted blindly.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { getMembership, getOrganizationBySlug } from './service.js';

export type AuthorizedOperatorContext = {
  operatorEmail: string;
  operatorUserId: string;
  organizationSlug: string;
  organizationId: string;
  organizationType: string;
};

export async function resolveAuthorizedOrganizationSlug(
  supabase: SupabaseClient,
  operatorEmail: string,
  requestedSlug?: string
): Promise<{ ok: true; slug: string } | { ok: false; code: string; error: string }> {
  const email = operatorEmail.toLowerCase();
  const hint = requestedSlug?.trim();

  if (hint) {
    const org = await getOrganizationBySlug(supabase, hint);
    if (!org) {
      return { ok: false, code: 'ORG_NOT_FOUND', error: `Organization not found: ${hint}` };
    }
    const membership = await getMembership(supabase, org.id, email);
    if (!membership) {
      return {
        ok: false,
        code: 'ORG_ACCESS_DENIED',
        error: 'Operator is not an active member of the requested organization',
      };
    }
    return { ok: true, slug: org.slug };
  }

  const { data: pref } = await supabase
    .from('studio_world_operator_preferences')
    .select('active_organization_slug')
    .eq('user_email', email)
    .maybeSingle();

  const prefSlug = typeof pref?.active_organization_slug === 'string' ? pref.active_organization_slug : '';
  if (prefSlug) {
    const org = await getOrganizationBySlug(supabase, prefSlug);
    if (org) {
      const membership = await getMembership(supabase, org.id, email);
      if (membership) return { ok: true, slug: org.slug };
    }
  }

  return { ok: true, slug: 'frontal-slayer' };
}

export async function resolveAuthorizedOperatorContext(
  supabase: SupabaseClient,
  input: {
    operatorEmail: string;
    operatorUserId: string;
    organizationSlug?: string;
  }
): Promise<{ ok: true; context: AuthorizedOperatorContext } | { ok: false; code: string; error: string }> {
  const slugResult = await resolveAuthorizedOrganizationSlug(
    supabase,
    input.operatorEmail,
    input.organizationSlug
  );
  if (!slugResult.ok) return slugResult;

  const org = await getOrganizationBySlug(supabase, slugResult.slug);
  if (!org) {
    return { ok: false, code: 'ORG_NOT_FOUND', error: 'Organization not found' };
  }

  const membership = await getMembership(supabase, org.id, input.operatorEmail);
  if (!membership) {
    return {
      ok: false,
      code: 'ORG_ACCESS_DENIED',
      error: 'Operator lacks active membership for organization',
    };
  }

  return {
    ok: true,
    context: {
      operatorEmail: input.operatorEmail.toLowerCase(),
      operatorUserId: input.operatorUserId,
      organizationSlug: org.slug,
      organizationId: org.id,
      organizationType: org.organizationType,
    },
  };
}

export function isExternalPartnerOrganization(organizationType: string): boolean {
  return organizationType === 'AGENCY' || organizationType === 'PARTNER' || organizationType === 'CLIENT_ORG';
}
