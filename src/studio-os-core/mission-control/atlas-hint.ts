/**
 * Mission Control™ — Global Atlas Layer hint line.
 */

export function formatAtlasMissionControlLine(pathname: string): string | null {
  const p = pathname.toLowerCase();
  if (p.includes('world-atlas')) {
    return 'Mission Control™ active — civilization assembling on the Atlas Table™';
  }
  if (p.includes('command-center') || p.includes('/studio/overview')) {
    return 'Mission Control™ — open World Atlas™ to activate the nervous system';
  }
  return 'Mission Control™ — the world is the interface';
}
