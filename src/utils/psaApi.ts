import { getAccessToken } from './api';
import { isSignedIn } from './adminAuth';
import type { PsaBawPrefillSelections } from './psaBawPrefill';
import type { PsaClientSessionContext } from './psaSessionContext';
import { formatPsaVoiceText } from './psaVoiceFormat';

export type PsaClientAction =
  | { type: 'sync_cart' }
  | { type: 'navigate'; path: string }
  | {
      type: 'prefill_baw';
      unitId: string;
      path?: string;
      selections?: PsaBawPrefillSelections;
    }
  | {
      type: 'save_baw_draft';
      unitId: string;
      path?: string;
      selections?: PsaBawPrefillSelections;
      label?: string;
    };

export type PsaChatCard =
  | {
      type: 'product';
      name: string;
      startingPriceUsd?: number | null;
      path: string;
      buildAWigPath: string;
      summary?: string;
    }
  | { type: 'nav'; label: string; path: string; description?: string }
  | { type: 'order'; orderNumber: string; status?: string; path: string; note?: string }
  | { type: 'action'; label: string; path: string };

export type PsaChatResult =
  | {
      ok: true;
      reply: string;
      quickReplies?: string[];
      cards?: PsaChatCard[];
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
  archived?: boolean;
  threadSummary?: string | null;
};

export type PsaStoredMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: string;
};

export type PsaContinueHint = {
  threadId: string;
  title: string;
  messageCount: number;
  updatedAt: string;
};

export type PsaMemberContextPayload = {
  slayArchetype?: string | null;
  purchaseContexts?: {
    id: string;
    occasion: string;
    monthYear?: string;
    orderNumber?: string;
    unitName?: string;
    unitId?: string;
    createdAt: string;
  }[];
  refreshedAt?: string;
};

export type PsaThreadLoadResult =
  | {
      ok: true;
      threadId: string | null;
      lastResponseId: string | null;
      title: string | null;
      messages: PsaStoredMessage[];
      historyAvailable: boolean;
      continueHint?: PsaContinueHint | null;
      memberContext?: PsaMemberContextPayload | null;
    }
  | { ok: false; code: 'SIGN_IN_REQUIRED' | 'PREMIUM_REQUIRED' | 'NETWORK' | 'SERVER'; message: string };

export type PsaSlayIdentityResult =
  | {
      ok: true;
      slayArchetype: string;
      memberContext?: PsaMemberContextPayload | null;
    }
  | { ok: false; code: 'SIGN_IN_REQUIRED' | 'PREMIUM_REQUIRED' | 'NETWORK' | 'SERVER'; message: string };

export type PsaThreadMutationResult =
  | { ok: true }
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

function psaNonJsonErrorMessage(res: Response, bodyPreview: string): string {
  const status = res.status;
  const preview = bodyPreview.trim();
  const looksLikeHtml = preview.startsWith('<');
  if (
    preview.includes('FUNCTION_INVOCATION_FAILED') ||
    preview.includes('A server error has occurred')
  ) {
    return 'PSA could not start on the server. Try again in a moment — if this keeps happening, the site may need a redeploy.';
  }
  if (status === 504 || status === 502 || (status >= 500 && looksLikeHtml)) {
    return 'PSA took too long to respond. Try a shorter question or ask again in a moment.';
  }
  if (status === 503) {
    return 'PSA is temporarily unavailable. Try again in a moment.';
  }
  if (!preview) {
    return 'PSA returned an empty response. Try again in a moment.';
  }
  return 'PSA returned an unexpected response. Try again in a moment.';
}

async function parsePsaJsonBody<T>(res: Response): Promise<
  | { ok: true; data: T }
  | { ok: false; message: string }
> {
  let text = '';
  try {
    text = await res.text();
  } catch {
    return { ok: false, message: 'Could not read PSA response. Check your connection and try again.' };
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return { ok: false, message: psaNonJsonErrorMessage(res, trimmed) };
  }

  try {
    return { ok: true, data: JSON.parse(trimmed) as T };
  } catch {
    return { ok: false, message: psaNonJsonErrorMessage(res, trimmed.slice(0, 80)) };
  }
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
  options: {
    previousResponseId?: string | null;
    threadId?: string | null;
    newThread?: boolean;
    context?: PsaClientSessionContext;
  },
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
      context: options.context ?? undefined,
    }),
  });
}

export async function postPsaChat(
  message: string,
  options?: {
    previousResponseId?: string | null;
    threadId?: string | null;
    newThread?: boolean;
    context?: PsaClientSessionContext;
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

  const parsed = await parsePsaJsonBody<{
    error?: string;
    code?: string;
    reply?: string;
    quickReplies?: string[];
    cards?: PsaChatCard[];
    responseId?: string | null;
    threadId?: string | null;
    model?: string;
    clientActions?: PsaClientAction[];
    usage?: PsaUsagePayload;
    retryAfterSec?: number;
  }>(res);
  if (!parsed.ok) {
    return { ok: false, code: 'SERVER', message: parsed.message };
  }
  const data = parsed.data;

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

  const reply =
    typeof data.reply === 'string' ? formatPsaVoiceText(data.reply.trim()) : '';
  if (!reply) {
    return {
      ok: false,
      code: 'SERVER',
      message:
        'PSA had trouble forming a reply. Ask again in a second, or open Build-a-Wig for live pricing on your unit.',
    };
  }
  const clientActions = Array.isArray(data.clientActions) ? data.clientActions : undefined;
  const quickReplies = Array.isArray(data.quickReplies)
    ? data.quickReplies
        .filter((q): q is string => typeof q === 'string' && q.trim().length > 0)
        .slice(0, 4)
        .map((q) => formatPsaVoiceText(q, { stripGreeting: false }))
    : undefined;
  const cards = Array.isArray(data.cards) ? data.cards : undefined;
  return {
    ok: true,
    reply,
    quickReplies,
    cards,
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

  const parsed = await parsePsaJsonBody<{
    error?: string;
    code?: string;
    threadId?: string | null;
    lastResponseId?: string | null;
    title?: string | null;
    messages?: PsaStoredMessage[];
    historyAvailable?: boolean;
    continueHint?: PsaContinueHint | null;
    memberContext?: PsaMemberContextPayload | null;
  }>(res);
  if (!parsed.ok) {
    return { ok: false, code: 'SERVER', message: parsed.message };
  }
  const data = parsed.data;

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
    continueHint: data.continueHint ?? null,
    memberContext: data.memberContext ?? null,
  };
}

export type PsaPurchaseContextResult =
  | { ok: true; occasion: string; memberContext?: PsaMemberContextPayload | null }
  | { ok: false; code: 'SIGN_IN_REQUIRED' | 'PREMIUM_REQUIRED' | 'NETWORK' | 'SERVER'; message: string };

export async function postPsaPurchaseContext(input: {
  occasion: string;
  monthYear?: string;
  orderNumber?: string;
  unitName?: string;
  unitId?: string;
}): Promise<PsaPurchaseContextResult> {
  let res: Response | null;
  try {
    res = await psaAuthedFetch('/api/psa/purchase-context', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  } catch {
    return { ok: false, code: 'NETWORK', message: 'Could not save your purchase context.' };
  }
  if (!res) {
    return { ok: false, code: 'SIGN_IN_REQUIRED', message: sessionExpiredMessage() };
  }

  const parsed = await parsePsaJsonBody<{
    error?: string;
    code?: string;
    occasion?: string;
    memberContext?: PsaMemberContextPayload | null;
  }>(res);
  if (!parsed.ok) {
    return { ok: false, code: 'SERVER', message: parsed.message };
  }
  const data = parsed.data;

  if (res.status === 401) {
    return { ok: false, code: 'SIGN_IN_REQUIRED', message: sessionExpiredMessage() };
  }
  if (res.status === 403 || data.code === 'PREMIUM_REQUIRED') {
    return { ok: false, code: 'PREMIUM_REQUIRED', message: data.error || 'Premium required.' };
  }
  if (!res.ok || !data.occasion) {
    return { ok: false, code: 'SERVER', message: data.error || 'Could not save your purchase context.' };
  }

  return {
    ok: true,
    occasion: data.occasion,
    memberContext: data.memberContext ?? null,
  };
}

export async function postPsaSlayIdentity(archetype: string): Promise<PsaSlayIdentityResult> {
  let res: Response | null;
  try {
    res = await psaAuthedFetch('/api/psa/slay-identity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archetype }),
    });
  } catch {
    return { ok: false, code: 'NETWORK', message: 'Could not save your Slay Archetype.' };
  }
  if (!res) {
    return { ok: false, code: 'SIGN_IN_REQUIRED', message: sessionExpiredMessage() };
  }

  const parsed = await parsePsaJsonBody<{
    error?: string;
    code?: string;
    slayArchetype?: string;
    memberContext?: PsaMemberContextPayload | null;
  }>(res);
  if (!parsed.ok) {
    return { ok: false, code: 'SERVER', message: parsed.message };
  }
  const data = parsed.data;

  if (res.status === 401) {
    return { ok: false, code: 'SIGN_IN_REQUIRED', message: sessionExpiredMessage() };
  }
  if (res.status === 403 || data.code === 'PREMIUM_REQUIRED') {
    return { ok: false, code: 'PREMIUM_REQUIRED', message: data.error || 'Premium required.' };
  }
  if (!res.ok || !data.slayArchetype) {
    return { ok: false, code: 'SERVER', message: data.error || 'Could not save your Slay Archetype.' };
  }

  return {
    ok: true,
    slayArchetype: data.slayArchetype,
    memberContext: data.memberContext ?? null,
  };
}

export async function archivePsaThread(threadId: string): Promise<PsaThreadMutationResult> {
  let res: Response | null;
  try {
    res = await psaAuthedFetch(`/api/psa/thread?threadId=${encodeURIComponent(threadId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId, archive: true }),
    });
  } catch {
    return { ok: false, code: 'NETWORK', message: 'Could not archive PSA chat.' };
  }
  if (!res) {
    return { ok: false, code: 'SIGN_IN_REQUIRED', message: sessionExpiredMessage() };
  }
  const parsed = await parsePsaJsonBody<{ error?: string; code?: string }>(res);
  if (!parsed.ok) {
    return { ok: false, code: 'SERVER', message: parsed.message };
  }
  if (res.status === 401) {
    return { ok: false, code: 'SIGN_IN_REQUIRED', message: sessionExpiredMessage() };
  }
  if (res.status === 403 || parsed.data.code === 'PREMIUM_REQUIRED') {
    return { ok: false, code: 'PREMIUM_REQUIRED', message: parsed.data.error || 'Premium required.' };
  }
  if (!res.ok) {
    return { ok: false, code: 'SERVER', message: parsed.data.error || 'Could not archive PSA chat.' };
  }
  return { ok: true };
}

export async function renamePsaThread(threadId: string, title: string): Promise<PsaThreadMutationResult> {
  let res: Response | null;
  try {
    res = await psaAuthedFetch(`/api/psa/thread?threadId=${encodeURIComponent(threadId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId, title }),
    });
  } catch {
    return { ok: false, code: 'NETWORK', message: 'Could not rename PSA chat.' };
  }
  if (!res) {
    return { ok: false, code: 'SIGN_IN_REQUIRED', message: sessionExpiredMessage() };
  }
  const parsed = await parsePsaJsonBody<{ error?: string; code?: string }>(res);
  if (!parsed.ok) {
    return { ok: false, code: 'SERVER', message: parsed.message };
  }
  if (res.status === 401) {
    return { ok: false, code: 'SIGN_IN_REQUIRED', message: sessionExpiredMessage() };
  }
  if (res.status === 403 || parsed.data.code === 'PREMIUM_REQUIRED') {
    return { ok: false, code: 'PREMIUM_REQUIRED', message: parsed.data.error || 'Premium required.' };
  }
  if (!res.ok) {
    return { ok: false, code: 'SERVER', message: parsed.data.error || 'Could not rename PSA chat.' };
  }
  return { ok: true };
}

export async function deletePsaThread(threadId: string): Promise<PsaThreadMutationResult> {
  let res: Response | null;
  try {
    res = await psaAuthedFetch(`/api/psa/thread?threadId=${encodeURIComponent(threadId)}`, {
      method: 'DELETE',
    });
  } catch {
    return { ok: false, code: 'NETWORK', message: 'Could not delete PSA chat.' };
  }
  if (!res) {
    return { ok: false, code: 'SIGN_IN_REQUIRED', message: sessionExpiredMessage() };
  }
  const parsed = await parsePsaJsonBody<{ error?: string; code?: string }>(res);
  if (!parsed.ok) {
    return { ok: false, code: 'SERVER', message: parsed.message };
  }
  if (res.status === 401) {
    return { ok: false, code: 'SIGN_IN_REQUIRED', message: sessionExpiredMessage() };
  }
  if (res.status === 403 || parsed.data.code === 'PREMIUM_REQUIRED') {
    return { ok: false, code: 'PREMIUM_REQUIRED', message: parsed.data.error || 'Premium required.' };
  }
  if (!res.ok) {
    return { ok: false, code: 'SERVER', message: parsed.data.error || 'Could not delete PSA chat.' };
  }
  return { ok: true };
}

export async function unarchivePsaThread(threadId: string): Promise<PsaThreadMutationResult> {
  let res: Response | null;
  try {
    res = await psaAuthedFetch(`/api/psa/thread?threadId=${encodeURIComponent(threadId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId, unarchive: true }),
    });
  } catch {
    return { ok: false, code: 'NETWORK', message: 'Could not restore PSA chat.' };
  }
  if (!res) {
    return { ok: false, code: 'SIGN_IN_REQUIRED', message: sessionExpiredMessage() };
  }
  const parsed = await parsePsaJsonBody<{ error?: string; code?: string }>(res);
  if (!parsed.ok) {
    return { ok: false, code: 'SERVER', message: parsed.message };
  }
  if (res.status === 401) {
    return { ok: false, code: 'SIGN_IN_REQUIRED', message: sessionExpiredMessage() };
  }
  if (res.status === 403 || parsed.data.code === 'PREMIUM_REQUIRED') {
    return { ok: false, code: 'PREMIUM_REQUIRED', message: parsed.data.error || 'Premium required.' };
  }
  if (!res.ok) {
    return { ok: false, code: 'SERVER', message: parsed.data.error || 'Could not restore PSA chat.' };
  }
  return { ok: true };
}

export async function fetchPsaThreadList(options?: { archivedOnly?: boolean }): Promise<PsaThreadsListResult> {
  let res: Response | null;
  const query = options?.archivedOnly ? '?archivedOnly=1' : '';
  try {
    res = await psaAuthedFetch(`/api/psa/threads${query}`, { method: 'GET' });
  } catch {
    return { ok: false, code: 'NETWORK', message: 'Could not load past PSA chats.' };
  }
  if (!res) {
    return { ok: false, code: 'SIGN_IN_REQUIRED', message: sessionExpiredMessage() };
  }

  const parsed = await parsePsaJsonBody<{ error?: string; code?: string; threads?: PsaThreadSummary[] }>(res);
  if (!parsed.ok) {
    return { ok: false, code: 'SERVER', message: parsed.message };
  }
  const data = parsed.data;

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

  const parsed = await parsePsaJsonBody<{ error?: string; code?: string; threadId?: string }>(res);
  if (!parsed.ok) {
    return { ok: false, code: 'SERVER', message: parsed.message };
  }
  const data = parsed.data;

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

  const parsed = await parsePsaJsonBody<{
    error?: string;
    code?: string;
    usage?: PsaUsagePayload;
    monthRemaining?: number;
    dayRemaining?: number;
  }>(res);
  if (!parsed.ok) {
    return { ok: false, code: 'SERVER', message: parsed.message };
  }
  const data = parsed.data;

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
