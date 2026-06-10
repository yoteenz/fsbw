import { getAccessToken } from './api';
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
  const token = await getAccessToken();
  if (!token) {
    return { ok: false, code: 'SIGN_IN_REQUIRED', message: 'Sign in to use PSA style analysis.' };
  }

  const env = (import.meta as unknown as { env?: { VITE_API_BASE?: string } }).env;
  const base = (env?.VITE_API_BASE || '').replace(/\/$/, '');
  const url = base ? `${base}/api/psa/selfie-style-analysis` : '/api/psa/selfie-style-analysis';

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ selfieDataUrl }),
    });
    const data = (await res.json()) as PsaSelfieStyleAnalysisResponse & { code?: string };
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
