import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  advanceMeetingStage,
  archiveEvolutionSession,
  ensureEvolutionRoomSubsystem,
  ER_MEETING_STAGE_LABELS,
  ER_ROOM_PATHS,
  generateMeetingSummary,
  getEvolutionRoomReadyView,
  recordFounderDecision,
  setMeetingStage,
  startEvolutionSession,
  updateCouncilItemInSession,
  type ErMeetingStage,
  type ErRoomPath,
  GENESIS_UPDATED_EVENT,
} from '../studio-os-core/genesis';

export function useEvolutionRoomState(founderDisplayName = 'Founder') {
  const location = useLocation();
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    ensureEvolutionRoomSubsystem();
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    ensureEvolutionRoomSubsystem();
  }, []);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(GENESIS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(GENESIS_UPDATED_EVENT, onUpdate);
  }, [refresh]);

  const view = useMemo(
    () =>
      getEvolutionRoomReadyView({
        pathname: location.pathname,
        founderDisplayName,
      }),
    [location.pathname, founderDisplayName, tick]
  );

  const advanceStage = useCallback(() => {
    const session = view.activeSession;
    if (!session) return;
    advanceMeetingStage(session.sessionId);
    refresh();
  }, [view.activeSession, refresh]);

  const goToStage = useCallback(
    (stage: ErMeetingStage) => {
      const session = view.activeSession;
      if (!session) return;
      setMeetingStage(session.sessionId, stage);
      refresh();
    },
    [view.activeSession, refresh]
  );

  const acceptCouncilItem = useCallback(
    (agendaId: string, notes?: string) => {
      const session = view.activeSession;
      if (!session) return;
      updateCouncilItemInSession(session.sessionId, agendaId, 'accepted', notes);
      refresh();
    },
    [view.activeSession, refresh]
  );

  const deferCouncilItem = useCallback(
    (agendaId: string, notes?: string) => {
      const session = view.activeSession;
      if (!session) return;
      updateCouncilItemInSession(session.sessionId, agendaId, 'deferred', notes);
      refresh();
    },
    [view.activeSession, refresh]
  );

  const recordDecision = useCallback(
    (title: string, nextAction: string) => {
      const session = view.activeSession;
      if (!session) return;
      recordFounderDecision(session.sessionId, {
        title,
        evidenceCited: ['Evolution Council deliberation'],
        systemsAffected: ['studio-os'],
        genesisImpact: 'Pending founder review — nothing auto-canonizes',
        nextAction,
        canonStatus: 'none',
      });
      refresh();
    },
    [view.activeSession, refresh]
  );

  const summarizeSession = useCallback(() => {
    const session = view.activeSession;
    if (!session) return null;
    const outputs = generateMeetingSummary(session.sessionId);
    refresh();
    return outputs;
  }, [view.activeSession, refresh]);

  const archiveSession = useCallback(() => {
    const session = view.activeSession;
    if (!session) return null;
    const archive = archiveEvolutionSession(session.sessionId);
    refresh();
    return archive;
  }, [view.activeSession, refresh]);

  const beginNewSession = useCallback(() => {
    startEvolutionSession(founderDisplayName);
    refresh();
  }, [founderDisplayName, refresh]);

  return {
    view,
    roomPaths: ER_ROOM_PATHS,
    meetingStageLabels: ER_MEETING_STAGE_LABELS,
    advanceStage,
    goToStage,
    acceptCouncilItem,
    deferCouncilItem,
    recordDecision,
    summarizeSession,
    archiveSession,
    beginNewSession,
    refresh,
  };
}

export type { ErMeetingStage, ErRoomPath };
