/** Future insurance partner integration — manual coordination in Sprint 11. */

export interface InsurancePartnerAdapterRequirements {
  requiredDocuments: string[];
  requiredFields: string[];
}

export interface InsuranceReferralPayload {
  requestId: string;
  organizationId: string;
  partnerId: string;
}

export interface InsurancePartnerAdapter {
  getRequirements(partnerId: string): InsurancePartnerAdapterRequirements;
  createReferral(payload: InsuranceReferralPayload): { ok: boolean; externalReference?: string };
  submitApplication?(): never;
  getQuoteStatus?(): never;
  getPolicyStatus?(): never;
  requestCertificate?(): never;
}

export const manualInsurancePartnerAdapter: InsurancePartnerAdapter = {
  getRequirements: () => ({
    requiredDocuments: ['Certificate of Insurance', 'Policy Document'],
    requiredFields: ['usdot', 'fleet_schedule', 'operations_profile'],
  }),
  createReferral: (payload) => ({
    ok: true,
    externalReference: `MANUAL-REF-${payload.requestId.slice(0, 8).toUpperCase()}`,
  }),
};
