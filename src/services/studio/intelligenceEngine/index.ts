import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import {
  gatherIntelligence,
  buildCreativeDirectorFeed,
  getCustomerSignals,
  getPerformanceSignals,
  createDefaultConnectorStates,
  syncConnector,
  type ConnectorStateMap,
} from './gather';

export type IntelligenceEngineConfig = {
  connectorStates: ConnectorStateMap;
  useDemoConnection: boolean;
};

export type IntelligenceEngineSnapshot = ReturnType<typeof gatherIntelligence> & {
  creativeDirectorFeed: ReturnType<typeof buildCreativeDirectorFeed>;
  customerSignals: ReturnType<typeof getCustomerSignals>;
  performanceSignals: ReturnType<typeof getPerformanceSignals>;
};

export function buildIntelligenceSnapshot(config: IntelligenceEngineConfig): IntelligenceEngineSnapshot {
  const gather = gatherIntelligence(config.connectorStates, config.useDemoConnection);
  return {
    ...gather,
    creativeDirectorFeed: buildCreativeDirectorFeed(gather),
    customerSignals: getCustomerSignals(config.connectorStates, config.useDemoConnection),
    performanceSignals: getPerformanceSignals(config.connectorStates, config.useDemoConnection),
  };
}

export const intelligenceEngineStudioService: StudioServiceStub & {
  getDefaultConnectorStates(): ConnectorStateMap;
  gather(config: IntelligenceEngineConfig): Promise<StudioServiceResult<IntelligenceEngineSnapshot>>;
  syncConnector(
    connectorId: keyof ConnectorStateMap,
    config: IntelligenceEngineConfig
  ): Promise<StudioServiceResult<{ states: ConnectorStateMap }>>;
  getCreativeDirectorFeed(
    config: IntelligenceEngineConfig
  ): Promise<StudioServiceResult<ReturnType<typeof buildCreativeDirectorFeed>>>;
} = {
  id: 'intelligence-engine',
  label: 'INTELLIGENCE ENGINE',
  phase: 2,
  enabled: false,
  description:
    'EVIDENCE-BASED STRATEGIST — CONNECTORS · CONFIDENCE · FORECASTS · FEEDS CREATIVE DIRECTOR',
  getDefaultConnectorStates: createDefaultConnectorStates,
  async gather(config) {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Intelligence Engine requires browser context.');
    }
    return { ok: true, data: buildIntelligenceSnapshot(config) };
  },
  async syncConnector(connectorId, config) {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Intelligence Engine sync requires browser context.');
    }
    const states = await syncConnector(connectorId, config.connectorStates, config.useDemoConnection);
    return { ok: true, data: { states } };
  },
  async getCreativeDirectorFeed(config) {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Intelligence feed requires browser context.');
    }
    const gather = gatherIntelligence(config.connectorStates, config.useDemoConnection);
    return { ok: true, data: buildCreativeDirectorFeed(gather) };
  },
};

export {
  gatherIntelligence,
  buildCreativeDirectorFeed,
  createDefaultConnectorStates,
  syncConnector,
  getCustomerSignals,
  getPerformanceSignals,
};
export type { ConnectorRuntimeState, IntelligenceRecommendation, IntelligenceEvidence, IntelligenceGatherResult, CreativeDirectorIntelligenceFeed } from './types';
export type { ConnectorStateMap } from './gather';
