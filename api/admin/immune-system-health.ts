export const config = { maxDuration: 30 };

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import { getSupabaseAdminServiceRole } from '../_lib/supabase.js';
import { probeGovernedGenerationJobsTable } from '../_lib/immuneSystem/schema-probe.js';
import { listIncidents } from '../../src/studio-os-core/immune-system/incident-recorder.js';
import {
  evaluateDeploymentReadinessFromTables,
  getGovernedGenerationReadinessFromPresence,
} from '../../src/studio-os-core/immune-system/readiness.js';
import {
  isImmuneAutoRepairEnabled,
  isImmuneProductionTargetVerified,
  resolveImmuneEnvironment,
  resolveSupabaseProjectRef,
} from '../_lib/immuneSystem/production-target.js';

/**
 * GET /api/admin/immune-system-health
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const auth = await resolveAdminAuth(req);
  if (!auth.ok) {
    const { status, error, code } = auth.failure;
    return res.status(status).json({ ok: false, error, code });
  }

  try {
    const supabase = getSupabaseAdminServiceRole();
    const probe = await probeGovernedGenerationJobsTable(supabase);
    const governedGeneration = getGovernedGenerationReadinessFromPresence(probe.tableExists);
    const deployment = evaluateDeploymentReadinessFromTables({
      'public.studio_governed_generation_jobs': probe.tableExists,
    });

    return res.status(200).json({
      ok: true,
      environment: resolveImmuneEnvironment(),
      projectRef: resolveSupabaseProjectRef(),
      autoRepairEnabled: isImmuneAutoRepairEnabled(),
      productionTargetVerified: isImmuneProductionTargetVerified(),
      subsystems: {
        governedGeneration,
      },
      deploymentReadiness: deployment,
      recentIncidentCount: listIncidents(10).length,
      checkedAt: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err instanceof Error ? err.message : 'Health check failed',
    });
  }
}
