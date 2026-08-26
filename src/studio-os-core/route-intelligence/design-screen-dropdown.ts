import type { DesignScreenRecord } from './types';

/** Browser-safe — no Node fs imports */
export function groupDesignScreensForDropdown(
  screens: DesignScreenRecord[],
  projectId: string,
): Record<string, DesignScreenRecord[]> {
  const projectScreens = screens.filter((s) => s.projectId === projectId);
  const groups: Record<string, DesignScreenRecord[]> = {};
  for (const s of projectScreens) {
    const list = groups[s.routeFamily] ?? [];
    list.push(s);
    groups[s.routeFamily] = list;
  }
  for (const key of Object.keys(groups)) {
    groups[key]!.sort((a, b) => a.displayName.localeCompare(b.displayName));
  }
  return groups;
}
