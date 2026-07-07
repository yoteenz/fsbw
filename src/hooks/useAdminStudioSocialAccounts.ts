import { useCallback, useEffect, useState } from 'react';
import {
  disconnectSocialAccount,
  fetchSocialAccounts,
  setSocialPostingDisabled,
  startSocialOAuth,
} from '../utils/apiSocialPublishing';
import type { PublicSocialAccount, SocialPlatformId } from '../utils/adminStudioSocialPublishing';
import { buildOfflineSocialAccounts } from '../utils/adminStudioSocialPublishing';

export function useAdminStudioSocialAccounts() {
  const [accounts, setAccounts] = useState<PublicSocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyPlatform, setBusyPlatform] = useState<SocialPlatformId | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchSocialAccounts();
      setAccounts(list);
    } catch (e) {
      setAccounts(buildOfflineSocialAccounts());
      setError(
        e instanceof Error
          ? `${e.message} — showing offline connector status. Configure OAuth env vars on Vercel to connect.`
          : 'API unavailable — showing offline connector status.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const connect = useCallback(async (platform: SocialPlatformId) => {
    setBusyPlatform(platform);
    setError(null);
    try {
      const url = await startSocialOAuth(platform);
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Connect failed');
      setBusyPlatform(null);
    }
  }, []);

  const disconnect = useCallback(
    async (platform: SocialPlatformId) => {
      setBusyPlatform(platform);
      try {
        const list = await disconnectSocialAccount(platform);
        setAccounts(list);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Disconnect failed');
      } finally {
        setBusyPlatform(null);
      }
    },
    []
  );

  const togglePosting = useCallback(async (platform: SocialPlatformId, disabled: boolean) => {
    setBusyPlatform(platform);
    try {
      const list = await setSocialPostingDisabled(platform, disabled);
      setAccounts(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setBusyPlatform(null);
    }
  }, []);

  return { accounts, loading, error, busyPlatform, refresh, connect, disconnect, togglePosting };
}
