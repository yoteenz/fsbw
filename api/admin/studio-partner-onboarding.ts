import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import { getSupabaseAdmin } from '../_lib/supabase.js';
import { createOrganizationInvitation, acceptOrganizationInvitation, revokeOrganizationInvitation, listOrganizationInvitations } from '../_lib/partnerOnboarding/invitations.js';
import { createPartnerAgencyOrganization } from '../_lib/partnerOnboarding/agency.js';
import { createAgencyClient, createAgencyProject, listAgencyClients, listAgencyProjects } from '../_lib/partnerOnboarding/clients.js';
import { getAgencyUsageAnalytics } from '../_lib/partnerOnboarding/analytics.js';
import { buildOperatorProductionContext, listOperatorOrganizations } from '../_lib/partnerOnboarding/context.js';
import { seedPartnerAgencyPilotFixtures } from '../_lib/partnerOnboarding/fixtures.js';
import { getOrganizationBySlug, getMembership, simulateProductionOperation } from '../_lib/productionGovernance/service.js';
import { executeGovernedProduction } from '../_lib/productionGovernance/executeGovernedProduction.js';
import { resolveAuthorizedOperatorContext } from '../_lib/productionGovernance/operator-context.js';

function parseBody(req: VercelRequest): Record<string, unknown> | null {
  if (typeof req.body === 'object' && req.body !== null && !Array.isArray(req.body)) {
    return req.body as Record<string, unknown>;
  }
  if (typeof req.body === 'string' && req.body.trim()) {
    try {
      return JSON.parse(req.body) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return null;
}

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function num(v: unknown, fallback = 0): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

async function requireOrgAdmin(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  organizationSlug: string,
  operatorEmail: string
) {
  const org = await getOrganizationBySlug(supabase, organizationSlug);
  if (!org) return { ok: false as const, status: 404, error: 'Organization not found' };
  const membership = await getMembership(supabase, org.id, operatorEmail);
  if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
    return { ok: false as const, status: 403, error: 'Admin role required' };
  }
  return { ok: true as const, org };
}

/**
 * Studio World Partner / Agency onboarding API
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const auth = await resolveAdminAuth(req);
  if (!auth.ok) {
    const { status, error, code } = auth.failure;
    return res.status(status).json({ error, code });
  }

  try {
    const supabase = getSupabaseAdmin();
    const body = parseBody(req) ?? {};
    const query = req.query ?? {};
    const operatorEmail = str(body.operatorEmail) || str(query.operatorEmail) || auth.user.email;
    const organizationSlug = str(body.organizationSlug) || str(query.organizationSlug);

    if (req.method === 'GET') {
      const action = str(query.action) || 'context';

      if (action === 'context') {
        const ctx = await buildOperatorProductionContext(supabase, {
          operatorEmail,
          operatorUserId: auth.user.id,
          organizationSlug: organizationSlug || undefined,
          clientId: str(query.clientId) || undefined,
          projectId: str(query.projectId) || undefined,
          campaignId: str(query.campaignId) || undefined,
        });
        if (!ctx) return res.status(403).json({ error: 'Organization context denied' });
        return res.status(200).json({ ok: true, context: ctx });
      }

      if (action === 'organizations') {
        const orgs = await listOperatorOrganizations(supabase, operatorEmail);
        return res.status(200).json({ ok: true, organizations: orgs });
      }

      if (action === 'clients') {
        const slug = organizationSlug || 'founding-partner-agency';
        const org = await getOrganizationBySlug(supabase, slug);
        if (!org) return res.status(404).json({ error: 'Organization not found' });
        const clients = await listAgencyClients(supabase, org.id);
        return res.status(200).json({ ok: true, clients });
      }

      if (action === 'projects') {
        const slug = organizationSlug || 'founding-partner-agency';
        const org = await getOrganizationBySlug(supabase, slug);
        if (!org) return res.status(404).json({ error: 'Organization not found' });
        const projects = await listAgencyProjects(supabase, org.id, str(query.clientId) || undefined);
        return res.status(200).json({ ok: true, projects });
      }

      if (action === 'invitations') {
        const slug = organizationSlug;
        if (!slug) return res.status(400).json({ error: 'organizationSlug required' });
        const admin = await requireOrgAdmin(supabase, slug, operatorEmail);
        if (!admin.ok) return res.status(admin.status).json({ error: admin.error });
        const invitations = await listOrganizationInvitations(supabase, admin.org.id);
        return res.status(200).json({ ok: true, invitations });
      }

      if (action === 'usage') {
        const slug = organizationSlug;
        if (!slug) return res.status(400).json({ error: 'organizationSlug required' });
        const org = await getOrganizationBySlug(supabase, slug);
        if (!org) return res.status(404).json({ error: 'Organization not found' });
        const membership = await getMembership(supabase, org.id, operatorEmail);
        if (!membership) return res.status(403).json({ error: 'Not a member' });
        const analytics = await getAgencyUsageAnalytics(supabase, {
          organizationId: org.id,
          clientId: str(query.clientId) || undefined,
          projectId: str(query.projectId) || undefined,
        });
        return res.status(200).json({ ok: true, analytics });
      }

      return res.status(400).json({ error: 'Unknown action' });
    }

    if (req.method === 'POST') {
      const action = str(body.action);

      if (action === 'seed_pilot_fixtures') {
        const seed = await seedPartnerAgencyPilotFixtures(supabase);
        return res.status(200).json({ ok: true, ...seed });
      }

      if (action === 'create_agency') {
        const name = str(body.name);
        const slug = str(body.slug);
        if (!name || !slug) return res.status(400).json({ error: 'name and slug required' });
        const created = await createPartnerAgencyOrganization(supabase, {
          name,
          slug,
          ownerEmail: operatorEmail,
          foundingPartner: body.foundingPartner !== false,
          monthlyHardLimit: num(body.monthlyHardLimit, 500),
          monthlySoftLimit: num(body.monthlySoftLimit, 400),
        });
        return res.status(201).json({ ok: true, ...created });
      }

      if (action === 'invite_member') {
        const slug = organizationSlug;
        const invitedEmail = str(body.invitedEmail);
        const proposedRole = str(body.proposedRole) || 'PRODUCER';
        if (!slug || !invitedEmail) {
          return res.status(400).json({ error: 'organizationSlug and invitedEmail required' });
        }
        const admin = await requireOrgAdmin(supabase, slug, operatorEmail);
        if (!admin.ok) return res.status(admin.status).json({ error: admin.error });
        const invitation = await createOrganizationInvitation(supabase, {
          organizationId: admin.org.id,
          invitedEmail,
          inviterEmail: operatorEmail,
          proposedRole,
          entitlementScope: (body.entitlementScope as Record<string, unknown>) ?? {},
        });
        return res.status(201).json({ ok: true, ...invitation });
      }

      if (action === 'accept_invitation') {
        const token = str(body.token);
        if (!token) return res.status(400).json({ error: 'token required' });
        const result = await acceptOrganizationInvitation(supabase, {
          token,
          acceptorEmail: operatorEmail,
          acceptorUserId: auth.user.id,
          requestedRole: str(body.requestedRole) || undefined,
        });
        if (!result.ok) return res.status(400).json(result);
        return res.status(200).json(result);
      }

      if (action === 'revoke_invitation') {
        const invitationId = str(body.invitationId);
        if (!invitationId) return res.status(400).json({ error: 'invitationId required' });
        await revokeOrganizationInvitation(supabase, invitationId, operatorEmail);
        return res.status(200).json({ ok: true });
      }

      if (action === 'switch_organization') {
        const targetSlug = str(body.organizationSlug);
        if (!targetSlug) return res.status(400).json({ error: 'organizationSlug required' });
        const authCtx = await resolveAuthorizedOperatorContext(supabase, {
          operatorEmail,
          operatorUserId: auth.user.id,
          organizationSlug: targetSlug,
        });
        if (!authCtx.ok) return res.status(403).json(authCtx);
        await supabase.from('studio_world_operator_preferences').upsert(
          {
            user_email: operatorEmail.toLowerCase(),
            active_organization_slug: targetSlug,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_email' }
        );
        const ctx = await buildOperatorProductionContext(supabase, {
          operatorEmail,
          operatorUserId: auth.user.id,
          organizationSlug: targetSlug,
        });
        return res.status(200).json({ ok: true, context: ctx });
      }

      if (action === 'create_client') {
        const slug = organizationSlug;
        const clientKey = str(body.clientKey);
        const name = str(body.name);
        if (!slug || !clientKey || !name) {
          return res.status(400).json({ error: 'organizationSlug, clientKey, name required' });
        }
        const org = await getOrganizationBySlug(supabase, slug);
        if (!org) return res.status(404).json({ error: 'Organization not found' });
        const client = await createAgencyClient(supabase, {
          organizationId: org.id,
          clientKey,
          name,
          actorEmail: operatorEmail,
          clientType: str(body.clientType) || undefined,
          primaryContact: str(body.primaryContact) || undefined,
        });
        return res.status(201).json({ ok: true, client });
      }

      if (action === 'create_project') {
        const slug = organizationSlug;
        const clientId = str(body.clientId);
        const projectKey = str(body.projectKey);
        const name = str(body.name);
        if (!slug || !clientId || !projectKey || !name) {
          return res.status(400).json({ error: 'organizationSlug, clientId, projectKey, name required' });
        }
        const org = await getOrganizationBySlug(supabase, slug);
        if (!org) return res.status(404).json({ error: 'Organization not found' });
        const project = await createAgencyProject(supabase, {
          organizationId: org.id,
          clientId,
          projectKey,
          name,
          actorEmail: operatorEmail,
          objective: str(body.objective) || undefined,
        });
        return res.status(201).json({ ok: true, project });
      }

      if (action === 'simulate_dual_context') {
        const email = str(body.operatorEmail) || operatorEmail;
        const fs = await executeGovernedProduction(supabase, {
          routeKey: 'studio-builder-generate',
          operatorEmail: email,
          operatorUserId: auth.user.id,
          organizationSlug: 'frontal-slayer',
          operationType: 'IMAGE_GENERATION',
          provider: 'simulated',
          estimatedCost: 3.21,
          simulate: true,
        });
        const agency = await executeGovernedProduction(supabase, {
          routeKey: 'studio-builder-generate',
          operatorEmail: email,
          operatorUserId: auth.user.id,
          organizationSlug: 'founding-partner-agency',
          operationType: 'IMAGE_GENERATION',
          provider: 'simulated',
          estimatedCost: 4.8,
          clientId: str(body.clientId) || undefined,
          projectId: str(body.projectId) || undefined,
          simulate: true,
        });
        const blocked = await executeGovernedProduction(supabase, {
          routeKey: 'product-photography-generate',
          operatorEmail: email,
          operatorUserId: auth.user.id,
          organizationSlug: 'founding-partner-agency',
          operationType: 'IMAGE_GENERATION',
          provider: 'simulated',
          estimatedCost: 2,
          simulate: true,
        });
        const forged = await executeGovernedProduction(supabase, {
          routeKey: 'studio-builder-generate',
          operatorEmail: email,
          operatorUserId: auth.user.id,
          organizationSlug: 'founding-partner-agency',
          operationType: 'IMAGE_GENERATION',
          provider: 'simulated',
          estimatedCost: 5,
          simulate: true,
          clientGovernanceEnabled: false,
        });
        return res.status(200).json({
          ok: true,
          frontalSlayer: fs,
          partnerAgency: agency,
          productPhotographyBlocked: blocked,
          forgedBillingOwnerIgnored: forged,
        });
      }

      if (action === 'simulate_production') {
        const slug = organizationSlug || 'frontal-slayer';
        const sim = await simulateProductionOperation(supabase, {
          context: {
            operatorUserId: operatorEmail,
            operatorEmail,
            organizationId: slug,
            organizationSlug: slug,
            clientId: str(body.clientId) || undefined,
            projectId: str(body.projectId) || undefined,
            campaignId: str(body.campaignId) || undefined,
          },
          operationType: 'IMAGE_GENERATION',
          provider: 'simulated',
          estimatedCost: num(body.estimatedCost, 2.5),
          simulate: true,
        });
        return res.status(200).json({ ok: true, ...sim });
      }

      return res.status(400).json({ error: 'Unknown action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[studio-partner-onboarding]', err instanceof Error ? err.message : err);
    return res.status(500).json({ error: 'Partner onboarding request failed' });
  }
}
