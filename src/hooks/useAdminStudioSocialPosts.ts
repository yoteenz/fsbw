import { useCallback, useEffect, useState } from 'react';
import {
  fetchSocialPosts,
  fetchSocialPublishLog,
  saveSocialPost,
  socialPostAction,
} from '../utils/apiSocialPublishing';
import type { SocialPlatformId, SocialPostRecord, SocialPublishLogEntry } from '../utils/adminStudioSocialPublishing';

export function useAdminStudioSocialPosts(distributionPackId: string) {
  const [posts, setPosts] = useState<SocialPostRecord[]>([]);
  const [log, setLog] = useState<SocialPublishLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!distributionPackId) return;
    setLoading(true);
    try {
      const [p, l] = await Promise.all([
        fetchSocialPosts(distributionPackId),
        fetchSocialPublishLog(),
      ]);
      setPosts(p);
      setLog(l);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, [distributionPackId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveDraft = useCallback(
    async (params: {
      id?: string;
      platform: SocialPlatformId;
      caption: string;
      hashtags: string;
      thumbnailUrl?: string;
      coverUrl?: string;
      contentPackRef?: string;
      submitApproval?: boolean;
    }) => {
      setBusy(true);
      setError(null);
      try {
        await saveSocialPost({
          id: params.id,
          distributionPackId,
          platform: params.platform,
          caption: params.caption,
          hashtags: params.hashtags,
          thumbnailUrl: params.thumbnailUrl,
          coverUrl: params.coverUrl,
          contentPackRef: params.contentPackRef,
          submitApproval: params.submitApproval,
        });
        await refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Save failed');
      } finally {
        setBusy(false);
      }
    },
    [distributionPackId, refresh]
  );

  const runAction = useCallback(
    async (id: string, action: 'approve' | 'reject' | 'schedule' | 'publish', extra?: { scheduledAt?: string; packApproved?: boolean }) => {
      setBusy(true);
      setError(null);
      try {
        await socialPostAction(id, action, extra);
        await refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : `${action} failed`);
      } finally {
        setBusy(false);
      }
    },
    [refresh]
  );

  return { posts, log, loading, error, busy, refresh, saveDraft, runAction };
}
