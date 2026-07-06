import { explainInteractionPattern, queryInteractionPatterns } from './discovery-engine';
import { summarizeInteractionEngine } from './engine-profile-builder';
import { listPatternsByType } from './pattern-catalog';
import { listMotionByType } from './motion-engine';
import { getMandatoryAccessibilitySpecs } from './accessibility-engine';
import {
  ensureOrganizationInteractionEngineProfile,
  getOrganizationInteractionEngineProfile,
} from './store';
import type { InteractionEngineDockAdvice } from './types';

export function resolveInteractionEngineAdvice(input: string, organizationId: string): InteractionEngineDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationInteractionEngineProfile(organizationId) ??
    ensureOrganizationInteractionEngineProfile(organizationId);

  if (/interaction engine|behavioral source|platform behavior|interaction pattern|how does.*behave/i.test(trimmed)) {
    return {
      response: summarizeInteractionEngine(profile),
      concierge: 'Chief Concierge',
      engineScore: profile.engineScore,
    };
  }

  if (/hover|focus|click|press|modal|drawer/i.test(trimmed)) {
    const term = trimmed.includes('hover')
      ? 'hover'
      : trimmed.includes('focus')
        ? 'focus'
        : trimmed.includes('modal')
          ? 'modal'
          : trimmed.includes('drawer')
            ? 'drawer'
            : 'click';
    const hits = queryInteractionPatterns(term, 3);
    if (hits.length > 0) {
      return {
        response: hits.map((h) => `${h.entry.name}: ${h.entry.behavior.slice(0, 60)}…`).join(' · '),
        concierge: 'Chief Concierge',
      };
    }
  }

  if (/motion|animation|easing|transition|micro-interaction/i.test(trimmed)) {
    const motion = listMotionByType('micro').slice(0, 2);
    return {
      response: `Motion standards: ${motion.map((m) => `${m.name} = ${m.value}`).join(' · ')}. All interactions respect prefers-reduced-motion.`,
      concierge: 'Chief Concierge',
    };
  }

  if (/accessibility|keyboard|screen reader|reduced motion|a11y/i.test(trimmed)) {
    const specs = getMandatoryAccessibilitySpecs().slice(0, 4);
    return {
      response: `Mandatory a11y: ${specs.map((s) => s.label).join(' · ')}. Every interaction supports keyboard, touch, and mouse.`,
      concierge: 'Chief Concierge',
      engineScore: profile.engineScore,
    };
  }

  if (/governance|compliance|consistent|familiar/i.test(trimmed)) {
    const warnings = profile.governanceFindings.filter((f) => f.severity === 'warning');
    return {
      response:
        warnings.length === 0
          ? 'All components inherit Interaction Engine™ patterns. Studio OS behaves like one cohesive operating system.'
          : `${warnings.length} governance findings — ${warnings[0]?.recommendation ?? 'review Interaction Engine dashboard.'}`,
      concierge: 'Chief Concierge',
      engineScore: profile.engineScore,
    };
  }

  if (/loading|success|error|confirmation/i.test(trimmed)) {
    const feedback = listPatternsByType('feedback').slice(0, 3);
    return {
      response: `Feedback patterns: ${feedback.map((p) => p.name).join(' · ')} — consistent states across all modules.`,
      concierge: 'Chief Concierge',
    };
  }

  const explainMatch = trimmed.match(/explain pattern\s+(.+)/i);
  if (explainMatch) {
    const hits = queryInteractionPatterns(explainMatch[1], 1);
    if (hits[0]) {
      return {
        response: explainInteractionPattern(hits[0].entry.patternId) ?? hits[0].entry.behavior,
        concierge: 'Chief Concierge',
      };
    }
  }

  const hits = queryInteractionPatterns(trimmed, 3);
  if (hits.length > 0 && /find|search|what is|show pattern|list pattern/i.test(trimmed)) {
    return {
      response: hits.map((h) => `${h.entry.name}: ${h.entry.trigger}`).join(' · '),
      concierge: 'Chief Concierge',
      engineScore: profile.engineScore,
    };
  }

  return null;
}

export function listInteractionEngineDockSuggestions(_organizationId: string): string[] {
  return [
    'Show Interaction Engine status.',
    'How does modal opening behave?',
    'List feedback interaction patterns.',
    'Are components using standard interactions?',
  ].slice(0, 4);
}

export function buildProactiveInteractionEngineSuggestion(organizationId: string): string | null {
  const profile = getOrganizationInteractionEngineProfile(organizationId);
  if (!profile) return null;
  return summarizeInteractionEngine(profile);
}

export function buildInteractionEngineOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationInteractionEngineProfile(organizationId);
  return profile.dockEngineLine;
}
