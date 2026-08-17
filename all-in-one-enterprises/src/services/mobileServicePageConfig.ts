import { aioComplianceIcons, aioPlatformIcons } from '../config/aioIconRegistry';

export type MobileServiceProcessStep = {
  title: string;
  description: string;
};

export type MobileServiceBenefit = {
  label: string;
  iconSrc?: string;
};

const DEFAULT_BENEFITS: MobileServiceBenefit[] = [
  { label: 'End-to-End Guidance', iconSrc: aioComplianceIcons.documentVault },
  { label: 'Fast & Reliable', iconSrc: aioComplianceIcons.operatingAuthority },
  { label: 'Accuracy You Can Trust', iconSrc: aioComplianceIcons.boc3 },
  { label: 'Ongoing Support', iconSrc: aioPlatformIcons.messages },
];

export const mobileServiceBenefitsBySlug: Record<string, MobileServiceBenefit[]> = {
  'operating-authority-assistance': DEFAULT_BENEFITS,
};

export const mobileServiceProcessBySlug: Record<string, MobileServiceProcessStep[]> = {
  'operating-authority-assistance': [
    {
      title: 'Review Your Profile',
      description: 'We gather your business information and determine your authority needs.',
    },
    {
      title: 'Identify Authority Steps',
      description: 'We determine the applications and filings required for your operation.',
    },
    {
      title: 'Coordinate & File',
      description: 'All In One prepares and coordinates the required filing process.',
    },
    {
      title: 'Track & Communicate',
      description: 'Monitor progress and outstanding requirements with clear updates.',
    },
    {
      title: 'Authority Complete',
      description: 'Transition into ongoing compliance and maintenance where applicable.',
    },
  ],
};

export const mobileServiceFaqBySlug: Record<string, { question: string; answer: string }[]> = {
  'operating-authority-assistance': [
    {
      question: 'Will I receive authority immediately?',
      answer: 'No — agency processing times apply and vary by application type and FMCSA workload.',
    },
    {
      question: 'What information do I need?',
      answer: 'Business entity details, operating profile, insurance information, and supporting documents depending on your situation.',
    },
    {
      question: 'How long can the process take?',
      answer: 'Timelines vary. All In One tracks filings and communicates status — external agency processing is outside our control.',
    },
    {
      question: 'Can All In One help maintain my authority?',
      answer: 'Yes — related compliance, renewal, and maintenance services are available through your Road Ready roadmap.',
    },
  ],
};

export const mobileServiceHeroIconBySlug: Record<string, string> = {
  'operating-authority-assistance': aioComplianceIcons.operatingAuthority,
  'boc-3-assistance': aioComplianceIcons.boc3,
  'llc-formation-assistance': aioComplianceIcons.companyFormation,
  'usdot-registration': aioComplianceIcons.operatingAuthority,
};

export const mobileServiceCategoryLabel: Record<string, string> = {
  permitting: 'Permits & Compliance',
  'business-formation': 'Start My Business',
  insurance: 'Trucking Insurance',
  dispatching: 'Dispatch',
  factoring: 'Get Paid Faster',
  bookkeeping: 'Bookkeeping',
  brokerage: 'Move Freight',
  safety: 'Safety & Compliance',
  financial: 'Financial Services',
};

export function resolveMobileServiceBenefits(slug: string): MobileServiceBenefit[] {
  return mobileServiceBenefitsBySlug[slug] ?? DEFAULT_BENEFITS;
}

export function resolveMobileServiceProcess(
  slug: string,
  fallbackProcess: string[],
  fallbackDescription: string,
): MobileServiceProcessStep[] {
  const override = mobileServiceProcessBySlug[slug];
  if (override) return override;
  return fallbackProcess.map((title, index) => ({
    title,
    description: index === 0 ? fallbackDescription : 'All In One coordinates this step with your business profile.',
  }));
}

export function resolveMobileServiceFaq(
  slug: string,
  fallback: { question: string; answer: string }[],
): { question: string; answer: string }[] {
  const override = mobileServiceFaqBySlug[slug];
  if (override?.length) return override;
  return fallback;
}

export function resolveMobileServiceHeroIcon(slug: string, division: string): string | undefined {
  return mobileServiceHeroIconBySlug[slug] ?? (division === 'bookkeeping' ? aioPlatformIcons.bookkeeping : undefined);
}
