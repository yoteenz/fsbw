import { useCallback, useEffect, useState } from 'react';
import {
  appendConversationTurn,
  endConversationSession,
  getActiveConversationSession,
  startConversationSession,
  type ConversationSurface,
} from '../studio-os-core/conversation-engine';
import {
  clearVoiceTranscripts,
  ensureVoiceModeProfile,
  startVoiceListening,
  stopVoiceListening,
  type VoiceModeProfile,
} from '../studio-os-core/voice-mode';

export function useVoiceModeState(organizationId: string) {
  const [profile, setProfile] = useState<VoiceModeProfile>(() =>
    ensureVoiceModeProfile(organizationId)
  );

  useEffect(() => {
    setProfile(ensureVoiceModeProfile(organizationId));
  }, [organizationId]);

  const refresh = useCallback(() => {
    setProfile(ensureVoiceModeProfile(organizationId));
  }, [organizationId]);

  const startListening = useCallback(
    (onFinal: (text: string) => void) => {
      const result = startVoiceListening(organizationId, onFinal);
      refresh();
      return result;
    },
    [organizationId, refresh]
  );

  const stopListening = useCallback(() => {
    stopVoiceListening();
    refresh();
  }, [refresh]);

  const clear = useCallback(() => {
    setProfile(clearVoiceTranscripts(organizationId));
  }, [organizationId]);

  return { profile, refresh, startListening, stopListening, clear };
}

export function useConversationEngineState(organizationId: string) {
  const [session, setSession] = useState(() => getActiveConversationSession(organizationId));

  const refresh = useCallback(() => {
    setSession(getActiveConversationSession(organizationId));
  }, [organizationId]);

  const openSession = useCallback(
    (surface: ConversationSurface) => {
      const next = startConversationSession(organizationId, surface);
      setSession(next);
      return next;
    },
    [organizationId]
  );

  const recordTurn = useCallback(
    (turn: Parameters<typeof appendConversationTurn>[1]) => {
      const next = appendConversationTurn(organizationId, turn);
      if (next) setSession(next);
      return next;
    },
    [organizationId]
  );

  const closeSession = useCallback(() => {
    endConversationSession(organizationId);
    setSession(null);
  }, [organizationId]);

  return { session, refresh, openSession, recordTurn, closeSession };
}
