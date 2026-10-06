import { getAioSupabase } from '../../data/supabase/client';
import type { ReviewSectionCode, ReviewSectionResponse, WhatChangedShortcut } from '../types';

export async function supabaseRecordReviewSection(
  organizationId: string,
  section: ReviewSectionCode,
  response: ReviewSectionResponse,
): Promise<{ error?: string }> {
  const supabase = getAioSupabase();
  if (!supabase) return { error: 'Backend is not configured.' };
  const { error } = await supabase.from('aio_client_review_sessions').upsert(
    {
      organization_id: organizationId,
      section_code: section,
      response,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'organization_id,section_code' },
  );
  return { error: error?.message };
}

export async function supabaseRecordWhatChanged(
  organizationId: string,
  shortcut: WhatChangedShortcut,
  note?: string,
): Promise<{ error?: string }> {
  const supabase = getAioSupabase();
  if (!supabase) return { error: 'Backend is not configured.' };
  const reconciliation =
    shortcut === 'CONTACT_INFO_CHANGED'
      ? 'APPLY_WITH_HISTORY'
      : shortcut === 'NOTHING_CHANGED'
        ? 'NONE'
        : 'STAFF_RECONCILE';
  const { error } = await supabase.from('aio_client_reported_changes').insert({
    organization_id: organizationId,
    shortcut,
    note: note ?? null,
    reconciliation,
  });
  return { error: error?.message };
}

export async function supabaseListReviewSections(organizationId: string) {
  const supabase = getAioSupabase();
  if (!supabase) return [];
  const { data } = await supabase
    .from('aio_client_review_sessions')
    .select('section_code, response, updated_at')
    .eq('organization_id', organizationId);
  return data ?? [];
}

export async function supabaseConfirmActivation(input: {
  organizationId: string;
  userId: string;
}): Promise<{ error?: string }> {
  const supabase = getAioSupabase();
  if (!supabase) return { error: 'Backend is not configured.' };

  const sections = await supabaseListReviewSections(input.organizationId);
  const required = ['COMPANY', 'PEOPLE', 'VEHICLES', 'ACTIVE_SERVICES'];
  const complete = required.every((code) => sections.some((s) => s.section_code === code && s.response));
  if (!complete) return { error: 'Required review sections incomplete' };

  const { error: orgError } = await supabase
    .from('aio_organizations')
    .update({
      client_lifecycle: 'ACTIVE',
      client_review_state: 'COMPLETE',
      activated_at: new Date().toISOString(),
    })
    .eq('id', input.organizationId);
  if (orgError) return { error: orgError.message };

  await supabase.from('aio_client_lifecycle_events').insert([
    {
      organization_id: input.organizationId,
      to_state: 'ACTIVE',
      event_type: 'CLIENT_CONFIRMED',
      actor_type: 'EXISTING_CLIENT',
      actor_user_id: input.userId,
    },
    {
      organization_id: input.organizationId,
      to_state: 'ACTIVE',
      event_type: 'CLIENT_ACTIVATED',
      actor_type: 'EXISTING_CLIENT',
      actor_user_id: input.userId,
    },
  ]);

  await supabase
    .from('aio_office_workspace_entitlements')
    .update({ state: 'ACTIVE', activated_at: new Date().toISOString() })
    .eq('organization_id', input.organizationId)
    .eq('state', 'PENDING_SETUP');

  return {};
}
