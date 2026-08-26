import type {
  CurationSourceDiff,
  CurationSourceSnapshot,
  ProjectWebsitePageSet,
  StudioWorldDesignRouteManifest,
} from '../types';

function fingerprintRoutes(pageSet: ProjectWebsitePageSet): string[] {
  return pageSet.compiledPages.map((p) => `${p.representativeRoute}|${p.designScreenId}`).sort();
}

function fingerprintScreens(manifest: StudioWorldDesignRouteManifest, projectId: string): string[] {
  return (manifest.designScreens ?? [])
    .filter((s) => s.projectId === projectId)
    .map((s) => `${s.designScreenId}|${s.representativeRoute}`)
    .sort();
}

export function captureSourceSnapshot(
  manifest: StudioWorldDesignRouteManifest,
  pageSet: ProjectWebsitePageSet,
): CurationSourceSnapshot {
  return {
    projectId: pageSet.projectId,
    sourceCommit: manifest.sourceCommit,
    routeFingerprints: fingerprintRoutes(pageSet),
    screenFingerprints: fingerprintScreens(manifest, pageSet.projectId),
    capturedAt: new Date().toISOString(),
  };
}

export function diffCurationSource(
  previous: CurationSourceSnapshot | undefined,
  manifest: StudioWorldDesignRouteManifest,
  pageSet: ProjectWebsitePageSet,
): CurationSourceDiff | undefined {
  if (!previous) return undefined;

  const currentRoutes = new Set(fingerprintRoutes(pageSet));
  const prevRoutes = new Set(previous.routeFingerprints);
  const newRoutes = [...currentRoutes].filter((r) => !prevRoutes.has(r));
  const removedRoutes = [...prevRoutes].filter((r) => !currentRoutes.has(r));

  const currentScreens = new Set(fingerprintScreens(manifest, pageSet.projectId));
  const prevScreens = new Set(previous.screenFingerprints);
  const screenChanges = [...currentScreens].filter((s) => !prevScreens.has(s)).concat([...prevScreens].filter((s) => !currentScreens.has(s)));

  if (!newRoutes.length && !removedRoutes.length && !screenChanges.length) return undefined;

  return {
    projectId: pageSet.projectId,
    newRoutes,
    removedRoutes,
    screenChanges,
    familyChanges: [],
    pageCandidates: newRoutes.map((r) => r.split('|')[0] ?? r),
    materialScreenChanges: [],
    authChanges: [],
  };
}

export function shouldMarkStale(
  locked: boolean,
  diff: CurationSourceDiff | undefined,
): boolean {
  return locked && !!diff && (diff.newRoutes.length > 0 || diff.removedRoutes.length > 0 || diff.screenChanges.length > 0);
}
