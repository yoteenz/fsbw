import { getAccessToken } from './api';

const API_BASE =
  (import.meta as unknown as { env?: { VITE_API_BASE?: string } }).env?.VITE_API_BASE ?? '';

export type PsaChatResult =
  | { ok: true; reply: string; responseId: string | null; model: string }
  | { ok: false; code: 'SIGN_IN_REQUIRED' | 'PREMIUM_REQUIRED' | 'NETWORK' | 'SERVER'; message: string };

export async function postPsaChat(
  message: string,
  previousResponseId?: string | null
): Promise<PsaChatResult> {
  const token = await getAccessToken();
  if (!token) {
    return { ok: false, code: 'SIGN_IN_REQUIRED', message: 'Sign in to chat with PSA.' };
  }

  const url = `${API_BASE.replace(/\/$/, '')}/api/psa/chat`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message,
        previousResponseId: previousResponseId ?? undefined,
      }),
    });
  } catch {
    return {
      ok: false,
      code: 'NETWORK',
      message: 'Could not reach PSA. Check your connection and try again.',
    };
  }

  let data: { error?: string; code?: string; reply?: string; responseId?: string | null; model?: string };
  try {
    data = (await res.json()) as typeof data;
  } catch {
    return { ok: false, code: 'SERVER', message: 'PSA returned an invalid response.' };
  }

  if (res.status === 401) {
    return { ok: false, code: 'SIGN_IN_REQUIRED', message: data.error || 'Sign in to chat with PSA.' };
  }
  if (res.status === 403 || data.code === 'PREMIUM_REQUIRED') {
    return {
      ok: false,
      code: 'PREMIUM_REQUIRED',
      message: data.error || 'Premium membership required for PSA.',
    };
  }
  if (!res.ok) {
    return { ok: false, code: 'SERVER', message: data.error || 'PSA is temporarily unavailable.' };
  }

  const reply = typeof data.reply === 'string' ? data.reply : '';
  return {
    ok: true,
    reply,
    responseId: data.responseId ?? null,
    model: data.model || 'gpt-5.4-mini',
  };
}
