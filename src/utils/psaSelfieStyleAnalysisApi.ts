import { getPsaAuthToken, psaAuthedFetch, psaSessionExpiredMessage } from './psaApi';
import type { PsaSelfieStyleAnalysisResult } from '../types/styleAnalysis';

export type PsaSelfieStyleAnalysisResponse =
  | { ok: true; result: PsaSelfieStyleAnalysisResult }
  | {
      ok: false;
      code?: 'SIGN_IN_REQUIRED' | 'PREMIUM_REQUIRED' | 'NETWORK' | 'SERVER';
      message: string;
    };

export async function postPsaSelfieStyleAnalysis(
  selfieDataUrl: string
): Promise<PsaSelfieStyleAnalysisResponse> {
  const token = await getPsaAuthToken();
  if (!token) {
    return {
      ok: false,
      code: 'SIGN_IN_REQUIRED',
      message: psaSessionExpiredMessage(),
    };
  }

  try {
    const res = await psaAuthedFetch('/api/psa/selfie-style-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ selfieDataUrl }),
    });
    if (!res) {
      return {
        ok: false,
        code: 'SIGN_IN_REQUIRED',
        message: psaSessionExpiredMessage(),
      };
    }

    const data = (await res.json()) as PsaSelfieStyleAnalysisResponse & { code?: string };
    if (res.status === 401) {
      return {
        ok: false,
        code: 'SIGN_IN_REQUIRED',
        message: psaSessionExpiredMessage(),
      };
    }
    if (!res.ok) {
      const code = (data as { code?: string }).code;
      return {
        ok: false,
        code:
          code === 'SIGN_IN_REQUIRED' || code === 'PREMIUM_REQUIRED' || code === 'NETWORK'
            ? code
            : 'SERVER',
        message: (data as { message?: string }).message || `HTTP ${res.status}`,
      };
    }
    if (!data.ok || !('result' in data)) {
      return { ok: false, code: 'SERVER', message: 'Unexpected response from style analysis.' };
    }
    return data;
  } catch (e) {
    return {
      ok: false,
      code: 'NETWORK',
      message: e instanceof Error ? e.message : 'Network error',
    };
  }
}
