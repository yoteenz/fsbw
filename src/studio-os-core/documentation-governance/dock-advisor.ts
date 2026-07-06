import { summarizeDocumentationGovernance } from './governance-profile-builder';
import { runDocumentationAudits } from './audit-engine';
import { validateAllFeatureCoverage } from './coverage-validator';
import { validatePreDeploymentRelease } from './pre-deploy-validator';
import { generateSelfImprovementRecommendations } from './self-improvement';
import {
  ensureOrganizationDocumentationGovernanceProfile,
  getOrganizationDocumentationGovernanceProfile,
} from './store';
import type { DocumentationGovernanceDockAdvice } from './types';

export function resolveDocumentationGovernanceAdvice(
  input: string,
  organizationId: string
): DocumentationGovernanceDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationDocumentationGovernanceProfile(organizationId) ??
    ensureOrganizationDocumentationGovernanceProfile(organizationId);

  if (/documentation governance|governance™|living organizational|audit documentation/i.test(trimmed)) {
    return {
      response: summarizeDocumentationGovernance(profile),
      concierge: 'Chief Concierge',
      governanceScore: profile.governanceScore,
    };
  }

  if (/documentation coverage|coverage dropped|below 95|coverage has dropped/i.test(trimmed)) {
    const below = profile.featuresBelowStandard;
    return {
      response:
        below === 0
          ? `Documentation coverage is ${profile.governanceScore}% — all features meet the ${profile.coverageStandardPct}% organizational standard.`
          : `Documentation coverage has dropped — ${below} features below ${profile.coverageStandardPct}%. ${profile.selfImprovement[0]?.action ?? 'Review Documentation Governance dashboard.'}`,
      concierge: 'Chief Concierge',
      governanceScore: profile.governanceScore,
    };
  }

  if (/no academy lesson|missing academy|academy lesson/i.test(trimmed)) {
    const gaps = runDocumentationAudits().filter((a) => a.issueType === 'missing-academy' && a.severity !== 'info');
    if (gaps.length > 0) {
      return {
        response: `${gaps.length} features lack Academy lessons: ${gaps.slice(0, 3).map((g) => g.featureName).join(', ')}. Register academyLessons in Documentation Registry™.`,
        concierge: 'Chief Concierge',
      };
    }
  }

  if (/missing onboarding|walkthrough|onboarding guidance/i.test(trimmed)) {
    const gaps = runDocumentationAudits().filter((a) => a.issueType === 'missing-walkthrough');
    if (gaps.length > 0) {
      return {
        response: `${gaps.length} features missing walkthrough links. ${gaps[0]?.recommendation ?? 'Update registry walkthroughReferences.'}`,
        concierge: 'Chief Concierge',
      };
    }
  }

  if (/pre-deploy|before release|deployment review|release ready/i.test(trimmed)) {
    const pre = validatePreDeploymentRelease();
    return {
      response: pre.summary,
      concierge: 'Chief Concierge',
      governanceScore: pre.scorePct,
    };
  }

  if (/documentation health|audit|broken reference|terminology|consistency/i.test(trimmed)) {
    return {
      response: profile.healthDimensions.map((d) => `${d.label}: ${d.scorePct}% — ${d.detail}`).join(' '),
      concierge: 'Chief Concierge',
      governanceScore: profile.governanceScore,
    };
  }

  if (/related features require|documentation updates required|three related/i.test(trimmed)) {
    const impacts = profile.dependencyImpacts.slice(0, 3);
    if (impacts.length > 0) {
      return {
        response: impacts.map((i) => i.prompt).join(' '),
        concierge: 'Chief Concierge',
      };
    }
  }

  if (/improve documentation|self.?improve|documentation recommendation/i.test(trimmed)) {
    const recs = generateSelfImprovementRecommendations().slice(0, 3);
    return {
      response: recs.map((r) => `${r.title}: ${r.action}`).join(' '),
      concierge: 'Chief Concierge',
    };
  }

  const coverage = validateAllFeatureCoverage();
  if (/which feature|incomplete documentation/i.test(trimmed)) {
    const worst = coverage.filter((c) => !c.complete).slice(0, 3);
    if (worst.length > 0) {
      return {
        response: worst.map((c) => `${c.featureName} at ${c.coveragePct}% — gaps: ${c.gaps.join(', ')}`).join(' · '),
        concierge: 'Chief Concierge',
      };
    }
  }

  return null;
}

export function listDocumentationGovernanceDockSuggestions(_organizationId: string): string[] {
  return [
    'Show Documentation Governance health.',
    'Which features are below documentation coverage standard?',
    'Is documentation ready for deployment?',
    'What documentation improvements are recommended?',
  ].slice(0, 4);
}

export function buildProactiveDocumentationGovernanceSuggestion(organizationId: string): string | null {
  const profile = getOrganizationDocumentationGovernanceProfile(organizationId);
  if (!profile) return null;
  if (profile.featuresBelowStandard > 0) {
    return `${profile.featuresBelowStandard} features below ${profile.coverageStandardPct}% documentation standard. Open Documentation Governance™ to review audits.`;
  }
  return summarizeDocumentationGovernance(profile);
}

export function buildDocumentationGovernanceOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationDocumentationGovernanceProfile(organizationId);
  return profile.dockGovernanceLine;
}
