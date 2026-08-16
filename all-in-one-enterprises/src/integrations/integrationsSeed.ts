import {
  DEFAULT_RESEARCH_RECORDS,
  DEFAULT_STATE_CAPABILITY_MATRIX,
  INTEGRATION_PROVIDER_CATALOG,
} from './integrationRegistry';
import type {
  IntegrationConnection,
  IntegrationCredentialReference,
  IntegrationStoreSlice,
  IntegrationReconciliationIssue,
} from './integrationTypes';

const now = new Date().toISOString();

function conn(
  id: string,
  providerId: string,
  name: string,
  env: 'DEMO' | 'SANDBOX' | 'PRODUCTION',
  status: IntegrationConnection['status'],
): IntegrationConnection {
  return {
    id,
    providerId,
    name,
    environment: env,
    status,
    health: status === 'CONNECTED' ? 'HEALTHY' : status === 'DEGRADED' ? 'DEGRADED' : 'UNKNOWN',
    enabledCapabilities: INTEGRATION_PROVIDER_CATALOG.find((p) => p.id === providerId)?.supportedCapabilities ?? [],
    credentialReferenceId: `cred-${id}`,
    configurationOwnerStaffId: 'staff-1',
    webhookEnabled: ['prov-payment-demo', 'prov-email-demo', 'prov-sms-demo'].includes(providerId),
    lastSuccessfulOperationAt: status === 'CONNECTED' ? now : undefined,
    lastVerifiedAt: status === 'CONNECTED' ? now : undefined,
    circuitBreakerState: 'CLOSED',
    createdAt: now,
    updatedAt: now,
  };
}

function cred(id: string, connectionId: string): IntegrationCredentialReference {
  return {
    id,
    connectionId,
    secretProvider: 'demo',
    referenceKey: `AIO_DEMO_${connectionId.toUpperCase()}`,
    authType: 'api_key',
    status: 'configured',
    maskedHint: '****demo',
  };
}

export function createIntegrationsSeedData(): IntegrationStoreSlice {
  const connections: IntegrationConnection[] = [
    conn('conn-regulatory-demo', 'prov-regulatory-demo', 'Demo Regulatory Lookup', 'DEMO', 'CONNECTED'),
    conn('conn-payment-demo', 'prov-payment-demo', 'Demo Payments', 'DEMO', 'CONNECTED'),
    conn('conn-email-demo', 'prov-email-demo', 'Demo Email', 'DEMO', 'CONNECTED'),
    conn('conn-sms-demo', 'prov-sms-demo', 'Demo SMS', 'DEMO', 'CONNECTED'),
    conn('conn-maps-demo', 'prov-maps-demo', 'Demo Maps & Routing', 'DEMO', 'CONNECTED'),
    conn('conn-loadboard-demo', 'prov-loadboard-demo', 'Demo Load Board', 'DEMO', 'CONNECTED'),
    conn('conn-factoring-demo', 'prov-factoring-demo', 'Demo Factoring Partner', 'DEMO', 'CONNECTED'),
    conn('conn-insurance-demo', 'prov-insurance-demo', 'Demo Insurance Partner', 'DEMO', 'CONNECTED'),
    conn('conn-accounting-demo', 'prov-accounting-demo', 'Demo Accounting Export', 'DEMO', 'CONNECTED'),
    conn('conn-payment-sandbox', 'prov-payment-demo', 'Payment Sandbox (unused)', 'SANDBOX', 'NOT_CONFIGURED'),
  ];

  const credentialRefs = connections
    .filter((c) => c.credentialReferenceId)
    .map((c) => cred(c.credentialReferenceId!, c.id));

  const demoReconciliation: IntegrationReconciliationIssue = {
    id: 'recon-demo-amount',
    providerId: 'prov-payment-demo',
    connectionId: 'conn-payment-demo',
    issueType: 'AMOUNT_MISMATCH',
    severity: 'critical',
    entityType: 'payment',
    entityId: 'pay-demo-mismatch',
    expectedValue: '115000',
    externalValue: '125000',
    status: 'open',
    createdAt: now,
  };

  return {
    integrationProviders: INTEGRATION_PROVIDER_CATALOG,
    integrationConnections: connections,
    integrationCredentialRefs: credentialRefs,
    integrationExternalIds: [],
    integrationOperations: [],
    integrationOperationAttempts: [],
    integrationWebhookEvents: [],
    integrationSyncJobs: [],
    integrationSyncCursors: [],
    integrationReconciliationIssues: [demoReconciliation],
    integrationConsents: [
      {
        id: 'consent-demo-eld',
        organizationId: 'client-a',
        providerId: 'prov-telematics',
        purpose: 'ELD connection for fleet visibility',
        scope: ['vehicle_location'],
        grantedAt: now,
      },
    ],
    integrationHealthRecords: connections.map((c) => ({
      id: `health-${c.id}`,
      connectionId: c.id,
      state: c.health,
      evaluatedAt: now,
      recentSuccessCount: c.status === 'CONNECTED' ? 1 : 0,
      recentFailureCount: 0,
    })),
    integrationAuditEvents: [
      {
        id: 'audit-seed-1',
        action: 'CONNECTION_VERIFIED',
        connectionId: 'conn-regulatory-demo',
        providerId: 'prov-regulatory-demo',
        staffId: 'staff-1',
        safeDetail: 'Initial demo seed verification',
        createdAt: now,
      },
    ],
    integrationMappings: [],
    integrationResearchRecords: DEFAULT_RESEARCH_RECORDS,
    carrierExternalVerifications: [],
    loadBoardCandidates: [],
    integrationOAuthStates: [],
    stateCapabilityMatrix: DEFAULT_STATE_CAPABILITY_MATRIX,
  };
}
