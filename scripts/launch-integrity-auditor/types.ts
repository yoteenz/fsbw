export type AuditSeverity = 'critical' | 'high' | 'medium' | 'low';

export type AuditResolutionStatus = 'open' | 'fixed' | 'retest_needed';

export type AuditIssue = {
  id: string;
  route_tested: string;
  status: 'pass' | 'fail' | 'warn' | 'manual' | 'skip';
  issue_type: string;
  severity: AuditSeverity;
  what_broke: string;
  likely_cause: string;
  recommended_fix: string;
  file_component_location: string;
  fix_priority: number;
  regression_risk: 'low' | 'medium' | 'high';
  design_risk: 'none' | 'low' | 'medium' | 'high';
  resolution_status: 'open' | 'fixed' | 'retest_needed';
};

export type LaunchIntegrityReport = {
  auditor: 'Launch Integrity Auditor™';
  product: 'Frontal Slayer / Build-a-Wig';
  generated_at: string;
  launch_readiness_score: number;
  deployment_status: 'pass' | 'fail' | 'warn';
  summary: {
    routes_tested: number;
    routes_passed: number;
    routes_failed: number;
    routes_warn: number;
    routes_manual: number;
    critical_open: number;
    high_open: number;
    medium_open: number;
    low_open: number;
    fixed_in_run: number;
  };
  checks: {
    typescript: { status: string; detail: string };
    production_build: { status: string; detail: string };
    lazy_imports: { status: string; missing: string[] };
    public_assets: { status: string; missing: string[] };
    api_routes: { status: string; count: number };
  };
  issues: AuditIssue[];
  fixes_applied?: { route: string; issue: string; fix: string; file: string }[];
  routes_still_needing_manual_review: string[];
};
