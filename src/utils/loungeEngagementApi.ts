import { getAccessToken } from './api';
import type {
  LoungeEngagementContentKey,
  LoungeEngagementContentType,
  LoungeEngagementSummary,
} from './loungeEngagementTypes';
import { engagementItemKey } from './loungeEngagementTypes';

const API_BASE =
  (import.meta as unknown as { env?: { VITE_API_BASE?: string } }).env?.VITE_API_BASE ?? '';

function apiUrl(path: string): string {
  return API_BASE ? `${API_BASE}${path}` : path;
}

const VIEWER_KEY_STORAGE = 'loungeEngagementViewerKey_v1';

export function getOrCreateEngagementViewerKey(): string {
  if (typeof window === 'undefined') return 'server';
  try {
    const existing = localStorage.getItem(VIEWER_KEY_STORAGE);
    if (existing && existing.length >= 16) return existing;
    const key =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `lv-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(VIEWER_KEY_STORAGE, key);
    return key;
  } catch {
    return `lv-fallback-${Date.now()}`;
  }
}

export async function fetchEngagementSummariesBatch(
  items: LoungeEngagementContentKey[]
): Promise<Map<string, LoungeEngagementSummary>> {
  const map = new Map<string, LoungeEngagementSummary>();
  if (!items.length) return map;

  const unique = new Map<string, LoungeEngagementContentKey>();
  for (const item of items) {
    unique.set(engagementItemKey(item), item);
  }
  const list = [...unique.values()];
  const qs = list.map((i) => `${i.contentType}:${encodeURIComponent(i.contentId)}`).join(',');

  const token = await getAccessToken();
  const res = await fetch(apiUrl(`/api/lounge-tv/engagement/summaries?items=${qs}`), {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!res.ok) return map;

  const data = (await res.json()) as { summaries?: LoungeEngagementSummary[] };
  for (const row of data.summaries ?? []) {
    map.set(engagementItemKey(row), row);
  }
  return map;
}

export async function postQualifiedEngagementView(args: {
  contentType: LoungeEngagementContentType;
  contentId: string;
  watchSeconds: number;
  durationSeconds: number;
}): Promise<{ recorded: boolean; reason?: string }> {
  const token = await getAccessToken();
  const res = await fetch(apiUrl('/api/lounge-tv/engagement/qualified-view'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      ...args,
      viewerKey: token ? undefined : getOrCreateEngagementViewerKey(),
    }),
  });
  if (!res.ok) return { recorded: false, reason: 'request_failed' };
  return (await res.json()) as { recorded: boolean; reason?: string };
}

export async function toggleEngagementHelpful(
  contentType: LoungeEngagementContentType,
  contentId: string
): Promise<{ helpful: boolean; helpfulCount: number } | null> {
  const token = await getAccessToken();
  if (!token) return null;

  const res = await fetch(apiUrl('/api/lounge-tv/engagement/helpful'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ contentType, contentId }),
  });

  if (res.status === 401) return null;
  if (!res.ok) throw new Error('helpful_failed');
  return (await res.json()) as { helpful: boolean; helpfulCount: number };
}

export type LoungeDiscussionComment = {
  id: string;
  parentId: string | null;
  body: string;
  isOfficial: boolean;
  isPinned: boolean;
  authorName: string;
  createdAt: string;
  isOwn: boolean;
};

export async function fetchDiscussionComments(
  contentType: LoungeEngagementContentType,
  contentId: string,
  cursor?: string | null
): Promise<{ comments: LoungeDiscussionComment[]; nextCursor: string | null }> {
  const params = new URLSearchParams({ contentType, contentId });
  if (cursor) params.set('cursor', cursor);
  const token = await getAccessToken();
  const res = await fetch(apiUrl(`/api/lounge-tv/engagement/comments?${params}`), {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error('comments_load_failed');
  return (await res.json()) as { comments: LoungeDiscussionComment[]; nextCursor: string | null };
}

export async function postDiscussionComment(args: {
  contentType: LoungeEngagementContentType;
  contentId: string;
  body: string;
  parentId?: string | null;
}): Promise<LoungeDiscussionComment> {
  const token = await getAccessToken();
  if (!token) throw new Error('auth_required');

  const res = await fetch(apiUrl('/api/lounge-tv/engagement/comments'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(args),
  });

  if (res.status === 401) throw new Error('auth_required');
  if (res.status === 429) throw new Error('rate_limited');
  if (!res.ok) throw new Error('comment_failed');

  const data = (await res.json()) as { comment: LoungeDiscussionComment };
  return data.comment;
}

export async function postCommentAction(args: {
  commentId: string;
  action: 'delete' | 'report' | 'pin' | 'unpin' | 'official' | 'hide';
}): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error('auth_required');

  const res = await fetch(apiUrl('/api/lounge-tv/engagement/comment-action'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(args),
  });

  if (!res.ok) throw new Error('action_failed');
}
