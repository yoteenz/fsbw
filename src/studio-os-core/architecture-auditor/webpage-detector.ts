import { FORBIDDEN_WEBPAGE_PATTERNS, WEBPAGE_SHELL_MARKERS } from './laws';
import type { ArchitectureViolation } from './types';

export type WebpageDetectionInput = {
  route: string;
  moduleId?: string;
  uiPattern?: string;
  shellHints?: string[];
  flaggedAsWebpage?: boolean;
};

function uid(): string {
  return `wv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function detectWebpageViolations(inputs: WebpageDetectionInput[]): ArchitectureViolation[] {
  const violations: ArchitectureViolation[] = [];

  for (const input of inputs) {
    const hints = (input.shellHints ?? []).map((h) => h.toLowerCase());
    const patterns: string[] = [];

    if (input.flaggedAsWebpage || input.uiPattern === 'scrollable-admin-stage') {
      patterns.push('scrollable admin stage shell');
    }
    if (input.uiPattern === 'immersive-partial-dashboard') {
      patterns.push('kpi metric grid');
      patterns.push('dashboard hybrid in immersive shell');
    }
    if (input.uiPattern === 'module-card-grid') {
      patterns.push('module card grid');
    }

    for (const marker of WEBPAGE_SHELL_MARKERS) {
      if (hints.some((h) => h.includes(marker.toLowerCase()))) {
        patterns.push(marker.toLowerCase());
      }
    }

    if (patterns.length === 0 && input.uiPattern === 'scrollable-admin-stage') {
      patterns.push('traditional saas ui');
    }

    if (patterns.length === 0) continue;

    const matchedForbidden = FORBIDDEN_WEBPAGE_PATTERNS.filter((p) =>
      patterns.some((pat) => pat.includes(p.replace(/-/g, ' ')) || p.includes(pat))
    );

    violations.push({
      id: uid(),
      category: 'webpage-pattern',
      severity: input.uiPattern === 'immersive-partial-dashboard' ? 'major' : 'critical',
      problem: `Route behaves like a webpage, not a physical place: ${input.route}`,
      reason:
        matchedForbidden.length > 0
          ? `Detected forbidden patterns: ${matchedForbidden.join(', ')}`
          : `Detected software UI patterns: ${patterns.join(', ')}`,
      affectedRoutes: [input.route],
      detectedPatterns: [...new Set([...patterns, ...matchedForbidden])],
    });
  }

  return violations;
}
