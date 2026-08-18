import { getSupabaseAdmin } from '../supabase.js';
import { aiProductionDirector } from './aiDirector.js';
import { buildDependencyMapFromRecipe, recomputeDeliverableReadiness } from './dependencyEngine.js';
import { computeNextActions } from './nextActionEngine.js';
import { computeReadiness } from './readinessEngine.js';

const DEMO_SLUG = 'northquarter-rebuild';

export async function ensureDemoProjectSeeded(): Promise<{ projectId: string; created: boolean }> {
  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase.from('site00_projects').select('id').eq('slug', DEMO_SLUG).maybeSingle();
  if (existing?.id) return { projectId: existing.id, created: false };

  const { data: recipe } = await supabase
    .from('site00_production_recipes')
    .select('id')
    .eq('recipe_key', 'site_ecommerce')
    .single();
  if (!recipe) throw new Error('SITE ECOMMERCE RECIPE NOT FOUND');

  const { data: project, error: pErr } = await supabase
    .from('site00_projects')
    .insert({
      slug: DEMO_SLUG,
      name: 'NORTHQUARTER REBUILD',
      client_email: 'client@northquarter.example',
      build_class: 'SITE',
      build_type: 'ECOMMERCE',
      identity_state: 'SOME PIECES EXIST',
      current_phase: 'DESIGN_DIRECTION',
      project_health: 'ON_TRACK',
      payment_state: 'CONFIRMED',
      provisioning_state: 'IN_PROGRESS',
      production_readiness_pct: 50,
      environment_readiness_pct: 60,
      recipe_id: recipe.id,
    })
    .select('id')
    .single();
  if (pErr || !project) throw pErr ?? new Error('FAILED TO CREATE DEMO PROJECT');

  const projectId = project.id;

  await supabase.from('site00_project_intelligence').insert({
    project_id: projectId,
    identity_state: 'SOME PIECES EXIST',
    build_class: 'SITE',
    build_type: 'ECOMMERCE',
    business_type: 'ECOMMERCE',
    industry: 'PREMIUM SKINCARE',
    primary_goals: ['INCREASE CONVERSION', 'BUILD BRAND CREDIBILITY'],
    target_audience: ['WOMEN 25–45', 'PREMIUM SKINCARE BUYERS'],
    brand_maturity: 'PARTIAL',
    existing_assets: ['LOGO MARK', 'PRODUCT PHOTOGRAPHY'],
    missing_assets: ['TYPOGRAPHY SYSTEM', 'HOMEPAGE DIRECTION'],
    required_features: ['COLLECTION PAGES', 'CHECKOUT', 'MEMBER AREA'],
    timeline: 'Q4 LAUNCH',
    budget_range: '$3.5K–$10K',
    current_phase: 'DESIGN_DIRECTION',
    confidence: 0.84,
    provenance: { build_class: 'CLIENT_PROVIDED', goals: 'AI_SUGGESTED' },
  });

  await supabase.from('site00_creative_constitutions').insert({
    project_id: projectId,
    brand_rules: ['PRIMARY RED: #EB1C24', 'USE APPROVED LOGO ONLY', 'BRIGHT ARCHITECTURE', 'NO GOLD'],
    client_preferences: ['MINIMAL LAYOUTS', 'EDITORIAL TYPOGRAPHY', 'STRONG WHITESPACE'],
    approved_decisions: ['DIRECTION B', 'TYPOGRAPHY OPTION 2'],
    rejected_decisions: ['DARK BACKGROUND', 'GRADIENT HERO', 'DIRECTION A'],
    must_include: ['PRODUCT CRAFTSMANSHIP STORY'],
    must_avoid: ['GENERIC ECOMMERCE CLICHÉS'],
  });

  const { data: recipeDeliverables } = await supabase
    .from('site00_recipe_deliverables')
    .select('*')
    .eq('recipe_id', recipe.id)
    .order('sort_order');

  const statusByKey: Record<string, string> = {
    strategy_synthesis: 'APPROVED',
    sitemap: 'APPROVED',
    conversion_architecture: 'APPROVED',
    homepage_visual_direction: 'GENERATING',
    collection_page: 'QUEUED',
    product_page: 'QUEUED',
    cart_checkout: 'NOT_READY',
    mobile_adaptation: 'BLOCKED',
    design_system: 'QUEUED',
    developer_handoff: 'NOT_READY',
  };

  for (const rd of recipeDeliverables ?? []) {
    await supabase.from('site00_project_deliverables').insert({
      project_id: projectId,
      recipe_deliverable_id: rd.id,
      deliverable_key: rd.deliverable_key,
      category: rd.category,
      title: rd.title,
      description: rd.description,
      status: statusByKey[rd.deliverable_key] ?? 'NOT_READY',
      recipe_id: recipe.id,
      variants_requested: rd.default_variants,
      blocked_by: rd.deliverable_key === 'mobile_adaptation' ? ['homepage_visual_direction'] : [],
    });
  }

  await supabase.from('site00_studio_pipeline_state').insert({
    project_id: projectId,
    interpret_status: 'COMPLETE',
    direct_status: 'COMPLETE',
    produce_status: 'IN_PROGRESS',
    approve_status: 'PENDING',
  });

  const { data: homepageDel } = await supabase
    .from('site00_project_deliverables')
    .select('id')
    .eq('project_id', projectId)
    .eq('deliverable_key', 'homepage_visual_direction')
    .single();

  if (homepageDel) {
    const briefJson = await aiProductionDirector.generateBrief({
      deliverableTitle: 'HOMEPAGE ART DIRECTION',
      projectName: 'NORTHQUARTER REBUILD',
      constitution: {},
    });
    const { data: brief } = await supabase
      .from('site00_production_briefs')
      .insert({
        project_id: projectId,
        deliverable_id: homepageDel.id,
        title: String(briefJson.title),
        status: 'APPROVED',
        brief_json: briefJson,
        provenance: 'AI_SUGGESTED',
      })
      .select('id')
      .single();

    await supabase.from('site00_production_jobs').insert([
      {
        project_id: projectId,
        deliverable_id: homepageDel.id,
        brief_id: brief?.id,
        status: 'PROCESSING',
        variants_requested: 3,
        progress_pct: 62,
        provider: 'dev-adapter',
        started_at: new Date().toISOString(),
        metadata: { label: 'HOMEPAGE ART DIRECTION' },
      },
      {
        project_id: projectId,
        deliverable_id: homepageDel.id,
        status: 'QUEUED',
        variants_requested: 2,
        metadata: { label: 'TYPOGRAPHY SYSTEM' },
      },
    ]);
  }

  const { data: services } = await supabase.from('site00_service_catalog').select('id, provider_key');
  for (const svc of services ?? []) {
    let state = 'NOT_REQUIRED';
    let phase = 'LAUNCH';
    if (svc.provider_key === 'godaddy' || svc.provider_key === 'github' || svc.provider_key === 'vercel') {
      state = 'CONNECTED';
      phase = 'BUILD';
    } else if (svc.provider_key === 'supabase') {
      state = 'CLIENT_ACTION_REQUIRED';
      phase = 'BUILD';
    } else if (svc.provider_key === 'stripe' || svc.provider_key === 'resend') {
      state = 'REQUIRED_LATER';
      phase = 'LAUNCH';
    }
    await supabase.from('site00_project_service_requirements').insert({
      project_id: projectId,
      service_id: svc.id,
      required_phase: phase,
      connection_state: state,
      owner_type: 'CLIENT',
    });
    if (state === 'CONNECTED') {
      await supabase.from('site00_service_connections').insert({
        project_id: projectId,
        service_id: svc.id,
        connection_state: 'CONNECTED',
        owner_type: 'CLIENT',
        connected_account_label: 'CLIENT OWNED',
        permission_level: 'DEVELOPER',
      });
    }
  }

  await supabase.from('site00_provisioning_sessions').insert({
    project_id: projectId,
    status: 'OPEN',
    current_step: 'CONNECT_ACCESS',
    readiness_pct: 60,
  });

  await supabase.from('site00_approval_requests').insert([
    {
      project_id: projectId,
      title: 'HOMEPAGE ART DIRECTION — OPTION B',
      category: 'DESIGN',
      status: 'ADMIN_REVIEW',
      priority: 'HIGH',
    },
    {
      project_id: projectId,
      title: 'BRAND VOICE REFINEMENT',
      category: 'COPY',
      status: 'AI_DRAFT',
      priority: 'MEDIUM',
    },
  ]);

  await supabase.from('site00_project_activity').insert([
    { project_id: projectId, event_type: 'PAYMENT_CONFIRMED', actor_type: 'SYSTEM', summary: 'PAYMENT CONFIRMED FOR NORTHQUARTER REBUILD.' },
    { project_id: projectId, event_type: 'BRIEF_APPROVED', actor_type: 'ADMIN', summary: 'HOMEPAGE ART DIRECTION BRIEF APPROVED.' },
    { project_id: projectId, event_type: 'GENERATION_STARTED', actor_type: 'AI', summary: 'HOMEPAGE ART DIRECTION GENERATION STARTED (3 VARIANTS).' },
  ]);

  await refreshProjectDerivedState(projectId);

  return { projectId, created: true };
}

export async function refreshProjectDerivedState(projectId: string) {
  const supabase = getSupabaseAdmin();

  const { data: deliverables } = await supabase
    .from('site00_project_deliverables')
    .select('id, deliverable_key, status, blocked_by')
    .eq('project_id', projectId);

  const { data: recipeDeliverables } = await supabase
    .from('site00_recipe_deliverables')
    .select('deliverable_key, depends_on');

  const depMap = buildDependencyMapFromRecipe(recipeDeliverables ?? []);
  const recomputed = recomputeDeliverableReadiness(deliverables ?? [], depMap);

  for (const d of recomputed) {
    await supabase
      .from('site00_project_deliverables')
      .update({ status: d.status, blocked_by: d.blocked_by })
      .eq('id', d.id);
  }

  const complete = recomputed.filter((d) =>
    ['APPROVED', 'CLIENT_APPROVED', 'DELIVERED'].includes(String(d.status)),
  ).length;

  const { data: accessReqs } = await supabase
    .from('site00_project_service_requirements')
    .select('connection_state, required_phase')
    .eq('project_id', projectId);

  const connected = (accessReqs ?? []).filter((a) => a.connection_state === 'CONNECTED').length;
  const accessTotal = (accessReqs ?? []).filter((a) => a.connection_state !== 'NOT_REQUIRED').length;

  const readiness = computeReadiness({
    deliverablesComplete: complete,
    deliverablesTotal: recomputed.length,
    assetsPresent: 2,
    assetsRequired: 4,
    accessConnected: connected,
    accessRequired: accessTotal || 1,
    dependenciesClear: recomputed.filter((d) => d.status !== 'BLOCKED').length,
    dependenciesTotal: recomputed.length,
    approvalsClear: complete,
    approvalsTotal: recomputed.length,
  });

  await supabase
    .from('site00_projects')
    .update({
      production_readiness_pct: readiness.productionReadiness,
      environment_readiness_pct: readiness.accessReadiness,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId);

  const { data: project } = await supabase.from('site00_projects').select('*').eq('id', projectId).single();
  if (!project) return;

  const { data: accessRows } = await supabase
    .from('site00_project_service_requirements')
    .select('connection_state, site00_service_catalog(provider_key, display_name), required_phase')
    .eq('project_id', projectId);

  const { count: pendingApprovals } = await supabase
    .from('site00_approval_requests')
    .select('*', { count: 'exact', head: true })
    .in('status', ['AI_DRAFT', 'ADMIN_REVIEW']);

  const { data: feedback } = await supabase
    .from('site00_client_feedback')
    .select('id, body')
    .eq('project_id', projectId)
    .eq('status', 'RECEIVED');

  const actions = computeNextActions({
    project,
    deliverables: recomputed.map((d) => ({
      deliverable_key: d.deliverable_key,
      title: d.deliverable_key,
      status: String(d.status),
      blocked_by: d.blocked_by ?? [],
    })),
    access: (accessRows ?? []).map((r) => {
      const cat = r.site00_service_catalog as { provider_key: string; display_name: string } | null;
      return {
        provider_key: cat?.provider_key ?? '',
        display_name: cat?.display_name ?? '',
        connection_state: r.connection_state,
        required_phase: r.required_phase,
      };
    }),
    pendingApprovals: pendingApprovals ?? 0,
    feedback: feedback ?? [],
  });

  await supabase.from('site00_next_actions').delete().eq('project_id', projectId).is('resolved_at', null);
  if (actions.length) {
    await supabase.from('site00_next_actions').insert(actions);
  }
}
