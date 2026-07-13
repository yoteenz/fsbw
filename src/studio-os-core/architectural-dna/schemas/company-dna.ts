export const COMPANY_DNA_VERSION = 'company-dna.v1' as const;

export type CompanyDnaProfile = {
  companyDnaVersion: typeof COMPANY_DNA_VERSION;
  organizationId: string;
  organizationName: string;
  logoAssetPath: string | null;
  brandMarble: string;
  accentColor: string;
  secondaryAccents: string[];
  materialOverrides: string[];
  brandInjectionPrompt: string;
  forbiddenBrandSubstitutions: string[];
  historyContext: string | null;
  futureAssetSlots: string[];
};
