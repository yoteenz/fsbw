/**
 * PSA chat thread persistence (Supabase).
 * Writes use service role from API routes after auth check.
 */
import { getSupabaseAdminServiceRole, hasSupabaseServiceRole } from './supabase.js';

export type PsaThreadRow = {
  id: string;
  user_id: string;
  title: string | null;
  last_openai_response_id: string | null;
  archived_at: string | null;
  thread_summary: string | null;
  created_at: string;
  updated_at: string;
};

export type PsaMessageRow = {
  id: string;
  thread_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  openai_response_id: string | null;
  created_at: string;
};

export type PsaThreadSummary = {
  id: string;
  title: string | null;
  updatedAt: string;
  preview: string | null;
};

const THREAD_LIST_LIMIT = 30;
const MESSAGE_LOAD_LIMIT = 150;

export function threadTitleFromMessage(text: string): string {
  const trimmed = text.replace(/\s+/g, ' ').trim();
  if (!trimmed) return 'PSA CHAT';
  return trimmed.length > 72 ? `${trimmed.slice(0, 69)}…` : trimmed;
}

export function isPsaThreadStoreConfigured(): boolean {
  return hasSupabaseServiceRole();
}

export async function createPsaThread(userId: string, title?: string | null): Promise<PsaThreadRow> {
  const supabase = getSupabaseAdminServiceRole();
  const { data, error } = await supabase
    .from('psa_threads')
    .insert({
      user_id: userId,
      title: title?.trim() || null,
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to create PSA thread');
  }
  return data as PsaThreadRow;
}

export async function getPsaThreadForUser(
  userId: string,
  threadId: string
): Promise<PsaThreadRow | null> {
  const supabase = getSupabaseAdminServiceRole();
  const { data, error } = await supabase
    .from('psa_threads')
    .select('*')
    .eq('id', threadId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as PsaThreadRow | null) ?? null;
}

export async function getLatestPsaThread(userId: string, activeOnly = true): Promise<PsaThreadRow | null> {
  const supabase = getSupabaseAdminServiceRole();
  let query = supabase
    .from('psa_threads')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1);

  if (activeOnly) {
    query = query.is('archived_at', null);
  }

  const { data, error } = await query.maybeSingle();

  if (error) throw new Error(error.message);
  return (data as PsaThreadRow | null) ?? null;
}

export async function listPsaThreads(
  userId: string,
  limit = THREAD_LIST_LIMIT,
  includeArchived = false
): Promise<PsaThreadSummary[]> {
  const supabase = getSupabaseAdminServiceRole();
  let query = supabase
    .from('psa_threads')
    .select('id, title, updated_at, archived_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (!includeArchived) {
    query = query.is('archived_at', null);
  }

  const { data: threads, error } = await query;

  if (error) throw new Error(error.message);
  const rows = (threads ?? []) as { id: string; title: string | null; updated_at: string }[];

  const summaries: PsaThreadSummary[] = [];
  for (const row of rows) {
    const { data: previewMsg } = await supabase
      .from('psa_messages')
      .select('content')
      .eq('thread_id', row.id)
      .eq('role', 'user')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    summaries.push({
      id: row.id,
      title: row.title,
      updatedAt: row.updated_at,
      preview: (previewMsg as { content?: string } | null)?.content?.slice(0, 120) ?? null,
    });
  }

  return summaries;
}

export async function getPsaThreadMessages(
  threadId: string,
  limit = MESSAGE_LOAD_LIMIT
): Promise<PsaMessageRow[]> {
  const supabase = getSupabaseAdminServiceRole();
  const { data, error } = await supabase
    .from('psa_messages')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as PsaMessageRow[];
}

export async function appendPsaMessage(input: {
  threadId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  openaiResponseId?: string | null;
}): Promise<PsaMessageRow> {
  const supabase = getSupabaseAdminServiceRole();
  const { data, error } = await supabase
    .from('psa_messages')
    .insert({
      thread_id: input.threadId,
      role: input.role,
      content: input.content,
      openai_response_id: input.openaiResponseId ?? null,
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to save PSA message');
  }

  await supabase
    .from('psa_threads')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', input.threadId);

  return data as PsaMessageRow;
}

/** Set title from first user message when thread has no title yet. */
export async function ensurePsaThreadTitleFromUserMessage(
  threadId: string,
  userMessage: string
): Promise<void> {
  const trimmed = userMessage.trim();
  if (!trimmed) return;
  const thread = await getPsaThreadById(threadId);
  if (thread?.title?.trim()) return;

  const supabase = getSupabaseAdminServiceRole();
  const { error } = await supabase
    .from('psa_threads')
    .update({ title: threadTitleFromMessage(trimmed) })
    .eq('id', threadId);
  if (error) throw new Error(error.message);
}

export async function updatePsaThreadSummary(threadId: string, summary: string): Promise<void> {
  const supabase = getSupabaseAdminServiceRole();
  const { error } = await supabase
    .from('psa_threads')
    .update({ thread_summary: summary.trim() || null })
    .eq('id', threadId);
  if (error) throw new Error(error.message);
}

export async function archivePsaThread(userId: string, threadId: string): Promise<boolean> {
  const existing = await getPsaThreadForUser(userId, threadId);
  if (!existing) return false;
  const supabase = getSupabaseAdminServiceRole();
  const { error } = await supabase
    .from('psa_threads')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', threadId)
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
  return true;
}

export async function unarchivePsaThread(userId: string, threadId: string): Promise<boolean> {
  const existing = await getPsaThreadForUser(userId, threadId);
  if (!existing) return false;
  const supabase = getSupabaseAdminServiceRole();
  const { error } = await supabase
    .from('psa_threads')
    .update({ archived_at: null })
    .eq('id', threadId)
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
  return true;
}

export async function deletePsaThread(userId: string, threadId: string): Promise<boolean> {
  const existing = await getPsaThreadForUser(userId, threadId);
  if (!existing) return false;
  const supabase = getSupabaseAdminServiceRole();
  const { error } = await supabase.from('psa_threads').delete().eq('id', threadId).eq('user_id', userId);
  if (error) throw new Error(error.message);
  return true;
}

export async function countPsaThreadMessages(threadId: string): Promise<number> {
  const supabase = getSupabaseAdminServiceRole();
  const { count, error } = await supabase
    .from('psa_messages')
    .select('*', { count: 'exact', head: true })
    .eq('thread_id', threadId);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function touchPsaThreadAfterReply(input: {
  threadId: string;
  lastOpenaiResponseId: string | null;
  titleFromFirstUserMessage?: string | null;
}): Promise<void> {
  const supabase = getSupabaseAdminServiceRole();
  const patch: Record<string, string | null> = {
    last_openai_response_id: input.lastOpenaiResponseId,
    updated_at: new Date().toISOString(),
  };

  if (input.titleFromFirstUserMessage) {
    const thread = await getPsaThreadById(input.threadId);
    if (thread && !thread.title?.trim()) {
      patch.title = threadTitleFromMessage(input.titleFromFirstUserMessage);
    }
  }

  const { error } = await supabase.from('psa_threads').update(patch).eq('id', input.threadId);
  if (error) throw new Error(error.message);
}

async function getPsaThreadById(threadId: string): Promise<PsaThreadRow | null> {
  const supabase = getSupabaseAdminServiceRole();
  const { data, error } = await supabase.from('psa_threads').select('*').eq('id', threadId).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as PsaThreadRow | null) ?? null;
}

/** Resolve thread for a chat turn — create if needed. */
export async function resolvePsaThreadForChat(input: {
  userId: string;
  threadId?: string | null;
  createNew?: boolean;
}): Promise<PsaThreadRow> {
  if (input.createNew) {
    return createPsaThread(input.userId);
  }

  if (input.threadId) {
    const existing = await getPsaThreadForUser(input.userId, input.threadId);
    if (existing) return existing;
  }

  const latest = await getLatestPsaThread(input.userId, true);
  if (latest) return latest;

  return createPsaThread(input.userId);
}
