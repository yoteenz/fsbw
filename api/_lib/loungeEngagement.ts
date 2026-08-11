import type { SupabaseClient } from '@supabase/supabase-js';
import { isAdminEmail } from './adminAuth.js';

export const LOUNGE_ENGAGEMENT_CONTENT_TYPES = [
  'content_pack',
  'psa_episode',
  'slay_tip',
  'care_lesson',
] as const;

export type LoungeEngagementContentType = (typeof LOUNGE_ENGAGEMENT_CONTENT_TYPES)[number];

export type LoungeEngagementSummary = {
  contentType: LoungeEngagementContentType;
  contentId: string;
  qualifiedViewCount: number;
  helpfulCount: number;
  commentCount: number;
  viewerHelpful?: boolean;
};

export type LoungeEngagementCommentRow = {
  id: string;
  content_type: string;
  content_id: string;
  user_id: string;
  parent_id: string | null;
  body: string;
  status: string;
  is_official: boolean;
  is_pinned: boolean;
  pinned_at: string | null;
  report_count: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
  } | null;
};

const COMMENT_RATE_LIMIT_MS = 15_000;
const recentCommentByUser = new Map<string, number>();

function parseContentKey(contentType: string, contentId: string): boolean {
  return (
    LOUNGE_ENGAGEMENT_CONTENT_TYPES.includes(contentType as LoungeEngagementContentType) &&
    contentId.trim().length > 0 &&
    contentId.length <= 128
  );
}

export function normalizeEngagementItem(raw: string): { contentType: LoungeEngagementContentType; contentId: string } | null {
  const [type, ...rest] = raw.split(':');
  const contentId = rest.join(':').trim();
  if (!type || !contentId) return null;
  if (!LOUNGE_ENGAGEMENT_CONTENT_TYPES.includes(type as LoungeEngagementContentType)) return null;
  return { contentType: type as LoungeEngagementContentType, contentId };
}

export async function fetchEngagementSummaries(
  supabase: SupabaseClient,
  items: Array<{ contentType: LoungeEngagementContentType; contentId: string }>,
  userId?: string | null
): Promise<LoungeEngagementSummary[]> {
  if (!items.length) return [];

  const unique = new Map<string, { contentType: LoungeEngagementContentType; contentId: string }>();
  for (const item of items) {
    if (!parseContentKey(item.contentType, item.contentId)) continue;
    unique.set(`${item.contentType}:${item.contentId}`, item);
  }
  const list = [...unique.values()];
  if (!list.length) return [];

  const contentTypes = [...new Set(list.map((i) => i.contentType))];
  const contentIds = [...new Set(list.map((i) => i.contentId))];

  const { data: rows, error } = await supabase
    .from('lounge_engagement_summaries')
    .select('content_type, content_id, qualified_view_count, helpful_count, comment_count')
    .in('content_type', contentTypes)
    .in('content_id', contentIds);

  if (error) throw error;

  const byKey = new Map<string, (typeof rows)[number]>();
  for (const row of rows ?? []) {
    byKey.set(`${row.content_type}:${row.content_id}`, row);
  }

  let helpfulSet = new Set<string>();
  if (userId) {
    const { data: helpfulRows } = await supabase
      .from('lounge_engagement_helpful')
      .select('content_type, content_id')
      .eq('user_id', userId)
      .in('content_type', contentTypes)
      .in('content_id', contentIds);
    helpfulSet = new Set((helpfulRows ?? []).map((r) => `${r.content_type}:${r.content_id}`));
  }

  return list.map(({ contentType, contentId }) => {
    const key = `${contentType}:${contentId}`;
    const row = byKey.get(key);
    return {
      contentType,
      contentId,
      qualifiedViewCount: row?.qualified_view_count ?? 0,
      helpfulCount: row?.helpful_count ?? 0,
      commentCount: row?.comment_count ?? 0,
      viewerHelpful: userId ? helpfulSet.has(key) : undefined,
    };
  });
}

export async function recordQualifiedView(
  supabase: SupabaseClient,
  args: {
    contentType: LoungeEngagementContentType;
    contentId: string;
    watchSeconds: number;
    durationSeconds: number;
    userId?: string | null;
    viewerKey?: string | null;
  }
): Promise<{ recorded: boolean; reason?: string; threshold?: number }> {
  if (!parseContentKey(args.contentType, args.contentId)) {
    return { recorded: false, reason: 'invalid_content' };
  }

  const { data, error } = await supabase.rpc('lounge_record_qualified_view', {
    p_content_type: args.contentType,
    p_content_id: args.contentId,
    p_watch_seconds: Math.max(0, Math.floor(args.watchSeconds)),
    p_duration_seconds: Math.max(0, Math.floor(args.durationSeconds)),
    p_user_id: args.userId ?? null,
    p_viewer_key: args.viewerKey ?? null,
  });

  if (error) throw error;
  const result = (data ?? {}) as Record<string, unknown>;
  return {
    recorded: Boolean(result.recorded),
    reason: typeof result.reason === 'string' ? result.reason : undefined,
    threshold: typeof result.threshold === 'number' ? result.threshold : undefined,
  };
}

export async function toggleHelpful(
  supabase: SupabaseClient,
  userId: string,
  contentType: LoungeEngagementContentType,
  contentId: string
): Promise<{ helpful: boolean; helpfulCount: number }> {
  if (!parseContentKey(contentType, contentId)) {
    throw new Error('invalid_content');
  }

  const { data, error } = await supabase.rpc('lounge_toggle_helpful', {
    p_content_type: contentType,
    p_content_id: contentId,
    p_user_id: userId,
  });

  if (error) throw error;
  const result = (data ?? {}) as Record<string, unknown>;
  return {
    helpful: Boolean(result.helpful),
    helpfulCount: Number(result.helpfulCount ?? 0),
  };
}

export async function listComments(
  supabase: SupabaseClient,
  contentType: LoungeEngagementContentType,
  contentId: string,
  limit = 40,
  cursor?: string | null
): Promise<{ comments: LoungeEngagementCommentRow[]; nextCursor: string | null }> {
  if (!parseContentKey(contentType, contentId)) {
    return { comments: [], nextCursor: null };
  }

  let query = supabase
    .from('lounge_engagement_comments')
    .select(
      'id, content_type, content_id, user_id, parent_id, body, status, is_official, is_pinned, pinned_at, report_count, created_at, updated_at'
    )
    .eq('content_type', contentType)
    .eq('content_id', contentId)
    .eq('status', 'visible')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(limit + 1);

  if (cursor) {
    query = query.gt('created_at', cursor);
  }

  const { data, error } = await query;
  if (error) throw error;

  const rows = (data ?? []) as LoungeEngagementCommentRow[];
  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const profileByUser = new Map<string, LoungeEngagementCommentRow['profiles']>();

  if (userIds.length) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .in('id', userIds);
    for (const p of profiles ?? []) {
      profileByUser.set(p.id as string, {
        first_name: p.first_name as string | null,
        last_name: p.last_name as string | null,
        email: p.email as string | null,
      });
    }
  }

  for (const row of rows) {
    row.profiles = profileByUser.get(row.user_id) ?? null;
  }

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? page[page.length - 1]?.created_at ?? null : null;

  return { comments: page, nextCursor };
}

function displayNameFromProfile(row: LoungeEngagementCommentRow): string {
  const p = row.profiles;
  const first = (p?.first_name ?? '').trim();
  const last = (p?.last_name ?? '').trim();
  const full = `${first} ${last}`.trim();
  if (full) return full.toUpperCase();
  const email = (p?.email ?? '').split('@')[0] ?? 'MEMBER';
  return email.toUpperCase();
}

export function mapCommentForClient(row: LoungeEngagementCommentRow, viewerUserId?: string | null) {
  return {
    id: row.id,
    parentId: row.parent_id,
    body: row.body,
    isOfficial: row.is_official,
    isPinned: row.is_pinned,
    authorName: displayNameFromProfile(row),
    createdAt: row.created_at,
    isOwn: viewerUserId != null && row.user_id === viewerUserId,
  };
}

export async function createComment(
  supabase: SupabaseClient,
  userId: string,
  args: {
    contentType: LoungeEngagementContentType;
    contentId: string;
    body: string;
    parentId?: string | null;
  }
): Promise<LoungeEngagementCommentRow> {
  if (!parseContentKey(args.contentType, args.contentId)) {
    throw new Error('invalid_content');
  }

  const body = args.body.trim();
  if (body.length < 1 || body.length > 2000) {
    throw new Error('invalid_body');
  }

  const rateKey = userId;
  const lastAt = recentCommentByUser.get(rateKey) ?? 0;
  if (Date.now() - lastAt < COMMENT_RATE_LIMIT_MS) {
    throw new Error('rate_limited');
  }

  if (args.parentId) {
    const { data: parent, error: parentErr } = await supabase
      .from('lounge_engagement_comments')
      .select('id, parent_id, content_type, content_id, status')
      .eq('id', args.parentId)
      .maybeSingle();
    if (parentErr) throw parentErr;
    if (!parent || parent.status !== 'visible') throw new Error('invalid_parent');
    if (parent.content_type !== args.contentType || parent.content_id !== args.contentId) {
      throw new Error('invalid_parent');
    }
    if (parent.parent_id) throw new Error('nested_reply_not_allowed');
  }

  const { data, error } = await supabase
    .from('lounge_engagement_comments')
    .insert({
      content_type: args.contentType,
      content_id: args.contentId,
      user_id: userId,
      parent_id: args.parentId ?? null,
      body,
      status: 'visible',
    })
    .select(
      'id, content_type, content_id, user_id, parent_id, body, status, is_official, is_pinned, pinned_at, report_count, created_at, updated_at'
    )
    .single();

  if (error) throw error;

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, email')
    .eq('id', userId)
    .maybeSingle();

  recentCommentByUser.set(rateKey, Date.now());
  await supabase.rpc('lounge_engagement_recount_summary', {
    p_content_type: args.contentType,
    p_content_id: args.contentId,
  });

  return {
    ...(data as LoungeEngagementCommentRow),
    profiles: profile ?? null,
  };
}

export async function deleteComment(
  supabase: SupabaseClient,
  userId: string,
  userEmail: string | null | undefined,
  commentId: string,
  isAdmin: boolean
): Promise<void> {
  const { data: row, error: fetchErr } = await supabase
    .from('lounge_engagement_comments')
    .select('id, user_id, content_type, content_id, status')
    .eq('id', commentId)
    .maybeSingle();
  if (fetchErr) throw fetchErr;
  if (!row) throw new Error('not_found');

  const canDelete = isAdmin || row.user_id === userId;
  if (!canDelete) throw new Error('forbidden');

  const { error } = await supabase
    .from('lounge_engagement_comments')
    .update({ status: 'removed', deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', commentId);
  if (error) throw error;

  await supabase.rpc('lounge_engagement_recount_summary', {
    p_content_type: row.content_type,
    p_content_id: row.content_id,
  });

  void userEmail;
}

export async function reportComment(
  supabase: SupabaseClient,
  userId: string,
  commentId: string
): Promise<void> {
  const { data: row, error: fetchErr } = await supabase
    .from('lounge_engagement_comments')
    .select('id, report_count, status')
    .eq('id', commentId)
    .maybeSingle();
  if (fetchErr) throw fetchErr;
  if (!row || row.status !== 'visible') throw new Error('not_found');

  const { error } = await supabase
    .from('lounge_engagement_comments')
    .update({
      report_count: (row.report_count ?? 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', commentId);
  if (error) throw error;

  void userId;
}

export async function moderateComment(
  supabase: SupabaseClient,
  adminEmail: string,
  args: {
    commentId: string;
    action: 'pin' | 'unpin' | 'official' | 'hide';
  }
): Promise<void> {
  if (!isAdminEmail(adminEmail)) throw new Error('forbidden');

  const { data: row, error: fetchErr } = await supabase
    .from('lounge_engagement_comments')
    .select('id, content_type, content_id, is_pinned, is_official, status')
    .eq('id', args.commentId)
    .maybeSingle();
  if (fetchErr) throw fetchErr;
  if (!row) throw new Error('not_found');

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (args.action === 'pin') {
    patch.is_pinned = true;
    patch.pinned_at = new Date().toISOString();
  } else if (args.action === 'unpin') {
    patch.is_pinned = false;
    patch.pinned_at = null;
  } else if (args.action === 'official') {
    patch.is_official = true;
  } else if (args.action === 'hide') {
    patch.status = 'hidden';
  }

  const { error } = await supabase.from('lounge_engagement_comments').update(patch).eq('id', args.commentId);
  if (error) throw error;

  await supabase.rpc('lounge_engagement_recount_summary', {
    p_content_type: row.content_type,
    p_content_id: row.content_id,
  });
}

/** Future discovery rails — sort by helpful, views, or discussion. */
export async function fetchDiscoveryCandidates(
  supabase: SupabaseClient,
  sort: 'helpful' | 'views' | 'discussed' | 'trending',
  limit = 20
): Promise<Array<{ contentType: string; contentId: string; score: number }>> {
  const column =
    sort === 'helpful' ? 'helpful_count' : sort === 'discussed' ? 'comment_count' : 'qualified_view_count';

  const { data, error } = await supabase
    .from('lounge_engagement_summaries')
    .select('content_type, content_id, qualified_view_count, helpful_count, comment_count, updated_at')
    .order(column, { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row) => {
    let score = Number(row[column as keyof typeof row] ?? 0);
    if (sort === 'trending') {
      const views = row.qualified_view_count ?? 0;
      const helpful = row.helpful_count ?? 0;
      const comments = row.comment_count ?? 0;
      score = views * 1 + helpful * 3 + comments * 2;
    }
    return {
      contentType: row.content_type,
      contentId: row.content_id,
      score,
    };
  });
}
