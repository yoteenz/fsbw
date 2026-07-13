import { describe, expect, it, vi, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fixtureReceptionConstructionPlan } from '../blueprint-author/fixtures';
import {
  buildFounderRenderJobView,
  canApproveFounderRender,
  FOUNDER_RENDER_ARTIFACT_INTENT,
} from './contract';
import { runFounderRenderPreflight } from './preflight';
import { requiresIsolatedObjectValidation } from '../creative-production/artifact-intent';

const FOUNDER_RENDER_HANDLERS = [
  '../../../api/admin/founder-render-generate.ts',
  '../../../api/admin/founder-render-status.ts',
  '../../../api/admin/founder-render-approve.ts',
] as const;

function receptionPlan(revision = 14) {
  const plan = fixtureReceptionConstructionPlan({
    organizationId: 'frontal-slayer',
    buildingId: 'b1',
    floorId: 'f1',
    roomId: 'reception',
    requestId: 'req-verify',
    founderIntent: 'Luxury reception verification',
    styleProfile: {
      styleId: 'luxury',
      version: '1',
      organizationStyle: 'frontal-slayer',
      visualLanguage: 'warm marble',
    },
  });
  plan.metadata.revision = revision;
  return plan;
}

async function invokeHandler(
  spec: (typeof FOUNDER_RENDER_HANDLERS)[number],
  req: { method: string; headers?: Record<string, string>; body?: unknown; query?: Record<string, string> }
): Promise<{ statusCode: number; body: string }> {
  const handler = (await import(spec)).default;
  const headers: Record<string, string> = {};
  let statusCode = 0;
  let body = '';
  const res = {
    setHeader(k: string, v: string) {
      headers[k.toLowerCase()] = v;
    },
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(payload: unknown) {
      body = JSON.stringify(payload);
      return this;
    },
    end(payload?: string) {
      if (payload) body = payload;
      return this;
    },
  };
  await handler(
    {
      method: req.method,
      headers: req.headers ?? {},
      body: req.body,
      query: req.query ?? {},
    } as never,
    res as never
  );
  return { statusCode, body };
}

describe('Founder Render production verification', () => {
  it('all founder-render API handlers load', async () => {
    for (const spec of FOUNDER_RENDER_HANDLERS) {
      const mod = await import(spec);
      expect(typeof mod.default).toBe('function');
    }
  });

  it('generate returns JSON for unauthenticated POST (not FUNCTION_INVOCATION_FAILED)', async () => {
    const { statusCode, body } = await invokeHandler(FOUNDER_RENDER_HANDLERS[0], {
      method: 'POST',
      body: {},
    });
    expect(statusCode).toBeGreaterThan(0);
    expect(() => JSON.parse(body)).not.toThrow();
    expect(body).not.toContain('FUNCTION_INVOCATION_FAILED');
    const parsed = JSON.parse(body) as { code?: string; ok?: boolean };
    expect(parsed.ok).toBe(false);
    expect(parsed.code).toBeTruthy();
  });

  it('generate OPTIONS returns 204 without module crash', async () => {
    const { statusCode } = await invokeHandler(FOUNDER_RENDER_HANDLERS[0], { method: 'OPTIONS' });
    expect(statusCode).toBe(204);
  });

  it('status returns JSON for unauthenticated GET', async () => {
    const { statusCode, body } = await invokeHandler(FOUNDER_RENDER_HANDLERS[1], {
      method: 'GET',
      query: { jobId: 'frj-test' },
    });
    expect(statusCode).toBeGreaterThan(0);
    expect(() => JSON.parse(body)).not.toThrow();
    expect(body).not.toContain('FUNCTION_INVOCATION_FAILED');
    const parsed = JSON.parse(body) as { code?: string; ok?: boolean };
    expect(parsed.ok).toBe(false);
    expect(parsed.code).toBeTruthy();
  });

  it('approve returns JSON for unauthenticated POST', async () => {
    const { statusCode, body } = await invokeHandler(FOUNDER_RENDER_HANDLERS[2], {
      method: 'POST',
      body: { jobId: 'frj-test' },
    });
    expect(statusCode).toBeGreaterThan(0);
    expect(() => JSON.parse(body)).not.toThrow();
    expect(body).not.toContain('FUNCTION_INVOCATION_FAILED');
    const parsed = JSON.parse(body) as { code?: string; ok?: boolean };
    expect(parsed.ok).toBe(false);
    expect(parsed.code).toBeTruthy();
  });

  it('blueprint revision A becomes stale when plan advances to revision B', () => {
    const planA = receptionPlan(14);
    const viewA = buildFounderRenderJobView({
      plan: planA,
      job: {
        status: 'ready',
        previewArtifactUrl: 'https://cdn.example/a.png',
        blueprintRevision: 14,
      },
    });
    expect(viewA.status).toBe('ready');
    expect(canApproveFounderRender(viewA, true)).toBe(true);

    const planB = receptionPlan(15);
    const staleView = buildFounderRenderJobView({
      plan: planB,
      job: {
        status: 'ready',
        previewArtifactUrl: 'https://cdn.example/a.png',
        blueprintRevision: 14,
      },
    });
    expect(staleView.status).toBe('stale');
    expect(staleView.isStale).toBe(true);
    expect(canApproveFounderRender(staleView, true)).toBe(false);
  });

  it('brand vault preflight resolves marble for frontal-slayer', () => {
    const preflight = runFounderRenderPreflight(receptionPlan());
    expect(preflight.ok).toBe(true);
    if (preflight.ok) {
      expect(preflight.brandReferenceUrls.length).toBeGreaterThan(0);
    }
  });

  it('brand vault preflight resolves marble for studio-os via frontal-slayer alias', () => {
    const plan = receptionPlan();
    plan.metadata.organizationId = 'studio-os';
    const preflight = runFounderRenderPreflight(plan);
    expect(preflight.ok).toBe(true);
    if (preflight.ok) {
      expect(preflight.brandVaultOrganizationId).toBe('frontal-slayer');
    }
  });

  it('missing brand vault blocks with BRAND_ASSET_REQUIRED_MISSING', () => {
    const plan = receptionPlan();
    plan.metadata.organizationId = 'org-without-vault-verify';
    const preflight = runFounderRenderPreflight(plan);
    expect(preflight.ok).toBe(false);
    if (!preflight.ok) expect(preflight.code).toBe('BRAND_ASSET_REQUIRED_MISSING');
  });

  it('founder render does not use isolated-object validation', () => {
    expect(requiresIsolatedObjectValidation('founder-full-room-preview')).toBe(false);
    expect(FOUNDER_RENDER_ARTIFACT_INTENT).toBe('founder-full-room-preview');
  });

  it('founder-render handlers never reference auth.actor (use auth.user)', () => {
    const handlerDir = path.join(process.cwd(), 'api/admin');
    for (const file of ['founder-render-generate.ts', 'founder-render-status.ts', 'founder-render-approve.ts']) {
      const source = fs.readFileSync(path.join(handlerDir, file), 'utf8');
      expect(source).not.toContain('auth.actor');
      if (file !== 'founder-render-status.ts') {
        expect(source).toContain('auth.user');
      }
    }
  });
});

describe('Founder Render authenticated handler path', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('generate returns 202 JSON when admin auth succeeds (no auth.actor crash)', async () => {
    vi.doMock('../../../api/_lib/adminAuth.js', () => ({
      resolveAdminAuth: vi.fn(async () => ({
        ok: true,
        user: { id: 'admin-1', email: 'kateenaarmstrong@gmail.com', accessToken: 'token' },
      })),
    }));
    vi.doMock('../../../api/_lib/founderRenderGeneration.js', () => ({
      prepareFounderRenderDispatch: vi.fn(async () => ({
        ok: true,
        providerRequestId: 'fal-req-test',
        model: 'fal-ai/nano-banana-pro/edit',
        promptVersion: 'founder-full-room-preview-prompt.v1',
        promptHash: 'abc123',
        effectivePrompt: 'test prompt',
        referenceCount: 1,
        brandMaterialRefs: ['https://example.com/marble.png'],
      })),
    }));
    vi.doMock('../../../api/_lib/founderRenderJobs.js', () => ({
      insertFounderRenderJob: vi.fn(async () => ({ ok: true, jobId: 'frj-auth-test' })),
    }));

    const handler = (await import('../../../api/admin/founder-render-generate.ts')).default;
    let statusCode = 0;
    let body = '';
    const res = {
      setHeader() {
        return this;
      },
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(payload: unknown) {
        body = JSON.stringify(payload);
        return this;
      },
      end() {
        return this;
      },
    };

    await handler(
      {
        method: 'POST',
        headers: { authorization: 'Bearer test' },
        body: { plan: receptionPlan() },
      } as never,
      res as never
    );

    expect(statusCode).toBe(202);
    const parsed = JSON.parse(body) as { ok?: boolean; jobId?: string; error?: string };
    expect(parsed.ok).toBe(true);
    expect(parsed.jobId).toBe('frj-auth-test');
    expect(body).not.toContain("reading 'email'");
  });
});
