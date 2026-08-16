import type {
  AdapterExecuteContext,
  AdapterExecuteResult,
  AdapterVerifyResult,
  RegulatoryDataAdapter,
  RegulatoryLookupRequest,
  RegulatoryLookupResult,
} from '../integrationAdapter';
import type { IntegrationCapability, IntegrationConnection } from '../integrationTypes';
import { computeDataFreshness } from '../integrationHealth';

const DEMO_USDOT = '1234567';

function baseDemoVerify(connection: IntegrationConnection): AdapterVerifyResult {
  return {
    ok: connection.environment === 'DEMO',
    testResult: connection.environment === 'DEMO' ? 'SUCCESS' : 'CONFIGURATION_INVALID',
    capabilities: ['READ', 'VERIFY', 'REGULATORY'],
    safeMessage: connection.environment === 'DEMO' ? 'Demo regulatory adapter verified' : 'Live FMCSA not configured',
  };
}

function demoProvenance(): RegulatoryLookupResult['provenance'] {
  const fetchedAt = new Date().toISOString();
  return {
    source: 'DEMO_DATA',
    fetchedAt,
    verificationStatus: 'demo',
    confidence: 'high',
    freshness: computeDataFreshness(fetchedAt, 365 * 24 * 60 * 60 * 1000),
  };
}

export class DemoRegulatoryAdapter implements RegulatoryDataAdapter {
  readonly providerSlug = 'demo-regulatory';
  readonly adapterVersion = '1.0.0';

  verifyConnection(connection: IntegrationConnection): Promise<AdapterVerifyResult> {
    return Promise.resolve(baseDemoVerify(connection));
  }

  getCapabilities(_connection: IntegrationConnection): IntegrationCapability[] {
    return ['READ', 'VERIFY', 'REGULATORY'];
  }

  async execute(ctx: AdapterExecuteContext): Promise<AdapterExecuteResult> {
    if (ctx.operationType === 'REGULATORY_LOOKUP') {
      const id = String(ctx.payload?.identifier ?? '');
      const result = await this.lookupCarrier({
        identifierType: (ctx.payload?.identifierType as 'USDOT' | 'MC') ?? 'USDOT',
        identifier: id,
      });
      return {
        status: result.found ? 'SUCCEEDED' : 'SUCCEEDED',
        result: result as unknown as Record<string, unknown>,
      };
    }
    if (ctx.operationType === 'TIMEOUT_SIMULATION') {
      return { status: 'FAILED', safeError: 'Provider timeout', retryEligible: true, errorCode: 'TIMEOUT' };
    }
    return { status: 'FAILED', safeError: 'Unknown operation', errorCode: 'VALIDATION_ERROR' };
  }

  async lookupCarrier(request: RegulatoryLookupRequest): Promise<RegulatoryLookupResult> {
    const normalized = request.identifier.replace(/\D/g, '');
    if (normalized === DEMO_USDOT || request.identifier === DEMO_USDOT) {
      return {
        found: true,
        legalName: 'Roadline Transport LLC',
        operatingStatus: 'ACTIVE — DEMO DATA',
        authorityStatus: 'AUTHORIZED — DEMO DATA',
        boc3Status: 'FILED — DEMO DATA',
        insuranceStatus: 'ON FILE — DEMO DATA',
        providerStatusRaw: 'A',
        provenance: demoProvenance(),
      };
    }
    return {
      found: false,
      provenance: {
        ...demoProvenance(),
        verificationStatus: 'unverified',
        confidence: 'low',
      },
    };
  }

  disconnect(): Promise<{ ok: boolean }> {
    return Promise.resolve({ ok: true });
  }
}

export const demoRegulatoryAdapter = new DemoRegulatoryAdapter();
