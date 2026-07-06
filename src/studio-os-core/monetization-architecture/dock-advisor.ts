import { resolveDockExpansionRecommendation } from '../industry-architecture/dock-advisor';
import { getDigitalStaffDefinition } from './digital-staff-catalog';
import { getPrimaryGrowthRecommendation, listGrowthRecommendations } from './growth-recommendations';
import { buildDigitalPayrollSummary } from './payroll-engine';
import { ensureOrganizationMonetizationProfile } from './store';
import type { ExecutiveGrowthAdvice } from './types';

const STAFF_HIRE_PATTERNS: Array<{ patterns: RegExp[]; staffId: string; response: string }> = [
  {
    patterns: [/publishing\s+concierge/i, /hire.*publish/i, /publishing\s+volume/i],
    staffId: 'publishing-concierge',
    response:
      'Our publishing volume is increasing. I recommend hiring a Publishing Concierge to own schedule optimization and approval flow.',
  },
  {
    patterns: [/lead\s+concierge/i, /follow\s*up.*lead/i, /sales\s+team.*manual/i],
    staffId: 'lead-concierge',
    response:
      'Your sales team is manually following up with leads. Would you like to activate Lead Concierge?',
  },
  {
    patterns: [/scheduling\s+concierge/i, /manual\s+scheduling/i, /outgrown.*scheduling/i],
    staffId: 'scheduling-concierge',
    response:
      'Your organization has outgrown manual scheduling. Scheduling Concierge would coordinate crews and appointments as dedicated operations staff.',
  },
  {
    patterns: [/production\s+concierge/i, /render\s+queue/i],
    staffId: 'production-concierge',
    response:
      'Production throughput would benefit from a dedicated Production Concierge on your Digital Payroll.',
  },
  {
    patterns: [/customer\s+experience/i, /inquiries\s+increased/i],
    staffId: 'customer-experience-concierge',
    response:
      'Customer inquiries increased. Customer Experience Concierge can route support and delight without adding chaos.',
  },
  {
    patterns: [/digital\s+payroll/i, /workforce/i, /how\s+many\s+employees/i],
    staffId: 'studio-intelligence',
    response: '', // filled dynamically
  },
];

export function resolveExecutiveGrowthAdvice(
  input: string,
  organizationId: string
): ExecutiveGrowthAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile = ensureOrganizationMonetizationProfile(organizationId);
  const payroll = buildDigitalPayrollSummary(profile);

  if (/digital\s+payroll|workforce|employees/i.test(trimmed)) {
    return {
      response: `Digital Workforce · ${payroll.activeEmployeeCount} Active Employees · Monthly Digital Payroll ${formatUsd(payroll.monthlyDigitalPayroll)}. Every active staff member strengthens Headquarters capabilities.`,
      concierge: 'Chief Concierge',
      suggestedCommand: 'Open Expansion Center workforce.',
    };
  }

  for (const trigger of STAFF_HIRE_PATTERNS) {
    if (trigger.response && trigger.patterns.some((p) => p.test(trimmed))) {
      const staff = getDigitalStaffDefinition(trigger.staffId);
      return {
        response: trigger.response,
        concierge: staff?.role ?? 'Chief Concierge',
        recommendedStaffId: trigger.staffId,
        suggestedCommand: staff ? `Activate ${staff.name}.` : undefined,
      };
    }
  }

  const expansion = resolveDockExpansionRecommendation(trimmed);
  if (expansion) {
    return {
      response: expansion.response.replace(
        /Install from Expansion Center\?/i,
        'Expand Headquarters from the Expansion Center when you are ready.'
      ),
      concierge: 'Chief Concierge',
      recommendedPackId: expansion.recommendedPackId,
      suggestedCommand: `Expand Headquarters with ${expansion.recommendedPackId.replace(/-/g, ' ').toUpperCase()}.`,
    };
  }

  const primary = getPrimaryGrowthRecommendation(profile);
  if (primary && /recommend|expand|grow|hire|department/i.test(trimmed)) {
    return {
      response: primary.executiveTone,
      concierge: 'Chief Concierge',
      recommendedPackId: primary.packId,
      recommendedStaffId: primary.staffId,
      suggestedCommand: primary.recommendedExpansion,
    };
  }

  return null;
}

export function buildProactiveGrowthSuggestion(organizationId: string): ExecutiveGrowthAdvice | null {
  const profile = ensureOrganizationMonetizationProfile(organizationId);
  const rec = getPrimaryGrowthRecommendation(profile);
  if (!rec) return null;
  return {
    response: rec.executiveTone,
    concierge: 'Chief Concierge',
    recommendedPackId: rec.packId,
    recommendedStaffId: rec.staffId,
    suggestedCommand: rec.recommendedExpansion,
  };
}

export function listExecutiveGrowthSuggestions(organizationId: string): string[] {
  const profile = ensureOrganizationMonetizationProfile(organizationId);
  return listGrowthRecommendations(profile).map((r) => r.executiveTone);
}

function formatUsd(n: number): string {
  return `$${n.toLocaleString()}`;
}
