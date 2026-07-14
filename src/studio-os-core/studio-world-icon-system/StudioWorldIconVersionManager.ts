import type { StudioWorldIconDefinition, StudioWorldIconVersionLabel } from './StudioWorldIconDefinition';

const VERSION_PRIORITY: Record<StudioWorldIconVersionLabel, number> = {
  certified: 100,
  v3: 80,
  v2: 70,
  v1: 60,
  experimental: 40,
  legacy: 20,
  deprecated: 10,
  future: 5,
};

export function compareIconVersions(a: StudioWorldIconVersionLabel, b: StudioWorldIconVersionLabel): number {
  return (VERSION_PRIORITY[b] ?? 0) - (VERSION_PRIORITY[a] ?? 0);
}

/** Runtime resolves newest certified version among candidates. */
export function resolveNewestCertifiedIcon(
  candidates: StudioWorldIconDefinition[]
): StudioWorldIconDefinition | null {
  const certified = candidates.filter(
    (c) => c.certification === 'certified' || c.certification === 'production'
  );
  if (certified.length === 0) return candidates[0] ?? null;
  return [...certified].sort((a, b) => compareIconVersions(a.version, b.version))[0] ?? null;
}

export function isIconVersionDeprecated(icon: StudioWorldIconDefinition): boolean {
  return icon.version === 'deprecated' || icon.metadata.deprecated || icon.status === 'deprecated';
}
