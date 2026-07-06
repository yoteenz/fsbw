import { getAllRegisteredComponents } from '../component-registry/registration';
import { buildInteractionPatternCatalog } from './pattern-catalog';
import type { InteractionGovernanceFinding } from './types';

/** Interaction governance — components must declare interaction rules; pages must not invent behavior. */
export function runInteractionGovernanceAudit(): InteractionGovernanceFinding[] {
  const findings: InteractionGovernanceFinding[] = [];
  const catalog = buildInteractionPatternCatalog();
  const components = getAllRegisteredComponents();
  const patternNames = new Set(catalog.map((p) => p.name.toLowerCase()));

  for (const component of components) {
    if (component.interactionRules.length === 0) {
      findings.push({
        id: `no-interactions-${component.componentId}`,
        severity: 'warning',
        componentId: component.componentId,
        message: `${component.officialName} does not declare interaction rules.`,
        recommendation: 'Bind component to Interaction Engine™ — document hover, focus, click, and expand patterns.',
      });
    }

    for (const rule of component.interactionRules) {
      const normalized = rule.toLowerCase();
      const matched = [...patternNames].some((name) => normalized.includes(name));
      if (!matched && !normalized.includes('tab') && !normalized.includes('expand')) {
        findings.push({
          id: `custom-interaction-${component.componentId}-${rule.slice(0, 20)}`,
          severity: 'info',
          componentId: component.componentId,
          message: `${component.officialName} uses custom rule "${rule}" — verify against Interaction Engine™ catalog.`,
          recommendation: 'Map to standardized pattern or register extension via registerInteractionPattern().',
        });
      }
    }
  }

  const withRules = components.filter((c) => c.interactionRules.length >= 2).length;
  if (components.length > 0 && withRules < components.length * 0.4) {
    findings.push({
      id: 'interaction-coverage-low',
      severity: 'warning',
      message: `Only ${withRules}/${components.length} components declare 2+ interaction rules.`,
      recommendation: 'Expand Component Registry interactionRules to reference Interaction Engine™ patterns.',
    });
  }

  findings.push({
    id: 'behavioral-cohesion',
    severity: 'info',
    message: `${catalog.filter((p) => p.platformStandard).length} platform-standard interaction patterns protect behavioral consistency.`,
    recommendation: 'Never implement page-specific hover/click/modal behavior — inherit from Interaction Engine™.',
  });

  return findings.sort((a, b) => {
    const rank = { critical: 0, warning: 1, info: 2 };
    return rank[a.severity] - rank[b.severity];
  });
}

export function computeComponentInteractionCompliance(): number {
  const components = getAllRegisteredComponents();
  if (components.length === 0) return 0;
  const compliant = components.filter((c) => c.interactionRules.length > 0).length;
  return Math.round((compliant / components.length) * 100);
}
