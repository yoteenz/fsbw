import type { PsaChatCopyConfig } from './psaChatCopyCatalog';
import { mergePsaChatCopyConfig, saveLocalPsaChatCopyConfig } from './psaChatCopyResolve';

export async function fetchPsaChatConfigFromCloud(): Promise<PsaChatCopyConfig | null> {
  const { getPsaChatAdminConfig } = await import('./api');
  const config = await getPsaChatAdminConfig();
  if (!config) return null;
  const { normalizePsaChatCopyConfig } = await import('./psaChatCopyCatalog');
  return normalizePsaChatCopyConfig(config);
}

export async function syncPsaChatCopyToCloud(config: PsaChatCopyConfig): Promise<void> {
  const { putAdminPsaChatConfig } = await import('./api');
  await putAdminPsaChatConfig({ ...config, updatedAt: Date.now() } as unknown as Record<string, unknown>);
}

export async function fetchAndMergePsaChatCopyFromCloud(): Promise<PsaChatCopyConfig> {
  const { getResolvedPsaChatCopyConfig } = await import('./psaChatCopyResolve');
  const local = getResolvedPsaChatCopyConfig();
  try {
    const remote = await fetchPsaChatConfigFromCloud();
    if (!remote) return local;
    const merged = mergePsaChatCopyConfig(local, remote);
    saveLocalPsaChatCopyConfig(merged);
    return merged;
  } catch {
    return local;
  }
}
