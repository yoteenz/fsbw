import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  isLobbyAssetDownloadsVisibleForAdmin,
  isLobbyAssetDownloadsVisibleFromSearch,
} from '../constants/lobbySceneAssets';

/** Dev, `?lobbyAssets=1` (persisted for the session), or signed-in admin on `/lobby`. */
export function useLobbyAssetDownloadsVisible(): boolean {
  const { search } = useLocation();
  const [adminVisible, setAdminVisible] = useState(false);

  useEffect(() => {
    const refresh = () => setAdminVisible(isLobbyAssetDownloadsVisibleForAdmin());
    refresh();
    window.addEventListener('signInStateChanged', refresh);
    return () => window.removeEventListener('signInStateChanged', refresh);
  }, []);

  return useMemo(
    () => isLobbyAssetDownloadsVisibleFromSearch(search) || adminVisible,
    [search, adminVisible],
  );
}
