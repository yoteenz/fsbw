import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';
import { getSupabaseAdminServiceRole } from '../_lib/supabase.js';

function parseBody(req: VercelRequest): Record<string, unknown> {
  const b = req.body;
  if (typeof b === 'string') {
    try {
      const p = JSON.parse(b) as unknown;
      return p && typeof p === 'object' && !Array.isArray(p) ? (p as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  if (b && typeof b === 'object' && !Array.isArray(b)) return b as Record<string, unknown>;
  return {};
}

/** GET/PUT /api/tutorial/progress — sync Mansion Tour + feature tour progress for signed-in users. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const user = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const supabase = getSupabaseAdminServiceRole();
  if (!supabase) return res.status(503).json({ error: 'Database unavailable' });

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('tutorial_progress')
      .select('*')
      .eq('user_id', user.id);
    if (error) {
      if (error.code === '42P01') {
        return res.status(200).json({ tours: {}, migrationRequired: true });
      }
      return res.status(500).json({ error: error.message });
    }

    const tours: Record<string, unknown> = {};
    let earnedAchievementIds: string[] = [];
    for (const row of data ?? []) {
      tours[row.tour_id as string] = {
        tourId: row.tour_id,
        status: row.status,
        lastStepId: row.last_step_id ?? undefined,
        lastStepIndex: row.last_step_index ?? -1,
        completedStepIds: row.completed_step_ids ?? [],
        completionPercentage: row.completion_percentage ?? 0,
        startedAt: row.started_at ?? undefined,
        completedAt: row.completed_at ?? undefined,
        skippedAt: row.skipped_at ?? undefined,
        dismissedAt: row.dismissed_at ?? undefined,
        updatedAt: row.updated_at,
      };
      const earned = row.earned_achievement_ids;
      if (Array.isArray(earned)) {
        earnedAchievementIds = [...new Set([...earnedAchievementIds, ...earned.map(String)])];
      }
    }
    return res.status(200).json({ tours, earnedAchievementIds });
  }

  if (req.method === 'PUT') {
    const body = parseBody(req);
    const tours = body.tours;
    const earnedAchievementIds = body.earnedAchievementIds;
    if (!tours || typeof tours !== 'object' || Array.isArray(tours)) {
      return res.status(400).json({ error: 'tours object required' });
    }

    const rows = Object.entries(tours as Record<string, Record<string, unknown>>).map(([tourId, p]) => ({
      user_id: user.id,
      tour_id: tourId,
      status: typeof p.status === 'string' ? p.status : 'not_started',
      last_step_id: typeof p.lastStepId === 'string' ? p.lastStepId : null,
      last_step_index: typeof p.lastStepIndex === 'number' ? p.lastStepIndex : -1,
      completed_step_ids: Array.isArray(p.completedStepIds) ? p.completedStepIds : [],
      completion_percentage: typeof p.completionPercentage === 'number' ? p.completionPercentage : 0,
      started_at: typeof p.startedAt === 'string' ? p.startedAt : null,
      completed_at: typeof p.completedAt === 'string' ? p.completedAt : null,
      skipped_at: typeof p.skippedAt === 'string' ? p.skippedAt : null,
      dismissed_at: typeof p.dismissedAt === 'string' ? p.dismissedAt : null,
      earned_achievement_ids: Array.isArray(earnedAchievementIds) ? earnedAchievementIds : [],
      updated_at: new Date().toISOString(),
    }));

    if (rows.length === 0) return res.status(200).json({ ok: true });

    const { error } = await supabase.from('tutorial_progress').upsert(rows, {
      onConflict: 'user_id,tour_id',
    });
    if (error) {
      if (error.code === '42P01') {
        return res.status(503).json({ error: 'Run migration 20260704180000_tutorial_progress.sql' });
      }
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
