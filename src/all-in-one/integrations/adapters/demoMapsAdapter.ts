import type {
  AdapterExecuteContext,
  AdapterExecuteResult,
  AdapterVerifyResult,
  MapsRoutingAdapter,
  RouteEstimateRequest,
  RouteEstimateResult,
} from '../integrationAdapter';
import type { IntegrationCapability, IntegrationConnection } from '../integrationTypes';
import { computeDataFreshness } from '../integrationHealth';

export class DemoMapsAdapter implements MapsRoutingAdapter {
  readonly providerSlug = 'demo-maps';
  readonly adapterVersion = '1.0.0';

  verifyConnection(connection: IntegrationConnection): Promise<AdapterVerifyResult> {
    return Promise.resolve({
      ok: true,
      testResult: 'SUCCESS',
      capabilities: ['ROUTING', 'READ'],
      safeMessage: `Demo maps (${connection.environment})`,
    });
  }

  getCapabilities(): IntegrationCapability[] {
    return ['ROUTING', 'READ'];
  }

  async execute(ctx: AdapterExecuteContext): Promise<AdapterExecuteResult> {
    if (ctx.operationType === 'ROUTE_ESTIMATE') {
      const est = await this.estimateRoute({
        origin: String(ctx.payload?.origin ?? 'Atlanta, GA'),
        destination: String(ctx.payload?.destination ?? 'Dallas, TX'),
        loadId: ctx.entityId,
      });
      return { status: 'SUCCEEDED', result: est as unknown as Record<string, unknown> };
    }
    if (ctx.operationType === 'PROVIDER_FAILURE') {
      return { status: 'FAILED', safeError: 'Maps provider unavailable', retryEligible: true, errorCode: 'PROVIDER_UNAVAILABLE' };
    }
    return { status: 'FAILED', safeError: 'Unknown maps operation' };
  }

  async estimateRoute(_request: RouteEstimateRequest): Promise<RouteEstimateResult> {
    const fetchedAt = new Date().toISOString();
    return {
      distanceMiles: 781,
      estimatedDurationMinutes: 720,
      label: 'DEMO',
      provenance: {
        source: 'DEMO_DATA',
        fetchedAt,
        verificationStatus: 'demo',
        freshness: computeDataFreshness(fetchedAt),
      },
    };
  }

  disconnect(): Promise<{ ok: boolean }> {
    return Promise.resolve({ ok: true });
  }
}

export const demoMapsAdapter = new DemoMapsAdapter();
