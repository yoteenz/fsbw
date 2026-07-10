import { useCallback, useEffect, useState } from 'react';
import type { ExpertCaptureProfile } from '../studio-os-core/expert-capture/profiles/profile-types';
import type { ExpertCaptureSession } from '../studio-os-core/expert-capture/types';
import type { ConfessionalInput } from '../studio-os-core/expert-capture/knowledge-mirror/confessional-service';
import { createConfessionalEntry } from '../studio-os-core/expert-capture/knowledge-mirror/confessional-service';
import {
  ownerApprovePacketForTraining,
  passScenarioTestForPacket,
  restrictAuthorization,
} from '../studio-os-core/expert-capture/knowledge-mirror/competency-core';
import {
  markEntryOutdated,
  supersedeKnowledgeEntry,
} from '../studio-os-core/expert-capture/knowledge-mirror/training-packets';
import { refreshProgramFromSession } from '../studio-os-core/expert-capture/knowledge-mirror/program-orchestrator';
import {
  submitAllExpertApprovedForOwnerReview,
  submitEntryForOwnerReview,
} from '../studio-os-core/expert-capture/knowledge-mirror/sync-from-session';
import {
  loadOrCreateProgram,
  persistKnowledgeProgram,
} from '../studio-os-core/expert-capture/knowledge-mirror/store';
import { buildOwnerMirrorSnapshot } from '../studio-os-core/expert-capture/knowledge-mirror/owner-mirror-data';
import {
  markNotificationsRead,
  ownerDecisionOnEntry,
  ownerDecisionOnPacket,
} from '../studio-os-core/expert-capture/knowledge-mirror/owner-workflow';
import type { KnowledgeProgram, OwnerReviewDecision } from '../studio-os-core/expert-capture/knowledge-mirror/types';

export type KnowledgeMirrorIdentity = {
  expertName: string;
  expertRole: string;
  organizationLabel: string;
};

function identityFromSession(session: ExpertCaptureSession): KnowledgeMirrorIdentity {
  return {
    expertName: session.meta.expertName,
    expertRole: session.meta.expertRole,
    organizationLabel: session.meta.organizationLabel,
  };
}

export async function syncKnowledgeMirrorFromSession(
  profile: ExpertCaptureProfile,
  session: ExpertCaptureSession
): Promise<KnowledgeProgram> {
  const program = await loadOrCreateProgram({
    profileId: profile.id,
    companyId: profile.companyId,
    expertName: session.meta.expertName,
    profession: session.meta.expertRole,
    organizationLabel: session.meta.organizationLabel,
  });
  const next = refreshProgramFromSession(program, session, profile.aiIndustryContext);
  return persistKnowledgeProgram(next);
}

export function useKnowledgeMirror(profile: ExpertCaptureProfile, identity: KnowledgeMirrorIdentity | null) {
  const [program, setProgram] = useState<KnowledgeProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const persist = useCallback((next: KnowledgeProgram) => {
    const saved = persistKnowledgeProgram(next);
    setProgram(saved);
    return saved;
  }, []);

  useEffect(() => {
    if (!identity?.expertName.trim()) {
      setProgram(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    void loadOrCreateProgram({
      profileId: profile.id,
      companyId: profile.companyId,
      expertName: identity.expertName,
      profession: identity.expertRole,
      organizationLabel: identity.organizationLabel,
    })
      .then(setProgram)
      .catch(() => setError('Could not load knowledge program'))
      .finally(() => setLoading(false));
  }, [profile.id, profile.companyId, identity?.expertName, identity?.expertRole, identity?.organizationLabel]);

  const refreshFromSession = useCallback(
    (session: ExpertCaptureSession) => {
      if (!program) return;
      const next = refreshProgramFromSession(program, session, profile.aiIndustryContext);
      persist(next);
    },
    [program, persist, profile.aiIndustryContext]
  );

  const submitEntryForReview = useCallback(
    (entryId: string) => {
      if (!program) return;
      persist(submitEntryForOwnerReview(program, entryId));
    },
    [program, persist]
  );

  const submitAllExpertApproved = useCallback(() => {
    if (!program) return;
    persist(submitAllExpertApprovedForOwnerReview(program));
  }, [program, persist]);

  const submitConfessional = useCallback(
    (input: ConfessionalInput) => {
      if (!program) return;
      persist(createConfessionalEntry(program, input));
    },
    [program, persist]
  );

  const ownerReviewEntry = useCallback(
    (entryId: string, decision: OwnerReviewDecision, notes?: string) => {
      if (!program) return;
      persist(ownerDecisionOnEntry(program, entryId, decision, notes));
    },
    [program, persist]
  );

  const ownerReviewPacket = useCallback(
    (packetId: string, decision: OwnerReviewDecision, notes?: string) => {
      if (!program) return;
      persist(ownerDecisionOnPacket(program, packetId, decision, notes));
    },
    [program, persist]
  );

  const approvePacketForTraining = useCallback(
    (packetId: string) => {
      if (!program) return;
      persist(ownerApprovePacketForTraining(program, packetId));
    },
    [program, persist]
  );

  const passScenarioTest = useCallback(
    (packetId: string) => {
      if (!program) return;
      persist(passScenarioTestForPacket(program, packetId));
    },
    [program, persist]
  );

  const restrictWorkerCapability = useCallback(
    (capability: string, reason: string) => {
      if (!program) return;
      persist(restrictAuthorization(program, capability, reason));
    },
    [program, persist]
  );

  const supersedeEntry = useCallback(
    (entryId: string, newStatement: string, reason: string) => {
      if (!program || !identity) return;
      persist(supersedeKnowledgeEntry(program, entryId, newStatement, reason, identity.expertName));
    },
    [program, identity, persist]
  );

  const markOutdated = useCallback(
    (entryId: string, reason: string) => {
      if (!program) return;
      persist(markEntryOutdated(program, entryId, reason));
    },
    [program, persist]
  );

  const dismissNotifications = useCallback(() => {
    if (!program) return;
    persist(markNotificationsRead(program));
  }, [program, persist]);

  const snapshot = program ? buildOwnerMirrorSnapshot(program) : null;

  return {
    program,
    snapshot,
    loading,
    error,
    refreshFromSession,
    submitEntryForReview,
    submitAllExpertApproved,
    submitConfessional,
    ownerReviewEntry,
    ownerReviewPacket,
    approvePacketForTraining,
    passScenarioTest,
    restrictWorkerCapability,
    supersedeEntry,
    markOutdated,
    dismissNotifications,
  };
}

export { identityFromSession };
