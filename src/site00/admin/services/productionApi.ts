import { apiFetch } from '../../../utils/api.js';
import type {
  Site00ApprovalsPayload,
  Site00DashboardPayload,
  Site00ProjectWorkspacePayload,
  Site00ProjectsPayload,
  Site00StudioPayload,
} from '../types/production.js';

async function parseJson<T>(res: Response): Promise<T> {
  const raw = await res.text();
  if (!raw.trim()) return {} as T;
  return JSON.parse(raw) as T;
}

async function productionFetch<T>(path: string, init?: { method?: string; body?: Record<string, unknown> }): Promise<T> {
  const res = await apiFetch(path, init);
  const data = await parseJson<T & { error?: string }>(res);
  if (!res.ok) throw new Error(data.error ?? `Production API ${res.status}`);
  return data;
}

export const site00ProductionApi = {
  dashboard: () => productionFetch<Site00DashboardPayload>('/api/admin/site00-production?action=dashboard'),
  studio: (projectId?: string) =>
    productionFetch<Site00StudioPayload>(
      `/api/admin/site00-production?action=studio${projectId ? `&projectId=${encodeURIComponent(projectId)}` : ''}`,
    ),
  approvals: (category = 'ALL') =>
    productionFetch<Site00ApprovalsPayload>(
      `/api/admin/site00-production?action=approvals&category=${encodeURIComponent(category)}`,
    ),
  projects: () => productionFetch<Site00ProjectsPayload>('/api/admin/site00-production?action=projects'),
  project: (projectId: string, section = 'overview') =>
    productionFetch<Site00ProjectWorkspacePayload>(
      `/api/admin/site00-production?action=project&projectId=${encodeURIComponent(projectId)}&section=${encodeURIComponent(section)}`,
    ),
  bootstrapDemo: () =>
    productionFetch<{ projectId?: string }>('/api/admin/site00-production', { method: 'POST', body: { action: 'bootstrap-demo' } }),
  generateBrief: (projectId: string, deliverableKey: string) =>
    productionFetch('/api/admin/site00-production', {
      method: 'POST',
      body: { action: 'generate-brief', projectId, deliverableKey },
    }),
  decideApproval: (approvalId: string, decision: string, notes?: string) =>
    productionFetch('/api/admin/site00-production', {
      method: 'POST',
      body: { action: 'decide-approval', approvalId, decision, notes },
    }),
};
