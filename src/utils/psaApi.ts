import { getAccessToken } from './api';
import { isSignedIn } from './adminAuth';

export type PsaClientAction =
  | { type: 'sync_cart' }
  | { type: 'navigate'; path: string };

export type PsaChatResult =
  | {
      ok: true;
      reply: string;
      responseId: string | null;
      threadId: string | null;
      model: string;
      clientActions?: PsaClientAction[];
    }
  | {
      ok: false;
      code: 'SIGN_IN_REQUIRED' | 'PREMIUM_REQUIRED' | 'PSA_LIMIT_REACHED' | 'NETWORK' | 'SERVER';
      message: string;
      usage?: PsaUsagePayload;
      retryAfterSec?: number;
    };

export type PsaThreadSummary = {
  id: string;
  title: string | null;
  updatedAt: string;
  preview: string | null;
};

export type PsaStoredMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: string;
};

export type PsaThreadLoadResult =
  | {
      ok: true;
      threadId: string | null;
      lastResponseId: string | null;
      title: string | null;
      messages: PsaStoredMessage[];
      historyAvailable: boolean;
    }
  | { ok: false; code: 'SIGN_IN_REQUIRED' | 'PREMIUM_REQUIRED' | 'NETWORK' | 'SERVER'; message: string };

export type PsaThreadsListResult =
  | { ok: true; threads: PsaThreadSummary[] }
  | { ok: false; code: 'SIGN_IN_REQUIRED' | 'PREMIUM_REQUIRED' | 'NETWORK' | 'SERVER'; message: string };

export type PsaNewThreadResult =
  | { ok: true; threadId: string }
  | { ok: false; code: 'SIGN_IN_REQUIRED' | 'PREMIUM_REQUIRED' | 'NETWORK' | 'SERVER'; message: string };

export type PsaUsagePayload = {
  monthCount: number;
  monthLimit: number;
  dayCount: number;
  dayLimit: number;
  tierKey?: string;
  tierLabel?: string;
  unlimited?: boolean;
};

export type PsaUsageResult =
  | { ok: true; usage: PsaUsagePayload; monthRemaining: number; dayRemaining: number }
  | { ok: false; code: 'SIGN_IN_REQUIRED' | 'PREMIUM_REQUIRED' | 'NETWORK' | 'SERVER'; message: string };

const API_BASE =
  (import.meta as unknown as { env?: { VITE_API_BASE?: string } }).env?.VITE_API_BASE ?? '';

async function refreshSupabaseSessionOnce(): Promise<void> {
  try {
    const supabase = (await import('./supabase')).getSupabase();
    if (!supabase) return;
    await supabase.auth.refreshSession();
  } catch {
    /* ignore */
  }
}

function sessionExpiredMessage(): string {
  if (isSignedIn()) {
    return 'Your session expired. Sign out and sign back in, or open Account → Settings and tap Sync my account, then try PSA again.';
  }
  return 'Sign in to chat with PSA.';
}

async function getPsaAuthToken(): Promise<string | null> {
  let token = await getAccessToken();
  if (!token) {
    await refreshSupabaseSessionOnce();
    token = await getAccessToken();
  }
  return token;
}

async function psaAuthedFetch(path: string, init: RequestInit = {}): Promise<Response | null> {
  const token = await getPsaAuthToken();
  if (!token) return null;
  const url = `${API_BASE.replace(/\/$/, '')}${path}`;
  let res = await fetch(url, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.status === 401) {
    await refreshSupabaseSessionOnce();
    const retryToken = await getAccessToken();
    if (retryToken) {
      res = await fetch(url, {
        ...init,
        headers: {
          ...(init.headers ?? {}),
          Authorization: `Bearer ${retryToken}`,
        },
      });
    }
  }
  return res;
}

async function postPsaChatOnce(
  message: string,
  options: { previousResponseId?: string | null; threadId?: string | null; newThread?: boolean },
  token: string
): Promise<Response> {
  const url = `${API_BASE.replace(/\/$/, '')}/api/psa/chat`;
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      message,
      previousResponseId: options.previousResponseId ?? undefined,
      threadId: options.threadId ?? undefined,
      newThread: options.newThread === true ? true : undefined,
    }),
  });
}

export async function postPsaChat(
  message: string,
  options?: {
    previousResponseId?: string | null;
    threadId?: string | null;
    newThread?: boolean;
  }
): Promise<PsaChatResult> {
  const token = await getPsaAuthToken();
  if (!token) {
    return { ok: false, code: 'SIGN_IN_REQUIRED', message: sessionExpiredMessage() };
  }

  const opts = options ?? {};

  let res: Response;
  try {
    res = await postPsaChatOnce(message, opts, token);
    if (res.status === 401) {
      await refreshSupabaseSessionOnce();
      const retryToken = await getAccessToken();
      if (retryToken) {
        res = await postPsaChatOnce(message, opts, retryToken);
      }
    }
  } catch {
    return {
      ok: false,
      code: 'NETWORK',
      message: 'Could not reach PSA. Check your connection and try again.',
    };
  }

  let data: {
    error?: string;
    code?: string;
    reply?: string;
    responseId?: string | null;
    threadId?: string | null;
    model?: string;
    clientActions?: PsaClientAction[];
    usage?: PsaUsagePayload;
    retryAfterSec?: number;
  };
  try {
    data = (await res.json()) as typeof data;
  } catch {
    return { ok: false, code: 'SERVER', message: 'PSA returned an invalid response.' };
  }

  if (res.status === 401) {
    return {
      ok: false,
      code: 'SIGN_IN_REQUIRED',
      message: sessionExpiredMessage(),
    };
  }
  if (res.status === 403 || data.code === 'PREMIUM_REQUIRED') {
    return {
      ok: false,
      code: 'PREMIUM_REQUIRED',
      message:
        data.error ||
        'Premium membership required for PSA. Open Account → Rewards to confirm your subscription, then tap Sync my account in Settings.',
    };
  }
  if (res.status === 429 || data.code === 'PSA_LIMIT_REACHED') {
    const usage = data.usage as PsaUsagePayload | undefined;
    return {
      ok: false,
      code: 'PSA_LIMIT_REACHED',
      message:
        data.error ||
        'You have reached your PSA message limit for your membership plan. Limits reset automatically.',
      usage,
      retryAfterSec: typeof data.retryAfterSec === 'number' ? data.retryAfterSec : undefined,
    };
  }
  if (!res.ok) {
    return { ok: false, code: 'SERVER', message: data.error || 'PSA is temporarily unavailable.' };
  }

  const reply = typeof data.reply === 'string' ? data.reply : '';
  const clientActions = Array.isArray(data.clientActions) ? data.clientActions : undefined;
  return {
    ok: true,
    reply,
    responseId: data.responseId ?? null,
    threadId: typeof data.threadId === 'string' ? data.threadId : null,
    model: data.model || 'gpt-5.4-mini',
    clientActions,
  };
}

export async function fetchPsaActiveThread(threadId?: string | null): Promise<PsaThreadLoadResult> {
  const query = threadId ? `?threadId=${encodeURIComponent(threadId)}` : '';
  let res: Response | null;
  try {
    res = await psaAuthedFetch(`/api/psa/thread${query}`, { method: 'GET' });
  } catch {
    return { ok: false, code: 'NETWORK', message: 'Could not load PSA chat history.' };
  }
  if (!res) {
    return { ok: false, code: 'SIGN_IN_REQUIRED', message: sessionExpiredMessage() };
  }

  let data: {
    error?: string;
    code?: string;
    threadId?: string | null;
    lastResponseId?: string | null;
    title?: string | null;
    messages?: PsaStoredMessage[];
    historyAvailable?: boolean;
  };
  try {
    data = (await res.json()) as typeof data;
  } catch {
    return { ok: false, code: 'SERVER', message: 'PSA returned an invalid response.' };
  }

  if (res.status === 401) {
    return { ok: false, code: 'SIGN_IN_REQUIRED', message: sessionExpiredMessage() };
  }
  if (res.status === 403 || data.code === 'PREMIUM_REQUIRED') {
    return { ok: false, code: 'PREMIUM_REQUIRED', message: data.error || 'Premium membership required for PSA.' };
  }
  if (!res.ok) {
    return { ok: false, code: 'SERVER', message: data.error || 'Could not load PSA chat history.' };
  }

  return {
    ok: true,
    threadId: data.threadId ?? null,
    lastResponseId: data.lastResponseId ?? null,
    title: data.title ?? null,
    messages: Array.isArray(data.messages) ? data.messages : [],
    historyAvailable: data.historyAvailable !== false,
  };
}

export async function fetchPsaThreadList(): Promise<PsaThreadsListResult> {
  let res: Response | null;
  try {
    res = await psaAuthedFetch('/api/psa/threads', { method: 'GET' });
  } catch {
    return { ok: false, code: 'NETWORK', message: 'Could not load past PSA chats.' };
  }
  if (!res) {
    return { ok: false, code: 'SIGN_IN_REQUIRED', message: sessionExpiredMessage() };
  }

  let data: { error?: string; code?: string; threads?: PsaThreadSummary[] };
  try {
    data = (await res.json()) as typeof data;
  } catch {
    return { ok: false, code: 'SERVER', message: 'PSA returned an invalid response.' };
  }

  if (res.status === 401) {
    return { ok: false, code: 'SIGN_IN_REQUIRED', message: sessionExpiredMessage() };
  }
  if (res.status === 403 || data.code === 'PREMIUM_REQUIRED') {
    return { ok: false, code: 'PREMIUM_REQUIRED', message: data.error || 'Premium membership required for PSA.' };
  }
  if (!res.ok) {
    return { ok: false, code: 'SERVER', message: data.error || 'Could not load past PSA chats.' };
  }

  return { ok: true, threads: Array.isArray(data.threads) ? data.threads : [] };
}

export async function createPsaThread(): Promise<PsaNewThreadResult> {
  let res: Response | null;
  try {
    res = await psaAuthedFetch('/api/psa/threads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
  } catch {
    return { ok: false, code: 'NETWORK', message: 'Could not start a new PSA chat.' };
  }
  if (!res) {
    return { ok: false, code: 'SIGN_IN_REQUIRED', message: sessionExpiredMessage() };
  }

  let data: { error?: string; code?: string; threadId?: string };
  try {
    data = (await res.json()) as typeof data;
  } catch {
    return { ok: false, code: 'SERVER', message: 'PSA returned an invalid response.' };
  }

  if (res.status === 401) {
    return { ok: false, code: 'SIGN_IN_REQUIRED', message: sessionExpiredMessage() };
  }
  if (res.status === 403 || data.code === 'PREMIUM_REQUIRED') {
    return { ok: false, code: 'PREMIUM_REQUIRED', message: data.error || 'Premium membership required for PSA.' };
  }
  if (!res.ok || !data.threadId) {
    return { ok: false, code: 'SERVER', message: data.error || 'Could not start a new PSA chat.' };
  }

  return { ok: true, threadId: data.threadId };
}

export async function fetchPsaUsage(): Promise<PsaUsageResult> {
  let token = await getAccessToken();
  if (!token) {
    await refreshSupabaseSessionOnce();
    token = await getAccessToken();
  }
  if (!token) {
    return { ok: false, code: 'SIGN_IN_REQUIRED', message: sessionExpiredMessage() };
  }

  const url = `${API_BASE.replace(/\/$/, '')}/api/psa/usage`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    return {
      ok: false,
      code: 'NETWORK',
      message: 'Could not load PSA usage. Check your connection and try again.',
    };
  }

  let data: {
    error?: string;
    code?: string;
    usage?: PsaUsagePayload;
    monthRemaining?: number;
    dayRemaining?: number;
  };
  try {
    data = (await res.json()) as typeof data;
  } catch {
    return { ok: false, code: 'SERVER', message: 'PSA returned an invalid response.' };
  }

  if (res.status === 401) {
    return { ok: false, code: 'SIGN_IN_REQUIRED', message: sessionExpiredMessage() };
  }
  if (res.status === 403 || data.code === 'PREMIUM_REQUIRED') {
    return {
      ok: false,
      code: 'PREMIUM_REQUIRED',
      message: data.error || 'Premium membership required for PSA.',
    };
  }
  if (!res.ok || !data.usage) {
    return { ok: false, code: 'SERVER', message: data.error || 'Could not load PSA usage.' };
  }

  return {
    ok: true,
    usage: data.usage,
    monthRemaining: Number(data.monthRemaining ?? 0),
    dayRemaining: Number(data.dayRemaining ?? 0),
  };
}
