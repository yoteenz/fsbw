import { getAllRegisteredComponents } from '../component-registry/registration';
import { buildDesignTokenCatalog } from './token-catalog';
import type { DesignGovernanceFinding } from './types';

const HARDCODED_COLOR_PATTERN = /#[0-9A-Fa-f]{3,8}|rgba?\(/;

/** Design governance — components must inherit tokens; pages must not redefine core values. */
export function runDesignGovernanceAudit(): DesignGovernanceFinding[] {
  const findings: DesignGovernanceFinding[] = [];
  const catalog = buildDesignTokenCatalog();
  const components = getAllRegisteredComponents();
  const tokenIds = new Set(catalog.map((t) => t.tokenId));

  for (const component of components) {
    if (component.designTokens.length === 0) {
      findings.push({
        id: `no-tokens-${component.componentId}`,
        severity: 'warning',
        componentId: component.componentId,
        message: `${component.officialName} does not declare design token bindings.`,
        recommendation: 'Bind component to Design Token Engine™ — inherit spacing, typography, and colors.',
      });
    }

    for (const ref of component.designTokens) {
      const normalized = ref.replace(/^ADMIN_STUDIO_THEME\./, 'color.').replace(/^EIA\./, 'color.eia-');
      if (!tokenIds.has(ref) && !catalog.some((t) => t.name.toLowerCase().includes(ref.toLowerCase()))) {
        findings.push({
          id: `unknown-token-${component.componentId}-${ref}`,
          severity: 'info',
          componentId: component.componentId,
          message: `${component.officialName} references "${ref}" — verify token exists in catalog.`,
          recommendation: 'Register missing token or update component binding.',
        });
      }
      void normalized;
    }
  }

  const withFullBinding = components.filter((c) => c.designTokens.length >= 3).length;
  if (withFullBinding < components.length * 0.5) {
    findings.push({
      id: 'coverage-low',
      severity: 'warning',
      message: `Only ${withFullBinding}/${components.length} components bind 3+ design tokens.`,
      recommendation: 'Expand Component Registry designTokens to reference Design Token Engine™ catalog.',
    });
  }

  findings.push({
    id: 'design-bible-protected',
    severity: 'info',
    message: `${catalog.filter((t) => t.immutable).length} immutable tokens protect Studio OS Design Bible.`,
    recommendation: 'Never override immutable brand tokens on individual pages.',
  });

  return findings.sort((a, b) => {
    const rank = { critical: 0, warning: 1, info: 2 };
    return rank[a.severity] - rank[b.severity];
  });
}

export function computeComponentTokenCoverage(): number {
  const components = getAllRegisteredComponents();
  if (components.length === 0) return 0;
  const bound = components.filter((c) => c.designTokens.length > 0).length;
  return Math.round((bound / components.length) * 100);
}

export function validatePageDoesNotRedefineCore(value: string): boolean {
  if (!HARDCODED_COLOR_PATTERN.test(value)) return true;
  return false;
}
