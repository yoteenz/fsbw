import { apiFetch } from './api';
import type {
  PublicSocialAccount,
  SocialPlatformId,
  SocialPostRecord,
  SocialPublishLogEntry,
} from './adminStudioSocialPublishing';

export async function fetchSocialAccounts(): Promise<PublicSocialAccount[]> {
  const res = await apiFetch('/api/admin/social-accounts');
  if (!res.ok) throw new Error('Failed to load social accounts');
  const json = (await res.json()) as { accounts: PublicSocialAccount[] };
  return json.accounts ?? [];
}

export async function startSocialOAuth(platform: SocialPlatformId): Promise<string> {
  const res = await apiFetch('/api/admin/social-accounts', {
    method: 'POST',
    body: { action: 'oauth_start', platform },
  });
  const json = (await res.json()) as { authorizeUrl?: string; error?: string };
  if (!res.ok || !json.authorizeUrl) {
    if (res.status === 503) {
      throw new Error(
        json.error ||
          'OAuth credentials not configured on the server. Add platform env vars in Vercel, redeploy, then try again.'
      );
    }
    throw new Error(json.error || 'OAuth start failed');
  }
  return json.authorizeUrl;
}

export async function disconnectSocialAccount(platform: SocialPlatformId): Promise<PublicSocialAccount[]> {
  const res = await apiFetch(`/api/admin/social-accounts?platform=${encodeURIComponent(platform)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Disconnect failed');
  const json = (await res.json()) as { accounts: PublicSocialAccount[] };
  return json.accounts ?? [];
}

export async function setSocialPostingDisabled(
  platform: SocialPlatformId,
  postingDisabled: boolean
): Promise<PublicSocialAccount[]> {
  const res = await apiFetch('/api/admin/social-accounts', {
    method: 'PATCH',
    body: { platform, postingDisabled },
  });
  if (!res.ok) throw new Error('Update failed');
  const json = (await res.json()) as { accounts: PublicSocialAccount[] };
  return json.accounts ?? [];
}

export async function fetchSocialPosts(distributionPackId: string): Promise<SocialPostRecord[]> {
  const res = await apiFetch(`/api/admin/social-posts?distributionPackId=${encodeURIComponent(distributionPackId)}`);
  if (!res.ok) return [];
  const json = (await res.json()) as { posts: SocialPostRecord[] };
  return json.posts ?? [];
}

export async function saveSocialPost(params: {
  id?: string;
  distributionPackId: string;
  contentPackRef?: string;
  platform: SocialPlatformId;
  caption: string;
  hashtags: string;
  thumbnailUrl?: string;
  coverUrl?: string;
  submitApproval?: boolean;
}): Promise<string | undefined> {
  const res = await apiFetch('/api/admin/social-posts', {
    method: 'POST',
    body: {
      action: params.submitApproval ? 'submit_approval' : 'save_draft',
      ...params,
    },
  });
  const json = (await res.json()) as { id?: string; error?: string };
  if (!res.ok) throw new Error(json.error || 'Save failed');
  return json.id;
}

export async function socialPostAction(
  id: string,
  action: 'approve' | 'reject' | 'schedule' | 'publish',
  extra?: { scheduledAt?: string; packApproved?: boolean }
): Promise<void> {
  const res = await apiFetch('/api/admin/social-posts', {
    method: 'POST',
    body: { action, id, ...extra },
  });
  const json = (await res.json()) as { error?: string };
  if (!res.ok) throw new Error(json.error || `${action} failed`);
}

export async function fetchSocialPublishLog(postId?: string): Promise<SocialPublishLogEntry[]> {
  const q = postId ? `?postId=${encodeURIComponent(postId)}&limit=30` : '?limit=30';
  const res = await apiFetch(`/api/admin/social-publish-log${q}`);
  if (!res.ok) return [];
  const json = (await res.json()) as { log: SocialPublishLogEntry[] };
  return json.log ?? [];
}
