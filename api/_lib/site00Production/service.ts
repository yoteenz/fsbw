import { getSupabaseAdmin } from '../supabase.js';
import { aiProductionDirector } from './aiDirector.js';
import { ensureDemoProjectSeeded, refreshProjectDerivedState } from './seedDemo.js';

export async function getDashboardPayload() {
  const supabase = getSupabaseAdmin();
  await ensureDemoProjectSeeded();

  const { data: projects } = await supabase.from('site00_projects').select('*').eq('status', 'ACTIVE').order('updated_at', { ascending: false });

  const { data: nextActions } = await supabase
    .from('site00_next_actions')
    .select('*, site00_projects(name, slug)')
    .is('resolved_at', null)
    .order('created_at', { ascending: false })
    .limit(20);

  const { count: approvalCount } = await supabase
    .from('site00_approval_requests')
    .select('*', { count: 'exact', head: true })
    .in('status', ['AI_DRAFT', 'ADMIN_REVIEW']);

  const { data: accessAlerts } = await supabase
    .from('site00_project_service_requirements')
    .select('connection_state, site00_projects(name, slug), site00_service_catalog(display_name, provider_key)')
    .eq('connection_state', 'CLIENT_ACTION_REQUIRED');

  return {
    projects: projects ?? [],
    nextActions: nextActions ?? [],
    approvalCount: approvalCount ?? 0,
    accessAlerts: accessAlerts ?? [],
  };
}

export async function getStudioPayload(projectId?: string) {
  const supabase = getSupabaseAdmin();
  const { projectId: demoId } = await ensureDemoProjectSeeded();
  const pid = projectId ?? demoId;

  await refreshProjectDerivedState(pid);

  const { data: project } = await supabase.from('site00_projects').select('*').eq('id', pid).single();
  const { data: pipeline } = await supabase.from('site00_studio_pipeline_state').select('*').eq('project_id', pid).maybeSingle();
  const { data: intelligence } = await supabase.from('site00_project_intelligence').select('*').eq('project_id', pid).maybeSingle();
  const { data: deliverables } = await supabase.from('site00_project_deliverables').select('*').eq('project_id', pid).order('category');
  const { data: jobs } = await supabase.from('site00_production_jobs').select('*').eq('project_id', pid).order('created_at', { ascending: false });
  const { data: projects } = await supabase.from('site00_projects').select('id, name, slug, current_phase, project_health').eq('status', 'ACTIVE');

  const insights = await aiProductionDirector.recommendInsights({
    name: project?.name ?? '',
    deliverables: (deliverables ?? []).map((d) => ({ title: d.title, status: d.status })),
  });

  const deliverableMap = groupDeliverables(deliverables ?? []);

  return { project, pipeline, intelligence, deliverables, deliverableMap, jobs, projects, insights };
}

export async function getApprovalsPayload(category?: string) {
  const supabase = getSupabaseAdmin();
  await ensureDemoProjectSeeded();

  let q = supabase
    .from('site00_approval_requests')
    .select('*, site00_projects(name, slug)')
    .in('status', ['AI_DRAFT', 'ADMIN_REVIEW'])
    .order('submitted_at', { ascending: false });

  if (category && category !== 'ALL') {
    q = q.eq('category', category);
  }

  const { data: items } = await q;
  return { items: items ?? [], total: items?.length ?? 0 };
}

export async function getProjectsPayload() {
  const supabase = getSupabaseAdmin();
  await ensureDemoProjectSeeded();
  const { data: projects } = await supabase.from('site00_projects').select('*').order('updated_at', { ascending: false });
  return { projects: projects ?? [] };
}

export async function getProjectWorkspace(projectId: string, section: string) {
  const supabase = getSupabaseAdmin();
  await refreshProjectDerivedState(projectId);

  const { data: project } = await supabase.from('site00_projects').select('*').eq('id', projectId).single();
  if (!project) throw new Error('PROJECT NOT FOUND');

  const base = {
    project,
    intelligence: null as Record<string, unknown> | null,
    constitution: null as Record<string, unknown> | null,
    deliverables: [] as unknown[],
    deliverableMap: {} as Record<string, { complete: number; total: number }>,
    approvals: [] as unknown[],
    access: [] as unknown[],
    activity: [] as unknown[],
    jobs: [] as unknown[],
    nextActions: [] as unknown[],
    studioSummary: { complete: 0, inProgress: 0, queued: 0, blocked: 0, total: 0 },
  };

  const { data: intelligence } = await supabase.from('site00_project_intelligence').select('*').eq('project_id', projectId).maybeSingle();
  const { data: constitution } = await supabase.from('site00_creative_constitutions').select('*').eq('project_id', projectId).maybeSingle();
  const { data: deliverables } = await supabase.from('site00_project_deliverables').select('*').eq('project_id', projectId);
  const { data: nextActions } = await supabase.from('site00_next_actions').select('*').eq('project_id', projectId).is('resolved_at', null);
  const { data: jobs } = await supabase.from('site00_production_jobs').select('*').eq('project_id', projectId);

  base.intelligence = intelligence;
  base.constitution = constitution;
  base.deliverables = deliverables ?? [];
  base.deliverableMap = groupDeliverables(deliverables ?? []);
  base.nextActions = nextActions ?? [];
  base.jobs = jobs ?? [];

  const statuses = deliverables ?? [];
  base.studioSummary = {
    complete: statuses.filter((d) => ['APPROVED', 'CLIENT_APPROVED', 'DELIVERED'].includes(d.status)).length,
    inProgress: statuses.filter((d) => ['GENERATING', 'AI_DRAFT', 'ADMIN_REVIEW', 'IN_PROGRESS'].includes(d.status)).length,
    queued: statuses.filter((d) => ['QUEUED', 'READY', 'BRIEF_GENERATED'].includes(d.status)).length,
    blocked: statuses.filter((d) => d.status === 'BLOCKED').length,
    total: statuses.length,
  };

  if (section === 'approvals' || section === 'overview') {
    const { data: approvals } = await supabase.from('site00_approval_requests').select('*').eq('project_id', projectId);
    base.approvals = approvals ?? [];
  }
  if (section === 'access' || section === 'overview') {
    const { data: access } = await supabase
      .from('site00_project_service_requirements')
      .select('*, site00_service_catalog(*)')
      .eq('project_id', projectId);
    base.access = access ?? [];
  }
  if (section === 'activity' || section === 'overview') {
    const { data: activity } = await supabase
      .from('site00_project_activity')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(50);
    base.activity = activity ?? [];
  }

  return base;
}

export async function approveBrief(briefId: string, adminUserId: string) {
  const supabase = getSupabaseAdmin();
  const { data: brief } = await supabase
    .from('site00_production_briefs')
    .update({ status: 'APPROVED', approved_by: adminUserId, approved_at: new Date().toISOString() })
    .eq('id', briefId)
    .select('project_id')
    .single();
  if (brief?.project_id) await refreshProjectDerivedState(brief.project_id);
  return brief;
}

export async function decideApproval(approvalId: string, decision: string, adminUserId: string, notes?: string) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('site00_approval_requests')
    .update({
      status: decision === 'APPROVE' ? 'APPROVED_INTERNALLY' : 'REVISION',
      decision,
      notes,
      decided_by: adminUserId,
      decided_at: new Date().toISOString(),
    })
    .eq('id', approvalId)
    .select('project_id')
    .single();
  if (data?.project_id) await refreshProjectDerivedState(data.project_id);
  return data;
}

export async function generateBriefForDeliverable(projectId: string, deliverableKey: string) {
  const supabase = getSupabaseAdmin();
  const { data: project } = await supabase.from('site00_projects').select('name').eq('id', projectId).single();
  const { data: del } = await supabase
    .from('site00_project_deliverables')
    .select('id, title')
    .eq('project_id', projectId)
    .eq('deliverable_key', deliverableKey)
    .single();
  if (!del) throw new Error('DELIVERABLE NOT FOUND');

  const { data: constitution } = await supabase.from('site00_creative_constitutions').select('*').eq('project_id', projectId).maybeSingle();
  const briefJson = await aiProductionDirector.generateBrief({
    deliverableTitle: del.title,
    projectName: project?.name ?? '',
    constitution: constitution ?? {},
  });

  const { data: brief } = await supabase
    .from('site00_production_briefs')
    .insert({
      project_id: projectId,
      deliverable_id: del.id,
      title: String(briefJson.title),
      status: 'DRAFT',
      brief_json: briefJson,
    })
    .select('*')
    .single();

  await supabase.from('site00_project_deliverables').update({ status: 'BRIEF_GENERATED', brief_id: brief?.id }).eq('id', del.id);
  await refreshProjectDerivedState(projectId);
  return brief;
}

function groupDeliverables(rows: Array<{ category: string; status: string }>) {
  const map: Record<string, { complete: number; total: number }> = {};
  for (const row of rows) {
    if (!map[row.category]) map[row.category] = { complete: 0, total: 0 };
    map[row.category].total += 1;
    if (['APPROVED', 'CLIENT_APPROVED', 'DELIVERED'].includes(row.status)) {
      map[row.category].complete += 1;
    }
  }
  return map;
}

export { ensureDemoProjectSeeded, refreshProjectDerivedState };
