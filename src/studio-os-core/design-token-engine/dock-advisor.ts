import { explainDesignToken, queryDesignTokens } from './discovery-engine';
import { summarizeDesignTokenEngine } from './engine-profile-builder';
import { listTokensByCategory } from './token-catalog';
import { getTokenValue } from './token-catalog';
import {
  ensureOrganizationDesignTokenEngineProfile,
  getOrganizationDesignTokenEngineProfile,
} from './store';
import { getActiveTheme } from './theme-engine';
import type { DesignTokenEngineDockAdvice } from './types';

export function resolveDesignTokenEngineAdvice(input: string, organizationId: string): DesignTokenEngineDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationDesignTokenEngineProfile(organizationId) ??
    ensureOrganizationDesignTokenEngineProfile(organizationId);

  if (/design token|visual source|design bible|design consistency|token engine/i.test(trimmed)) {
    return {
      response: summarizeDesignTokenEngine(profile),
      concierge: 'Chief Concierge',
      engineScore: profile.engineScore,
    };
  }

  if (/accent color|brand color|studio red|eia red/i.test(trimmed)) {
    return {
      response: `Brand accent: ${getTokenValue('color.brand-accent')} · EIA red: ${getTokenValue('color.eia-red')}. Immutable — inherit via Design Token Engine™, never hardcode on pages.`,
      concierge: 'Chief Concierge',
    };
  }

  if (/spacing|typography|glass|blur|breakpoint/i.test(trimmed)) {
    const cat = trimmed.includes('spacing')
      ? 'spacing'
      : trimmed.includes('typography')
        ? 'typography'
        : trimmed.includes('glass')
          ? 'glass'
          : trimmed.includes('blur')
            ? 'blur'
            : 'breakpoint';
    const list = listTokensByCategory(cat as Parameters<typeof listTokensByCategory>[0])
      .slice(0, 4)
      .map((t) => `${t.name}: ${t.value}`)
      .join(' · ');
    return { response: `${cat} tokens: ${list}.`, concierge: 'Chief Concierge' };
  }

  if (/dark theme|light theme|future theme/i.test(trimmed)) {
    const active = getActiveTheme();
    const themes = profile.themes.map((t) => `${t.label} (${t.tokenCount} tokens)`).join(' · ');
    return { response: `Active: ${active}. ${themes}.`, concierge: 'Chief Concierge' };
  }

  if (/governance|inherit|redefine|override/i.test(trimmed)) {
    const warnings = profile.governanceFindings.filter((f) => f.severity === 'warning');
    return {
      response:
        warnings.length === 0
          ? 'All components inherit from Design Token Engine™. Individual pages must not redefine core design values.'
          : `${warnings.length} governance findings — ${warnings[0]?.recommendation ?? 'review Design Token Engine dashboard.'}`,
      concierge: 'Chief Concierge',
      engineScore: profile.engineScore,
    };
  }

  const explainMatch = trimmed.match(/explain token\s+(.+)/i);
  if (explainMatch) {
    const hits = queryDesignTokens(explainMatch[1], 1);
    if (hits[0]) {
      return {
        response: explainDesignToken(hits[0].entry.tokenId) ?? hits[0].entry.description,
        concierge: 'Chief Concierge',
      };
    }
  }

  const hits = queryDesignTokens(trimmed, 3);
  if (hits.length > 0 && /find|search|what is|show token|list token/i.test(trimmed)) {
    return {
      response: hits.map((h) => `${h.entry.name} = ${h.entry.value}`).join(' · '),
      concierge: 'Chief Concierge',
      engineScore: profile.engineScore,
    };
  }

  return null;
}

export function listDesignTokenEngineDockSuggestions(_organizationId: string): string[] {
  return [
    'Show Design Token Engine status.',
    'What is the Studio accent color?',
    'List spacing design tokens.',
    'Are components inheriting design tokens?',
  ].slice(0, 4);
}

export function buildProactiveDesignTokenEngineSuggestion(organizationId: string): string | null {
  const profile = getOrganizationDesignTokenEngineProfile(organizationId);
  if (!profile) return null;
  return summarizeDesignTokenEngine(profile);
}

export function buildDesignTokenEngineOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationDesignTokenEngineProfile(organizationId);
  return profile.dockEngineLine;
}
