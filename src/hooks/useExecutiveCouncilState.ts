import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  conductExecutiveCouncilMeeting,
  syncExecutiveCouncilFromSources,
  updateCouncilDecisionOutcome,
  type OrganizationExecutiveCouncilProfile,
} from '../studio-os-core/executive-council';

export function useExecutiveCouncilState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationExecutiveCouncilProfile | null>(null);
  const [meetingQuery, setMeetingQuery] = useState('We need to increase revenue.');
  const [meetingLoading, setMeetingLoading] = useState(false);

  const refresh = useCallback(() => {
    const next = syncExecutiveCouncilFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener('studio-os-executive-council-updated', onUpdate);
    window.addEventListener('studio-os-profession-brain-updated', onUpdate);
    window.addEventListener('studio-os-company-health-index-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    window.addEventListener('studio-os-headquarters-expanded', onUpdate);
    return () => {
      window.removeEventListener('studio-os-executive-council-updated', onUpdate);
      window.removeEventListener('studio-os-profession-brain-updated', onUpdate);
      window.removeEventListener('studio-os-company-health-index-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
      window.removeEventListener('studio-os-headquarters-expanded', onUpdate);
    };
  }, [refresh]);

  const runCouncilMeeting = useCallback(
    (query?: string) => {
      const q = (query ?? meetingQuery).trim();
      if (!q) return;
      setMeetingLoading(true);
      try {
        conductExecutiveCouncilMeeting(workspaceId, q);
        refresh();
      } finally {
        setMeetingLoading(false);
      }
    },
    [workspaceId, meetingQuery, refresh]
  );

  const resolveDecision = useCallback(
    (decisionId: string, outcome: 'approved' | 'declined' | 'deferred') => {
      updateCouncilDecisionOutcome(workspaceId, decisionId, outcome);
      refresh();
    },
    [workspaceId, refresh]
  );

  return {
    profile,
    refresh,
    meetingQuery,
    setMeetingQuery,
    meetingLoading,
    runCouncilMeeting,
    resolveDecision,
  };
}
