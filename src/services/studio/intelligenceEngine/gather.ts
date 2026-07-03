import {
  INTELLIGENCE_CONNECTOR_REGISTRY,
  INTELLIGENCE_TYPE_LABELS,
  TOPIC_FORECAST_SEEDS,
  TOPIC_RECOMMENDATION_EVIDENCE_MAP,
  CUSTOMER_INTELLIGENCE_DEMO_SIGNALS,
  PERFORMANCE_INTELLIGENCE_DEMO_SIGNALS,
  confidenceLevelFromPercent,
  type IntelligenceConnectorId,
  type IntelligenceEvidenceSeed,
} from '../../../utils/adminStudioIntelligenceDemo';
import type {
  ConnectorRuntimeState,
  IntelligenceEvidence,
  IntelligenceGatherResult,
  IntelligenceRecommendation,
  TopicForecast,
  CreativeDirectorIntelligenceFeed,
} from './types';
import { getConnectorImplementation } from './connectors';

export type ConnectorStateMap = Record<IntelligenceConnectorId, ConnectorRuntimeState>;

export function createDefaultConnectorStates(): ConnectorStateMap {
  return INTELLIGENCE_CONNECTOR_REGISTRY.reduce((acc, def) => {
    acc[def.id] = {
      enabled: false,
      connected: false,
      lastSyncAt: null,
      statusMessage: 'DISABLED — ENABLE TO GATHER SIGNALS',
    };
    return acc;
  }, {} as ConnectorStateMap);
}

/** Demo evidence only materializes when connector is enabled AND connected (simulated wiring). */
export function getDemoEvidenceForConnector(
  connectorId: IntelligenceConnectorId
): IntelligenceEvidenceSeed[] {
  const items: IntelligenceEvidenceSeed[] = [];
  for (const rec of Object.values(TOPIC_RECOMMENDATION_EVIDENCE_MAP)) {
    for (const ev of rec.evidence) {
      if (ev.connectorId === connectorId) items.push(ev);
    }
  }
  for (const sig of CUSTOMER_INTELLIGENCE_DEMO_SIGNALS) {
    if (sig.connectorId === connectorId) {
      items.push({ connectorId, signal: sig.label, metric: sig.value });
    }
  }
  for (const sig of PERFORMANCE_INTELLIGENCE_DEMO_SIGNALS) {
    if (sig.connectorId === connectorId) {
      items.push({ connectorId, signal: sig.metric, metric: sig.value });
    }
  }
  return items;
}

export async function syncConnector(
  connectorId: IntelligenceConnectorId,
  states: ConnectorStateMap,
  useDemoConnection: boolean
): Promise<ConnectorStateMap> {
  const state = states[connectorId];
  if (!state?.enabled) return states;

  const impl = getConnectorImplementation(connectorId);
  const connected = useDemoConnection ? true : state.connected;

  if (!connected) {
    return {
      ...states,
      [connectorId]: {
        ...state,
        connected: false,
        statusMessage: 'ENABLED · NOT CONNECTED — WIRE API IN PHASE 2',
      },
    };
  }

  const runtime: ConnectorRuntimeState = { ...state, connected: true };
  const payload = impl ? await impl.fetch(runtime) : null;
  const demoSignals = getDemoEvidenceForConnector(connectorId);
  const hasData = demoSignals.length > 0 || (payload?.signals.length ?? 0) > 0;

  return {
    ...states,
    [connectorId]: {
      ...state,
      connected: true,
      lastSyncAt: new Date().toISOString(),
      statusMessage: hasData
        ? `CONNECTED · ${demoSignals.length || payload?.signals.length || 0} SIGNALS`
        : 'CONNECTED · NO DATA RECEIVED YET',
    },
  };
}

function buildEvidence(
  seeds: IntelligenceEvidenceSeed[],
  states: ConnectorStateMap,
  useDemoConnection: boolean
): IntelligenceEvidence[] {
  return seeds
    .filter((seed) => {
      const st = states[seed.connectorId];
      if (!st?.enabled) return false;
      if (useDemoConnection) return true;
      return st.connected && Boolean(st.lastSyncAt);
    })
    .map((seed) => {
      const def = INTELLIGENCE_CONNECTOR_REGISTRY.find((c) => c.id === seed.connectorId);
      const st = states[seed.connectorId];
      return {
        ...seed,
        connectorLabel: def?.label ?? seed.connectorId,
        collectedAt: st?.lastSyncAt ?? new Date().toISOString(),
        dataAvailable: true,
      };
    });
}

function computeConfidence(evidenceCount: number, required: number): number {
  if (evidenceCount === 0) return 0;
  const ratio = Math.min(1, evidenceCount / Math.max(required, 1));
  return Math.round(40 + ratio * 55);
}

export function gatherIntelligence(
  states: ConnectorStateMap,
  useDemoConnection: boolean
): IntelligenceGatherResult {
  const activeConnectors = INTELLIGENCE_CONNECTOR_REGISTRY.filter((def) => {
    const st = states[def.id];
    return st?.enabled && (useDemoConnection ? true : st.connected);
  }).map((d) => d.id);

  const recommendations: IntelligenceRecommendation[] = Object.entries(TOPIC_RECOMMENDATION_EVIDENCE_MAP).map(
    ([id, rec]) => {
      const evidence = buildEvidence(rec.evidence, states, useDemoConnection);
      const required = rec.evidence.length;
      const confidence = computeConfidence(evidence.length, required);
      return {
        id,
        title: rec.title,
        intelligenceType: 'market' as const,
        confidence,
        confidenceLevel: confidenceLevelFromPercent(confidence),
        evidence,
        suggestedShowId: rec.suggestedShowId,
        suggestedCtaId: rec.suggestedCtaId,
        suggestedProducts: rec.suggestedProducts,
        insufficientEvidence: evidence.length < 2,
        reason:
          evidence.length < 2
            ? 'INSUFFICIENT EVIDENCE — ENABLE MORE CONNECTORS'
            : undefined,
      };
    }
  );

  const forecasts: TopicForecast[] = TOPIC_FORECAST_SEEDS.map((f) => {
    const missing = f.requiredConnectors.filter((cid) => {
      const st = states[cid];
      return !st?.enabled || !(useDemoConnection ? true : st.connected);
    });
    return {
      id: f.id,
      title: f.title,
      window: f.window,
      intelligenceType: f.intelligenceType,
      ready: missing.length === 0,
      missingConnectors: missing.map(
        (id) => INTELLIGENCE_CONNECTOR_REGISTRY.find((c) => c.id === id)?.label ?? id
      ),
    };
  });

  const hasActionableData = recommendations.some((r) => !r.insufficientEvidence);

  return {
    gatheredAt: new Date().toISOString(),
    activeConnectors,
    recommendations,
    forecasts,
    hasActionableData,
  };
}

export function buildCreativeDirectorFeed(
  gather: IntelligenceGatherResult
): CreativeDirectorIntelligenceFeed {
  const top = gather.recommendations
    .filter((r) => !r.insufficientEvidence)
    .sort((a, b) => b.confidence - a.confidence)[0];

  if (!top) {
    return {
      briefingBullets: ['NO CONNECTOR DATA — ENABLE & CONNECT SOURCES TO POWER BRIEFING'],
      suggestedTopic: null,
      suggestedShowId: null,
      suggestedCtaId: null,
      suggestedProductIds: [],
      campaignSuggestions: [],
      publishingNotes: [],
      insufficientData: true,
    };
  }

  return {
    briefingBullets: top.evidence.map((e) => `${e.connectorLabel}: ${e.signal}${e.metric ? ` (${e.metric})` : ''}`),
    suggestedTopic: top.title,
    suggestedShowId: top.suggestedShowId ?? null,
    suggestedCtaId: top.suggestedCtaId ?? null,
    suggestedProductIds: top.suggestedProducts ?? [],
    campaignSuggestions: [`SEASONAL FORECAST — ${top.title}`, 'MEMBERSHIP DRIVE — LOUNGE ACTIVATION'],
    publishingNotes: ['FRIDAY 7PM — SLAY REPORT SLOT', 'EMAIL TEASE THURSDAY AM'],
    insufficientData: false,
  };
}

export function getCustomerSignals(states: ConnectorStateMap, useDemoConnection: boolean) {
  return CUSTOMER_INTELLIGENCE_DEMO_SIGNALS.filter((s) => {
    const st = states[s.connectorId];
    return st?.enabled && (useDemoConnection || st.connected);
  });
}

export function getPerformanceSignals(states: ConnectorStateMap, useDemoConnection: boolean) {
  return PERFORMANCE_INTELLIGENCE_DEMO_SIGNALS.filter((s) => {
    const st = states[s.connectorId];
    return st?.enabled && (useDemoConnection || st.connected);
  });
}

void INTELLIGENCE_TYPE_LABELS;
