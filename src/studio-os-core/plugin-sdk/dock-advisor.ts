import { explainPluginType, explainSdkCapability, queryPluginSdk } from './discovery-engine';
import { summarizePluginSdk } from './engine-profile-builder';
import { findPluginByName, listUpdateablePlugins } from './marketplace-engine';
import { isPluginSandboxHealthy } from './sandbox-engine';
import {
  ensureOrganizationPluginSdkProfile,
  getOrganizationPluginSdkProfile,
  setPluginDisabled,
} from './store';
import type { PluginSdkDockAdvice } from './types';

export function resolvePluginSdkAdvice(input: string, organizationId: string): PluginSdkDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationPluginSdkProfile(organizationId) ?? ensureOrganizationPluginSdkProfile(organizationId);

  if (/plugin sdk|extensible platform|plugin platform|studio os platform/i.test(trimmed)) {
    return {
      response: summarizePluginSdk(profile),
      concierge: 'Chief Concierge',
      platformScore: profile.platformScore,
    };
  }

  if (/install.*contractor pack|contractor pack/i.test(trimmed)) {
    const plugin = findPluginByName(profile.installedPlugins, 'contractor');
    return {
      response: plugin
        ? `${plugin.name} v${plugin.version} is ${plugin.status} — sandboxed and org-scoped. Install from Official Plugins marketplace tier.`
        : 'Contractor Pack available in Official Plugins — install from Plugin SDK marketplace.',
      concierge: 'Chief Concierge',
    };
  }

  if (/update.*marketing plugin|marketing plugin|update the marketing/i.test(trimmed)) {
    const updates = listUpdateablePlugins(profile.installedPlugins);
    return {
      response:
        updates.length === 0
          ? 'All installed plugins are current.'
          : `Update available: ${updates.join(' · ')} — review compatibility before applying.`,
      concierge: 'Chief Concierge',
      platformScore: profile.platformScore,
    };
  }

  if (/disable.*plugin|disable this plugin/i.test(trimmed)) {
    const match = trimmed.match(/disable\s+(?:the\s+)?(.+?)\s+plugin/i);
    const target = match?.[1]?.trim();
    if (target) {
      const plugin = findPluginByName(profile.installedPlugins, target);
      if (plugin) {
        setPluginDisabled(organizationId, plugin.pluginId, true);
        return {
          response: `${plugin.name} disabled — sandbox preserved, capabilities revoked via Permission Engine™.`,
          concierge: 'Chief Concierge',
        };
      }
    }
    return {
      response: 'Specify plugin name to disable — e.g. "Disable the Marketing Plugin."',
      concierge: 'Chief Concierge',
    };
  }

  if (/plugin compatibility|compatibility|show compatibility/i.test(trimmed)) {
    const types = profile.pluginTypes.filter((t) => t.status === 'available').slice(0, 4).map((t) => t.name);
    return {
      response: `Plugin SDK supports ${profile.pluginTypes.length} types · sandbox ${profile.sandboxScorePct}%. Compatible: ${types.join(' · ')}…`,
      concierge: 'Chief Concierge',
      platformScore: profile.platformScore,
    };
  }

  if (/marketplace|verified plugins|official plugins|community plugins/i.test(trimmed)) {
    const tiers = profile.marketplaceTiers.slice(0, 4).map((t) => `${t.label} (${t.pluginCount})`);
    return {
      response: `Marketplace tiers: ${tiers.join(' · ')} — organizations choose which plugins to install.`,
      concierge: 'Chief Concierge',
    };
  }

  if (/sandbox|isolated|policy engine|permission engine/i.test(trimmed)) {
    const healthy = isPluginSandboxHealthy(organizationId);
    return {
      response: healthy
        ? `Plugin sandbox healthy (${profile.sandboxScorePct}%) — Policy Engine™ and Permission Engine™ enforced on every plugin action.`
        : 'Plugin sandbox review required — check sandbox findings in Plugin SDK.',
      concierge: 'Chief Concierge',
    };
  }

  if (/register pages|register components|register commands|sdk capabilities/i.test(trimmed)) {
    const caps = profile.sdkCapabilities.slice(0, 5).map((c) => c.label);
    return {
      response: `SDK capabilities: ${caps.join(' · ')} — every plugin becomes a first-class Studio OS citizen.`,
      concierge: 'Chief Concierge',
    };
  }

  const explainTypeMatch = trimmed.match(/explain (?:plugin type|type)\s+(.+)/i);
  if (explainTypeMatch) {
    const hits = queryPluginSdk(explainTypeMatch[1], organizationId, 1);
    if (hits[0]?.type === 'plugin-type') {
      return { response: explainPluginType(hits[0].id) ?? hits[0].label, concierge: 'Chief Concierge' };
    }
  }

  const explainCapMatch = trimmed.match(/explain (?:capability|sdk)\s+(.+)/i);
  if (explainCapMatch) {
    return {
      response: explainSdkCapability(explainCapMatch[1].trim().replace(/\s+/g, '-')) ?? 'Capability not found.',
      concierge: 'Chief Concierge',
    };
  }

  const hits = queryPluginSdk(trimmed, organizationId, 3);
  if (hits.length > 0 && /find|search|show|list|which/i.test(trimmed)) {
    return {
      response: hits.map((h) => h.label).join(' · '),
      concierge: 'Chief Concierge',
      platformScore: profile.platformScore,
    };
  }

  return null;
}

export function listPluginSdkDockSuggestions(_organizationId: string): string[] {
  return [
    'Install the Contractor Pack.',
    'Update the Marketing Plugin.',
    'Disable this plugin.',
    'Show plugin compatibility.',
  ].slice(0, 4);
}

export function buildProactivePluginSdkSuggestion(organizationId: string): string | null {
  const profile = getOrganizationPluginSdkProfile(organizationId);
  if (!profile) return null;
  return summarizePluginSdk(profile);
}

export function buildPluginSdkOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationPluginSdkProfile(organizationId);
  return profile.dockPlatformLine;
}
