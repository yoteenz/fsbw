import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import type { ReferenceQualityEvaluation, ReferenceQualityStatus, ViewportClass } from './types';

const REFERENCE_SEARCH_DIRS = [
  'public/design-references',
  'public/studio-world/references',
  'docs/frontal-slayer/design-dna-canon',
  'docs/site00/references',
  'motherboard/golden-prompts',
];

const VIEWPORT_HINTS: Record<ViewportClass, RegExp[]> = {
  MOBILE: [/mobile/i, /390/i, /iphone/i, /m\./],
  TABLET: [/tablet/i, /834/i, /ipad/i, /t\./],
  DESKTOP: [/desktop/i, /1440/i, /1920/i, /wide/i, /d\./],
};

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);

export type DiscoveredReference = {
  referenceId: string;
  path: string;
  projectHint?: string;
  routeHint?: string;
  viewportClass?: ViewportClass;
  width?: number;
  height?: number;
  source: 'filesystem' | 'supabase-metadata' | 'design-dna-canon';
};

function inferViewportFromPath(path: string): ViewportClass | undefined {
  for (const [vp, patterns] of Object.entries(VIEWPORT_HINTS) as [ViewportClass, RegExp[]][]) {
    if (patterns.some((p) => p.test(path))) return vp;
  }
  return undefined;
}

function inferProjectFromPath(path: string): string | undefined {
  if (/frontal|fs|slayer|noir|commerce/i.test(path)) return 'frontal-slayer';
  if (/ndxbook|ai-media|newsroom/i.test(path)) return 'ndxbook';
  if (/aio|all-in-one|office/i.test(path)) return 'all-in-one-enterprise';
  if (/site00|site-00|bluprint|bldr|idnty|evolve/i.test(path)) return 'site00';
  return undefined;
}

function walkImages(dir: string, repoRoot: string, maxDepth = 4, depth = 0): DiscoveredReference[] {
  if (depth > maxDepth || !existsSync(dir)) return [];
  const refs: DiscoveredReference[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }
  for (const name of entries) {
    const abs = join(dir, name);
    let st;
    try {
      st = statSync(abs);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      refs.push(...walkImages(abs, repoRoot, maxDepth, depth + 1));
    } else if (IMAGE_EXT.has(extname(name).toLowerCase())) {
      const rel = abs.replace(repoRoot + '/', '').replace(repoRoot + '\\', '');
      refs.push({
        referenceId: `ref:${rel}`,
        path: rel,
        projectHint: inferProjectFromPath(rel),
        viewportClass: inferViewportFromPath(rel),
        source: 'filesystem',
      });
    }
  }
  return refs;
}

export function discoverFilesystemReferences(repoRoot: string): DiscoveredReference[] {
  const all: DiscoveredReference[] = [];
  for (const dir of REFERENCE_SEARCH_DIRS) {
    all.push(...walkImages(join(repoRoot, dir), repoRoot));
  }
  return all;
}

/** Scan design-dna-canon store seed for route → reference mappings */
export function discoverDesignDnaCanonReferences(repoRoot: string): DiscoveredReference[] {
  const seedPath = join(repoRoot, 'src/studio-os-core/design-dna-canon/store.ts');
  if (!existsSync(seedPath)) return [];
  const content = readFileSync(seedPath, 'utf8');
  const refs: DiscoveredReference[] = [];
  const routeRe = /route:\s*['"]([^'"]+)['"]/g;
  let m: RegExpExecArray | null;
  while ((m = routeRe.exec(content))) {
    refs.push({
      referenceId: `canon:${m[1]}`,
      path: `design-dna-canon:${m[1]}`,
      routeHint: m[1],
      projectHint: 'frontal-slayer',
      source: 'design-dna-canon',
    });
  }
  return refs;
}

export function matchReferenceToRoute(
  refs: DiscoveredReference[],
  projectId: string,
  route: string,
  viewport: ViewportClass,
): DiscoveredReference | undefined {
  const slug = route.split('/').filter(Boolean).pop() ?? '';
  return refs.find((r) => {
    if (r.projectHint && r.projectHint !== projectId) return false;
    if (r.viewportClass && r.viewportClass !== viewport) return false;
    if (r.routeHint && route.startsWith(r.routeHint)) return true;
    if (r.path.toLowerCase().includes(slug.toLowerCase()) && slug.length > 2) return true;
    return false;
  });
}

export function evaluateReferenceQuality(
  ref: DiscoveredReference | undefined,
  route: string,
  viewport: ViewportClass,
): ReferenceQualityEvaluation {
  if (!ref) {
    return {
      referenceId: 'none',
      routeId: route,
      viewportClass: viewport,
      status: 'INCOMPLETE',
      reasons: ['No reference discovered for route and viewport'],
    };
  }

  const reasons: string[] = [];
  let status: ReferenceQualityStatus = 'USABLE';

  if (ref.path.includes('draft') || ref.path.includes('wip')) {
    status = 'PARTIAL';
    reasons.push('Reference path suggests draft/WIP');
  }
  if (ref.path.includes('legacy') || ref.path.includes('old-')) {
    status = 'OUTDATED';
    reasons.push('Reference path suggests legacy shell');
  }
  if (ref.viewportClass && ref.viewportClass !== viewport) {
    status = 'WRONG_VIEWPORT';
    reasons.push(`Reference tagged for ${ref.viewportClass} used as ${viewport}`);
  }
  if (ref.path.includes('thumb') || ref.path.includes('low-res')) {
    status = 'LOW_RESOLUTION';
    reasons.push('Low resolution indicator in path');
  }
  if (status === 'USABLE' && ref.source === 'design-dna-canon') {
    status = 'CANONICAL_GOOD';
    reasons.push('Design DNA canon protected reference');
  }

  return {
    referenceId: ref.referenceId,
    routeId: route,
    viewportClass: viewport,
    status,
    reasons,
  };
}

/** Placeholder for Supabase asset metadata — reads local registry if present */
export function discoverSupabaseReferenceMetadata(repoRoot: string): DiscoveredReference[] {
  const registryPath = join(repoRoot, 'public/studio-world/asset-reference-registry.json');
  if (!existsSync(registryPath)) return [];
  try {
    const data = JSON.parse(readFileSync(registryPath, 'utf8')) as {
      assets?: Array<{ id: string; path: string; projectId?: string; route?: string; viewport?: ViewportClass }>;
    };
    return (data.assets ?? []).map((a) => ({
      referenceId: a.id,
      path: a.path,
      projectHint: a.projectId,
      routeHint: a.route,
      viewportClass: a.viewport,
      source: 'supabase-metadata' as const,
    }));
  } catch {
    return [];
  }
}

export function discoverAllReferences(repoRoot: string): DiscoveredReference[] {
  return [
    ...discoverFilesystemReferences(repoRoot),
    ...discoverDesignDnaCanonReferences(repoRoot),
    ...discoverSupabaseReferenceMetadata(repoRoot),
  ];
}
