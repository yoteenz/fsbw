import type { RoadReadyApplicabilityInput, RoadReadyApplicabilityOutput } from './serviceCatalogTypes';

interface ApplicabilityRule {
  requirementKey: string;
  serviceSlug: string;
  title: string;
  evaluate: (input: RoadReadyApplicabilityInput) => { result: RoadReadyApplicabilityOutput['result']; reason: string };
}

const RULES: ApplicabilityRule[] = [
  {
    requirementKey: 'ucr',
    serviceSlug: 'ucr-registration',
    title: 'UCR Registration',
    evaluate: (input) => {
      if (input.interstate) return { result: 'LIKELY_REQUIRED', reason: 'Interstate motor carriers often need UCR — confirm applicability.' };
      if (input.intrastate && (input.vehicleCount ?? 0) > 0) return { result: 'NEEDS_REVIEW', reason: 'UCR applicability depends on operation type and fleet.' };
      return { result: 'NOT_APPLICABLE', reason: 'UCR may not apply based on current profile.' };
    },
  },
  {
    requirementKey: 'hvut',
    serviceSlug: 'hvut-form-2290',
    title: 'HVUT / Form 2290',
    evaluate: (input) => {
      if (input.vehicleWeightOver26000) return { result: 'LIKELY_REQUIRED', reason: 'Heavy vehicles may require HVUT filing — confirm vehicle weight.' };
      return { result: 'NOT_APPLICABLE', reason: 'HVUT typically applies to taxable heavy vehicles.' };
    },
  },
  {
    requirementKey: 'mcs150',
    serviceSlug: 'mcs-150-biennial-update',
    title: 'MCS-150 Biennial Update',
    evaluate: (input) => {
      if (input.interstate || input.newEntrant) return { result: 'RECOMMENDED', reason: 'USDOT registrants typically need periodic MCS-150 updates.' };
      return { result: 'NEEDS_REVIEW', reason: 'Confirm whether MCS-150 update applies to your USDOT registration.' };
    },
  },
  {
    requirementKey: 'drug_alcohol_consortium',
    serviceSlug: 'drug-alcohol-consortium',
    title: 'Drug & Alcohol Consortium',
    evaluate: (input) => {
      if (input.hasCdlDrivers) return { result: 'LIKELY_REQUIRED', reason: 'CDL drivers often require consortium enrollment — confirm driver count.' };
      return { result: 'NOT_APPLICABLE', reason: 'Consortium requirements depend on CDL driver employment.' };
    },
  },
  {
    requirementKey: 'clearinghouse',
    serviceSlug: 'fmcsa-clearinghouse-assistance',
    title: 'FMCSA Clearinghouse',
    evaluate: (input) => {
      if (input.hasCdlDrivers) return { result: 'RECOMMENDED', reason: 'Employers of CDL drivers typically need Clearinghouse compliance.' };
      return { result: 'NOT_APPLICABLE', reason: 'Clearinghouse applies when employing CDL drivers.' };
    },
  },
  {
    requirementKey: 'dq_files',
    serviceSlug: 'driver-qualification-files',
    title: 'Driver Qualification Files',
    evaluate: (input) => {
      if (input.hasCdlDrivers) return { result: 'RECOMMENDED', reason: 'DQ files are typically maintained for employed CDL drivers.' };
      return { result: 'NOT_APPLICABLE', reason: 'DQ file requirements depend on driver structure.' };
    },
  },
  {
    requirementKey: 'eld',
    serviceSlug: 'eld-services',
    title: 'ELD Services',
    evaluate: (input) => {
      if ((input.vehicleCount ?? 0) > 0 && input.interstate) return { result: 'NEEDS_REVIEW', reason: 'ELD requirements depend on hours-of-service applicability.' };
      return { result: 'OPTIONAL', reason: 'ELD may be recommended based on operation — review required.' };
    },
  },
  {
    requirementKey: 'new_entrant_audit',
    serviceSlug: 'new-entrant-audit-support',
    title: 'New Entrant Audit Support',
    evaluate: (input) => {
      if (input.newEntrant) return { result: 'RECOMMENDED', reason: 'New entrant carriers may face safety audits — prepare documentation.' };
      return { result: 'NOT_APPLICABLE', reason: 'New entrant audit support applies to new entrant carriers.' };
    },
  },
  {
    requirementKey: 'bookkeeping',
    serviceSlug: 'bookkeeping',
    title: 'Bookkeeping',
    evaluate: () => ({ result: 'OPTIONAL', reason: 'Optional operational support — not a compliance requirement.' }),
  },
];

export function evaluateRoadReadyApplicability(input: RoadReadyApplicabilityInput): RoadReadyApplicabilityOutput[] {
  return RULES.map((rule) => {
    const { result, reason } = rule.evaluate(input);
    return {
      requirementKey: rule.requirementKey,
      result,
      reason,
      serviceSlug: rule.serviceSlug,
    };
  });
}

export function recommendServicesFromBusinessProfile(input: RoadReadyApplicabilityInput): string[] {
  const outputs = evaluateRoadReadyApplicability(input);
  const slugs = new Set<string>();
  for (const o of outputs) {
    if (['REQUIRED', 'LIKELY_REQUIRED', 'RECOMMENDED', 'NEEDS_REVIEW'].includes(o.result) && o.serviceSlug) {
      slugs.add(o.serviceSlug);
    }
  }
  if (input.interstate) {
    slugs.add('irp-apportioned-registration');
    slugs.add('ifta-fuel-tax-assistance');
  }
  if (input.newEntrant) slugs.add('operating-authority-assistance');
  return [...slugs];
}
