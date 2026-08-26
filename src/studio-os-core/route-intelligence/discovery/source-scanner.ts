import { readFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { RouteEvidence, RouteType } from '../types';

export type ScannedRoute = {
  route: string;
  routePattern: string;
  sourceFile: string;
  line?: number;
  component?: string;
  redirect?: string;
  isNavigate?: boolean;
  evidence: RouteEvidence[];
};

const NAVIGATE_TO_RE = /(?:to|href)=["'{]([^"'{}]+)["'}]/g;
const LAZY_IMPORT_RE = /lazy\s*\(\s*\(\)\s*=>\s*import\s*\(\s*['"]([^'"]+)['"]/g;

function normalizeRoute(path: string, parentPrefix = ''): string {
  let p = path.trim();
  if (!p.startsWith('/')) {
    p = `${parentPrefix.replace(/\/$/, '')}/${p}`.replace(/\/+/g, '/');
  }
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p || '/';
}

function toPattern(route: string): string {
  return route.replace(/:[^/]+/g, ':param');
}

export function inferRouteType(route: string, _sourceFile: string): RouteType {
  if (route.includes('/admin/')) return 'WORKSPACE';
  if (/\/(modal|drawer|panel|overlay)/i.test(route)) return 'MODAL';
  if (/\/(step|steps|\d{2})\b/i.test(route)) return 'STEP';
  if (route.includes(':')) return 'DETAIL';
  if (/\/(build-a-wig|checkout|assessment|provisioning)/i.test(route)) return 'FLOW';
  if (_sourceFile.includes('Navigate')) return 'INDEX';
  return 'PAGE';
}

export function scanRouteFile(
  absolutePath: string,
  repoRoot: string,
  options: { prefix?: string; defaultProjectPrefix?: string } = {},
): ScannedRoute[] {
  if (!existsSync(absolutePath)) return [];
  const content = readFileSync(absolutePath, 'utf8');
  const rel = relative(repoRoot, absolutePath);
  const routes: ScannedRoute[] = [];
  const lazyMap = new Map<number, string>();

  let lazyMatch: RegExpExecArray | null;
  const lazyRe = new RegExp(LAZY_IMPORT_RE.source, 'g');
  while ((lazyMatch = lazyRe.exec(content))) {
    lazyMap.set(lazyMatch.index, lazyMatch[1]!);
  }

  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const lineRe = /path=["'{]([^"'}]+)["'}]/g;
    let m: RegExpExecArray | null;
    while ((m = lineRe.exec(line))) {
      const raw = m[1]!;
      const full = normalizeRoute(raw, options.prefix ?? options.defaultProjectPrefix ?? '');
      routes.push({
        route: full,
        routePattern: toPattern(full),
        sourceFile: rel,
        line: i + 1,
        evidence: [{ source: 'router', file: rel, line: i + 1, detail: raw }],
      });
    }

    const navRe = /<Navigate\s+[^>]*to=["'{]([^"'}]+)["'}]/g;
    while ((m = navRe.exec(line))) {
      const target = m[1]!;
      if (target.startsWith('http')) continue;
      routes.push({
        route: normalizeRoute(target),
        routePattern: toPattern(normalizeRoute(target)),
        sourceFile: rel,
        line: i + 1,
        redirect: target,
        isNavigate: true,
        evidence: [{ source: 'redirect', file: rel, line: i + 1, detail: target }],
      });
    }
  }

  return dedupeScannedRoutes(routes);
}

export function scanNavigationLinks(content: string, _sourceFile: string): string[] {
  const targets = new Set<string>();
  const re = new RegExp(NAVIGATE_TO_RE.source, 'g');
  let m: RegExpExecArray | null;
  while ((m = re.exec(content))) {
    const t = m[1]!.trim();
    if (t.startsWith('/') && !t.startsWith('//') && !t.includes('${')) {
      targets.add(normalizeRoute(t.split('?')[0]!));
    }
  }
  return [...targets];
}

export function scanRouteConstants(
  content: string,
  sourceFile: string,
  prefix = '',
): ScannedRoute[] {
  const routes: ScannedRoute[] = [];
  const constRe = /['"`](\/[^'"`]+)['"`]/g;
  let m: RegExpExecArray | null;
  while ((m = constRe.exec(content))) {
    const raw = m[1]!;
    if (!raw.startsWith('/')) continue;
    if (raw.includes('*')) continue;
    const full = normalizeRoute(raw, prefix);
    routes.push({
      route: full,
      routePattern: toPattern(full),
      sourceFile,
      evidence: [{ source: 'route-constant', file: sourceFile, detail: raw }],
    });
  }
  return dedupeScannedRoutes(routes);
}

export function dedupeScannedRoutes(routes: ScannedRoute[]): ScannedRoute[] {
  const map = new Map<string, ScannedRoute>();
  for (const r of routes) {
    const key = r.routePattern;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, r);
    } else {
      existing.evidence.push(...r.evidence);
      if (r.redirect) existing.redirect = r.redirect;
    }
  }
  return [...map.values()];
}

export function readRepoFile(repoRoot: string, relPath: string): string {
  const abs = join(repoRoot, relPath);
  if (!existsSync(abs)) return '';
  return readFileSync(abs, 'utf8');
}

export function scanMultipleFiles(
  repoRoot: string,
  relPaths: string[],
  options?: { prefix?: string },
): ScannedRoute[] {
  const all: ScannedRoute[] = [];
  for (const rel of relPaths) {
    all.push(...scanRouteFile(join(repoRoot, rel), repoRoot, options));
  }
  return dedupeScannedRoutes(all);
}
