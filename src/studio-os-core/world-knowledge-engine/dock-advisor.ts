import { MONITORING_CATEGORY_LABELS } from './constants';
import { getBriefingByType } from './briefings-engine';
import { summarizeWorldKnowledgeProfile } from './knowledge-builder';
import {
  ensureOrganizationWorldKnowledgeProfile,
  getOrganizationWorldKnowledgeProfile,
} from './store';
import type { WorldKnowledgeEngineDockAdvice } from './types';

export function resolveWorldKnowledgeEngineAdvice(
  input: string,
  organizationId: string
): WorldKnowledgeEngineDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationWorldKnowledgeProfile(organizationId) ??
    ensureOrganizationWorldKnowledgeProfile(organizationId);

  if (
    /world knowledge|outside world|external intelligence|industry news|monitor the world|research partner/i.test(
      trimmed
    )
  ) {
    return {
      response: summarizeWorldKnowledgeProfile(profile),
      concierge: 'Chief Concierge',
      worldKnowledgeScore: profile.worldKnowledgeScore,
      signalsSurfaced: profile.signalsSurfaced,
    };
  }

  if (/regulation|legislation|government|compliance/i.test(trimmed)) {
    const signals = profile.filteredSignals.filter((s) =>
      /regulation|legislation|government/.test(s.category)
    );
    return {
      response: signals.length
        ? signals
            .slice(0, 3)
            .map((s) => `${s.headline} — ${s.whyItMatters}`)
            .join('\n')
        : 'No new regulations surfaced for your industry in the current monitoring cycle.',
      concierge: 'Chief Concierge',
    };
  }

  if (/competitor|competition|rival/i.test(trimmed)) {
    const signal = profile.filteredSignals.find((s) => s.category === 'competitor-activity');
    return {
      response: signal
        ? `A competitor launched a similar service — ${signal.summary} ${signal.whyItMatters}`
        : 'Competitor monitoring active — no major competitive moves in current filter window.',
      concierge: 'Chief Concierge',
    };
  }

  if (/ai|artificial intelligence|automate|technology/i.test(trimmed)) {
    const signal = profile.filteredSignals.find(
      (s) => s.category === 'artificial-intelligence' || s.category === 'technology-advances'
    );
    return {
      response: signal
        ? `A new AI technology could affect your workflow — ${signal.summary} ${signal.whyItMatters}`
        : 'Technology monitoring active — no critical AI shifts requiring immediate action.',
      concierge: 'Chief Concierge',
    };
  }

  if (/daily|today|summarize today|briefing|developments/i.test(trimmed)) {
    const daily = getBriefingByType(profile.briefings, 'daily');
    return {
      response: daily
        ? `I've summarized today's developments: ${daily.summary} ${daily.whyItMatters}`
        : profile.dockWorldLine,
      concierge: 'Chief Concierge',
    };
  }

  if (/weekly|monthly|quarterly|report|outlook/i.test(trimmed)) {
    const type = /weekly/i.test(trimmed)
      ? 'weekly'
      : /monthly/i.test(trimmed)
        ? 'monthly'
        : /quarterly/i.test(trimmed)
          ? 'quarterly'
          : 'executive-summary';
    const briefing = getBriefingByType(profile.briefings, type);
    return {
      response: briefing
        ? `${briefing.title}: ${briefing.summary} Why it matters: ${briefing.whyItMatters}`
        : summarizeWorldKnowledgeProfile(profile),
      concierge: 'Chief Concierge',
    };
  }

  if (/opportunity|risk|alert/i.test(trimmed)) {
    const opp = getBriefingByType(profile.briefings, 'opportunity-alert');
    const risk = getBriefingByType(profile.briefings, 'risk-alert');
    return {
      response: [opp ? `Opportunity: ${opp.summary}` : '', risk ? `Risk: ${risk.summary}` : '']
        .filter(Boolean)
        .join('\n'),
      concierge: 'Chief Concierge',
    };
  }

  if (/filter|industry|law firm|painting|beauty|hair|relevant/i.test(trimmed)) {
    return {
      response: [
        profile.industryFilterSummary,
        profile.filteredSignals
          .slice(0, 4)
          .map((s) => `${MONITORING_CATEGORY_LABELS[s.category]}: ${s.headline}`)
          .join('\n'),
      ].join(' '),
      concierge: 'Chief Concierge',
      signalsSurfaced: profile.signalsSurfaced,
    };
  }

  if (/market|trend|economic|consumer|social|platform|security|certification/i.test(trimmed)) {
    const match = profile.filteredSignals.find((s) =>
      new RegExp(trimmed.split(/\s+/)[0] ?? '', 'i').test(s.category + s.headline)
    );
    return {
      response: match
        ? `${match.headline} — ${match.whyItMatters} (${match.relevancePct}% relevance)`
        : profile.filteredSignals
            .slice(0, 4)
            .map((s) => s.headline)
            .join('\n'),
      concierge: 'Chief Concierge',
    };
  }

  return null;
}

export function listWorldKnowledgeEngineDockSuggestions(organizationId: string): string[] {
  ensureOrganizationWorldKnowledgeProfile(organizationId);
  return [
    "I've summarized today's developments — what's relevant to us?",
    'Are there regulations affecting our industry?',
    'Did any competitor launch something similar?',
    'What external intelligence should I know this week?',
  ].slice(0, 4);
}

export function buildProactiveWorldKnowledgeSuggestion(organizationId: string): string | null {
  const profile = getOrganizationWorldKnowledgeProfile(organizationId);
  if (!profile) return null;
  return summarizeWorldKnowledgeProfile(profile);
}

export function buildWorldKnowledgeOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationWorldKnowledgeProfile(organizationId);
  return profile.dockWorldLine;
}

export function buildMorningWorldAlert(organizationId: string): string | null {
  const profile = getOrganizationWorldKnowledgeProfile(organizationId);
  if (!profile) return null;
  const risk = profile.briefings.find((b) => b.type === 'risk-alert');
  if (risk) return `A regulation affecting your industry was announced this morning — ${risk.summary.slice(0, 120)}…`;
  const daily = profile.briefings.find((b) => b.type === 'daily');
  return daily ? `I've summarized today's developments — ${daily.highlights[0] ?? daily.summary.slice(0, 100)}…` : null;
}
