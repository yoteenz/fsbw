/**
 * PSA tool usage logging for admin review (service role only).
 */
import { getSupabaseAdminServiceRole } from './supabase.js';

export function isPsaToolAnalyticsConfigured(): boolean {
  try {
    return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
  } catch {
    return false;
  }
}

export async function logPsaToolEvents(input: {
  threadId: string | null;
  userId: string;
  toolNames: string[];
  userMessageSnippet?: string;
}): Promise<void> {
  if (!input.toolNames.length || !isPsaToolAnalyticsConfigured()) return;

  const snippet = (input.userMessageSnippet ?? '').trim().slice(0, 160);
  const rows = input.toolNames.map((tool_name) => ({
    thread_id: input.threadId,
    user_id: input.userId,
    tool_name,
    user_message_snippet: snippet || null,
  }));

  try {
    const supabase = getSupabaseAdminServiceRole();
    const { error } = await supabase.from('psa_tool_events').insert(rows);
    if (error) console.warn('[psaToolAnalytics] insert', error.message);
  } catch (err) {
    console.warn('[psaToolAnalytics] insert failed', err);
  }
}

export type PsaToolUsageAggregate = {
  toolName: string;
  count: number;
};

export type PsaAdminThreadReviewRow = {
  id: string;
  userId: string;
  title: string | null;
  updatedAt: string;
  messageCount: number;
  preview: string | null;
  toolsUsed: string[];
};

export async function listPsaThreadsForAdminReview(limit = 40): Promise<PsaAdminThreadReviewRow[]> {
  const supabase = getSupabaseAdminServiceRole();
  const { data: threads, error } = await supabase
    .from('psa_threads')
    .select('id, user_id, title, updated_at')
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error || !threads?.length) return [];

  const ids = threads.map((t) => t.id as string);
  const { data: messages } = await supabase
    .from('psa_messages')
    .select('thread_id, role, content, created_at')
    .in('thread_id', ids)
    .order('created_at', { ascending: true });

  const { data: toolRows } = await supabase
    .from('psa_tool_events')
    .select('thread_id, tool_name')
    .in('thread_id', ids);

  const msgByThread = new Map<string, { count: number; preview: string | null }>();
  for (const row of messages ?? []) {
    const tid = String(row.thread_id);
    const cur = msgByThread.get(tid) ?? { count: 0, preview: null };
    cur.count += 1;
    if (row.role === 'user' && typeof row.content === 'string') {
      cur.preview = row.content.slice(0, 72);
    }
    msgByThread.set(tid, cur);
  }

  const toolsByThread = new Map<string, Set<string>>();
  for (const row of toolRows ?? []) {
    const tid = String(row.thread_id);
    const set = toolsByThread.get(tid) ?? new Set<string>();
    set.add(String(row.tool_name));
    toolsByThread.set(tid, set);
  }

  return threads.map((t) => {
    const tid = t.id as string;
    const meta = msgByThread.get(tid);
    return {
      id: tid,
      userId: t.user_id as string,
      title: (t.title as string | null) ?? null,
      updatedAt: t.updated_at as string,
      messageCount: meta?.count ?? 0,
      preview: meta?.preview ?? null,
      toolsUsed: [...(toolsByThread.get(tid) ?? [])].sort(),
    };
  });
}

export type PsaAdminThreadDetail = {
  thread: { id: string; userId: string; title: string | null; updatedAt: string };
  messages: { id: string; role: string; content: string; createdAt: string }[];
  toolEvents: { toolName: string; createdAt: string; userMessageSnippet: string | null }[];
  toolSummary: PsaToolUsageAggregate[];
};

export async function getPsaThreadDetailForAdmin(threadId: string): Promise<PsaAdminThreadDetail | null> {
  const supabase = getSupabaseAdminServiceRole();
  const { data: thread, error } = await supabase
    .from('psa_threads')
    .select('id, user_id, title, updated_at')
    .eq('id', threadId)
    .maybeSingle();

  if (error || !thread) return null;

  const [{ data: messages }, { data: toolEvents }] = await Promise.all([
    supabase
      .from('psa_messages')
      .select('id, role, content, created_at')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true }),
    supabase
      .from('psa_tool_events')
      .select('tool_name, created_at, user_message_snippet')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true }),
  ]);

  const summaryMap = new Map<string, number>();
  for (const row of toolEvents ?? []) {
    const name = String(row.tool_name);
    summaryMap.set(name, (summaryMap.get(name) ?? 0) + 1);
  }

  return {
    thread: {
      id: thread.id as string,
      userId: thread.user_id as string,
      title: (thread.title as string | null) ?? null,
      updatedAt: thread.updated_at as string,
    },
    messages: (messages ?? []).map((m) => ({
      id: m.id as string,
      role: m.role as string,
      content: m.content as string,
      createdAt: m.created_at as string,
    })),
    toolEvents: (toolEvents ?? []).map((e) => ({
      toolName: e.tool_name as string,
      createdAt: e.created_at as string,
      userMessageSnippet: (e.user_message_snippet as string | null) ?? null,
    })),
    toolSummary: [...summaryMap.entries()]
      .map(([toolName, count]) => ({ toolName, count }))
      .sort((a, b) => b.count - a.count),
  };
}
