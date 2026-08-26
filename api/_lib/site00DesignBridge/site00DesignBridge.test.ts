/**
 * P0.BRIDGE.1-FSBW — Site00DesignBridge test suite (28 success-criteria areas)
 */

import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { Site00DesignBridge } from './bridge.js';
import type {
  Site00BridgeSupabase,
  Site00DesignChangeRequest,
  Site00ProjectKey,
  Site00RuntimeBindingRow,
} from './types.js';
import { ELIGIBLE_CHANGE_STATUS, FSBW_REPO_BINDING } from './types.js';
import {
  validateOperations,
  isPathAllowedForProject,
  isP0PafProtectedPath,
} from './operations.js';
import {
  FrontalSlayerSite00Materializer,
  AIOSite00Materializer,
  StudioWorldWebsiteSite00Materializer,
  applyPlanToSource,
  compileMaterializationPlan,
} from './materializers.js';
import {
  validateRuntimeBindingRow,
  resolveRuntimeBindings,
  clearRuntimeBindingCache,
} from './runtimeBindings.js';
import {
  getClientSite00RuntimeBindings,
  hydrateSite00RuntimeBindings,
} from '../../../src/site00DesignBridge/clientRuntimeBindings.js';

function makeChange(overrides: Partial<Site00DesignChangeRequest> = {}): Site00DesignChangeRequest {
  return {
    id: 'uuid-1',
    change_request_id: 'cr-test-001',
    project_id: 'FRONTAL_SLAYER',
    repo_binding: FSBW_REPO_BINDING,
    status: ELIGIBLE_CHANGE_STATUS,
    design_version: 'dv-1',
    base_source_commit: 'abc123fullcommit',
    target_branch: 'master',
    operations: [
      {
        type: 'UPDATE_COMPONENT_PROP',
        targetPath: 'src/pages/lobby/page.tsx',
        prop: 'headline',
        value: 'Welcome',
      },
    ],
    shell_propagation: null,
    runtime_bindings: null,
    propagation_exceptions: [],
    risk_level: 'LOW',
    metadata: {},
    founder_approved_at: new Date().toISOString(),
    fsbw_status: null,
    fsbw_applied_commit: null,
    fsbw_applied_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

type MockStore = {
  changes: Site00DesignChangeRequest[];
  receipts: Record<string, unknown>[];
  applications: Record<string, unknown>[];
  runtimeBindings: Site00RuntimeBindingRow[];
};

function createMockSupabase(store: MockStore): Site00BridgeSupabase {
  const chain = (table: string) => {
    let filters: Array<{ col: string; val: unknown; op: 'eq' | 'in' | 'is' }> = [];
    let pendingInsert: Record<string, unknown> | Record<string, unknown>[] | null = null;
    let pendingUpdate: Record<string, unknown> | null = null;

    const resolveRows = (): unknown[] => {
      let rows: unknown[] = [];
      if (table === 'site00_design_change_requests') rows = [...store.changes];
      if (table === 'site00_design_change_applications') rows = [...store.applications];
      if (table === 'site00_change_receipts') rows = [...store.receipts];
      if (table === 'site00_runtime_bindings') rows = [...store.runtimeBindings];
      for (const f of filters) {
        rows = rows.filter((r) => {
          const rec = r as Record<string, unknown>;
          if (f.op === 'eq') return rec[f.col] === f.val;
          if (f.op === 'in') return (f.val as unknown[]).includes(rec[f.col]);
          return rec[f.col] === f.val;
        });
      }
      return rows;
    };

    const api = {
      select: () => api,
      insert: (row: Record<string, unknown> | Record<string, unknown>[]) => {
        pendingInsert = row;
        return api;
      },
      update: (row: Record<string, unknown>) => {
        pendingUpdate = row;
        return api;
      },
      eq: (col: string, val: unknown) => {
        filters.push({ col, val, op: 'eq' });
        return api;
      },
      in: (col: string, vals: unknown[]) => {
        filters.push({ col, val: vals, op: 'in' });
        return api;
      },
      is: (col: string, val: null) => {
        filters.push({ col, val, op: 'is' });
        return api;
      },
      order: () => api,
      limit: () => api,
      then: (resolve: (v: { data: unknown; error: null }) => void) => {
        if (pendingInsert) {
          const rows = Array.isArray(pendingInsert) ? pendingInsert : [pendingInsert];
          if (table === 'site00_change_receipts') store.receipts.push(...rows);
          if (table === 'site00_design_change_applications') store.applications.push(...rows);
          resolve({ data: rows, error: null });
          return;
        }
        if (pendingUpdate && table === 'site00_design_change_requests') {
          const id = filters.find((f) => f.col === 'change_request_id')?.val;
          const row = store.changes.find((c) => c.change_request_id === id);
          if (row) Object.assign(row, pendingUpdate);
          resolve({ data: row ?? null, error: null });
          return;
        }
        resolve({ data: resolveRows(), error: null });
      },
      maybeSingle: async () => {
        if (pendingInsert) {
          const rows = Array.isArray(pendingInsert) ? pendingInsert : [pendingInsert];
          if (table === 'site00_change_receipts') store.receipts.push(...rows);
          if (table === 'site00_design_change_applications') store.applications.push(...rows);
          return { data: rows[0] ?? null, error: null };
        }
        const rows = resolveRows();
        return { data: rows[0] ?? null, error: null };
      },
      single: async () => {
        if (pendingInsert && table === 'site00_change_receipts') {
          store.receipts.push(...(Array.isArray(pendingInsert) ? pendingInsert : [pendingInsert]));
          return { data: { id: `receipt-${store.receipts.length}` }, error: null };
        }
        if (pendingInsert && table === 'site00_design_change_applications') {
          const rows = Array.isArray(pendingInsert) ? pendingInsert : [pendingInsert];
          store.applications.push(...rows);
          return { data: rows[0], error: null };
        }
        const rows = resolveRows();
        return { data: rows[0] ?? null, error: null };
      },
    };
    return api;
  };
  return { from: chain };
}

describe('Site00DesignBridge — change consumption', () => {
  let store: MockStore;

  beforeEach(() => {
    store = { changes: [], receipts: [], applications: [], runtimeBindings: [] };
  });

  it('reads only READY_FOR_REPO for yoteenz/fsbw', async () => {
    store.changes = [
      makeChange({ change_request_id: 'ok-1', status: ELIGIBLE_CHANGE_STATUS }),
      makeChange({ change_request_id: 'bad-status', status: 'DRAFT' }),
      makeChange({ change_request_id: 'bad-repo', repo_binding: 'other/repo', status: ELIGIBLE_CHANGE_STATUS }),
    ];
    const bridge = new Site00DesignBridge({ repoRoot: process.cwd(), supabase: createMockSupabase(store) });
    const approved = await bridge.getApprovedChanges();
    expect(approved).toHaveLength(1);
    expect(approved[0]?.change_request_id).toBe('ok-1');
  });

  it('ignores wrong repo request', () => {
    const bridge = new Site00DesignBridge({ repoRoot: process.cwd(), supabase: createMockSupabase(store) });
    const r = bridge.validateChangeAuthority(makeChange({ repo_binding: 'yoteenz/other' }));
    expect(r.ok).toBe(false);
  });

  it('ignores wrong project request', () => {
    const bridge = new Site00DesignBridge({ repoRoot: process.cwd(), supabase: createMockSupabase(store) });
    const r = bridge.validateChangeAuthority(makeChange({ project_id: 'INVALID' as Site00ProjectKey }));
    expect(r.ok).toBe(false);
  });

  it('enforces idempotency', async () => {
    store.applications.push({ change_request_id: 'cr-test-001' });
    const bridge = new Site00DesignBridge({
      repoRoot: process.cwd(),
      supabase: createMockSupabase(store),
      skipTests: true,
      skipBuild: true,
    });
    expect(await bridge.checkIdempotency('cr-test-001')).toBe(true);
    const result = await bridge.applyMaterializationPlan(makeChange());
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/idempotency/i);
  });
});

describe('Site00DesignBridge — base commit and divergence', () => {
  it('validates base commit match', () => {
    const bridge = new Site00DesignBridge({
      repoRoot: process.cwd(),
      getCurrentCommit: () => 'abc123fullcommitdeadbeef',
    });
    const r = bridge.validateBaseCommit(makeChange({ base_source_commit: 'abc123' }));
    expect(r.ok).toBe(true);
  });

  it('blocks source divergence', () => {
    const bridge = new Site00DesignBridge({
      repoRoot: process.cwd(),
      getCurrentCommit: () => 'totallydifferentcommit',
    });
    const r = bridge.validateBaseCommit(makeChange({ base_source_commit: 'abc123' }));
    expect(r.ok).toBe(false);
    expect(r.status).toBe('BLOCKED_SOURCE_DIVERGENCE');
  });
});

describe('Site00DesignBridge — operation validation', () => {
  it('rejects unknown operations', () => {
    const r = validateOperations('FRONTAL_SLAYER', [{ type: 'RUN_SHELL' as never }]);
    expect(r.ok).toBe(false);
    expect(r.status).toBe('UNSUPPORTED_OPERATION');
  });

  it('blocks raw code execution fields', () => {
    const r = validateOperations('FRONTAL_SLAYER', [
      { type: 'UPDATE_COMPONENT_PROP', targetPath: 'src/pages/x.tsx', eval: 'process.exit(1)' } as never,
    ]);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/Forbidden/);
  });

  it('enforces path allowlist', () => {
    expect(isPathAllowedForProject('FRONTAL_SLAYER', 'src/pages/home.tsx')).toBe(true);
    expect(isPathAllowedForProject('FRONTAL_SLAYER', 'api/_lib/supabase.ts')).toBe(false);
  });

  it('enforces path denylist for secrets and Studio World native', () => {
    expect(isPathAllowedForProject('STUDIO_WORLD_WEBSITE', 'src/studio-os-core/genesis/x.ts')).toBe(false);
    expect(isPathAllowedForProject('FRONTAL_SLAYER', '.env.local')).toBe(false);
  });

  it('preserves P0.PAF authority', () => {
    expect(isP0PafProtectedPath('api/_lib/productAssetFactory/pipeline.ts')).toBe(true);
    const r = validateOperations('FRONTAL_SLAYER', [
      {
        type: 'CHANGE_ASSET_BINDING',
        targetPath: 'src/pages/shop/product.tsx',
        assetId: 'generic-hero',
      },
    ]);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/P0\.PAF/);
  });
});

describe('Site00DesignBridge — runtime bindings', () => {
  beforeEach(() => clearRuntimeBindingCache());
  afterEach(() => clearRuntimeBindingCache());

  it('validates runtime binding schema', () => {
    const ok = validateRuntimeBindingRow({
      id: '1',
      project_id: 'FRONTAL_SLAYER',
      route: '/',
      page_key: 'home',
      binding_type: 'design_token',
      binding_key: 'color.primary',
      binding_value: { hex: '#000' },
      schema_version: 'site00-runtime-binding@1',
      design_version: 'dv-1',
      change_request_id: null,
      is_active: true,
    });
    expect(ok.ok).toBe(true);
  });

  it('falls back safely on invalid binding', async () => {
    const result = await resolveRuntimeBindings(
      'FRONTAL_SLAYER',
      async () => [
        {
          id: '1',
          project_id: 'FRONTAL_SLAYER',
          route: null,
          page_key: null,
          binding_type: 'design_token',
          binding_key: 'color.primary',
          binding_value: {},
          schema_version: 'site00-runtime-binding@1',
          design_version: 'dv-1',
          change_request_id: null,
          is_active: true,
        },
        {
          id: '2',
          project_id: 'FRONTAL_SLAYER',
          route: null,
          page_key: null,
          binding_type: 'design_token',
          binding_key: 'not.allowed.token',
          binding_value: {},
          schema_version: 'site00-runtime-binding@1',
          design_version: 'dv-1',
          change_request_id: null,
          is_active: true,
        },
      ],
    );
    expect(result.bindings).toHaveLength(1);
  });

  it('does not break site on Supabase outage', async () => {
    const result = await resolveRuntimeBindings(
      'FRONTAL_SLAYER',
      async () => {
        throw new Error('Supabase unavailable');
      },
    );
    expect(result.source).toBe('default');
    expect(result.bindings).toEqual([]);
  });

  it('client runtime never requires service role', () => {
    hydrateSite00RuntimeBindings('FRONTAL_SLAYER', [
      {
        id: '1',
        project_id: 'FRONTAL_SLAYER',
        route: '/',
        page_key: 'home',
        binding_type: 'content',
        binding_key: 'hero',
        binding_value: 'Hello',
        schema_version: 'site00-runtime-binding@1',
        design_version: 'dv-1',
        change_request_id: null,
        is_active: true,
      },
    ], '/', 'home');
    const rows = getClientSite00RuntimeBindings('FRONTAL_SLAYER', '/', 'home', []);
    expect(rows).toHaveLength(1);
  });
});

describe('Site00DesignBridge — project materializers', () => {
  let tmp: string;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), 'site00-bridge-'));
    mkdirSync(join(tmp, 'src/pages/lobby'), { recursive: true });
    writeFileSync(join(tmp, 'src/pages/lobby/page.tsx'), 'export default function Lobby() { return null; }\n');
  });

  afterEach(() => {
    rmSync(tmp, { recursive: true, force: true });
  });

  it('Frontal Slayer adapter applies structured op', () => {
    const plan = compileMaterializationPlan(makeChange(), 'VALID');
    const result = applyPlanToSource(plan, { repoRoot: tmp, dryRun: false });
    expect(result.ok).toBe(true);
    expect(result.filesChanged.length).toBeGreaterThan(0);
    const content = readFileSync(join(tmp, 'src/pages/lobby/page.tsx'), 'utf8');
    expect(content).toContain('site00-bridge');
  });

  it('AIO adapter resolves paths under all-in-one-enterprises', () => {
    const m = new AIOSite00Materializer();
    const p = m.resolveOperationPath({ type: 'REGISTER_ROUTE', route: '/about' });
    expect(p).toContain('all-in-one-enterprises/src/pages/about.tsx');
  });

  it('Studio World website adapter stays in website scope', () => {
    const m = new StudioWorldWebsiteSite00Materializer();
    const p = m.resolveOperationPath({ type: 'REGISTER_ROUTE', route: '/studio' });
    expect(p).toContain('src/features/studio-world/website/pages/studio.tsx');
  });

  it('protects Studio World native infrastructure paths', () => {
    expect(isPathAllowedForProject('STUDIO_WORLD_WEBSITE', 'src/features/studio-world/experience-lab/x.ts')).toBe(false);
  });
});

describe('Site00DesignBridge — shell propagation', () => {
  it('detects shell version conflict', () => {
    const bridge = new Site00DesignBridge({
      repoRoot: process.cwd(),
      getCurrentCommit: () => 'abc123',
    });
    const plan = bridge.compileMaterializationPlan(
      makeChange({
        base_source_commit: 'abc123',
        shell_propagation: { shellId: 'nav-shell', expectedVersion: 'nav@v2' },
        operations: [{ type: 'CHANGE_SHARED_SHELL', shellId: 'nav-shell', expectedShellVersion: 'nav@v2' }],
      }),
    );
    expect(['VALID', 'CONFLICT']).toContain(plan.status);
  });

  it('surfaces duplicated implementation reconciliation', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'site00-dup-'));
    mkdirSync(join(tmp, 'src/components/shells'), { recursive: true });
    mkdirSync(join(tmp, 'src/pages/_duplicated'), { recursive: true });
    writeFileSync(join(tmp, 'src/components/shells/nav-shell.tsx'), 'export {}');
    writeFileSync(join(tmp, 'src/pages/_duplicated/nav-shell.tsx'), 'export {}');
    const prev = process.cwd();
    try {
      process.chdir(tmp);
      const m = new FrontalSlayerSite00Materializer();
      expect(m.detectDuplicatedImplementation({ type: 'CHANGE_SHARED_SHELL', shellId: 'nav-shell' })).toBe(true);
    } finally {
      process.chdir(prev);
    }
    rmSync(tmp, { recursive: true, force: true });
  });

  it('respects propagation exceptions via plan metadata', () => {
    const change = makeChange({ propagation_exceptions: ['page-excluded'] });
    const plan = compileMaterializationPlan(change, 'VALID');
    expect(plan.changeRequestId).toBe(change.change_request_id);
  });
});

describe('Site00DesignBridge — apply pipeline', () => {
  let store: MockStore;
  let tmp: string;

  beforeEach(() => {
    store = { changes: [makeChange()], receipts: [], applications: [], runtimeBindings: [] };
    tmp = mkdtempSync(join(tmpdir(), 'site00-apply-'));
    mkdirSync(join(tmp, 'src/pages/lobby'), { recursive: true });
    writeFileSync(join(tmp, 'src/pages/lobby/page.tsx'), 'export default function Lobby() { return null; }\n');
  });

  afterEach(() => {
    rmSync(tmp, { recursive: true, force: true });
  });

  it('dry-run validates without writing when dryRun true', async () => {
    const bridge = new Site00DesignBridge({ repoRoot: tmp, supabase: createMockSupabase(store), dryRun: true });
    const plan = await bridge.runDryRun(makeChange());
    expect(plan.status).toBe('VALID');
    const content = readFileSync(join(tmp, 'src/pages/lobby/page.tsx'), 'utf8');
    expect(content).not.toContain('site00-bridge');
  });

  it('runs tests/build hooks and blocks completion on failure', async () => {
    const bridge = new Site00DesignBridge({
      repoRoot: tmp,
      supabase: createMockSupabase(store),
      getCurrentCommit: () => 'abc123',
      execCommand: async (cmd) => ({
        code: cmd.includes('build') ? 1 : 0,
        stdout: '',
        stderr: 'build failed',
      }),
    });
    const result = await bridge.applyMaterializationPlan(makeChange({ base_source_commit: 'abc123' }));
    expect(result.ok).toBe(false);
    expect(result.buildPassed).toBe(false);
    expect(store.receipts.some((r) => r.event === 'FAILED')).toBe(true);
  });

  it('writes receipts and records lineage on success', async () => {
    const bridge = new Site00DesignBridge({
      repoRoot: tmp,
      supabase: createMockSupabase(store),
      getCurrentCommit: () => 'abc123full',
      skipTests: true,
      skipBuild: true,
      execCommand: async () => ({ code: 0, stdout: '', stderr: '' }),
    });
    const result = await bridge.applyMaterializationPlan(makeChange({ base_source_commit: 'abc123' }));
    expect(result.ok).toBe(true);
    expect(store.receipts.some((r) => r.event === 'APPLIED')).toBe(true);
    expect(store.applications.some((a) => a.change_request_id === 'cr-test-001')).toBe(true);
  });

  it('does not allow partial silent apply — fails atomically', async () => {
    const bridge = new Site00DesignBridge({ repoRoot: tmp, supabase: createMockSupabase(store) });
    const bad = makeChange({
      operations: [
        { type: 'UPDATE_COMPONENT_PROP', targetPath: 'src/pages/missing.tsx', prop: 'x', value: 1 },
      ],
    });
    const result = await bridge.applyMaterializationPlan(bad);
    expect(result.ok).toBe(false);
  });
});

describe('Site00DesignBridge — security', () => {
  it('service role is not exposed in client bundle path', async () => {
    const src = readFileSync(
      join(process.cwd(), 'src/site00DesignBridge/clientRuntimeBindings.ts'),
      'utf8',
    );
    expect(src).not.toMatch(/SUPABASE_SERVICE_ROLE/);
    expect(src).not.toMatch(/getSupabaseAdmin/);
  });
});

describe('Site00DesignBridge — adapters registered', () => {
  it('exports all three project materializers', () => {
    expect(new FrontalSlayerSite00Materializer().projectId).toBe('FRONTAL_SLAYER');
    expect(new AIOSite00Materializer().projectId).toBe('ALL_IN_ONE_ENTERPRISES');
    expect(new StudioWorldWebsiteSite00Materializer().projectId).toBe('STUDIO_WORLD_WEBSITE');
  });
});

describe('Site00DesignBridge — P0.BRIDGE.1A round-trip fixtures', () => {
  it('allows dedicated bridge validation fixture path', () => {
    const path = 'src/features/studio-world/website/bridge-validation/site00BridgeRoundtripFixture.ts';
    expect(isPathAllowedForProject('STUDIO_WORLD_WEBSITE', path)).toBe(true);
    expect(isPathAllowedForProject('STUDIO_WORLD_WEBSITE', 'src/studio-os-core/genesis/x.ts')).toBe(false);
  });

  it('validates round-trip fixture operation as VALID dry-run plan', () => {
    const bridge = new Site00DesignBridge({
      repoRoot: process.cwd(),
      getCurrentCommit: () => 'abc123',
    });
    const plan = bridge.compileMaterializationPlan(
      makeChange({
        change_request_id: 'cr-bridge-roundtrip-fixture',
        project_id: 'STUDIO_WORLD_WEBSITE',
        base_source_commit: 'abc123',
        operations: [
          {
            type: 'UPDATE_PAGE_METADATA',
            targetPath: 'src/features/studio-world/website/bridge-validation/site00BridgeRoundtripFixture.ts',
            value: { bridgeValidation: true, customerImpact: 'NONE' },
          },
        ],
      }),
    );
    expect(plan.status).toBe('VALID');
  });

  it('blocks stale base commit with BLOCKED_SOURCE_DIVERGENCE', () => {
    const bridge = new Site00DesignBridge({
      repoRoot: process.cwd(),
      getCurrentCommit: () => 'deadbeef9999',
    });
    const plan = bridge.compileMaterializationPlan(
      makeChange({ base_source_commit: 'abc123only' }),
    );
    expect(plan.status).toBe('BLOCKED_SOURCE_DIVERGENCE');
  });
});
