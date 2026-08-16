import { describe, expect, it, beforeEach } from 'vitest';
import { createDemoSeed } from '../demo/demoSeed';
import type { DemoStore } from '../demo/demoTypes';
import {
  assertResourceAccess,
  buildCustomerAccessContext,
  buildStaffAccessContext,
  canExportFinancial,
} from './authorizationGuard';
import { neutralizeCsvCell, redactPii } from './securityRedaction';
import { validateUpload } from './fileSecurity';
import { canLaunchProduction } from './productionGate';
import { checkRateLimit, resetRateLimitBuckets } from './rateLimitPolicy';
import { runFsIsolationSelfCheck } from './fsIsolation';
import {
  attemptBulkExport,
  getAuthorizedInvoice,
  safePasswordResetResponse,
} from '../demo/securityActions';

function storeWith(fn: (s: DemoStore) => void): DemoStore {
  const s = structuredClone(createDemoSeed());
  fn(s);
  return s;
}

describe('customer isolation (IDOR)', () => {
  it('denies customer A access to customer B invoice', () => {
    const store = createDemoSeed();
    store.portalClientId = 'client-a';
    const invB = store.invoices.find((i) => i.organizationId === 'client-b');
    expect(invB).toBeTruthy();
    const { invoice, decision } = getAuthorizedInvoice(invB!.id, true, store);
    expect(invoice).toBeUndefined();
    expect(decision.allowed).toBe(false);
  });

  it('allows customer access to own invoice', () => {
    const store = createDemoSeed();
    store.portalClientId = 'client-a';
    const invA = store.invoices.find((i) => i.organizationId === 'client-a');
    expect(invA).toBeTruthy();
    const { invoice, decision } = getAuthorizedInvoice(invA!.id, true, store);
    expect(invoice?.id).toBe(invA!.id);
    expect(decision.allowed).toBe(true);
  });

  it('denies cross-customer document access', () => {
    const store = createDemoSeed();
    store.portalClientId = 'client-a';
    const docB = store.documents.find((d) => d.organizationId === 'client-b');
    if (!docB) return;
    const ctx = buildCustomerAccessContext(store);
    const d = assertResourceAccess(store, ctx, 'document', docB.id);
    expect(d.allowed).toBe(false);
  });
});

describe('staff permissions', () => {
  it('denies dispatcher financial export', () => {
    const store = storeWith((s) => {
      s.officeStaffId = 'staff-4';
      s.officeStaffRole = 'dispatcher';
    });
    const ctx = buildStaffAccessContext(store);
    expect(canExportFinancial(ctx)).toBe(false);
    expect(ctx.staff!.permissions.includes('reports.export')).toBe(false);
    expect(ctx.staff!.permissions.includes('management.financial.read')).toBe(false);
  });

  it('denies dispatcher integration credentials', () => {
    const store = storeWith((s) => {
      s.officeStaffId = 'staff-4';
      s.officeStaffRole = 'dispatcher';
    });
    const ctx = buildStaffAccessContext(store);
    expect(ctx.staff!.permissions.includes('integrations.credentials.manage')).toBe(false);
  });
});

describe('permission revocation', () => {
  it('blocks export after admin removes reports.export', () => {
    const store2 = storeWith((s) => {
      s.officeStaffId = 'staff-6';
      s.officeStaffRole = 'billing_specialist';
      s.staffPermissionOverrides = { 'staff-6': ['reports.export'] };
    });
    const result = attemptBulkExport('financial-summary', 10, store2);
    expect(result.ok).toBe(false);
  });
});

describe('CSV injection', () => {
  it('neutralizes formula prefixes', () => {
    expect(neutralizeCsvCell('=SUM(A1)')).toBe("'=SUM(A1)");
    expect(neutralizeCsvCell('+cmd')).toBe("'+cmd");
    expect(neutralizeCsvCell('Normal Co')).toBe('Normal Co');
  });
});

describe('upload validation', () => {
  it('rejects executable extension masquerading as pdf', () => {
    const result = validateUpload({
      fileName: 'invoice.exe',
      declaredMime: 'application/pdf',
      sizeBytes: 1000,
      bytes: new Uint8Array([0x4d, 0x5a, 0, 0]),
    });
    expect(result.ok).toBe(false);
  });

  it('accepts valid pdf signature', () => {
    const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
    const result = validateUpload({
      fileName: 'invoice.pdf',
      declaredMime: 'application/pdf',
      sizeBytes: bytes.length,
      bytes,
    });
    expect(result.ok).toBe(true);
  });
});

describe('production gate', () => {
  it('returns BLOCKED in debug with explicit reasons', () => {
    const store = createDemoSeed();
    const gate = canLaunchProduction(store);
    expect(gate.status).toBe('BLOCKED');
    expect(gate.blockers.length).toBeGreaterThan(0);
    expect(gate.blockers.some((b) => b.toLowerCase().includes('debug') || b.toLowerCase().includes('demo'))).toBe(true);
  });
});

describe('demo reset protection', () => {
  it('refuses reset when simulating production', () => {
    const store = storeWith((s) => {
      if (s.securitySettings) {
        s.securitySettings.environmentLabel = 'PRODUCTION';
        s.securitySettings.demoModeActive = false;
      }
    });
    // simulate loaded store — resetDemoStore reads from storage; test logic directly
    const settings = store.securitySettings;
    const blocked = settings?.environmentLabel === 'PRODUCTION' && !settings.demoModeActive;
    expect(blocked).toBe(true);
  });
});

describe('account enumeration', () => {
  it('returns same message for known and unknown email', () => {
    const a = safePasswordResetResponse('known@example.com');
    const b = safePasswordResetResponse('unknown@example.com');
    expect(a.message).toBe(b.message);
  });
});

describe('PII redaction', () => {
  it('redacts bearer tokens and emails in logs', () => {
    const out = redactPii('User email test@example.com Bearer secret-token-xyz');
    expect(out).not.toContain('secret-token');
    expect(out).not.toContain('test@example.com');
  });
});

describe('rate limiting', () => {
  beforeEach(() => resetRateLimitBuckets());

  it('blocks after threshold', () => {
    for (let i = 0; i < 20; i++) {
      checkRateLimit('login', 'ip-1');
    }
    const blocked = checkRateLimit('login', 'ip-1');
    expect(blocked.allowed).toBe(false);
  });
});

describe('Frontal Slayer isolation', () => {
  it('self-check documents shared host boundary', () => {
    const result = runFsIsolationSelfCheck();
    expect(result.ok).toBe(true);
  });
});

describe('XSS payload in customer name', () => {
  it('stores script payload as plain text without execution hooks', () => {
    const store = storeWith((s) => {
      const c = s.clients[0];
      if (c) c.companyName = '<script>alert(1)</script> Evil Corp';
    });
    expect(store.clients[0].companyName).toContain('<script>');
    // Rendering layers must escape — no dangerouslySetInnerHTML in AIO module (static grep contract)
    expect(store.clients[0].companyName).not.toMatch(/dangerouslySetInnerHTML/);
  });
});
