import type {
  AdapterExecuteResult,
  AdapterVerifyResult,
  LoadBoardAdapter,
  LoadBoardSearchRequest,
  LoadBoardSearchResult,
} from '../integrationAdapter';
import type { IntegrationCapability, IntegrationConnection } from '../integrationTypes';

const DEMO_LOADS = [
  {
    externalLoadId: 'DEMO-LB-001',
    origin: 'Atlanta, GA',
    destination: 'Nashville, TN',
    rateMinor: 95000,
    commodity: 'General Freight',
    equipment: 'Dry Van',
    miles: 250,
    isDemo: true,
  },
  {
    externalLoadId: 'DEMO-LB-002',
    origin: 'Dallas, TX',
    destination: 'Houston, TX',
    rateMinor: 65000,
    commodity: 'Building Materials',
    equipment: 'Flatbed',
    miles: 240,
    isDemo: true,
  },
];

export class DemoLoadBoardAdapter implements LoadBoardAdapter {
  readonly providerSlug = 'demo-loadboard';
  readonly adapterVersion = '1.0.0';

  verifyConnection(connection: IntegrationConnection): Promise<AdapterVerifyResult> {
    return Promise.resolve({
      ok: true,
      testResult: 'SUCCESS',
      capabilities: ['SEARCH', 'READ', 'WRITE'],
      safeMessage: `Demo load board (${connection.environment})`,
    });
  }

  getCapabilities(): IntegrationCapability[] {
    return ['SEARCH', 'READ', 'WRITE'];
  }

  async execute(): Promise<AdapterExecuteResult> {
    return { status: 'SUCCEEDED' };
  }

  async searchLoads(request: LoadBoardSearchRequest): Promise<LoadBoardSearchResult> {
    let candidates = [...DEMO_LOADS];
    if (request.origin) {
      candidates = candidates.filter((c) => c.origin.toLowerCase().includes(request.origin!.toLowerCase()));
    }
    if (request.destination) {
      candidates = candidates.filter((c) => c.destination.toLowerCase().includes(request.destination!.toLowerCase()));
    }
    return { candidates };
  }

  disconnect(): Promise<{ ok: boolean }> {
    return Promise.resolve({ ok: true });
  }
}

export const demoLoadBoardAdapter = new DemoLoadBoardAdapter();
