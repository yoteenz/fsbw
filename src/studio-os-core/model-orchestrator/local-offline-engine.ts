import {
  LOCAL_OFFLINE_CAPABILITY_LABELS,
  LOCAL_OFFLINE_CAPABILITIES,
} from './constants';
import type { LocalOfflineCapability, LocalOfflineProfile } from './types';

export function buildLocalOfflineCapabilities(offlineCapable: boolean): LocalOfflineProfile[] {
  return LOCAL_OFFLINE_CAPABILITIES.map((capability) => ({
    capability,
    label: LOCAL_OFFLINE_CAPABILITY_LABELS[capability],
    available: capability !== 'enterprise-sensitive-data' || offlineCapable,
    offlineModeSupported: offlineCapable || capability === 'offline-command-handling',
    detail: localDetail(capability),
  }));
}

function localDetail(capability: LocalOfflineCapability): string {
  const details: Record<LocalOfflineCapability, string> = {
    'basic-search': 'Indexed org knowledge search without cloud AI',
    summaries: 'Condense documents from Memory Engine™ locally',
    'private-notes': 'Founder notes never sent to cloud providers',
    'offline-command-handling': 'Command Dock™ queues commands until connectivity returns',
    'document-organization': 'Operating Manual sections organized offline',
    'simple-workflows': 'Shadow Mode™ approved automations run locally',
    'enterprise-sensitive-data': 'Regulated data stays on-premise · Professional Trust Framework™ enforced',
  };
  return details[capability];
}

export function summarizeLocalOffline(profiles: LocalOfflineProfile[], offlineCapable: boolean): string {
  const available = profiles.filter((p) => p.available).length;
  return `Local + offline — ${available}/${profiles.length} capabilities${offlineCapable ? ' · offline mode active' : ''}. Limited functionality preserved when cloud AI unavailable.`;
}
