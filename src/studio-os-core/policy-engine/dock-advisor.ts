import { explainPolicy, findPolicyForWorkflow, queryPolicyEngine } from './discovery-engine';
import { summarizePolicyEngine } from './engine-profile-builder';
import { filterBlockedToday, verifyWorkflowCompliance } from './enforcement-engine';
import { listPoliciesByCategory } from './policy-catalog';
import { simulatePolicyChange } from './simulation-engine';
import {
  appendPolicySimulationResult,
  ensureOrganizationPolicyEngineProfile,
  getOrganizationPolicyEngineProfile,
} from './store';
import type { PolicyEngineDockAdvice } from './types';

export function resolvePolicyEngineAdvice(input: string, organizationId: string): PolicyEngineDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationPolicyEngineProfile(organizationId) ??
    ensureOrganizationPolicyEngineProfile(organizationId);

  if (/policy engine|show.*policies|all policies|organizational law/i.test(trimmed)) {
    return {
      response: summarizePolicyEngine(profile),
      concierge: 'Chief Concierge',
      engineScore: profile.engineScore,
    };
  }

  if (/why was.*blocked|automation blocked|workflow blocked|why blocked/i.test(trimmed)) {
    const blocked = filterBlockedToday(profile.enforcementHistory);
    const latest = blocked[0] ?? profile.enforcementHistory.find((e) => !e.compliant);
    return {
      response: latest
        ? `${latest.workflowName}: ${latest.explanation} → ${latest.recommendations.join('; ')}`
        : 'No blocked workflows today. All recent executions policy-compliant.',
      concierge: 'Chief Concierge',
      engineScore: profile.engineScore,
    };
  }

  if (/publishing policies|content publishing|show all publishing/i.test(trimmed)) {
    const publishing = listPoliciesByCategory('content-publishing');
    const brand = listPoliciesByCategory('brand-guidelines');
    const all = [...publishing, ...brand];
    return {
      response:
        all.length === 0
          ? 'No publishing policies registered.'
          : `Publishing: ${all.map((p) => p.name).join(' · ')}.`,
      concierge: 'Chief Concierge',
    };
  }

  if (/simulate.*approval|simulate this approval|approval rule simulation/i.test(trimmed)) {
    const result = simulatePolicyChange('org.approval-workflow', 'Simulated approval rule change from Command Dock');
    appendPolicySimulationResult(organizationId, result);
    return {
      response: `Simulation: ${result.affectedDepartments.join(', ')} · ${result.affectedEmployees} employees · ${result.affectedAutomations.length} automations · Risk: ${result.riskLevel}. ${result.recommendedChanges[0] ?? ''}`,
      concierge: 'Chief Concierge',
    };
  }

  if (/simulate.*policy|policy simulation|simulate impact/i.test(trimmed)) {
    const hits = queryPolicyEngine(trimmed.replace(/simulate|policy|impact/gi, '').trim() || 'content', 1);
    const policyId = hits[0]?.entry.policyId ?? 'org.content-publishing';
    const result = simulatePolicyChange(policyId, 'Policy change simulation from Command Dock');
    appendPolicySimulationResult(organizationId, result);
    return {
      response: `${result.policyName}: ${result.affectedDepartments.length} departments · ${result.affectedAutomations.length} automations · Risk ${result.riskLevel}.`,
      concierge: 'Chief Concierge',
    };
  }

  if (/policy controls|what policy|which policy controls/i.test(trimmed)) {
    const workflowMatch = trimmed.match(/controls?\s+(?:this\s+)?(?:workflow\s+)?(.+)/i);
    const query = workflowMatch?.[1]?.trim() ?? 'automation';
    const policies = findPolicyForWorkflow(query);
    return {
      response:
        policies.length === 0
          ? `No specific policies found for "${query}". Review Policy Engine catalog.`
          : `Controls ${query}: ${policies.map((p) => p.name).join(' · ')}.`,
      concierge: 'Chief Concierge',
      engineScore: profile.engineScore,
    };
  }

  if (/compliance|enforcement|policy violation/i.test(trimmed)) {
    return {
      response: `${profile.complianceRatePct}% compliance · ${profile.enforcementHistory.filter((e) => !e.compliant).length} recent violations. Review Policy Engine enforcement tab.`,
      concierge: 'Chief Concierge',
    };
  }

  if (/hierarchy|platform policy|organization policy|department policy/i.test(trimmed)) {
    const layers = profile.hierarchyLayers.map((l) => `${l.level}:${l.policyCount}`).join(' · ');
    return {
      response: `Policy hierarchy: ${layers}. Lower levels extend, never violate higher rules.`,
      concierge: 'Chief Concierge',
    };
  }

  if (/approval required|privacy|professional trust|marketplace permission/i.test(trimmed)) {
    const check = verifyWorkflowCompliance('workflow.generic', 'Generic Workflow', {
      requiresApproval: trimmed.includes('approval'),
      hasPrivacyConsent: !trimmed.includes('privacy'),
      hasVerifiedExpertise: !trimmed.includes('marketplace'),
    });
    return {
      response: check.compliant
        ? 'Workflow compliant with applicable policies.'
        : `${check.explanation} ${check.recommendations.join('; ')}`,
      concierge: 'Chief Concierge',
    };
  }

  const explainMatch = trimmed.match(/explain policy\s+(.+)/i);
  if (explainMatch) {
    const hits = queryPolicyEngine(explainMatch[1], 1);
    if (hits[0]) {
      return {
        response: explainPolicy(hits[0].entry.policyId) ?? hits[0].entry.description,
        concierge: 'Chief Concierge',
      };
    }
  }

  const hits = queryPolicyEngine(trimmed, 3);
  if (hits.length > 0 && /find|search|show|list|which/i.test(trimmed)) {
    return {
      response: hits.map((h) => `${h.entry.name} (${h.entry.level})`).join(' · '),
      concierge: 'Chief Concierge',
      engineScore: profile.engineScore,
    };
  }

  return null;
}

export function listPolicyEngineDockSuggestions(_organizationId: string): string[] {
  return [
    'Why was this automation blocked?',
    'Show all publishing policies.',
    'Simulate this approval rule.',
    'What policy controls this workflow?',
  ].slice(0, 4);
}

export function buildProactivePolicyEngineSuggestion(organizationId: string): string | null {
  const profile = getOrganizationPolicyEngineProfile(organizationId);
  if (!profile) return null;
  return summarizePolicyEngine(profile);
}

export function buildPolicyEngineOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationPolicyEngineProfile(organizationId);
  return profile.dockPolicyLine;
}
