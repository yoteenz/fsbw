import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import { getSupabaseAdmin } from '../_lib/supabase.js';
import {
  evaluateGovernanceForRequest,
  getActiveBudget,
  getOrganizationBySlug,
  getUsageTotalsForBillingOwner,
  listEntitlements,
  listOrganizationsForUser,
  seedGovernanceFixtures,
  simulateProductionOperation,
} from '../_lib/productionGovernance/service.js';
import type { ProductionOperationType } from '../../src/studio-os-core/production-governance/types.js';

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

/**
 * Studio World Production Governance API (admin/debug)
 * GET  ?action=dashboard&organizationSlug=&operatorEmail=
 * POST — seed_fixtures, simulate, evaluate
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
    const operatorEmail = str(body.operatorEmail) || str(query.operatorEmail) || auth.user.email || '';
    const organizationSlug =
      str(body.organizationSlug) || str(query.organizationSlug) || 'frontal-slayer';

    if (req.method === 'GET') {
      const action = str(query.action) || 'dashboard';

      if (action === 'organizations') {
        const orgs = await listOrganizationsForUser(supabase, operatorEmail);
        return res.status(200).json({ ok: true, operatorEmail, organizations: orgs });
      }

      if (action === 'dashboard') {
        const org = await getOrganizationBySlug(supabase, organizationSlug);
        if (!org) return res.status(404).json({ error: 'Organization not found' });

        const entitlements = await listEntitlements(supabase, org.id);
        const budget = await getActiveBudget(supabase, org.id);
        const bounds = budget
          ? { start: budget.periodStart, end: budget.periodEnd }
          : {
              start: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString(),
              end: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, 1)).toISOString(),
            };
        const totals = await getUsageTotalsForBillingOwner(supabase, org.id, bounds.start, bounds.end);

        const { data: usageLedger } = await supabase
          .from('studio_world_production_usage_events')
          .select('*')
          .eq('billing_owner_id', org.id)
          .order('created_at', { ascending: false })
          .limit(20);

        const { data: reservations } = await supabase
          .from('studio_world_production_cost_reservations')
          .select('*')
          .eq('billing_owner_id', org.id)
          .order('created_at', { ascending: false })
          .limit(10);

        const { data: auditEvents } = await supabase
          .from('studio_world_production_audit_events')
          .select('*')
          .eq('organization_id', org.id)
          .order('created_at', { ascending: false })
          .limit(15);

        const hard = budget?.hardLimit;
        const capacity =
          hard != null && hard > 0
            ? Math.max(0, hard - totals.actual - totals.reserved)
            : null;

        return res.status(200).json({
          ok: true,
          operatorEmail,
          activeOrganization: org,
          billingOwner: { billingOwnerType: 'organization', billingOwnerId: org.id, organizationSlug: org.slug },
          entitlements,
          budget,
          usage: {
            actual: totals.actual,
            reserved: totals.reserved,
            availableCapacity: capacity,
            percentUsed: hard ? ((totals.actual + totals.reserved) / hard) * 100 : null,
          },
          usageLedger: usageLedger ?? [],
          reservations: reservations ?? [],
          auditEvents: auditEvents ?? [],
        });
      }

      return res.status(400).json({ error: 'Unknown action' });
    }

    if (req.method === 'POST') {
      const action = str(body.action);

      if (action === 'seed_fixtures') {
        const seed = await seedGovernanceFixtures(supabase);
        return res.status(200).json({ ok: true, ...seed });
      }

      if (action === 'evaluate') {
        const result = await evaluateGovernanceForRequest(supabase, {
          context: {
            operatorUserId: operatorEmail,
            operatorEmail,
            organizationId: organizationSlug,
            organizationSlug,
            clientId: str(body.clientId) || undefined,
            projectId: str(body.projectId) || undefined,
            campaignId: str(body.campaignId) || undefined,
          },
          operationType: (str(body.operationType) || 'IMAGE_GENERATION') as ProductionOperationType,
          provider: str(body.provider) || 'simulated',
          estimatedCost: num(body.estimatedCost, 1),
          simulate: true,
        });
        return res.status(200).json({ ok: true, result });
      }

      if (action === 'simulate') {
        const sim = await simulateProductionOperation(supabase, {
          context: {
            operatorUserId: operatorEmail,
            operatorEmail,
            organizationId: organizationSlug,
            organizationSlug,
            clientId: str(body.clientId) || undefined,
            campaignId: str(body.campaignId) || undefined,
          },
          operationType: (str(body.operationType) || 'IMAGE_GENERATION') as ProductionOperationType,
          provider: 'simulated',
          estimatedCost: num(body.estimatedCost, 2.5),
          idempotencyKey: str(body.idempotencyKey) || undefined,
          simulate: true,
          failProvider: body.failProvider === true,
        });
        return res.status(200).json({ ok: true, ...sim });
      }

      if (action === 'switch_organization') {
        const targetSlug = str(body.organizationSlug);
        if (!targetSlug) {
          return res.status(400).json({ error: 'organizationSlug required' });
        }
        const org = await getOrganizationBySlug(supabase, targetSlug);
        if (!org) return res.status(404).json({ error: 'Organization not found' });
        const membership = await supabase
          .from('studio_world_organization_memberships')
          .select('id')
          .eq('organization_id', org.id)
          .eq('user_email', operatorEmail.toLowerCase())
          .eq('status', 'active')
          .maybeSingle();
        if (!membership.data) {
          return res.status(403).json({ error: 'Operator is not a member of target organization' });
        }
        await supabase.from('studio_world_operator_preferences').upsert(
          {
            user_email: operatorEmail.toLowerCase(),
            active_organization_slug: targetSlug,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_email' }
        );
        return res.status(200).json({ ok: true, activeOrganizationSlug: targetSlug });
      }

      return res.status(400).json({ error: 'Unknown action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[studio-production-governance]', err instanceof Error ? err.message : err);
    return res.status(500).json({ error: 'Production governance request failed' });
  }
}
