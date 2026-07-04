import type { CertificationType, PolicyCategory, VerificationType } from './types';

export const GOVERNANCE_STORAGE_KEY = 'studioOsGovernance_v1';
export const GOVERNANCE_VERSION = 1;

export const VERIFICATION_TYPE_LABELS: Record<VerificationType, string> = {
  identity: 'Identity Verification',
  business: 'Business Verification',
  workspace: 'Workspace Verification',
  creator: 'Creator Verification',
  enterprise: 'Enterprise Verification',
  portfolio: 'Portfolio Verification',
  agency: 'Agency Verification',
  developer: 'Developer Verification',
  professional: 'Professional Certification',
};

export const CERTIFICATION_TYPE_LABELS: Record<CertificationType, string> = {
  'studio-os-consultant': 'Certified Studio OS Consultant',
  'blueprint-architect': 'Certified Blueprint Architect',
  'automation-engineer': 'Certified Automation Engineer',
  'creative-dna-designer': 'Certified Creative DNA Designer',
  'executive-ai-designer': 'Certified Executive AI Designer',
  'implementation-partner': 'Certified Implementation Partner',
  'enterprise-advisor': 'Certified Enterprise Advisor',
};

export const POLICY_CATEGORY_LABELS: Record<PolicyCategory, string> = {
  terms: 'Terms of Service',
  'community-guidelines': 'Community Guidelines',
  'marketplace-rules': 'Marketplace Rules',
  'ai-policies': 'AI Policies',
  privacy: 'Privacy Policies',
  licensing: 'Licensing',
  developer: 'Developer Policies',
  partner: 'Partner Policies',
};
