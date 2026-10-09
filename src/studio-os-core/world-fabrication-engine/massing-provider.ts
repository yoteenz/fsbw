import type { MassingProviderRole } from './types';

export type MassingProviderCandidate = {
  provider: 'ARTLIST';
  role: MassingProviderRole;
  modelId: string;
  label: string;
  notes: string;
};

/** Availability/pricing must be verified at execution time — not hardcoded credits. */
export const MASSING_PROVIDER_CANDIDATES: MassingProviderCandidate[] = [
  {
    provider: 'ARTLIST',
    role: 'MASSING_PROVIDER',
    modelId: 'hyper3d-rodin-v2.5-fast',
    label: 'Hyper3D Rodin v2.5 Fast',
    notes: 'Observed in SITE 00 Build Object experiment — massing only',
  },
  {
    provider: 'ARTLIST',
    role: 'MASSING_PROVIDER',
    modelId: 'tripo-h3.1',
    label: 'Tripo H3.1',
    notes: 'Candidate — verify availability at execution',
  },
  {
    provider: 'ARTLIST',
    role: 'MASSING_PROVIDER',
    modelId: 'hunyuan-3d-v3.1-pro',
    label: 'Hunyuan 3D v3.1 Pro',
    notes: 'Candidate — verify availability at execution',
  },
  {
    provider: 'ARTLIST',
    role: 'MASSING_PROVIDER',
    modelId: 'meshy-v7',
    label: 'Meshy v7',
    notes: 'Candidate — verify availability at execution',
  },
];

export type MassingGenerationRequest = {
  manifestId: string;
  authorityId: string;
  provider: 'ARTLIST';
  modelId: string;
  inputImageRef: string;
  paidExecutionAuthorized: boolean;
};

export function validateMassingRequest(req: MassingGenerationRequest): string[] {
  const errors: string[] = [];
  if (!req.paidExecutionAuthorized) {
    errors.push('Paid massing generation blocked — allowPaidGeneration must be true with budget approval');
  }
  if (!req.inputImageRef) errors.push('Massing requires approved reference image');
  if (!MASSING_PROVIDER_CANDIDATES.some((c) => c.modelId === req.modelId)) {
    errors.push('Unknown massing model — register after live provider inspection');
  }
  return errors;
}
