import { readFirstEnsure } from '../sync/profile-cache';
import {
  PLUGIN_SDK_STORAGE_KEY,
  PLUGIN_SDK_VERSION,
  STUDIO_OS_PLUGIN_SDK_UPDATED,
} from './constants';
import { buildOrganizationPluginSdkProfile } from './engine-profile-builder';
import type { OrganizationPluginSdkProfile, PluginSdkStore } from './types';

function emptyStore(): PluginSdkStore {
  return { version: PLUGIN_SDK_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_PLUGIN_SDK_UPDATED));
  }
}

export function readPluginSdkStore(): PluginSdkStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(PLUGIN_SDK_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as PluginSdkStore;
    return { ...emptyStore(), ...parsed, version: PLUGIN_SDK_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writePluginSdkStore(store: PluginSdkStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(PLUGIN_SDK_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationPluginSdkProfile(organizationId: string): OrganizationPluginSdkProfile | null {
  return readPluginSdkStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationPluginSdkProfile): OrganizationPluginSdkProfile {
  const store = readPluginSdkStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writePluginSdkStore({ ...store, profiles: [...next, profile] });
  return profile;
}

/** Rebuild plugin catalog, SDK capabilities, marketplace, and sandbox from Workspace Runtime + platform sources */
export function syncPluginSdkFromSources(organizationId: string): OrganizationPluginSdkProfile {
  const profile = upsertProfile(buildOrganizationPluginSdkProfile(organizationId));
  return profile;
}

export function ensureOrganizationPluginSdkProfile(organizationId: string): OrganizationPluginSdkProfile {
  return readFirstEnsure(organizationId, getOrganizationPluginSdkProfile, syncPluginSdkFromSources);
}

export function setPluginDisabled(
  organizationId: string,
  pluginId: string,
  disabled: boolean
): OrganizationPluginSdkProfile {
  const profile =
    getOrganizationPluginSdkProfile(organizationId) ?? syncPluginSdkFromSources(organizationId);
  const installedPlugins = profile.installedPlugins.map((p) =>
    p.pluginId === pluginId ? { ...p, status: disabled ? ('disabled' as const) : ('active' as const) } : p
  );
  const activePluginCount = installedPlugins.filter((p) => p.status === 'active').length;
  return upsertProfile({
    ...profile,
    installedPlugins,
    activePluginCount,
    updatedAt: new Date().toISOString(),
  });
}
