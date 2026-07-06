import { explainPrompt, queryPromptRegistry } from './discovery-engine';
import { summarizePromptRegistry } from './engine-profile-builder';
import { listPromptsByFeature } from './prompt-catalog';
import { runPromptTest } from './testing-engine';
import {
  comparePromptVersions,
  filterVersionsChangedThisMonth,
  getVersionHistoryForPrompt,
} from './version-history';
import {
  appendPromptTestResult,
  ensureOrganizationPromptRegistryProfile,
  getOrganizationPromptRegistryProfile,
} from './store';
import type { PromptRegistryDockAdvice } from './types';

export function resolvePromptRegistryAdvice(input: string, organizationId: string): PromptRegistryDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationPromptRegistryProfile(organizationId) ??
    ensureOrganizationPromptRegistryProfile(organizationId);

  if (/prompt registry|show.*prompts|my prompts|registered prompts/i.test(trimmed)) {
    return {
      response: summarizePromptRegistry(profile),
      concierge: 'Chief Concierge',
      registryScore: profile.registryScore,
    };
  }

  if (/executive council.*prompt|prompts used by executive council|council prompts/i.test(trimmed)) {
    const council = listPromptsByFeature('executive-council');
    return {
      response:
        council.length === 0
          ? 'No Executive Council prompts registered.'
          : `Executive Council: ${council.map((p) => `${p.name} v${p.version}`).join(' · ')}.`,
      concierge: 'Chief Concierge',
      registryScore: profile.registryScore,
    };
  }

  const compareMatch = trimmed.match(/compare prompt version\s+(\d+)\s+to version\s+(\d+)/i);
  if (compareMatch || /compare.*version\s+\d+.*version\s+\d+/i.test(trimmed)) {
    const vA = compareMatch?.[1] ? `${compareMatch[1]}.0.0` : '5.0.0';
    const vB = compareMatch?.[2] ? `${compareMatch[2]}.0.0` : '6.0.0';
    const comparison = comparePromptVersions(
      'executive-council.meeting-synthesis',
      vA,
      vB,
      profile.versionHistory
    );
    return {
      response: comparison
        ? `${comparison.promptName}: v${comparison.versionA} → v${comparison.versionB}. ${comparison.summary}. Quality Δ ${comparison.qualityDeltaPct}%.`
        : 'Version comparison not found — check Prompt Registry version history.',
      concierge: 'Chief Concierge',
    };
  }

  if (/prompts changed this month|which prompts changed|changed this month/i.test(trimmed)) {
    const changed = filterVersionsChangedThisMonth(profile.versionHistory);
    return {
      response:
        changed.length === 0
          ? 'No prompt versions changed this month.'
          : `Changed: ${changed.map((v) => `${v.promptName} v${v.version}`).join(' · ')}.`,
      concierge: 'Chief Concierge',
    };
  }

  if (/test this prompt|test prompt before|run prompt test/i.test(trimmed)) {
    const promptMatch = trimmed.match(/test (?:this )?prompt(?:\s+(.+))?/i);
    const query = promptMatch?.[1]?.trim() ?? 'command dock';
    const hits = queryPromptRegistry(query, 1);
    if (hits[0]) {
      const result = runPromptTest(hits[0].entry.promptId, hits[0].entry.version);
      appendPromptTestResult(organizationId, result);
      return {
        response: `Tested ${hits[0].entry.name} v${hits[0].entry.version}: quality ${result.qualityScorePct}% · latency ${result.latencyMs}ms · ${result.passed ? 'PASSED' : 'FAILED'}. Review Prompt Testing tab.`,
        concierge: 'Chief Concierge',
        registryScore: profile.registryScore,
      };
    }
    return {
      response: 'Specify a prompt to test — e.g. "Test this prompt before deployment."',
      concierge: 'Chief Concierge',
    };
  }

  if (/version history|pending approval|draft prompt/i.test(trimmed)) {
    const pending = profile.versionHistory.filter((v) => v.status === 'pending-approval');
    return {
      response:
        pending.length === 0
          ? `${profile.draftCount} draft prompts · no versions pending approval.`
          : `Pending: ${pending.map((v) => `${v.promptName} v${v.version}`).join(' · ')}.`,
      concierge: 'Chief Concierge',
    };
  }

  if (/quality score|hallucination|prompt quality/i.test(trimmed)) {
    const latest = profile.testResults.slice(0, 3);
    return {
      response:
        latest.length === 0
          ? `Average quality: ${profile.avgQualityScorePct}%.`
          : `Recent tests: ${latest.map((t) => `${t.promptName} ${t.qualityScorePct}%`).join(' · ')}.`,
      concierge: 'Chief Concierge',
    };
  }

  if (/hidden prompt|prompts are code|transparent/i.test(trimmed)) {
    const warnings = profile.governanceFindings.filter((f) => f.severity !== 'info');
    return {
      response:
        warnings.length === 0
          ? 'All prompts registered — no hidden text. Prompts are first-class platform assets.'
          : `${warnings.length} findings — ${warnings[0]?.recommendation ?? 'review Prompt Registry.'}`,
      concierge: 'Chief Concierge',
      registryScore: profile.registryScore,
    };
  }

  const explainMatch = trimmed.match(/explain prompt\s+(.+)/i);
  if (explainMatch) {
    const hits = queryPromptRegistry(explainMatch[1], 1);
    if (hits[0]) {
      return {
        response: explainPrompt(hits[0].entry.promptId) ?? hits[0].entry.description,
        concierge: 'Chief Concierge',
      };
    }
  }

  const historyMatch = trimmed.match(/version history (?:for )?(.+)/i);
  if (historyMatch) {
    const hits = queryPromptRegistry(historyMatch[1], 1);
    if (hits[0]) {
      const history = getVersionHistoryForPrompt(hits[0].entry.promptId, profile.versionHistory);
      return {
        response:
          history.length === 0
            ? `No version history for ${hits[0].entry.name}.`
            : `${hits[0].entry.name}: ${history.map((v) => `v${v.version} (${v.status})`).join(' · ')}.`,
        concierge: 'Chief Concierge',
      };
    }
  }

  const hits = queryPromptRegistry(trimmed, 3);
  if (hits.length > 0 && /find|search|show|list|which/i.test(trimmed)) {
    return {
      response: hits.map((h) => `${h.entry.name} v${h.entry.version} (${h.entry.status})`).join(' · '),
      concierge: 'Chief Concierge',
      registryScore: profile.registryScore,
    };
  }

  return null;
}

export function listPromptRegistryDockSuggestions(_organizationId: string): string[] {
  return [
    'Show prompts used by Executive Council.',
    'Compare Prompt Version 5 to Version 6.',
    'Which prompts changed this month?',
    'Test this prompt before deployment.',
  ].slice(0, 4);
}

export function buildProactivePromptRegistrySuggestion(organizationId: string): string | null {
  const profile = getOrganizationPromptRegistryProfile(organizationId);
  if (!profile) return null;
  return summarizePromptRegistry(profile);
}

export function buildPromptRegistryOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationPromptRegistryProfile(organizationId);
  return profile.dockRegistryLine;
}
