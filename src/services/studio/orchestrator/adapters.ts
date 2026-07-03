import type { OrchestratorProviderId } from '../../../utils/adminStudioOrchestratorDemo';
import { ORCHESTRATOR_ADAPTER_REGISTRY } from '../../../utils/adminStudioOrchestratorDemo';
import type { AdapterRuntimeState } from './types';

export type ProviderAdapter = {
  id: OrchestratorProviderId;
  label: string;
  responsibilities: string[];
  execute(_input: { task: string; prompt: string }): Promise<{ ok: false; code: 'NOT_CONNECTED'; message: string }>;
};

function stubAdapter(id: OrchestratorProviderId): ProviderAdapter {
  const def = ORCHESTRATOR_ADAPTER_REGISTRY.find((a) => a.id === id)!;
  return {
    id,
    label: def.label,
    responsibilities: def.responsibilities,
    async execute() {
      return {
        ok: false,
        code: 'NOT_CONNECTED',
        message: `${def.label} is not connected. Studio must route through Orchestrator in Phase 2.`,
      };
    },
  };
}

export const PROVIDER_ADAPTERS: ProviderAdapter[] = [
  stubAdapter('openai'),
  stubAdapter('fal'),
  stubAdapter('openart'),
  stubAdapter('voice'),
  stubAdapter('email'),
];

export function createDefaultAdapterStates(): Record<OrchestratorProviderId, AdapterRuntimeState> {
  return {
    openai: { enabled: true, connected: false, statusMessage: 'NOT CONNECTED' },
    fal: { enabled: true, connected: false, statusMessage: 'NOT CONNECTED' },
    openart: { enabled: false, connected: false, statusMessage: 'DISABLED' },
    voice: { enabled: false, connected: false, statusMessage: 'PHASE 2 — VOICE PROVIDER' },
    email: { enabled: true, connected: false, statusMessage: 'NOT CONNECTED — NO AUTO SEND' },
  };
}
