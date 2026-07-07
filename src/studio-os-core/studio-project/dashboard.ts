import type { ProductionDepartmentId, ProductionDepartmentStatus } from '../content-pipeline/departments';
import { nextProductionDepartment, PRODUCTION_DEPARTMENTS } from '../content-pipeline/departments';
import { getActiveBranch, getCreativeDirectionProject, NDXBOOK_PAGE_001_PROJECT_ID } from '../creative-direction-studio/store';
import { countBlockingFounderNotes, PAGE_001_ASSET_KEY } from '../ndxbook/founderNotes/store';
import type { NdxbookPage } from '../ndxbook/types';
import { DEPARTMENT_OBJECTIVES, DEPARTMENT_DISPLAY, PROJECT_001, PROJECT_001_OUTPUT_PLAN } from './constants';
import type { ProjectDashboardSnapshot, ProjectOutput, ProjectTimelineEvent, StudioProject } from './types';
import { STUDIO_PROJECT_001_ID } from './types';

function computeProgress(
  statuses: Record<ProductionDepartmentId, ProductionDepartmentStatus>,
  page: NdxbookPage | null
): number {
  const completed = Object.values(statuses).filter((s) => s === 'complete').length;
  let base = Math.round((completed / PRODUCTION_DEPARTMENTS.length) * 72);
  if (page) base += 10;
  if (page?.pipeline?.studioReview) base += 6;
  if (page?.pipeline?.approvedAt) base += 6;
  if (page?.status === 'scheduled' || page?.status === 'published') base += 6;
  return Math.min(100, base);
}

function resolveOutputs(page: NdxbookPage | null): { created: ProjectOutput[]; remaining: ProjectOutput[] } {
  const all = PROJECT_001_OUTPUT_PLAN.map((o) => ({ ...o, projectId: STUDIO_PROJECT_001_ID }));
  if (!page) {
    return { created: [], remaining: all };
  }

  const created: ProjectOutput[] = [
    { ...all[0]!, status: page.status === 'published' ? 'published' : page.pipeline?.approvedAt ? 'approved' : 'in-production' },
  ];

  if (page.status === 'review' || page.pipeline?.studioReview) {
    created.push({ ...all[1]!, status: 'in-review' });
  }

  const createdIds = new Set(created.map((c) => c.id));
  const remaining = all.filter((o) => !createdIds.has(o.id));

  return { created, remaining };
}

function buildTimeline(page: NdxbookPage | null, activeDept: ProductionDepartmentId): ProjectTimelineEvent[] {
  const events: ProjectTimelineEvent[] = [
    {
      id: 'tl-created',
      projectId: STUDIO_PROJECT_001_ID,
      kind: 'project-created',
      label: 'Project Created',
      detail: `${PROJECT_001.displayCode} · ${PROJECT_001.name}`,
      createdAt: page?.createdAt ?? new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ];

  const cds = getCreativeDirectionProject(NDXBOOK_PAGE_001_PROJECT_ID);
  if (cds) {
    events.push({
      id: 'tl-cd',
      projectId: STUDIO_PROJECT_001_ID,
      kind: 'creative-direction-updated',
      label: 'Creative Direction Updated',
      detail: cds.branches.find((b) => b.id === cds.activeBranchId)?.name ?? 'Branch active',
      createdAt: cds.updatedAt,
    });
    const branch = cds.branches.find((b) => b.id === cds.activeBranchId);
    if (branch && branch.references.length > 0) {
      events.push({
        id: 'tl-mood',
        projectId: STUDIO_PROJECT_001_ID,
        kind: 'mood-board-expanded',
        label: 'Mood Board Expanded',
        detail: `${branch.references.length} inspiration reference(s) analyzed`,
        createdAt: branch.references[0]!.addedAt,
      });
    }
  }

  if (page) {
    events.push({
      id: 'tl-prod',
      projectId: STUDIO_PROJECT_001_ID,
      kind: 'production-started',
      label: 'Production Started',
      detail: 'Primary production assets registered',
      createdAt: page.createdAt,
      departmentId: 'production',
    });
  }

  if (page?.pipeline?.studioReview) {
    events.push({
      id: 'tl-review',
      projectId: STUDIO_PROJECT_001_ID,
      kind: 'review-requested',
      label: 'Review Requested',
      detail: page.pipeline.studioReview.overallPass ? 'Studio Intelligence PASS' : 'Studio Intelligence — needs work',
      createdAt: page.pipeline.studioReview.reviewedAt,
      departmentId: 'review',
    });
  }

  if (page?.pipeline?.approvedAt) {
    events.push({
      id: 'tl-approved',
      projectId: STUDIO_PROJECT_001_ID,
      kind: 'marketing-approved',
      label: 'Production Approved',
      detail: 'Quality approved · expansion authorized',
      createdAt: page.pipeline.approvedAt,
      departmentId: 'review',
    });
  }

  if (page?.status === 'scheduled' || page?.status === 'published') {
    events.push({
      id: 'tl-pub',
      projectId: STUDIO_PROJECT_001_ID,
      kind: 'publishing-complete',
      label: page.status === 'published' ? 'Publishing Complete' : 'Publishing Scheduled',
      detail: page.status === 'published' ? 'Instagram output live' : 'Instagram output scheduled',
      createdAt: page.pipeline?.scheduledAt ?? page.updatedAt,
      departmentId: 'publishing',
    });
  }

  if (page?.status === 'published') {
    events.push({
      id: 'tl-perf',
      projectId: STUDIO_PROJECT_001_ID,
      kind: 'performance-review',
      label: 'Performance Review',
      detail: 'Analytics observatory active',
      createdAt: page.updatedAt,
      departmentId: 'intelligence',
    });
  }

  events.push({
    id: 'tl-current',
    projectId: STUDIO_PROJECT_001_ID,
    kind: 'department-handoff',
    label: 'Current Department',
    detail: DEPARTMENT_DISPLAY[activeDept] ?? activeDept,
    createdAt: new Date().toISOString(),
    departmentId: activeDept,
  });

  return events.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function resolveProject001Dashboard(input: {
  page: NdxbookPage | null;
  activeDepartment: ProductionDepartmentId;
  departmentStatuses: Record<ProductionDepartmentId, ProductionDepartmentStatus>;
}): ProjectDashboardSnapshot {
  const { page, activeDepartment, departmentStatuses } = input;
  const progressPct = computeProgress(departmentStatuses, page);
  const next = nextProductionDepartment(activeDepartment);
  const branch = getActiveBranch(NDXBOOK_PAGE_001_PROJECT_ID);
  const openNotes = countBlockingFounderNotes(PAGE_001_ASSET_KEY);
  const { created, remaining } = resolveOutputs(page);

  const pendingReviews: string[] = [];
  if (page?.pipeline?.studioReview && !page.pipeline.studioReview.overallPass) {
    pendingReviews.push('Studio Intelligence — revise before approval');
  }
  if (openNotes > 0) pendingReviews.push(`${openNotes} open founder direction note(s)`);
  if (!page) pendingReviews.push('Primary production asset not yet created');

  let conciergeStatus = 'Standing by';
  if (page?.pipeline?.studioReview) {
    conciergeStatus = page.pipeline.studioReview.overallPass ? 'Review board PASS' : 'Review board — action required';
  } else if (page) {
    conciergeStatus = 'Awaiting Studio Intelligence review';
  }

  const project: StudioProject = {
    ...PROJECT_001,
    status: {
      department: activeDepartment,
      departmentLabel: DEPARTMENT_DISPLAY[activeDepartment] ?? activeDepartment,
      progressPct,
      currentObjective: DEPARTMENT_OBJECTIVES[activeDepartment] ?? 'Advance the production',
      pendingReview: pendingReviews[0] ?? null,
      nextDepartment: next,
      nextDepartmentLabel: next ? DEPARTMENT_DISPLAY[next] ?? next : null,
    },
  };

  const perf = page?.performance;
  const performanceSummary =
    page?.status === 'published' || page?.status === 'scheduled'
      ? `Reach ${perf?.engagement ?? '—'} · Saves ${perf?.saves ?? '—'} · Shares ${perf?.shares ?? '—'}`
      : 'Performance summary unlocks after publishing';

  const aiRecommendations = [
    branch ? `Creative direction · ${branch.name} — ${branch.northStar.slice(0, 80)}…` : 'Set creative direction branch',
    openNotes > 0 ? 'Resolve founder notes before department handoff' : 'Production health clear for dispatch',
    remaining.length > 0 ? `${remaining.length} outputs remaining in expansion plan` : 'All planned outputs accounted for',
  ];

  return {
    project,
    creativeDirectionBranch: branch?.name ?? 'Luxury Editorial',
    creativeDirectionNorthStar: branch?.northStar ?? '',
    moodBoardHighlight: branch?.moodBoard.sections['visual-style']?.slice(0, 2).join(' · ') ?? 'Building mood board',
    openFounderNotes: openNotes,
    conciergeStatus,
    pendingReviews,
    productionTimeline: buildTimeline(page, activeDepartment),
    outputsCreated: created,
    outputsRemaining: remaining,
    publishingSchedule: page?.pipeline?.scheduledAt ?? null,
    performanceSummary,
    aiRecommendations,
  };
}

export function formatProjectCode(number: number): string {
  return `PROJECT ${String(number).padStart(3, '0')}`;
}
