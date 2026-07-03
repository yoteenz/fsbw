import type { IntelligenceConnectorId } from '../../../utils/adminStudioIntelligenceDemo';
import { INTELLIGENCE_CONNECTOR_REGISTRY } from '../../../utils/adminStudioIntelligenceDemo';
import type { ConnectorRuntimeState } from './types';

export type ConnectorDataPayload = {
  connectorId: IntelligenceConnectorId;
  signals: Array<{ signal: string; metric?: string }>;
  syncedAt: string;
};

/** Each connector is independently pluggable — Phase 2 replaces fetch bodies. */
export type IntelligenceConnector = {
  id: IntelligenceConnectorId;
  label: string;
  fetch(_state: ConnectorRuntimeState): Promise<ConnectorDataPayload | null>;
};

function notConnectedConnector(id: IntelligenceConnectorId): IntelligenceConnector {
  const def = INTELLIGENCE_CONNECTOR_REGISTRY.find((c) => c.id === id)!;
  return {
    id,
    label: def.label,
    async fetch(state) {
      if (!state.enabled || !state.connected) return null;
      return { connectorId: id, signals: [], syncedAt: new Date().toISOString() };
    },
  };
}

/** Registry — add new connectors here without modifying engine core. */
export const INTELLIGENCE_CONNECTOR_IMPLEMENTATIONS: IntelligenceConnector[] =
  INTELLIGENCE_CONNECTOR_REGISTRY.map((def) => notConnectedConnector(def.id));

export function getConnectorImplementation(id: IntelligenceConnectorId): IntelligenceConnector | undefined {
  return INTELLIGENCE_CONNECTOR_IMPLEMENTATIONS.find((c) => c.id === id);
}
