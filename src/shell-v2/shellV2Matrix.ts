/**
 * StudioAppShellV2 provider/module matrix — incremental composition tracking.
 * Phase 1 = stage 0 only. Stages 1–10 are added one commit at a time; stop at first failure.
 */

export type ShellV2StageId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type ShellV2MatrixRow = {
  stage: ShellV2StageId;
  key: string;
  label: string;
  /** pass | fail | pending — updated as stages are verified in production */
  status: 'pass' | 'fail' | 'pending';
  modules: string[];
};

/** Ordered provider/module additions (exact sequence from recovery strategy). */
export const SHELL_V2_MATRIX: ShellV2MatrixRow[] = [
  {
    stage: 0,
    key: 'minimal',
    label: 'Minimal shell (React + Router + static routes)',
    status: 'pass',
    modules: ['React root', 'BrowserRouter', '/v2 public', '/v2/diagnostic', 'shell-v2.css'],
  },
  {
    stage: 1,
    key: 'error-boundary',
    label: 'Error boundary',
    status: 'pending',
    modules: ['ShellV2ErrorBoundary'],
  },
  {
    stage: 2,
    key: 'auth-provider',
    label: 'Authentication provider',
    status: 'pending',
    modules: ['ShellV2AuthProvider'],
  },
  {
    stage: 3,
    key: 'router-guards',
    label: 'Router guards',
    status: 'pending',
    modules: ['ShellV2RouteGuards'],
  },
  {
    stage: 4,
    key: 'studio-bootstrap',
    label: 'Studio Bootstrap',
    status: 'pending',
    modules: ['ensureStudioBootstrapStarted (v2 isolated)'],
  },
  {
    stage: 5,
    key: 'platform-dna',
    label: 'Platform / State DNA',
    status: 'pending',
    modules: ['platform-dna boot module', 'state-dna boot module'],
  },
  {
    stage: 6,
    key: 'registries',
    label: 'Registries',
    status: 'pending',
    modules: ['brand-registry', 'department-registry', 'scene-registry'],
  },
  {
    stage: 7,
    key: 'workspace-runtime',
    label: 'Workspace runtime',
    status: 'pending',
    modules: ['ensureWorkspacesBootstrapped', 'WorkspaceProvider'],
  },
  {
    stage: 8,
    key: 'admin-shell',
    label: 'Admin shell',
    status: 'pending',
    modules: ['AdminStudioLayout', 'AdminGuard'],
  },
  {
    stage: 9,
    key: 'experience-runtime',
    label: 'Experience Runtime',
    status: 'pending',
    modules: ['experience-runtime boot module', 'Experience Runtime engine'],
  },
  {
    stage: 10,
    key: 'app-routes',
    label: 'Existing application routes',
    status: 'pending',
    modules: ['Legacy App route tree (migrated groups)'],
  },
];

export const SHELL_V2_DEFAULT_STAGE: ShellV2StageId = 0;

export function isShellV2Path(pathname: string): boolean {
  return pathname === '/v2' || pathname.startsWith('/v2/');
}

/** Max enabled stage — default 0 (minimal only). Override: ?v2Stage=N or sessionStorage shellV2MaxStage */
export function getShellV2MaxStage(): ShellV2StageId {
  if (typeof window === 'undefined') return SHELL_V2_DEFAULT_STAGE;

  try {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('v2Stage');
    if (q != null) {
      const n = Number.parseInt(q, 10);
      if (Number.isFinite(n) && n >= 0 && n <= 10) {
        sessionStorage.setItem('shellV2MaxStage', String(n));
        return n as ShellV2StageId;
      }
    }
    const stored = sessionStorage.getItem('shellV2MaxStage');
    if (stored != null) {
      const n = Number.parseInt(stored, 10);
      if (Number.isFinite(n) && n >= 0 && n <= 10) return n as ShellV2StageId;
    }
  } catch {
    /* ignore */
  }

  return SHELL_V2_DEFAULT_STAGE;
}

export function isShellV2StageEnabled(stage: ShellV2StageId): boolean {
  return stage <= getShellV2MaxStage();
}

export function getShellV2MatrixSnapshot(): {
  maxStage: ShellV2StageId;
  rows: ShellV2MatrixRow[];
  firstPending: ShellV2StageId | null;
} {
  const maxStage = getShellV2MaxStage();
  const rows = SHELL_V2_MATRIX.map((row) => {
    let status: ShellV2MatrixRow['status'] = row.status;
    if (row.stage > maxStage) status = 'pending';
    else if (row.stage < maxStage) status = 'pass';
    return { ...row, status };
  });
  const firstPending =
    rows.find((r) => r.stage > 0 && r.status === 'pending' && r.stage <= maxStage)?.stage ??
    rows.find((r) => r.status === 'pending')?.stage ??
    null;
  return { maxStage, rows, firstPending };
}
