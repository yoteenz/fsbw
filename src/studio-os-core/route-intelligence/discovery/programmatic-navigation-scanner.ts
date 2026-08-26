import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import type { RouteEntryEvidence } from '../types';

const CODE_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs']);

const NAV_PATTERNS: Array<{ type: RouteEntryEvidence['type']; re: RegExp }> = [
  { type: 'NAVIGATE_CALL', re: /navigate\s*\(\s*['"`]([^'"`$]+)['"`]/g },
  { type: 'NAVIGATE_CALL', re: /navigate\s*\(\s*`([^`$]+)`/g },
  { type: 'ROUTER_PUSH', re: /(?:router|history)\.push\s*\(\s*['"`]([^'"`$]+)['"`]/g },
  { type: 'LOCATION_ASSIGNMENT', re: /(?:window\.)?location\.(?:href|assign)\s*=\s*['"`]([^'"`$]+)['"`]/g },
  { type: 'CTA_HANDLER', re: /(?:to|href)\s*[:=]\s*['"`](\/[^'"`$]+)['"`]/g },
  { type: 'STATIC_LINK', re: /<Link[^>]+to\s*=\s*['"{]([^"'{}$]+)['"}]/g },
  { type: 'STATIC_LINK', re: /<Navigate[^>]+to\s*=\s*['"{]([^"'{}$]+)['"}]/g },
  { type: 'PRODUCT_CARD_ROUTE', re: /(?:path|route|href)\s*:\s*['"`](\/(?:straight|wavy|curly|shop|build-a-wig)[^'"`]*)['"`]/g },
  { type: 'WORKFLOW_TRANSITION', re: /(?:nextStep|goToStep|stepRoute)\s*[:=]\s*['"`](\/[^'"`]+)['"`]/g },
  { type: 'AUTH_REDIRECT', re: /(?:redirect|returnUrl|redirectTo)\s*[:=]\s*['"`](\/[^'"`]+)['"`]/g },
  { type: 'NOTIFICATION_LINK', re: /(?:notification|alert).*?(?:path|route|href)\s*[:=]\s*['"`](\/[^'"`]+)['"`]/gi },
  { type: 'DEEP_LINK_REGISTRY', re: /path:\s*['"`](\/[^'"`]+)['"`]/g },
];

function normalizeTarget(raw: string): string | null {
  const t = raw.trim().split('?')[0]!.split('#')[0]!;
  if (!t.startsWith('/')) return null;
  if (t.startsWith('//')) return null;
  if (t.includes('${')) return null;
  return t.length > 1 && t.endsWith('/') ? t.slice(0, -1) : t || '/';
}

function toPattern(route: string): string {
  return route.replace(/:[^/]+/g, ':param');
}

function walkCodeFiles(dir: string, maxDepth = 6, depth = 0): string[] {
  if (depth > maxDepth || !existsSync(dir)) return [];
  const files: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name.startsWith('.')) continue;
    const abs = join(dir, name);
    let st;
    try {
      st = statSync(abs);
    } catch {
      continue;
    }
    if (st.isDirectory()) files.push(...walkCodeFiles(abs, maxDepth, depth + 1));
    else if (CODE_EXT.has(extname(name))) files.push(abs);
  }
  return files;
}

export type ProgrammaticNavScanResult = {
  targetsByPattern: Map<string, RouteEntryEvidence[]>;
  allTargets: RouteEntryEvidence[];
};

export function scanProgrammaticNavigation(repoRoot: string, projectId: string): ProgrammaticNavScanResult {
  const scanRoots: Record<string, string[]> = {
    'frontal-slayer': [
      join(repoRoot, 'src/pages'),
      join(repoRoot, 'src/components'),
      join(repoRoot, 'e2e'),
      join(repoRoot, 'scripts/launch-integrity-auditor'),
    ],
    ndxbook: [join(repoRoot, 'src/pages/admin/studio'), join(repoRoot, 'src/components/admin/studio')],
    site00: [join(repoRoot, 'src/site00'), join(repoRoot, 'src/routes')],
    'all-in-one-enterprise': [join(repoRoot, 'all-in-one-enterprises/src')],
  };

  const roots = scanRoots[projectId] ?? [join(repoRoot, 'src')];
  const targetsByPattern = new Map<string, RouteEntryEvidence[]>();
  const allTargets: RouteEntryEvidence[] = [];

  for (const root of roots) {
    if (!existsSync(root)) continue;
    for (const file of walkCodeFiles(root, projectId === 'frontal-slayer' ? 8 : 6)) {
      const rel = file.replace(repoRoot + '/', '').replace(repoRoot + '\\', '');
      let content: string;
      try {
        content = readFileSync(file, 'utf8');
      } catch {
        continue;
      }
      for (const { type, re } of NAV_PATTERNS) {
        const pattern = new RegExp(re.source, re.flags);
        let m: RegExpExecArray | null;
        while ((m = pattern.exec(content))) {
          const target = normalizeTarget(m[1]!);
          if (!target) continue;
          const line = content.slice(0, m.index).split('\n').length;
          const evidence: RouteEntryEvidence = { type, file: rel, line, targetRoute: target, detail: m[0].slice(0, 80) };
          allTargets.push(evidence);
          const key = toPattern(target);
          const list = targetsByPattern.get(key) ?? [];
          list.push(evidence);
          targetsByPattern.set(key, list);
        }
      }
    }
  }

  return { targetsByPattern, allTargets };
}

export function patternMatchesRoute(pattern: string, routePattern: string): boolean {
  if (pattern === routePattern) return true;
  const pParts = pattern.split('/').filter(Boolean);
  const rParts = routePattern.split('/').filter(Boolean);
  if (pParts.length !== rParts.length) return false;
  return pParts.every((p, i) => p === rParts[i] || p === ':param' || rParts[i] === ':param');
}

export function findEntryEvidenceForRoute(
  routePattern: string,
  navPatterns: Set<string>,
  programmatic: ProgrammaticNavScanResult,
  redirectTargets: Map<string, string>,
): RouteEntryEvidence[] {
  const evidence: RouteEntryEvidence[] = [];

  if (navPatterns.has(routePattern)) {
    evidence.push({ type: 'STATIC_LINK', detail: 'static navigation scan' });
  }

  const prog = programmatic.targetsByPattern.get(routePattern);
  if (prog) evidence.push(...prog);

  for (const [from, to] of redirectTargets) {
    if (toPattern(to) === routePattern || from === routePattern) {
      evidence.push({ type: 'REDIRECT_TARGET', detail: `${from} → ${to}`, targetRoute: to });
    }
  }

  for (const [pat, evs] of programmatic.targetsByPattern) {
    if (pat !== routePattern && patternMatchesRoute(pat, routePattern)) {
      evidence.push(...evs.map((e) => ({ ...e, type: 'DYNAMIC_SLUG_GENERATOR' as const })));
    }
  }

  return evidence;
}
