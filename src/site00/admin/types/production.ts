export type Site00ProjectSummary = {
  id: string;
  slug: string;
  name: string;
  build_class: string | null;
  current_phase: string;
  project_health: string;
  production_readiness_pct: number;
  environment_readiness_pct?: number;
};

export type Site00NextAction = {
  id?: string;
  project_id?: string;
  title: string;
  reason: string;
  destination: string;
  priority?: string;
};

export type Site00StudioSummary = {
  complete: number;
  inProgress: number;
  queued: number;
  blocked: number;
  total: number;
};

export type Site00DeliverableRow = {
  title: string;
  category: string;
  status: string;
  variants_requested?: number;
  deliverable_key?: string;
};

export type Site00ProductionJob = {
  metadata?: { label?: string };
  variants_requested: number;
  progress_pct: number;
  status: string;
};

export type Site00DirectorInsight = {
  priority: string;
  what: string;
  why: string;
  action: string;
};

export type Site00ApprovalItem = {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  site00_projects?: { name: string; slug: string; id?: string };
};

export type Site00AccessRequirement = {
  connection_state: string;
  required_phase: string;
  owner_type: string;
  site00_service_catalog?: { display_name: string; provider_key: string };
};

export type Site00ActivityEvent = {
  summary: string;
  actor_type: string;
  created_at: string;
};

export type Site00DashboardPayload = {
  projects: Site00ProjectSummary[];
  nextActions: Site00NextAction[];
  approvalCount: number;
  accessAlerts: unknown[];
};

export type Site00StudioPayload = {
  project: Site00ProjectSummary | null;
  pipeline: Record<string, string> | null;
  intelligence: Record<string, unknown> | null;
  deliverables: Site00DeliverableRow[];
  deliverableMap: Record<string, { complete: number; total: number }>;
  jobs: Site00ProductionJob[];
  projects: Site00ProjectSummary[];
  insights: Site00DirectorInsight[];
};

export type Site00ApprovalsPayload = {
  items: Site00ApprovalItem[];
  total: number;
};

export type Site00ProjectsPayload = {
  projects: Site00ProjectSummary[];
};

export type Site00ProjectWorkspacePayload = {
  project: Site00ProjectSummary;
  intelligence: Record<string, unknown> | null;
  deliverables: Site00DeliverableRow[];
  approvals: Array<{ title: string; status: string; category: string }>;
  access: Site00AccessRequirement[];
  activity: Site00ActivityEvent[];
  nextActions: Site00NextAction[];
  studioSummary: Site00StudioSummary;
};
