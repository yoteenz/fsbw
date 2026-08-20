/**
 * Partner agency client + project management.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { recordAuditEvent } from '../productionGovernance/service.js';

function nowIso(): string {
  return new Date().toISOString();
}

export async function createAgencyClient(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    clientKey: string;
    name: string;
    actorEmail: string;
    clientType?: string;
    primaryContact?: string;
  }
) {
  const { data, error } = await supabase
    .from('studio_world_clients')
    .upsert(
      {
        organization_id: input.organizationId,
        client_key: input.clientKey,
        name: input.name,
        status: 'active',
        metadata: {
          clientType: input.clientType ?? 'brand',
          primaryContact: input.primaryContact,
        },
        updated_at: nowIso(),
      },
      { onConflict: 'organization_id,client_key' }
    )
    .select('*')
    .single();

  if (error) throw error;

  await recordAuditEvent(supabase, {
    actorEmail: input.actorEmail,
    organizationId: input.organizationId,
    eventType: 'CLIENT_CREATED',
    targetType: 'client',
    targetId: data.id as string,
    metadata: { clientKey: input.clientKey },
  });

  return data;
}

export async function createAgencyProject(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    clientId: string;
    projectKey: string;
    name: string;
    actorEmail: string;
    objective?: string;
  }
) {
  const { data, error } = await supabase
    .from('studio_world_projects')
    .upsert(
      {
        organization_id: input.organizationId,
        client_id: input.clientId,
        project_key: input.projectKey,
        name: input.name,
        status: 'active',
        metadata: { objective: input.objective },
        updated_at: nowIso(),
      },
      { onConflict: 'organization_id,project_key' }
    )
    .select('*')
    .single();

  if (error) throw error;

  await recordAuditEvent(supabase, {
    actorEmail: input.actorEmail,
    organizationId: input.organizationId,
    eventType: 'PROJECT_CREATED',
    targetType: 'project',
    targetId: data.id as string,
    metadata: { projectKey: input.projectKey, clientId: input.clientId },
  });

  return data;
}

export async function listAgencyClients(supabase: SupabaseClient, organizationId: string) {
  const { data } = await supabase
    .from('studio_world_clients')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('status', 'active')
    .order('name');
  return data ?? [];
}

export async function listAgencyProjects(supabase: SupabaseClient, organizationId: string, clientId?: string) {
  let query = supabase
    .from('studio_world_projects')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('status', 'active');
  if (clientId) query = query.eq('client_id', clientId);
  const { data } = await query.order('name');
  return data ?? [];
}
