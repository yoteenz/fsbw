import { MARKETPLACE_TIERS } from './constants';
import type { InstalledPluginEntry, MarketplaceTier, MarketplaceTierEntry } from './types';

const TIER_META: Record<
  MarketplaceTier,
  { label: string; description: string; pluginCount: number; installable: boolean }
> = {
  'verified-plugins': {
    label: 'Verified Plugins',
    description: 'Security-reviewed and compatibility-tested by Studio OS.',
    pluginCount: 8,
    installable: true,
  },
  'official-plugins': {
    label: 'Official Plugins',
    description: 'Built and maintained by Studio OS — guaranteed sync chain support.',
    pluginCount: 14,
    installable: true,
  },
  'community-plugins': {
    label: 'Community Plugins',
    description: 'Shared by the ecosystem with attribution and reputation scoring.',
    pluginCount: 22,
    installable: true,
  },
  'paid-plugins': {
    label: 'Paid Plugins',
    description: 'Premium extensions with licensing and revenue sharing.',
    pluginCount: 6,
    installable: true,
  },
  'free-plugins': {
    label: 'Free Plugins',
    description: 'No-cost extensions organizations can install immediately.',
    pluginCount: 18,
    installable: true,
  },
  'internal-organization-plugins': {
    label: 'Internal Organization Plugins',
    description: 'Private plugins built by the organization — never shared externally.',
    pluginCount: 3,
    installable: true,
  },
};

export function buildMarketplaceTiers(): MarketplaceTierEntry[] {
  return MARKETPLACE_TIERS.map((tier) => ({
    tier,
    ...TIER_META[tier],
  }));
}

export function buildInstalledPlugins(organizationId: string): InstalledPluginEntry[] {
  const suffix = organizationId.slice(0, 4).toUpperCase();
  return [
    {
      pluginId: 'contractor-pack',
      name: 'Contractor Pack',
      typeId: 'department-packs',
      tier: 'official-plugins',
      version: '1.2.0',
      status: 'active',
      sandboxed: true,
      organizationScoped: true,
    },
    {
      pluginId: 'marketing-dashboard-widget',
      name: 'Marketing Dashboard Widget',
      typeId: 'dashboard-widgets',
      tier: 'verified-plugins',
      version: '2.0.1',
      status: 'update-available',
      sandboxed: true,
      organizationScoped: true,
    },
    {
      pluginId: 'weekly-briefing-skill',
      name: 'Weekly Briefing Skill',
      typeId: 'command-dock-skills',
      tier: 'internal-organization-plugins',
      version: '1.0.0',
      status: 'active',
      sandboxed: true,
      organizationScoped: true,
    },
    {
      pluginId: `org-custom-${suffix}`,
      name: `${suffix} Custom Integration`,
      typeId: 'integrations',
      tier: 'internal-organization-plugins',
      version: '0.9.4',
      status: 'active',
      sandboxed: true,
      organizationScoped: true,
    },
  ];
}

export function countPluginsRequiringUpdate(plugins: InstalledPluginEntry[]): number {
  return plugins.filter((p) => p.status === 'update-available').length;
}

export function findPluginByName(plugins: InstalledPluginEntry[], name: string): InstalledPluginEntry | undefined {
  const q = name.trim().toLowerCase();
  return plugins.find((p) => p.name.toLowerCase().includes(q) || p.pluginId.includes(q));
}

export function listUpdateablePlugins(plugins: InstalledPluginEntry[]): string[] {
  return plugins.filter((p) => p.status === 'update-available').map((p) => p.name);
}
