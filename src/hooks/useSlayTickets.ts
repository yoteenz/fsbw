import { useCallback, useEffect, useState } from 'react';
import { getAccessToken, fetchSlayTicketState } from '../utils/api';
import {
  applyLocalSlayTicketState,
  getSlayTicketBalanceFromUser,
  isLoungeContentUnlocked,
  mapApiHistoryToRows,
  readStoredLoungeUnlocks,
  readStoredSlayTicketHistory,
  SLAY_TICKETS_UPDATED_EVENT,
  type LoungeContentUnlock,
  type SlayTicketHistoryRow,
} from '../utils/slayTicketHistoryDisplay';
import { getCurrentUserEmailFromStorage } from '../utils/perUserStorage';

export function useSlayTickets(userData: Record<string, unknown> | null | undefined) {
  const email = String(userData?.email || getCurrentUserEmailFromStorage() || '').trim().toLowerCase();
  const [balance, setBalance] = useState(() => getSlayTicketBalanceFromUser(userData));
  const [history, setHistory] = useState<SlayTicketHistoryRow[]>(() =>
    readStoredSlayTicketHistory(userData)
  );
  const [unlocks, setUnlocks] = useState<LoungeContentUnlock[]>(() =>
    email ? readStoredLoungeUnlocks(email) : []
  );
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!email) return;
    setBalance(getSlayTicketBalanceFromUser(userData));
    setHistory(readStoredSlayTicketHistory(userData));
    setUnlocks(readStoredLoungeUnlocks(email));
    const token = await getAccessToken();
    if (!token) return;
    setLoading(true);
    try {
      const state = await fetchSlayTicketState();
      if (!state) return;
      setBalance(Math.max(0, Math.floor(Number(state.balance) || 0)));
      setHistory(mapApiHistoryToRows(state.history || []));
      const mappedUnlocks: LoungeContentUnlock[] = (state.unlocks || []).map((u: {
        content_id: string;
        ticket_cost: number;
        unlocked_at: string;
        access_type: string;
        expires_at: string | null;
      }) => ({
        contentId: u.content_id,
        ticketCost: u.ticket_cost,
        unlockedAt: u.unlocked_at,
        accessType: u.access_type === 'rental' ? 'rental' : 'permanent',
        expiresAt: u.expires_at,
      }));
      setUnlocks(mappedUnlocks);
      applyLocalSlayTicketState(email, {
        slayTicketBalance: Math.max(0, Math.floor(Number(state.balance) || 0)),
        slayTicketHistory: mapApiHistoryToRows(state.history || []),
        unlocks: mappedUnlocks,
      });
    } catch {
      /* keep local fallback */
    } finally {
      setLoading(false);
    }
  }, [email, userData]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => void refresh();
    window.addEventListener(SLAY_TICKETS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(SLAY_TICKETS_UPDATED_EVENT, onUpdate);
  }, [refresh]);

  const isUnlocked = useCallback(
    (contentId: string) => isLoungeContentUnlocked(contentId, unlocks),
    [unlocks]
  );

  return { balance, history, unlocks, loading, refresh, isUnlocked };
}
