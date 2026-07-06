import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { SYSTEM_DISCOVERY_SURFACES } from './constants';
import { buildDependencyGraph, summarizeDependencyGraph } from './dependency-graph';
import { getAllRegisteredSystems, validateSystemEntry } from './registration';
import type { OrganizationSystemRegistryProfile, SystemRegistryHealthMetric } from './types';

export function buildDockRegistryLine(profile: OrganizationSystemRegistryProfile): string {
  return `System Registry™ ${profile.registryScore}% — ${profile.totalSystems} systems indexed · ${Object.keys(profile.categoryCounts).length} categories · ${summarizeDependencyGraph().split('·')[2]?.trim() ?? 'connected'}.`;
}

function computeHealthMetrics(systems: ReturnType<typeof getAllRegisteredSystems>): SystemRegistryHealthMetric[] {
  const total = systems.length;
  const withDocs = systems.filter((s) => s.documentation.length > 0).length;
  const withDeps = systems.filter((s) => s.dependencies.length > 0).length;
  const broken = systems.filter((s) => validateSystemEntry(s).length > 0).length;
  const live = systems.filter((s) => s.status === 'live').length;

  return [
    {
      id: 'indexed',
      label: 'Systems Indexed',
      scorePct: Math.min(99, Math.round((total / 200) * 100)),
      detail: `${total} objects registered in master directory`,
      status: total >= 100 ? 'healthy' : 'warning',
    },
    {
      id: 'documentation',
      label: 'Documentation Linked',
      scorePct: Math.round((withDocs / Math.max(1, total)) * 100),
      detail: `${withDocs}/${total} systems link documentation`,
      status: withDocs >= total * 0.85 ? 'healthy' : 'warning',
    },
    {
      id: 'dependencies',
      label: 'Dependency Graph',
      scorePct: Math.round((withDeps / Math.max(1, total)) * 100),
      detail: `${withDeps}/${total} systems declare dependencies`,
      status: 'healthy',
    },
    {
      id: 'integrity',
      label: 'Registry Integrity',
      scorePct: Math.max(0, 100 - broken * 10),
      detail: broken === 0 ? 'No broken references' : `${broken} entries need validation`,
      status: broken === 0 ? 'healthy' : 'warning',
    },
    {
      id: 'live',
      label: 'Live Systems',
      scorePct: Math.round((live / Math.max(1, total)) * 100),
      detail: `${live} live · ${systems.filter((s) => s.status === 'planned').length} planned`,
      status: 'healthy',
    },
  ];
}

export function buildOrganizationSystemRegistryProfile(organizationId: string): OrganizationSystemRegistryProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();
  const systems = getAllRegisteredSystems();
  const categoryCounts: Record<string, number> = {};

  for (const s of systems) {
    categoryCounts[s.category] = (categoryCounts[s.category] ?? 0) + 1;
  }

  const healthMetrics = computeHealthMetrics(systems);
  const registryScore = Math.min(
    99,
    Math.round(healthMetrics.reduce((sum, m) => sum + m.scorePct, 0) / healthMetrics.length)
  );

  const profile: OrganizationSystemRegistryProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    registryScore,
    totalSystems: systems.length,
    categoryCounts,
    systems,
    dependencyNodes: buildDependencyGraph(),
    healthMetrics,
    discoverySurfaces: SYSTEM_DISCOVERY_SURFACES.map((surface) => ({
      surface,
      synced: true,
      systemCount: systems.length,
    })),
    dockRegistryLine: '',
    lastIndexedAt: now,
  };

  profile.dockRegistryLine = buildDockRegistryLine(profile);
  return profile;
}

export function summarizeSystemRegistry(profile: OrganizationSystemRegistryProfile): string {
  const topCategories = Object.entries(profile.categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([cat, n]) => `${cat}:${n}`)
    .join(' · ');
  return `${profile.dockRegistryLine} Categories: ${topCategories}.`;
}
