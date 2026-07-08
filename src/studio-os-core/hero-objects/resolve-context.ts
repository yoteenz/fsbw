import { getCurrentWorldLocation } from '../studio-world/navigation';
import {
  DEFAULT_ORB_CONTEXT_ID,
  ORB_CONTEXT_REGISTRY,
  type OrbContextDefinition,
} from './context-registry';

export type OrbContextResolutionInput = {
  pathname: string;
  activeDepartment?: string | null;
};

export type OrbContextResolution = {
  contextId: string;
  contextLabel: string;
  context: OrbContextDefinition;
  matchSource: 'path-pattern' | 'flagship' | 'department' | 'default';
};

const DEPARTMENT_TO_CONTEXT: Record<string, string> = {
  marketing: 'marketing',
  finance: 'finance',
  operations: 'operations',
  product: 'product',
  'customer-experience': 'customer-experience',
  legal: 'legal',
  intelligence: 'intelligence',
  'creative-direction': 'creative-direction',
};

function resolveByDepartment(department: string | null | undefined): OrbContextDefinition | null {
  if (!department) return null;
  const contextId = DEPARTMENT_TO_CONTEXT[department];
  if (!contextId) return null;
  return ORB_CONTEXT_REGISTRY.find((c) => c.contextId === contextId) ?? null;
}

function normalizePath(path: string): string {
  const clean = path.split('?')[0]!.replace(/\/$/, '') || '/';
  return clean.toLowerCase();
}

function scorePathMatch(pathname: string, pattern: string): number {
  const path = normalizePath(pathname);
  const normalizedPattern = normalizePath(pattern.startsWith('/') ? pattern : `/${pattern}`);
  if (path === normalizedPattern) return normalizedPattern.length + 1000;
  if (path.includes(normalizedPattern)) return normalizedPattern.length;
  const slug = normalizedPattern.replace(/^\/admin\/studio\//, '').replace(/^\/admin\//, '');
  if (slug && path.includes(slug)) return slug.length;
  return 0;
}

function resolveByPathPatterns(pathname: string): OrbContextDefinition | null {
  let best: OrbContextDefinition | null = null;
  let bestScore = 0;

  for (const context of ORB_CONTEXT_REGISTRY) {
    for (const pattern of context.pathPatterns) {
      const score = scorePathMatch(pathname, pattern);
      if (score > bestScore) {
        bestScore = score;
        best = context;
      }
    }
  }

  return bestScore > 0 ? best : null;
}

function resolveByFlagship(pathname: string): OrbContextDefinition | null {
  const location = getCurrentWorldLocation(pathname);
  if (!location) return null;

  const matches = ORB_CONTEXT_REGISTRY.filter((context) =>
    context.flagshipIds?.includes(location.flagshipId)
  );

  if (matches.length === 0) return null;

  if (location.flagshipId === 'headquarters') {
    return matches.find((m) => m.contextId === 'operations') ?? matches[0] ?? null;
  }

  return matches[0] ?? null;
}

/**
 * Resolve the Contextual Orb™ department from the founder's current route.
 * Data-driven — Orb UI must not embed department logic.
 */
export function resolveOrbContextFromLocation(input: OrbContextResolutionInput): OrbContextResolution {
  const pathname = input.pathname;

  const byPath = resolveByPathPatterns(pathname);
  if (byPath) {
    return {
      contextId: byPath.contextId,
      contextLabel: byPath.contextLabel,
      context: byPath,
      matchSource: 'path-pattern',
    };
  }

  const byDepartment = resolveByDepartment(input.activeDepartment);
  if (byDepartment) {
    return {
      contextId: byDepartment.contextId,
      contextLabel: byDepartment.contextLabel,
      context: byDepartment,
      matchSource: 'department',
    };
  }

  const byFlagship = resolveByFlagship(pathname);
  if (byFlagship) {
    return {
      contextId: byFlagship.contextId,
      contextLabel: byFlagship.contextLabel,
      context: byFlagship,
      matchSource: 'flagship',
    };
  }

  const fallback = ORB_CONTEXT_REGISTRY.find((c) => c.contextId === DEFAULT_ORB_CONTEXT_ID)!;
  return {
    contextId: fallback.contextId,
    contextLabel: fallback.contextLabel,
    context: fallback,
    matchSource: 'default',
  };
}

export function registerOrbContext(context: OrbContextDefinition): void {
  const existing = ORB_CONTEXT_REGISTRY.findIndex((c) => c.contextId === context.contextId);
  if (existing >= 0) {
    ORB_CONTEXT_REGISTRY[existing] = context;
  } else {
    ORB_CONTEXT_REGISTRY.push(context);
  }
}
