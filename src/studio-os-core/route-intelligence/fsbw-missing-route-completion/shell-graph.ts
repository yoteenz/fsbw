import type {
  DesignFamilyRecord,
  ExperiencePageRecord,
  MaterialScreenRecord,
  SharedShellDependencyGraph,
  SharedShellRecord,
  StudioWorldDesignRouteManifest,
} from '../types';

function shellVersion(shellAuthority: string, version = 1): string {
  return `${shellAuthority.toLowerCase().replace(/\s+/g, '-')}-shell@v${version}`;
}

export function buildSharedShellDependencyGraph(
  projectId: string,
  manifest: StudioWorldDesignRouteManifest,
): SharedShellDependencyGraph {
  const families = (manifest.designFamilies ?? []).filter((f) => f.projectId === projectId);
  const pageSet = manifest.projectPageSets?.find((p) => p.projectId === projectId);
  const pages = pageSet?.experiencePages ?? [];
  const materials = pageSet?.materialScreens ?? [];

  const shellMap = new Map<string, SharedShellRecord>();

  for (const family of families) {
    if (!family.shellAuthority) continue;
    const shellId = `${projectId}:shell:${family.shellAuthority}`;
    const existing = shellMap.get(shellId) ?? {
      shellId,
      projectId,
      displayName: family.shellAuthority,
      componentPaths: [`src/components/shells/${family.shellAuthority}.tsx`],
      consumerPageIds: [],
      consumerFamilyIds: [],
      responsiveAuthority: family.layoutAuthority ?? family.shellAuthority,
      version: shellVersion(family.shellAuthority),
    };
    if (!existing.consumerFamilyIds.includes(family.designFamilyId)) {
      existing.consumerFamilyIds.push(family.designFamilyId);
    }
    shellMap.set(shellId, existing);
  }

  for (const page of pages) {
    for (const familyId of page.designFamilyIds) {
      const family = families.find((f) => f.designFamilyId === familyId);
      if (!family?.shellAuthority) continue;
      const shellId = `${projectId}:shell:${family.shellAuthority}`;
      const shell = shellMap.get(shellId);
      if (shell && !shell.consumerPageIds.includes(page.experiencePageId)) {
        shell.consumerPageIds.push(page.experiencePageId);
      }
    }
  }

  const edges: SharedShellDependencyGraph['edges'] = [];
  for (const [shellId, shell] of shellMap) {
    for (const componentPath of shell.componentPaths) {
      for (const familyId of shell.consumerFamilyIds) {
        edges.push({ shellId, componentPath, familyId });
      }
      for (const pageId of shell.consumerPageIds) {
        const page = pages.find((p) => p.experiencePageId === pageId);
        edges.push({
          shellId,
          componentPath,
          experiencePageId: pageId,
          route: page?.representativeRoute,
        });
      }
    }
  }

  for (const material of materials) {
    const page = pages.find((p) => p.experiencePageId === material.experiencePageId);
    if (!page) continue;
    for (const familyId of page.designFamilyIds) {
      const family = families.find((f) => f.designFamilyId === familyId);
      if (!family?.shellAuthority) continue;
      const shellId = `${projectId}:shell:${family.shellAuthority}`;
      edges.push({
        shellId,
        componentPath: `material:${material.materialScreenId}`,
        materialScreenId: material.materialScreenId,
        route: material.representativeRoute,
      });
    }
  }

  return { projectId, shells: [...shellMap.values()], edges };
}

export function findShellForFamily(
  projectId: string,
  family: DesignFamilyRecord,
  graph: SharedShellDependencyGraph,
): SharedShellRecord | undefined {
  if (!family.shellAuthority) return undefined;
  const shellId = `${projectId}:shell:${family.shellAuthority}`;
  return graph.shells.find((s) => s.shellId === shellId);
}

export function consumersForShell(shell: SharedShellRecord, pages: ExperiencePageRecord[], materials: MaterialScreenRecord[]) {
  return {
    pages: pages.filter((p) => shell.consumerPageIds.includes(p.experiencePageId)),
    materials: materials.filter((m) => shell.consumerPageIds.some((id) => pages.find((p) => p.experiencePageId === id)?.materialScreenIds.includes(m.materialScreenId))),
    families: shell.consumerFamilyIds,
  };
}

export function detectDuplicatedFamilyImplementation(
  family: DesignFamilyRecord,
  graph: SharedShellDependencyGraph,
): boolean {
  const shell = findShellForFamily(family.projectId, family, graph);
  if (!shell) return true;
  return shell.componentPaths.length === 0 || !shell.componentPaths[0]?.includes(family.shellAuthority);
}
