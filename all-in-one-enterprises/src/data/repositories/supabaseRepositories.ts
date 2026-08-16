import { isBackendMode } from '../../config/dataMode';
import type { IntakeAnswers } from '../../intake/intakeTypes';
import type { RoadmapResult } from '../../roadmap/roadmapTypes';
import { getWorkflowForDivision, statusLabelForStep, buildCustomerTimeline } from '../../office/workflows/workflowEngine';
import { computePriority } from '../../office/priorityEngine';
import { getAioSupabase } from '../supabase/client';
import type { ServiceRequest } from '../../demo/demoTypes';
import type {
  IntakeRepository,
  OperationalDataRepository,
  RoadmapRepository,
  ServicePlanRepository,
  ServiceRequestRepository,
  SubmitRequestPayload,
} from './types';

function requireOrgId(orgId: string | undefined): string {
  if (!orgId) throw new Error('No organization context.');
  return orgId;
}

export class SupabaseIntakeRepository implements IntakeRepository {
  constructor(private orgId: string, private userId: string) {}

  load(): IntakeAnswers | null {
    return null;
  }

  async save(answers: IntakeAnswers): Promise<void> {
    const supabase = getAioSupabase();
    if (!supabase) return;

    const { data: existing } = await supabase
      .from('aio_intake_sessions')
      .select('id')
      .eq('organization_id', this.orgId)
      .eq('user_id', this.userId)
      .eq('status', 'in_progress')
      .maybeSingle();

    if (existing?.id) {
      await supabase
        .from('aio_intake_sessions')
        .update({ answers, status: 'in_progress' })
        .eq('id', existing.id);
    } else {
      await supabase.from('aio_intake_sessions').insert({
        organization_id: this.orgId,
        user_id: this.userId,
        answers,
        status: 'in_progress',
      });
    }
  }

  async loadAsync(): Promise<IntakeAnswers | null> {
    const supabase = getAioSupabase();
    if (!supabase) return null;

    const { data } = await supabase
      .from('aio_intake_sessions')
      .select('answers')
      .eq('organization_id', this.orgId)
      .eq('user_id', this.userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return (data?.answers as IntakeAnswers) ?? null;
  }

  clear(): void {
    /* backend clear not exposed to customers */
  }
}

export class SupabaseRoadmapRepository implements RoadmapRepository {
  constructor(private orgId: string, private userId: string) {}

  load(): RoadmapResult | null {
    return null;
  }

  async save(result: RoadmapResult): Promise<void> {
    const supabase = getAioSupabase();
    if (!supabase) return;

    const { data: roadmap, error } = await supabase
      .from('aio_roadmaps')
      .insert({
        organization_id: this.orgId,
        user_id: this.userId,
        rule_version: 'v1',
        compliance_progress: result.complianceProgress,
        business_progress: result.businessServicesProgress,
        status: 'active',
      })
      .select('id')
      .single();

    if (error || !roadmap) return;

    const items = result.items.map((item, index) => ({
      roadmap_id: roadmap.id,
      title: item.title,
      status: item.status,
      category: item.category ?? null,
      reason: item.reason ?? null,
      sort_order: index,
    }));

    if (items.length > 0) {
      await supabase.from('aio_roadmap_items').insert(items);
    }

    await supabase.from('aio_activity_events').insert({
      event_type: 'ROADMAP_GENERATED',
      actor_user_id: this.userId,
      organization_id: this.orgId,
      entity_type: 'roadmap',
      entity_id: roadmap.id,
      visibility: 'customer',
      title: 'Preliminary Roadmap generated',
    });
  }

  async loadAsync(): Promise<RoadmapResult | null> {
    const supabase = getAioSupabase();
    if (!supabase) return null;

    const { data: roadmap } = await supabase
      .from('aio_roadmaps')
      .select('*')
      .eq('organization_id', this.orgId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!roadmap) return null;

    const { data: items } = await supabase
      .from('aio_roadmap_items')
      .select('*')
      .eq('roadmap_id', roadmap.id)
      .order('sort_order');

    return {
      items: (items ?? []).map((i) => ({
        id: i.id,
        category: (i.category ?? 'business') as RoadmapResult['items'][number]['category'],
        title: i.title,
        description: i.reason ?? '',
        status: i.status as RoadmapResult['items'][number]['status'],
        priority: 'medium' as const,
        reason: i.reason ?? '',
        serviceAvailable: false,
        requiredForProgress: true,
        source: 'rule' as const,
      })),
      complianceProgress: roadmap.compliance_progress,
      businessServicesProgress: roadmap.business_progress,
      generatedAt: roadmap.created_at,
      summary: 'Preliminary Roadmap based on information provided.',
      crossSellRecommendations: [],
    };
  }

  clear(): void {}
}

export class SupabaseServicePlanRepository implements ServicePlanRepository {
  private key(orgId: string) {
    return `aio_service_plan_${orgId}`;
  }

  constructor(private orgId: string) {}

  load() {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(this.key(this.orgId));
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  async save(items: ReturnType<ServicePlanRepository['load']>): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.key(this.orgId), JSON.stringify(items));
  }

  async add(item: ReturnType<ServicePlanRepository['load']>[number]): Promise<void> {
    const items = this.load();
    if (!items.some((p: { slug: string }) => p.slug === item.slug)) {
      await this.save([...items, item]);
    }
  }

  async remove(slug: string): Promise<void> {
    await this.save(this.load().filter((p: { slug: string }) => p.slug !== slug));
  }

  clear(): void {
    if (typeof window !== 'undefined') localStorage.removeItem(this.key(this.orgId));
  }
}

function mapRequestRow(row: Record<string, unknown>, orgName: string): ServiceRequest {
  const division = String(row.division);
  const workflowStep = String(row.workflow_step);
  return {
    id: String(row.id),
    requestNumber: String(row.request_number),
    clientId: String(row.organization_id),
    services: row.service_slug
      ? [{ slug: String(row.service_slug), title: String(row.service_slug), division }]
      : [{ slug: division, title: division, division }],
    division,
    status: workflowStep as ServiceRequest['status'],
    statusLabel: String(row.status_label ?? statusLabelForStep(workflowStep)),
    workflowStep,
    priority: (row.priority as ServiceRequest['priority']) ?? 'normal',
    assignedStaffId: row.assigned_staff_user_id ? String(row.assigned_staff_user_id) : undefined,
    createdAt: String(row.created_at),
    targetDate: row.target_date ? String(row.target_date) : undefined,
    nextStep: getWorkflowForDivision(division).steps.find((s) => s.id === workflowStep)?.customerLabel ?? '',
    businessName: orgName,
    contactName: '',
    contactEmail: '',
    customerNotes: row.customer_notes ? String(row.customer_notes) : undefined,
    timeline: buildCustomerTimeline(division, workflowStep),
    documentIds: [],
    taskIds: [],
    isDemo: false,
  };
}

export class SupabaseServiceRequestRepository implements ServiceRequestRepository {
  constructor(private orgId: string, private userId: string, private orgName: string) {}

  async loadAll(): Promise<ServiceRequest[]> {
    const supabase = getAioSupabase();
    if (!supabase) return [];

    const query = supabase.from('aio_service_requests').select('*').order('created_at', { ascending: false });

    const { data } = await (this.orgId === '__internal__'
      ? query
      : query.eq('organization_id', this.orgId));

    return (data ?? []).map((row) => mapRequestRow(row, this.orgName));
  }

  async getById(id: string): Promise<ServiceRequest | undefined> {
    const supabase = getAioSupabase();
    if (!supabase) return undefined;

    const { data } = await supabase.from('aio_service_requests').select('*').eq('id', id).maybeSingle();
    return data ? mapRequestRow(data, this.orgName) : undefined;
  }

  async create(payload: SubmitRequestPayload): Promise<ServiceRequest> {
    const supabase = getAioSupabase();
    if (!supabase) throw new Error('Backend not configured');

    const orgId = requireOrgId(this.orgId);
    const division = payload.services[0]?.division ?? 'permitting';
    const wf = getWorkflowForDivision(division);
    const step = wf.steps[0];

    const { data: numData, error: numError } = await supabase.rpc('aio_next_request_number');
    const requestNumber = !numError && numData ? String(numData) : `AIO-${Date.now()}`;

    const { data, error } = await supabase
      .from('aio_service_requests')
      .insert({
        organization_id: orgId,
        requester_user_id: this.userId,
        request_number: requestNumber,
        division,
        service_slug: payload.services[0]?.slug ?? null,
        status: step.id,
        workflow_step: step.id,
        status_label: statusLabelForStep(step.id),
        priority: computePriority({ status: step.id, createdAt: new Date().toISOString() }),
        customer_notes: payload.notes ?? null,
      })
      .select('*')
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Failed to create request');

    await supabase.from('aio_service_request_status_history').insert({
      request_id: data.id,
      to_status: step.id,
      actor_user_id: this.userId,
    });

    await supabase.from('aio_activity_events').insert({
      event_type: 'REQUEST_CREATED',
      actor_user_id: this.userId,
      organization_id: orgId,
      entity_type: 'service_request',
      entity_id: data.id,
      visibility: 'customer',
      title: `Service request ${requestNumber} submitted`,
    });

    return mapRequestRow(data, this.orgName);
  }

  async updateStatus(requestId: string, workflowStep: string, staffId?: string): Promise<ServiceRequest | undefined> {
    const supabase = getAioSupabase();
    if (!supabase) return undefined;

    const { data: prev } = await supabase.from('aio_service_requests').select('workflow_step').eq('id', requestId).single();

    const { data, error } = await supabase
      .from('aio_service_requests')
      .update({
        workflow_step: workflowStep,
        status: workflowStep,
        status_label: statusLabelForStep(workflowStep),
      })
      .eq('id', requestId)
      .select('*')
      .single();

    if (error || !data) return undefined;

    await supabase.from('aio_service_request_status_history').insert({
      request_id: requestId,
      from_status: prev?.workflow_step ?? null,
      to_status: workflowStep,
      actor_user_id: staffId ?? this.userId,
    });

    await supabase.from('aio_activity_events').insert({
      event_type: 'REQUEST_STATUS_CHANGED',
      actor_user_id: staffId ?? this.userId,
      organization_id: data.organization_id,
      entity_type: 'service_request',
      entity_id: requestId,
      visibility: 'customer',
      title: `${data.request_number} → ${statusLabelForStep(workflowStep)}`,
    });

    return mapRequestRow(data, this.orgName);
  }

  async assign(requestId: string, staffId: string): Promise<void> {
    const supabase = getAioSupabase();
    if (!supabase) return;

    await supabase
      .from('aio_service_requests')
      .update({ assigned_staff_user_id: staffId })
      .eq('id', requestId);

    await supabase.from('aio_activity_events').insert({
      event_type: 'REQUEST_ASSIGNED',
      actor_user_id: this.userId,
      entity_type: 'service_request',
      entity_id: requestId,
      visibility: 'internal',
      title: 'Request assigned',
    });
  }

  clear(): void {}
}

export class SupabaseOperationalDataRepository implements OperationalDataRepository {
  constructor(private orgId: string | null, private isInternal: boolean) {}

  async loadSnapshot() {
    if (!this.isInternal || !this.orgId) {
      return {};
    }
    return {};
  }

  isRealtime() {
    return false;
  }
}

export function createBackendRepositories(ctx: {
  orgId: string;
  userId: string;
  orgName: string;
  isInternal: boolean;
}) {
  return {
    intake: new SupabaseIntakeRepository(ctx.orgId, ctx.userId),
    roadmap: new SupabaseRoadmapRepository(ctx.orgId, ctx.userId),
    servicePlan: new SupabaseServicePlanRepository(ctx.orgId),
    serviceRequests: ctx.isInternal
      ? new SupabaseServiceRequestRepository('__internal__', ctx.userId, ctx.orgName)
      : new SupabaseServiceRequestRepository(ctx.orgId, ctx.userId, ctx.orgName),
    operational: new SupabaseOperationalDataRepository(ctx.orgId, ctx.isInternal),
  };
}

export function isBackendRepositoriesActive(): boolean {
  return isBackendMode();
}
