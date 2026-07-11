import type { TrustAgreement } from './types';

export const TRUST_AGREEMENTS: TrustAgreement[] = [
  {
    id: 'confidentiality_nda',
    title: 'Confidentiality Agreement (NDA)',
    subtitle: 'Protects your proprietary information during capture and storage.',
    placeholderText:
      'Legal text placeholder. This agreement defines confidential information, permitted use, disclosure restrictions, and duration. Final language will be attorney-reviewed.',
    required: true,
  },
  {
    id: 'intellectual_property',
    title: 'Intellectual Property Ownership',
    subtitle: 'Knowledge ownership, rights retained, rights licensed, and training permissions.',
    placeholderText:
      'Legal text placeholder. Expert retains ownership of proprietary methods. Studio receives a limited license to store, organize, and train authorized workers only. Final language will be attorney-reviewed.',
    required: true,
  },
  {
    id: 'training_license',
    title: 'Training License',
    subtitle: 'Studio may train ONLY approved workers for your organization.',
    placeholderText:
      'Legal text placeholder. No unauthorized sharing, no cross-client learning, no resale, no redistribution. Worker isolation is enforced by organization boundary. Final language will be attorney-reviewed.',
    required: true,
  },
  {
    id: 'privacy_policy',
    title: 'Privacy Policy',
    subtitle: 'Recording, storage, processing, retention, and deletion.',
    placeholderText:
      'Legal text placeholder. Describes what is recorded, how long data is retained, encryption practices, and deletion rights. Final language will be attorney-reviewed.',
    required: true,
  },
  {
    id: 'expert_consent',
    title: 'Expert Consent',
    subtitle: 'I understand how my knowledge will be used.',
    placeholderText:
      'Legal text placeholder. Expert acknowledges the capture process, approval gates, audit trail, and worker training scope. Final language will be attorney-reviewed.',
    required: true,
  },
];
