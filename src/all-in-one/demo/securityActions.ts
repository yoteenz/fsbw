import { loadDemoStore, updateDemoStore } from '../demo/demoStore';
import type { DemoStore } from '../demo/demoTypes';
import { resolveOfficeStaffContext } from '../office-core/officeContext';
import { recordSecurityAudit } from '../security/securityAudit';
import {
  assertResourceAccess,
  buildCustomerAccessContext,
  buildStaffAccessContext,
  canExportFinancial,
} from '../security/authorizationGuard';
import { checkRateLimit } from '../security/rateLimitPolicy';
import { validateUpload } from '../security/fileSecurity';
import { canLaunchProduction, evaluateProductionReadiness } from '../security/productionGate';
import { buildSecurityControlRegistry, summarizeControlPosture } from '../security/securityControlRegistry';
import { hasSecurityPermission, type SecurityPermission } from '../security/securityPermissions';
import type {
  IncidentStatus,
  PrivacyRequestStatus,
  PrivacyRequestType,
  SecurityFindingStatus,
  SignedDownloadGrant,
} from '../security/securityTypes';

function uid(): string {
  return crypto.randomUUID();
}

export function getSecurityControls(store: DemoStore = loadDemoStore()) {
  return buildSecurityControlRegistry(store);
}

export function getSecurityPosture(store: DemoStore = loadDemoStore()) {
  const controls = getSecurityControls(store);
  return summarizeControlPosture(controls);
}

export function getProductionGate(store: DemoStore = loadDemoStore()) {
  return canLaunchProduction(store);
}

export function getProductionReadiness(store: DemoStore = loadDemoStore()) {
  return evaluateProductionReadiness(store);
}

export function requireSecurityPermission(store: DemoStore, perm: SecurityPermission): boolean {
  const ctx = resolveOfficeStaffContext(store);
  return hasSecurityPermission(ctx.permissions, perm);
}

export function getAuthorizedInvoice(id: string, asCustomer: boolean, store: DemoStore = loadDemoStore()) {
  const ctx = asCustomer ? buildCustomerAccessContext(store) : buildStaffAccessContext(store);
  const decision = assertResourceAccess(store, ctx, 'invoice', id);
  if (!decision.allowed) return { invoice: undefined, decision };
  return { invoice: store.invoices.find((i) => i.id === id), decision };
}

export function getAuthorizedDocument(id: string, asCustomer: boolean, store: DemoStore = loadDemoStore()) {
  const ctx = asCustomer ? buildCustomerAccessContext(store) : buildStaffAccessContext(store);
  const decision = assertResourceAccess(store, ctx, 'document', id);
  if (!decision.allowed) return { document: undefined, decision };
  return { document: store.documents.find((d) => d.id === id), decision };
}

export function createSignedDownloadGrant(
  documentId: string,
  organizationId: string,
  ttlMinutes = 15,
): SignedDownloadGrant {
  const grant: SignedDownloadGrant = {
    documentId,
    organizationId,
    token: crypto.randomUUID(),
    expiresAt: new Date(Date.now() + ttlMinutes * 60000).toISOString(),
  };
  updateDemoStore((s) => {
    if (!s.signedDownloadGrants) s.signedDownloadGrants = [];
    s.signedDownloadGrants.push(grant);
    recordSecurityAudit(s, {
      eventType: 'DOCUMENT_DOWNLOADED',
      action: 'Signed download grant created',
      result: 'SUCCESS',
      organizationId,
      entityType: 'document',
      entityId: documentId,
    });
    return s;
  });
  return grant;
}

export function validateSignedDownload(token: string, documentId: string, orgId: string, store: DemoStore = loadDemoStore()) {
  const grant = store.signedDownloadGrants?.find(
    (g) => g.token === token && g.documentId === documentId && g.organizationId === orgId,
  );
  if (!grant) return { ok: false as const, reason: 'invalid' };
  if (grant.usedAt) return { ok: false as const, reason: 'used' };
  if (grant.expiresAt < new Date().toISOString()) return { ok: false as const, reason: 'expired' };
  return { ok: true as const, grant };
}

export function revokeSession(sessionId: string, actorStaffId: string): void {
  updateDemoStore((s) => {
    const sess = s.securitySessions?.find((x) => x.id === sessionId);
    if (sess) sess.revokedAt = new Date().toISOString();
    const staff = resolveOfficeStaffContext(s);
    recordSecurityAudit(s, {
      eventType: 'SESSION_REVOKED',
      action: 'Session revoked',
      result: 'SUCCESS',
      actorId: actorStaffId,
      actorLabel: staff.staffName,
      actorRole: staff.role,
      entityType: 'session',
      entityId: sessionId,
    });
    return s;
  });
}

export function revokeStaffPermission(staffId: string, permission: string, actorStaffId: string): void {
  updateDemoStore((s) => {
    if (!s.staffPermissionOverrides) s.staffPermissionOverrides = {};
    const key = staffId;
    const revoked = new Set(s.staffPermissionOverrides[key] ?? []);
    revoked.add(permission);
    s.staffPermissionOverrides[key] = [...revoked];
    recordSecurityAudit(s, {
      eventType: 'PERMISSION_CHANGED',
      action: `Removed permission ${permission}`,
      result: 'SUCCESS',
      actorId: actorStaffId,
      entityType: 'staff',
      entityId: staffId,
      metadata: { permission, change: 'revoke' },
    });
    return s;
  });
}

export function staffHasEffectivePermission(store: DemoStore, staffId: string, permission: string): boolean {
  const ctx = resolveOfficeStaffContext(store);
  if (ctx.staffId !== staffId) {
    const base = ctx.permissions;
    const revoked = store.staffPermissionOverrides?.[staffId] ?? [];
    return base.includes(permission as never) && !revoked.includes(permission);
  }
  return ctx.permissions.includes(permission as never);
}

export function attemptBulkExport(reportId: string, rowCount: number, store: DemoStore = loadDemoStore()) {
  const ctx = buildStaffAccessContext(store);
  const staff = ctx.staff!;
  const rate = checkRateLimit('export', staff.staffId);
  if (!rate.allowed) {
    return { ok: false, message: 'Export rate limit exceeded.' };
  }
  if (!canExportFinancial(ctx) || !staffHasEffectivePermission(store, staff.staffId, 'reports.export')) {
    recordSecurityAudit(store, {
      eventType: 'EXPORT_CREATED',
      action: `Blocked export — ${reportId}`,
      result: 'DENIED',
      actorId: staff.staffId,
      actorLabel: staff.staffName,
      metadata: { reportId, rowCount },
    });
    return { ok: false, message: 'You do not have permission to export this report.' };
  }
  updateDemoStore((s) => {
    recordSecurityAudit(s, {
      eventType: 'EXPORT_CREATED',
      action: `Export created — ${reportId}`,
      result: 'SUCCESS',
      actorId: staff.staffId,
      actorLabel: staff.staffName,
      metadata: { reportId, rowCount, filters: 'demo' },
    });
    return s;
  });
  return { ok: true };
}

export function validateFileUpload(input: Parameters<typeof validateUpload>[0]) {
  return validateUpload(input);
}

export function submitPrivacyRequest(
  organizationId: string,
  requesterLabel: string,
  requestType: PrivacyRequestType,
): void {
  updateDemoStore((s) => {
    const req = {
      id: uid(),
      organizationId,
      requesterLabel,
      requestType,
      status: 'SUBMITTED' as PrivacyRequestStatus,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: true,
    };
    if (!s.privacyRequests) s.privacyRequests = [];
    s.privacyRequests.unshift(req);
    recordSecurityAudit(s, {
      eventType: 'PRIVACY_REQUEST_ACTION',
      action: `Privacy request submitted — ${requestType}`,
      result: 'SUCCESS',
      organizationId,
      entityType: 'privacy_request',
      entityId: req.id,
    });
    return s;
  });
}

export function updatePrivacyRequestStatus(id: string, status: PrivacyRequestStatus, notes?: string): void {
  updateDemoStore((s) => {
    const req = s.privacyRequests?.find((p) => p.id === id);
    if (!req) return s;
    req.status = status;
    req.updatedAt = new Date().toISOString();
    if (notes) req.reviewNotes = notes;
    recordSecurityAudit(s, {
      eventType: 'PRIVACY_REQUEST_ACTION',
      action: `Privacy request status → ${status}`,
      result: 'SUCCESS',
      organizationId: req.organizationId,
      entityType: 'privacy_request',
      entityId: id,
    });
    return s;
  });
}

export function createSecurityIncident(input: {
  title: string;
  summary: string;
  severity: import('../security/securityTypes').IncidentSeverity;
  category: import('../security/securityTypes').IncidentCategory;
  owner: string;
}): void {
  updateDemoStore((s) => {
    const inc = {
      id: uid(),
      ...input,
      detectedAt: new Date().toISOString(),
      status: 'OPEN' as IncidentStatus,
      isDemo: true,
    };
    if (!s.securityIncidents) s.securityIncidents = [];
    s.securityIncidents.unshift(inc);
    recordSecurityAudit(s, {
      eventType: 'INCIDENT_ACTION',
      action: 'Security incident opened',
      result: 'SUCCESS',
      actorId: input.owner,
      entityType: 'incident',
      entityId: inc.id,
      metadata: { severity: input.severity },
    });
    return s;
  });
}

export function updateIncidentStatus(id: string, status: IncidentStatus, notes?: string): void {
  updateDemoStore((s) => {
    const inc = s.securityIncidents?.find((i) => i.id === id);
    if (!inc) return s;
    inc.status = status;
    if (notes) inc.containment = notes;
    recordSecurityAudit(s, {
      eventType: 'INCIDENT_ACTION',
      action: `Incident status → ${status}`,
      result: 'SUCCESS',
      entityType: 'incident',
      entityId: id,
    });
    return s;
  });
}

export function updateFindingStatus(id: string, status: SecurityFindingStatus): void {
  updateDemoStore((s) => {
    const f = s.securityFindings?.find((x) => x.id === id);
    if (f) {
      f.status = status;
      if (status === 'CLOSED' || status === 'MITIGATED') f.verifiedAt = new Date().toISOString();
    }
    return s;
  });
}

export function safePasswordResetResponse(_email: string): { message: string } {
  return {
    message: 'If an account exists for that email, password reset instructions will be sent.',
  };
}

export function disableStaffAccount(staffId: string, actorStaffId: string): void {
  updateDemoStore((s) => {
    const member = s.staff.find((m) => m.id === staffId);
    if (member) member.status = 'out';
    s.securitySessions?.filter((sess) => sess.principalId === staffId).forEach((sess) => {
      sess.revokedAt = new Date().toISOString();
    });
    recordSecurityAudit(s, {
      eventType: 'ADMIN_OVERRIDE',
      action: 'Staff account disabled and sessions revoked',
      result: 'SUCCESS',
      actorId: actorStaffId,
      entityType: 'staff',
      entityId: staffId,
    });
    return s;
  });
}

export function simulateProductionEnvironment(enabled: boolean): void {
  updateDemoStore((s) => {
    if (!s.securitySettings) return s;
    s.securitySettings.environmentLabel = enabled ? 'PRODUCTION' : 'DEBUG';
    s.securitySettings.demoModeActive = !enabled;
    return s;
  });
}
