import type { AiProductionDepartmentId, AiProductionProviderId } from '../../../utils/adminStudioAiProductionEngineDemo';
import { DEPARTMENT_DEFAULT_PROVIDER } from '../../../utils/adminStudioAiProductionEngineDemo';

export type ProviderAdapterState = {
  id: AiProductionProviderId;
  enabled: boolean;
  statusMessage: string;
  lastCall: string | null;
};

export const PROVIDER_ADAPTER_REGISTRY: Array<{
  id: AiProductionProviderId;
  label: string;
  interchangeable: boolean;
}> = [
  { id: 'openai', label: 'OPENAI', interchangeable: true },
  { id: 'fal', label: 'FAL', interchangeable: true },
  { id: 'openart', label: 'OPENART', interchangeable: true },
  { id: 'voice', label: 'VOICE PROVIDER', interchangeable: true },
  { id: 'resend', label: 'RESEND', interchangeable: true },
  { id: 'future', label: 'FUTURE AI PROVIDERS', interchangeable: true },
];

export function createDefaultProviderStates(): Record<AiProductionProviderId, ProviderAdapterState> {
  return {
    openai: { id: 'openai', enabled: true, statusMessage: 'READY · NOT CONNECTED', lastCall: null },
    fal: { id: 'fal', enabled: true, statusMessage: 'READY · NOT CONNECTED', lastCall: null },
    openart: { id: 'openart', enabled: true, statusMessage: 'READY · NOT CONNECTED', lastCall: null },
    voice: { id: 'voice', enabled: true, statusMessage: 'READY · NOT CONNECTED', lastCall: null },
    resend: { id: 'resend', enabled: true, statusMessage: 'READY · NOT CONNECTED', lastCall: null },
    future: { id: 'future', enabled: false, statusMessage: 'RESERVED · NOT CONNECTED', lastCall: null },
  };
}

export function resolveDepartmentProvider(departmentId: AiProductionDepartmentId): AiProductionProviderId {
  return DEPARTMENT_DEFAULT_PROVIDER[departmentId];
}
