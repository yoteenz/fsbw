import type { DepartmentPackage } from '../department-package';
import type { ProjectGenomeRecord } from '../project-genome';

export function resolveDepartmentOrbGreeting(
  pkg: DepartmentPackage,
  project: ProjectGenomeRecord
): { greeting: string; guidance: string } {
  return {
    greeting: `Welcome to ${pkg.definition.displayName}. ${project.name} is open.`,
    guidance: `${pkg.definition.identity.metaphor} — ${project.northStar}`,
  };
}

export function resolveDepartmentOrbAmbientInsight(
  pkg: DepartmentPackage,
  activeZoneId: string | null
): string | null {
  if (!activeZoneId) return 'Walk the room — Mood Wall, Founder Notes, and production await.';
  const zone = pkg.definition.spatial.zones.find((z) => z.id === activeZoneId);
  if (!zone) return null;
  if (zone.type === 'hero') return 'Drop inspiration on the Mood Wall — I will analyze and suggest direction.';
  if (zone.type === 'orb') return 'Ask me anything about creative direction or press Generate Environment when ready.';
  if (zone.id.includes('founder')) return 'Pin a decision here — it travels with the project genome.';
  return `You are at ${zone.displayName}. Explore or return to center.`;
}
