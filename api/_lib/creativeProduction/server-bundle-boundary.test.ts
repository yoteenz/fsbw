import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const BUNDLE_PATH = path.join(
  process.cwd(),
  'api/_lib/creativeProduction/studio-os-server.bundle.js'
);

const FAILING_ENTRY_MODULES = [
  '../../../api/admin/experience-lab-ephemeral-authorization.ts',
  '../../../api/admin/studio-builder-generate.ts',
  '../../../api/admin/studio-foundry-generate.ts',
  '../../../api/admin/studio-generate-asset.ts',
] as const;

describe('server bundle boundary (api → src repair)', () => {
  it('prebuilt bundle exists and excludes browser globals', () => {
    expect(fs.existsSync(BUNDLE_PATH)).toBe(true);
    const text = fs.readFileSync(BUNDLE_PATH, 'utf8');
    expect(text.length).toBeGreaterThan(1000);
    expect(text).not.toMatch(/\bwindow\b/);
    expect(text).not.toMatch(/\blocalStorage\b/);
    expect(text).not.toMatch(/\bdocument\b/);
    expect(text).not.toMatch(/\bnavigator\b/);
    expect(text).toContain('createDemoCreativeInitiative');
    expect(text).toContain('hasCompleteValidationCompileContext');
  });

  it('studio-os-server runtime surface imports from bundle', async () => {
    const mod = await import('./studio-os-server.js');
    expect(typeof mod.createDemoCreativeInitiative).toBe('function');
    expect(typeof mod.hasCompleteValidationCompileContext).toBe('function');
    expect(typeof mod.representGovernedGenerationRequest).toBe('function');
    expect(typeof mod.compileAssetIntent).toBe('function');
  });

  it('legacy-adapters loads without cross-root src value imports', async () => {
    const mod = await import('./legacy-adapters.js');
    expect(typeof mod.ensureValidationEphemeralAuth).toBe('function');
    expect(typeof mod.adaptLegacyBuilderRequest).toBe('function');
  });

  it('all four failing route entry modules load', async () => {
    for (const spec of FAILING_ENTRY_MODULES) {
      const mod = await import(spec);
      expect(typeof mod.default).toBe('function');
    }
  });

  it('ephemeral canary handler returns application JSON for unauthenticated POST', async () => {
    const handler = (await import('../../../api/admin/experience-lab-ephemeral-authorization.ts'))
      .default;

    const headers: Record<string, string> = {};
    let statusCode = 0;
    let body = '';

    const req = {
      method: 'POST',
      headers: {},
      body: {},
    };

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

    await handler(req as never, res as never);

    expect(statusCode).toBeGreaterThan(0);
    expect(() => JSON.parse(body)).not.toThrow();
    const parsed = JSON.parse(body) as { error?: string; code?: string };
    expect(parsed.code ?? parsed.error).toBeTruthy();
    expect(body).not.toContain('FUNCTION_INVOCATION_FAILED');
  });
});
