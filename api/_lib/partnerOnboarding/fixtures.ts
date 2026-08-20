/**
 * Partner/agency dual-context pilot fixtures.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { createPartnerAgencyOrganization } from './agency.js';
import { createAgencyClient, createAgencyProject } from './clients.js';
import { seedGovernanceFixtures } from '../productionGovernance/service.js';

export const PILOT_OPERATOR_EMAIL = 'partner-operator@pilot.test';

export async function seedPartnerAgencyPilotFixtures(supabase: SupabaseClient) {
  const base = await seedGovernanceFixtures(supabase);

  const agency = await createPartnerAgencyOrganization(supabase, {
    name: 'Founding Partner Agency',
    slug: 'founding-partner-agency',
    ownerEmail: PILOT_OPERATOR_EMAIL,
    monthlyHardLimit: 500,
    monthlySoftLimit: 400,
    foundingPartner: true,
  });

  await supabase.from('studio_world_organization_memberships').upsert(
    {
      organization_id: base.orgIds['frontal-slayer'],
      user_email: PILOT_OPERATOR_EMAIL,
      role: 'PRODUCTION_DIRECTOR',
      status: 'active',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'organization_id,user_email' }
  );

  const clientA = await createAgencyClient(supabase, {
    organizationId: agency.organizationId,
    clientKey: 'client-a',
    name: 'Agency Client A',
    actorEmail: PILOT_OPERATOR_EMAIL,
  });

  const clientB = await createAgencyClient(supabase, {
    organizationId: agency.organizationId,
    clientKey: 'client-b',
    name: 'Agency Client B',
    actorEmail: PILOT_OPERATOR_EMAIL,
  });

  const projectA = await createAgencyProject(supabase, {
    organizationId: agency.organizationId,
    clientId: clientA.id as string,
    projectKey: 'campaign-alpha',
    name: 'Campaign Alpha',
    actorEmail: PILOT_OPERATOR_EMAIL,
    objective: 'Fall campaign pilot',
  });

  return {
    orgIds: { ...base.orgIds, agency: agency.organizationId },
    agencySlug: agency.slug,
    clientAId: clientA.id as string,
    clientBId: clientB.id as string,
    projectAId: projectA.id as string,
    operatorEmail: PILOT_OPERATOR_EMAIL,
  };
}
