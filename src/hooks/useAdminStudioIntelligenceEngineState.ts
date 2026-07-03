import { useCallback, useMemo, useState } from 'react';
import { INTELLIGENCE_CONNECTOR_REGISTRY } from '../utils/adminStudioIntelligenceDemo';
import { ADMIN_STUDIO_STORAGE_KEYS, readStudioJson, writeStudioJson } from '../utils/adminStudioStorage';
import {
  buildIntelligenceSnapshot,
  createDefaultConnectorStates,
  syncConnector,
  type ConnectorStateMap,
} from '../services/studio/intelligenceEngine';
import type { IntelligenceConnectorId } from '../utils/adminStudioIntelligenceDemo';

type IntelligenceEnginePersisted = {
  connectorStates: ConnectorStateMap;
  useDemoConnection: boolean;
};

const DEMO_CONNECTOR_IDS: IntelligenceConnectorId[] = [
  'google-trends',
  'pinterest-trends',
  'instagram-analytics',
  'wishlist-activity',
  'orders',
  'search-analytics',
  'psa-conversations',
  'baw-saves',
  'lounge-tv-analytics',
  'email-performance',
];

function loadPersisted(): IntelligenceEnginePersisted {
  const saved = readStudioJson<Partial<IntelligenceEnginePersisted>>(ADMIN_STUDIO_STORAGE_KEYS.intelligenceEngine);
  return {
    connectorStates: { ...createDefaultConnectorStates(), ...(saved?.connectorStates ?? {}) },
    useDemoConnection: saved?.useDemoConnection ?? false,
  };
}

function persist(state: IntelligenceEnginePersisted): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.intelligenceEngine, state);
}

export function useAdminStudioIntelligenceEngine() {
  const [persisted, setPersisted] = useState(loadPersisted);

  const snapshot = useMemo(
    () =>
      buildIntelligenceSnapshot({
        connectorStates: persisted.connectorStates,
        useDemoConnection: persisted.useDemoConnection,
      }),
    [persisted]
  );

  const update = useCallback((patch: Partial<IntelligenceEnginePersisted>) => {
    setPersisted((prev) => {
      const next = { ...prev, ...patch };
      persist(next);
      return next;
    });
  }, []);

  const toggleConnector = useCallback((id: IntelligenceConnectorId) => {
    setPersisted((prev) => {
      const current = prev.connectorStates[id];
      const nextStates = {
        ...prev.connectorStates,
        [id]: {
          ...current,
          enabled: !current.enabled,
          statusMessage: !current.enabled ? 'ENABLED — SYNC TO RECEIVE DATA' : 'DISABLED',
        },
      };
      const next = { ...prev, connectorStates: nextStates };
      persist(next);
      return next;
    });
  }, []);

  const enableDemoSources = useCallback(async () => {
    let states = persisted.connectorStates;
    for (const id of DEMO_CONNECTOR_IDS) {
      states = {
        ...states,
        [id]: {
          ...states[id],
          enabled: true,
          connected: true,
          lastSyncAt: new Date().toISOString(),
          statusMessage: 'DEMO CONNECTION — SIMULATED SIGNALS',
        },
      };
    }
    const next = { connectorStates: states, useDemoConnection: true };
    persist(next);
    setPersisted(next);
  }, [persisted.connectorStates]);

  const syncOneConnector = useCallback(
    async (id: IntelligenceConnectorId) => {
      const states = await syncConnector(id, persisted.connectorStates, persisted.useDemoConnection);
      update({ connectorStates: states });
    },
    [persisted.connectorStates, persisted.useDemoConnection, update]
  );

  return {
    snapshot,
    connectorRegistry: INTELLIGENCE_CONNECTOR_REGISTRY,
    connectorStates: persisted.connectorStates,
    useDemoConnection: persisted.useDemoConnection,
    toggleConnector,
    enableDemoSources,
    syncOneConnector,
    setUseDemoConnection: (v: boolean) => update({ useDemoConnection: v }),
  };
}
