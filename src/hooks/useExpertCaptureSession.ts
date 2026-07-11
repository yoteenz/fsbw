import { useCallback, useEffect, useRef, useState } from 'react';
import {
  applyKnowledgeExtraction,
  approveAnswerKnowledge,
  callInterviewAi,
  clearAllMediaBlobs,
  clearSessionStorage,
  countProgress,
  createAnswerForQuestion,
  createEmptySession,
  deleteMediaBlob,
  estimateRemainingMinutes,
  getCurrentQuestion,
  loadSession,
  markNeedsClarification,
  newMediaBlobId,
  rejectAnswerKnowledge,
  saveMediaBlob,
  saveSession,
  SessionRecorder,
  speakText,
  startSpeechTranscription,
  type ExpertCaptureAnswer,
  type ExpertCapturePhase,
  type ExpertCaptureSession,
} from '../studio-os-core/expert-capture';
import {
  ExpertCaptureAutosaveManager,
  buildResumeLink,
  computeProgressPercent,
  deleteExpertCaptureSession,
  getCurrentQuestionLabel,
  getLastCompletedSection,
  loadExpertCaptureDocument,
  resolveResumePhase,
  syncExpertCaptureDocument,
  uploadAnswerMedia,
  type ExpertCaptureInterruptedAnswer,
  type ExpertCaptureMediaRef,
  type ExpertCaptureRuntimeState,
  type ExpertCaptureSaveStatus,
} from '../studio-os-core/expert-capture/persistence';
import type { ExpertCaptureProfile } from '../studio-os-core/expert-capture/profiles/profile-types';
import {
  appendAuditEntry,
  createEmptyTrustRecord,
  isTrustFrameworkComplete,
  TRUST_AGREEMENT_VERSION,
  type TrustAgreementId,
} from '../studio-os-core/expert-capture/trust-vault';
import { findLocalInviteByToken, syncInviteFromSession } from '../studio-os-core/expert-capture/invite-system';
import type { ExpertInvite } from '../studio-os-core/expert-capture/invite-system';
import { syncKnowledgeMirrorFromSession } from './useKnowledgeMirror';
import {
  attachMirroredPreview,
  createMicLevelMonitor,
  requestMediaStream,
} from '../studio-os-core/expert-capture/recording-service';

function aiContext(profile: ExpertCaptureProfile) {
  return {
    profileId: profile.id,
    industryContext: profile.aiIndustryContext,
  };
}

function initialPhase(profile: ExpertCaptureProfile): ExpertCapturePhase {
  const local = loadSession(profile);
  if (!local) return 'landing';
  if (!isTrustFrameworkComplete(local)) {
    if (!local.meta.trustFramework?.welcomeCompletedAt) return 'trust_welcome';
    if (!local.meta.trustFramework?.agreementsSignedAt) return 'trust_agreements';
    if (!local.meta.trustFramework?.vaultIntroCompletedAt) return 'vault_gate';
  }
  if (local.meta.consentAcceptedAt && local.meta.startedAt) return 'welcome_back';
  if (local.meta.consentAcceptedAt) return 'welcome_back';
  return 'welcome_back';
}

export type UseExpertCaptureSessionOptions = {
  /** Server session id from invite record — enables resume on a fresh browser */
  inviteSessionId?: string | null;
};

export function useExpertCaptureSession(
  profile: ExpertCaptureProfile,
  options?: UseExpertCaptureSessionOptions
) {
  const [session, setSession] = useState<ExpertCaptureSession | null>(() => loadSession(profile));
  const [phase, setPhase] = useState<ExpertCapturePhase>(() => initialPhase(profile));
  const [currentAnswer, setCurrentAnswer] = useState<ExpertCaptureAnswer | null>(null);
  const [interruptedAnswer, setInterruptedAnswer] = useState<ExpertCaptureInterruptedAnswer | null>(null);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [aiMessage, setAiMessage] = useState('');
  const [pendingFollowUp, setPendingFollowUp] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clarifyMode, setClarifyMode] = useState(false);
  const [clarifyDraft, setClarifyDraft] = useState('');
  const [sessionVersion, setSessionVersion] = useState(1);
  const [saveStatus, setSaveStatus] = useState<ExpertCaptureSaveStatus>('idle');
  const [saveMessage, setSaveMessage] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [lastServerConfirmedAt, setLastServerConfirmedAt] = useState<string | null>(null);
  const [resumeLink, setResumeLink] = useState<string | null>(null);
  const [mediaRefs, setMediaRefs] = useState<Record<string, ExpertCaptureMediaRef>>({});
  const [hydrated, setHydrated] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const recorderRef = useRef(new SessionRecorder());
  const transcriberRef = useRef<ReturnType<typeof startSpeechTranscription> | null>(null);
  const stopMicRef = useRef<(() => void) | null>(null);
  const recordStartedRef = useRef<number | null>(null);
  const autosaveRef = useRef<ExpertCaptureAutosaveManager | null>(null);
  const sessionRef = useRef<ExpertCaptureSession | null>(session);
  const phaseRef = useRef<ExpertCapturePhase>(phase);
  const runtimeRef = useRef<ExpertCaptureRuntimeState | null>(null);

  sessionRef.current = session;
  phaseRef.current = phase;

  const buildRuntime = useCallback(
    (overrides: Partial<ExpertCaptureRuntimeState> = {}): ExpertCaptureRuntimeState => ({
      workflowStage: phase,
      currentAnswer,
      pendingFollowUp,
      liveTranscript,
      clarifyDraft,
      aiMessage,
      currentReviewAnswerId: null,
      interruptedAnswer,
      phase,
      ...overrides,
    }),
    [phase, currentAnswer, pendingFollowUp, liveTranscript, clarifyDraft, aiMessage, interruptedAnswer]
  );

  runtimeRef.current = buildRuntime();

  const getAutosaveManager = useCallback(() => {
    if (!autosaveRef.current) {
      autosaveRef.current = new ExpertCaptureAutosaveManager(profile, profile.companyId);
      autosaveRef.current.onStatusChange((s) => {
        setSaveStatus(s.status);
        setSaveMessage(s.message);
        setLastSavedAt(s.lastSavedAt);
        setLastServerConfirmedAt(s.lastServerConfirmedAt);
      });
    }
    return autosaveRef.current;
  }, [profile]);

  const autosaveNow = useCallback(
    async (nextSession: ExpertCaptureSession, runtimeOverrides?: Partial<ExpertCaptureRuntimeState>, force = false) => {
      const runtime = buildRuntime(runtimeOverrides);
      const result = await getAutosaveManager().save(
        {
          session: nextSession,
          runtime,
          mediaRefs,
          sessionVersion,
        },
        { force }
      );
      if (result.sessionVersion > sessionVersion) setSessionVersion(result.sessionVersion);
      if (nextSession.meta.id) setResumeLink(buildResumeLink(nextSession.meta.id, profile.route));
      return result;
    },
    [buildRuntime, getAutosaveManager, mediaRefs, sessionVersion, profile.route]
  );

  const persist = useCallback(
    (next: ExpertCaptureSession, runtimeOverrides?: Partial<ExpertCaptureRuntimeState>) => {
      saveSession(next, profile);
      setSession(next);
      getAutosaveManager().scheduleSave({
        session: next,
        runtime: buildRuntime(runtimeOverrides),
        mediaRefs,
        sessionVersion,
      });
      if (next.meta.id) setResumeLink(buildResumeLink(next.meta.id, profile.route));
      if (next.meta.inviteToken) {
        const inv = findLocalInviteByToken(next.meta.inviteToken);
        if (inv) syncInviteFromSession(next, inv);
      }
    },
    [profile, buildRuntime, getAutosaveManager, mediaRefs, sessionVersion]
  );

  const syncKnowledgeMirror = useCallback(
    (next: ExpertCaptureSession) => {
      if (!next.meta.expertName.trim()) return;
      void syncKnowledgeMirrorFromSession(profile, next);
    },
    [profile]
  );

  const applyLoadedDocument = useCallback(
    (doc: Awaited<ReturnType<typeof loadExpertCaptureDocument>>) => {
      if (!doc?.document?.session) return;
      const resolved = resolveResumePhase(doc.document);
      saveSession(doc.document.session, profile);
      setSession(doc.document.session);
      setSessionVersion(doc.sessionVersion);
      setMediaRefs(doc.document.mediaRefs ?? {});
      setCurrentAnswer(resolved.currentAnswer);
      setPendingFollowUp(resolved.pendingFollowUp);
      setLiveTranscript(resolved.liveTranscript);
      setClarifyDraft(resolved.clarifyDraft);
      setAiMessage(resolved.aiMessage);
      setInterruptedAnswer(resolved.interruptedAnswer);
      setLastSavedAt(doc.lastSavedAt);
      if (resolved.interruptedAnswer) {
        setPhase('interrupted_recovery');
      } else if (resolved.workflowStage === 'save_exit') {
        setPhase('save_exit');
      } else {
        setPhase(resolved.phase);
      }
      setResumeLink(buildResumeLink(doc.document.session.meta.id, profile.route));
    },
    [profile]
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const sessionId =
        params.get('sessionId') ?? options?.inviteSessionId ?? loadSession(profile)?.meta.id;
      if (token) {
        const loaded = await loadExpertCaptureDocument({ resumeToken: token });
        if (!cancelled && loaded) applyLoadedDocument(loaded);
      } else if (sessionId) {
        const loaded = await loadExpertCaptureDocument({ sessionId });
        if (!cancelled && loaded) applyLoadedDocument(loaded);
      }
      if (!cancelled) setHydrated(true);
    })();
    return () => {
      cancelled = true;
      autosaveRef.current?.dispose();
    };
  }, [profile, applyLoadedDocument, options?.inviteSessionId]);

  useEffect(() => {
    const flush = () => {
      if (!sessionRef.current) return;
      autosaveRef.current?.flushPending();
    };
    const onHide = () => {
      if (isRecording && currentAnswer && sessionRef.current) {
        const partial: ExpertCaptureInterruptedAnswer = {
          answerId: currentAnswer.id,
          questionId: currentAnswer.questionId,
          questionText: currentAnswer.questionText,
          partialTranscript: liveTranscript,
          partialMediaLocalId: currentAnswer.media.videoBlobId,
          partialMediaId: currentAnswer.media.videoBlobId,
          interruptedAt: new Date().toISOString(),
          uploadStatus: 'pending',
        };
        setInterruptedAnswer(partial);
        persist(
          sessionRef.current,
          {
            interruptedAnswer: partial,
            workflowStage: 'interrupted_recovery',
            phase: 'interrupted_recovery',
          }
        );
      } else {
        flush();
      }
    };
    window.addEventListener('pagehide', onHide);
    window.addEventListener('beforeunload', flush);
    return () => {
      window.removeEventListener('pagehide', onHide);
      window.removeEventListener('beforeunload', flush);
    };
  }, [isRecording, currentAnswer, liveTranscript, persist]);

  useEffect(() => {
    if (!isRecording) {
      getAutosaveManager().stopRecordingInterval();
      return;
    }
    getAutosaveManager().startRecordingInterval(() => {
      if (!sessionRef.current) return null;
      return {
        session: sessionRef.current,
        runtime: buildRuntime(),
        mediaRefs,
        sessionVersion,
      };
    });
  }, [isRecording, buildRuntime, getAutosaveManager, mediaRefs, sessionVersion]);

  const attachStream = useCallback(async () => {
    const stream = await requestMediaStream();
    streamRef.current = stream;
    if (videoRef.current) attachMirroredPreview(stream, videoRef.current);
    stopMicRef.current?.();
    stopMicRef.current = createMicLevelMonitor(stream, setMicLevel);
    return stream;
  }, []);

  useEffect(() => {
    return () => {
      stopMicRef.current?.();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const startSessionFromInvite = useCallback(
    async (invite: ExpertInvite) => {
      if (invite.sessionId) {
        const loaded = await loadExpertCaptureDocument({ sessionId: invite.sessionId });
        if (loaded?.document?.session) {
          applyLoadedDocument(loaded);
          return;
        }
      }
      const local = loadSession(profile);
      if (local?.meta.inviteToken === invite.token) {
        setSession(local);
        setPhase(initialPhase(profile));
        return;
      }
      const next = createEmptySession(
        {
          expertName: invite.inviteeName,
          expertRole: invite.role,
          organizationLabel: invite.businessName,
        },
        profile
      );
      next.meta.trustFramework = createEmptyTrustRecord();
      next.meta.inviteId = invite.id;
      next.meta.inviteToken = invite.token;
      setSessionVersion(1);
      void autosaveNow(next, { phase: 'trust_welcome', workflowStage: 'consent' }, true);
      setSession(next);
      saveSession(next, profile);
      setPhase('trust_welcome');
    },
    [profile, autosaveNow, applyLoadedDocument]
  );

  const startSession = useCallback(
    (expertName: string, expertRole: string) => {
      const next = createEmptySession(
        {
          expertName,
          expertRole: profile.lockRole ? profile.defaultExpertRole : expertRole,
          organizationLabel: profile.defaultOrganization,
        },
        profile
      );
      next.meta.trustFramework = createEmptyTrustRecord();
      setSessionVersion(1);
      void autosaveNow(next, { phase: 'trust_welcome', workflowStage: 'consent' }, true);
      setSession(next);
      saveSession(next, profile);
      setPhase('trust_welcome');
    },
    [profile, autosaveNow]
  );

  const completeTrustWelcome = useCallback(() => {
    if (!session) return;
    const now = new Date().toISOString();
    const next = {
      ...session,
      meta: {
        ...session.meta,
        trustFramework: {
          ...(session.meta.trustFramework ?? createEmptyTrustRecord()),
          welcomeCompletedAt: now,
        },
      },
    };
    persist(next, { phase: 'trust_agreements' });
    setPhase('trust_agreements');
  }, [session, persist]);

  const signTrustAgreements = useCallback(
    (signatureName: string, agreementsAccepted: Record<TrustAgreementId, boolean>) => {
      if (!session) return;
      const now = new Date().toISOString();
      const next = {
        ...session,
        meta: {
          ...session.meta,
          consentAcceptedAt: now,
          trustFramework: {
            ...(session.meta.trustFramework ?? createEmptyTrustRecord()),
            welcomeCompletedAt: session.meta.trustFramework?.welcomeCompletedAt ?? now,
            agreementsSignedAt: now,
            signatureName,
            agreementsAccepted,
            agreementVersion: TRUST_AGREEMENT_VERSION,
          },
        },
      };
      appendAuditEntry(profile.companyId, profile.id, {
        user: signatureName,
        worker: null,
        purpose: 'Trust Framework',
        action: 'Agreements signed — Knowledge Vault initialized',
        resourceType: 'legal_agreements',
        resourceId: session.meta.id,
      });
      persist(next, { phase: 'vault_gate' });
      setPhase('vault_gate');
    },
    [session, persist, profile.companyId, profile.id]
  );

  const completeVaultGate = useCallback(() => {
    if (!session) return;
    const now = new Date().toISOString();
    const next = {
      ...session,
      meta: {
        ...session.meta,
        trustFramework: {
          ...(session.meta.trustFramework ?? createEmptyTrustRecord()),
          vaultIntroCompletedAt: now,
        },
      },
    };
    persist(next, { phase: 'consent' });
    setPhase('consent');
  }, [session, persist]);

  const acceptConsent = useCallback(() => {
    if (!session) return;
    const next = {
      ...session,
      meta: {
        ...session.meta,
        consentAcceptedAt: new Date().toISOString(),
        status: 'draft' as const,
      },
    };
    persist(next, { phase: 'media_setup' });
    setPhase('media_setup');
  }, [session, persist]);

  const enableMedia = useCallback(async () => {
    setError(null);
    try {
      await attachStream();
      setPhase('interview');
      if (!session) return;
      const next = {
        ...session,
        meta: {
          ...session.meta,
          startedAt: session.meta.startedAt ?? new Date().toISOString(),
          status: 'in_progress' as const,
        },
      };
      persist(next, { phase: 'interview' });

      if (!next.meta.aiGreetingDelivered) {
        setAiSpeaking(true);
        const greet = await callInterviewAi({
          action: 'greet',
          expertName: next.meta.expertName,
          expertRole: next.meta.expertRole,
          ...aiContext(profile),
        });
        setAiMessage(greet.text);
        await speakText(greet.text);
        setAiSpeaking(false);
        persist({ ...next, meta: { ...next.meta, aiGreetingDelivered: true } });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Camera/microphone access failed');
    }
  }, [attachStream, session, persist, profile]);

  const beginAnswer = useCallback(() => {
    if (!session) return;
    const question = getCurrentQuestion(session);
    if (!question) return;
    setInterruptedAnswer(null);
    const answer = createAnswerForQuestion(session, question, pendingFollowUp ? currentAnswer?.id ?? null : null);
    if (pendingFollowUp) answer.questionText = pendingFollowUp;
    setCurrentAnswer(answer);
    setLiveTranscript('');
    setIsRecording(true);
    setIsPaused(false);
    recordStartedRef.current = Date.now();

    const stream = streamRef.current;
    if (stream) {
      recorderRef.current = new SessionRecorder();
      recorderRef.current.start(stream);
      transcriberRef.current?.stop();
      transcriberRef.current = startSpeechTranscription(setLiveTranscript);
    }
    persist(session, { currentAnswer: answer, phase: 'interview', interruptedAnswer: null });
  }, [session, pendingFollowUp, currentAnswer?.id, persist]);

  const pauseRecording = useCallback(() => {
    recorderRef.current.pause();
    setIsPaused(true);
    if (session) {
      persist({ ...session, meta: { ...session.meta, status: 'paused', pausedAt: new Date().toISOString() } });
    }
  }, [session, persist]);

  const resumeRecording = useCallback(() => {
    recorderRef.current.resume();
    setIsPaused(false);
    if (session) {
      persist({ ...session, meta: { ...session.meta, status: 'in_progress', pausedAt: null } });
    }
  }, [session, persist]);

  const finishAnswer = useCallback(async () => {
    if (!session || !currentAnswer) return;
    setProcessing(true);
    setIsRecording(false);
    transcriberRef.current?.stop();
    const finalTranscript = transcriberRef.current?.getTranscript() || liveTranscript;
    transcriberRef.current = null;

    let videoBlobId: string | null = null;
    let videoBlob: Blob | null = null;
    try {
      const stopped = await recorderRef.current.stop();
      videoBlob = stopped.videoBlob;
      if (videoBlob.size > 0) {
        videoBlobId = newMediaBlobId('video');
        await saveMediaBlob(videoBlobId, videoBlob);
      }
    } catch {
      /* optional media */
    }

    const durationMs = recordStartedRef.current ? Date.now() - recordStartedRef.current : null;
    let draft: ExpertCaptureAnswer = {
      ...currentAnswer,
      transcript: finalTranscript,
      recordedAt: new Date().toISOString(),
      durationMs,
      media: { videoBlobId, audioBlobId: videoBlobId },
      status: 'transcribed',
    };

    if (videoBlobId && videoBlob && videoBlob.size > 0) {
      setSaveStatus('uploading');
      setSaveMessage('Uploading answer…');
      const ref = await uploadAnswerMedia({
        sessionId: session.meta.id,
        answerId: draft.id,
        questionId: draft.questionId,
        mediaId: videoBlobId,
        localBlobId: videoBlobId,
        blob: videoBlob,
        isPartial: false,
      });
      setMediaRefs((prev) => ({ ...prev, [videoBlobId!]: ref }));
      if (ref.uploadStatus === 'failed') {
        setSaveMessage('Upload pending — saved locally');
      } else {
        setSaveMessage('Answer uploaded');
      }
    }

    const analysis = await callInterviewAi({
      action: 'analyze_answer',
      question: draft.questionText,
      transcript: finalTranscript,
      expertRole: session.meta.expertRole,
      ...aiContext(profile),
    });

    draft = {
      ...draft,
      aiUnderstanding: analysis.understanding ?? analysis.text,
      status: 'interpreted',
    };
    if (analysis.knowledgeItems?.length) {
      draft = applyKnowledgeExtraction(draft, analysis.knowledgeItems);
    }

    const followUp =
      analysis.followUpQuestion ?? profile.buildLocalFollowUp?.(finalTranscript, draft.questionText) ?? null;

    setCurrentAnswer(draft);
    setPendingFollowUp(followUp);
    setPhase('understanding_review');
    persist(session, { currentAnswer: draft, pendingFollowUp: followUp, phase: 'understanding_review' });
    setProcessing(false);
  }, [session, currentAnswer, liveTranscript, profile, persist]);

  const confirmUnderstanding = useCallback(
    (confirmation: 'correct' | 'partial' | 'misunderstood') => {
      if (!session || !currentAnswer) return;
      if (confirmation === 'misunderstood') {
        setClarifyMode(true);
        setPhase('clarify');
        setAiMessage("I'm sorry. Please explain what I misunderstood.");
        persist(session, { phase: 'clarify' });
        return;
      }
      const confirmed: ExpertCaptureAnswer = {
        ...currentAnswer,
        confirmation,
        status: 'awaiting_approval',
      };
      setCurrentAnswer(confirmed);
      persist(session, { currentAnswer: confirmed, phase: 'understanding_review' });
    },
    [session, currentAnswer, persist]
  );

  const submitClarification = useCallback(async () => {
    if (!session || !currentAnswer || !clarifyDraft.trim()) return;
    setProcessing(true);
    const result = await callInterviewAi({
      action: 'clarify',
      question: currentAnswer.questionText,
      transcript: currentAnswer.transcript,
      misunderstanding: currentAnswer.aiUnderstanding ?? '',
      expertCorrection: clarifyDraft.trim(),
      ...aiContext(profile),
    });
    let updated: ExpertCaptureAnswer = {
      ...currentAnswer,
      aiUnderstanding: result.understanding ?? result.text ?? currentAnswer.aiUnderstanding,
      clarificationNotes: clarifyDraft.trim(),
      transcriptExpertCorrected: true,
      correctedTranscript: clarifyDraft.trim(),
      confirmation: 'partial',
      status: 'corrected',
    };
    if (result.knowledgeItems?.length) {
      updated = applyKnowledgeExtraction(updated, result.knowledgeItems);
    }
    setCurrentAnswer(updated);
    setClarifyMode(false);
    setClarifyDraft('');
    setPhase('understanding_review');
    persist(session, { currentAnswer: updated, phase: 'understanding_review', clarifyDraft: '' });
    setProcessing(false);
  }, [session, currentAnswer, clarifyDraft, profile, persist]);

  const continueAfterReview = useCallback(() => {
    if (!session || !currentAnswer) return;
    const answers = [...session.answers.filter((a) => a.id !== currentAnswer.id), currentAnswer];
    let nextSession: ExpertCaptureSession = {
      ...session,
      answers,
      meta: {
        ...session.meta,
        currentQuestionIndex: session.meta.currentQuestionIndex + 1,
        estimatedMinutesRemaining: estimateRemainingMinutes({ ...session, answers }, profile.minutesPerQuestion),
      },
    };

    if (pendingFollowUp && currentAnswer.confirmation !== 'misunderstood') {
      setPendingFollowUp(null);
      setCurrentAnswer(null);
      setPhase('interview');
      setAiMessage(`Follow-up: ${pendingFollowUp}`);
      persist(nextSession, { currentAnswer: null, pendingFollowUp: null, phase: 'interview' });
      void speakText(pendingFollowUp);
      return;
    }

    setPendingFollowUp(null);
    setCurrentAnswer(null);
    const remaining = getCurrentQuestion({ ...nextSession, answers });
    if (!remaining) {
      nextSession = {
        ...nextSession,
        meta: { ...nextSession.meta, status: 'completed', endedAt: new Date().toISOString() },
        summary: profile.buildSessionSummary({ ...nextSession, answers }),
      };
      persist(nextSession, { currentAnswer: null, phase: 'session_complete' });
      setPhase('session_complete');
      return;
    }
    persist(nextSession, { currentAnswer: null, phase: 'interview' });
    setPhase('interview');
    setAiMessage(remaining.text);
    void speakText(remaining.text);
  }, [session, currentAnswer, pendingFollowUp, persist, profile]);

  const redoAnswer = useCallback(async () => {
    if (currentAnswer?.media.videoBlobId) await deleteMediaBlob(currentAnswer.media.videoBlobId);
    setCurrentAnswer(null);
    setInterruptedAnswer(null);
    setLiveTranscript('');
    setPhase('interview');
    beginAnswer();
  }, [currentAnswer, beginAnswer]);

  const discardInterruptedAnswer = useCallback(() => {
    setInterruptedAnswer(null);
    setCurrentAnswer(null);
    setPhase('interview');
    if (session) persist(session, { interruptedAnswer: null, currentAnswer: null, phase: 'interview' });
  }, [session, persist]);

  const resumeInterruptedAnswer = useCallback(() => {
    if (!interruptedAnswer || !session) return;
    const draft = createAnswerForQuestion(session, {
      id: interruptedAnswer.questionId,
      text: interruptedAnswer.questionText,
      category: '',
      order: 0,
      optional: false,
    });
    draft.id = interruptedAnswer.answerId;
    draft.transcript = interruptedAnswer.partialTranscript;
    draft.questionText = interruptedAnswer.questionText;
    setCurrentAnswer(draft);
    setLiveTranscript(interruptedAnswer.partialTranscript);
    setInterruptedAnswer(null);
    setPhase('understanding_review');
    persist(session, {
      interruptedAnswer: null,
      currentAnswer: draft,
      liveTranscript: interruptedAnswer.partialTranscript,
      phase: 'understanding_review',
    });
  }, [interruptedAnswer, session, persist]);

  const deleteAnswer = useCallback(
    async (mode: 'ask_again' | 'skip') => {
      if (!session || !currentAnswer) return;
      if (currentAnswer.media.videoBlobId) await deleteMediaBlob(currentAnswer.media.videoBlobId);
      const deleted: ExpertCaptureAnswer = {
        ...currentAnswer,
        deleted: true,
        deletedAt: new Date().toISOString(),
        status: 'deleted',
        knowledgeItems: currentAnswer.knowledgeItems.map((k) => ({ ...k, status: 'deleted' as const })),
      };
      const answers = [...session.answers, deleted];
      persist({ ...session, answers }, { currentAnswer: null, phase: 'interview' });
      setCurrentAnswer(null);
      setPendingFollowUp(null);
      if (mode === 'skip') {
        const skipped = createAnswerForQuestion(session, {
          id: currentAnswer.questionId,
          text: currentAnswer.questionText,
          category: '',
          order: 0,
          optional: true,
        });
        skipped.skipped = true;
        skipped.status = 'skipped';
        persist({ ...session, answers: [...answers, skipped] });
      }
      setPhase('interview');
    },
    [session, currentAnswer, persist]
  );

  const skipQuestion = useCallback(() => {
    if (!session) return;
    const question = getCurrentQuestion(session);
    if (!question) return;
    const skipped = createAnswerForQuestion(session, question);
    skipped.skipped = true;
    skipped.status = 'skipped';
    skipped.confirmation = 'correct';
    const answers = [...session.answers, skipped];
    const next = {
      ...session,
      answers,
      meta: {
        ...session.meta,
        currentQuestionIndex: session.meta.currentQuestionIndex + 1,
        estimatedMinutesRemaining: estimateRemainingMinutes({ ...session, answers }, profile.minutesPerQuestion),
      },
    };
    persist(next);
    setCurrentAnswer(null);
    const remaining = getCurrentQuestion({ ...session, answers });
    if (!remaining) {
      setPhase('session_complete');
      return;
    }
    setAiMessage(remaining.text);
    setPhase('interview');
  }, [session, persist, profile]);

  const editTranscript = useCallback(
    (text: string) => {
      if (!currentAnswer) return;
      const updated = {
        ...currentAnswer,
        correctedTranscript: text,
        transcriptExpertCorrected: true,
        status: 'corrected' as const,
      };
      setCurrentAnswer(updated);
      if (session) persist(session, { currentAnswer: updated });
    },
    [currentAnswer, session, persist]
  );

  const goToKnowledgeReview = useCallback(() => {
    setPhase('knowledge_review');
    if (session) persist(session, { phase: 'knowledge_review' });
  }, [session, persist]);

  const goToExport = useCallback(() => {
    setPhase('export');
    if (session) persist(session, { phase: 'export' });
  }, [session, persist]);

  const approveAnswer = useCallback(
    (answerId: string) => {
      if (!session) return;
      const answers = session.answers.map((a) =>
        a.id === answerId ? approveAnswerKnowledge({ ...a, confirmation: 'correct' }) : a
      );
      const next = { ...session, answers };
      persist(next);
      syncKnowledgeMirror(next);
    },
    [session, persist, syncKnowledgeMirror]
  );

  const rejectAnswer = useCallback(
    (answerId: string) => {
      if (!session) return;
      const answers = session.answers.map((a) => (a.id === answerId ? rejectAnswerKnowledge(a) : a));
      const next = { ...session, answers };
      persist(next);
      syncKnowledgeMirror(next);
    },
    [session, persist, syncKnowledgeMirror]
  );

  const needsClarificationAnswer = useCallback(
    (answerId: string) => {
      if (!session) return;
      const answers = session.answers.map((a) => (a.id === answerId ? markNeedsClarification(a) : a));
      const next = { ...session, answers };
      persist(next);
      syncKnowledgeMirror(next);
    },
    [session, persist, syncKnowledgeMirror]
  );

  const saveAndExit = useCallback(async () => {
    if (isRecording) {
      transcriberRef.current?.stop();
      setIsRecording(false);
      try {
        const { videoBlob } = await recorderRef.current.stop();
        if (videoBlob.size > 0 && currentAnswer && session) {
          const blobId = newMediaBlobId('video');
          await saveMediaBlob(blobId, videoBlob);
          const partial: ExpertCaptureInterruptedAnswer = {
            answerId: currentAnswer.id,
            questionId: currentAnswer.questionId,
            questionText: currentAnswer.questionText,
            partialTranscript: liveTranscript,
            partialMediaLocalId: blobId,
            partialMediaId: blobId,
            interruptedAt: new Date().toISOString(),
            uploadStatus: 'pending',
          };
          setInterruptedAnswer(partial);
          void uploadAnswerMedia({
            sessionId: session.meta.id,
            answerId: currentAnswer.id,
            questionId: currentAnswer.questionId,
            mediaId: blobId,
            localBlobId: blobId,
            blob: videoBlob,
            isPartial: true,
          });
        }
      } catch {
        /* best effort */
      }
    }
    if (!session) return;
    await autosaveNow(session, { workflowStage: 'save_exit', phase: 'save_exit' }, true);
    setPhase('save_exit');
  }, [isRecording, currentAnswer, session, liveTranscript, autosaveNow]);

  const resumeInterview = useCallback(async () => {
    if (!session) return;
    const result = await syncExpertCaptureDocument({
      document: {
        schemaVersion: 2,
        session,
        runtime: buildRuntime({ phase: session.meta.startedAt ? 'interview' : 'media_setup' }),
        indexes: {
          completedQuestionIds: [],
          skippedQuestionIds: [],
          deletedQuestionIds: [],
          redoQuestionIds: [],
          approvedAnswerIds: [],
          unreviewedAnswerIds: [],
          pendingFollowUps: [],
          completedRecordingIds: [],
        },
        drafts: { currentDraftTranscript: '', currentDraftInterpretation: null, currentDraftKnowledgeObjects: [] },
        mediaRefs,
        deviceMetadata: { deviceId: 'unknown', userAgent: '', platform: '', language: 'en', lastSeenAt: new Date().toISOString() },
        exportStatus: 'none',
        sessionSummaryStatus: 'none',
        consentStatus: session.meta.consentAcceptedAt ? 'accepted' : 'pending',
        retentionStatus: 'active',
        recoveryStatus: 'ready_to_resume',
        sessionVersion,
        lastMutationId: 'resume',
      },
      companyId: profile.companyId,
      profileId: profile.id,
      claimDevice: true,
    });
    if (!result.ok && result.conflict) {
      setPhase('device_conflict');
      return;
    }
    if (interruptedAnswer) {
      setPhase('interrupted_recovery');
      return;
    }
    if (currentAnswer && phaseRef.current === 'understanding_review') {
      setPhase('understanding_review');
      return;
    }
    if (!isTrustFrameworkComplete(session)) {
      if (!session.meta.trustFramework?.welcomeCompletedAt) {
        setPhase('trust_welcome');
        return;
      }
      if (!session.meta.trustFramework?.agreementsSignedAt) {
        setPhase('trust_agreements');
        return;
      }
      if (!session.meta.trustFramework?.vaultIntroCompletedAt) {
        setPhase('vault_gate');
        return;
      }
    }
    if (session.meta.status === 'completed') {
      setPhase('session_complete');
      return;
    }
    if (session.meta.startedAt) {
      setPhase('interview');
      void attachStream().catch(() => undefined);
      return;
    }
    if (session.meta.consentAcceptedAt) {
      setPhase('media_setup');
      return;
    }
    setPhase('consent');
  }, [session, buildRuntime, mediaRefs, sessionVersion, profile, interruptedAnswer, currentAnswer, attachStream]);

  const goToSessionDashboard = useCallback(() => setPhase('session_dashboard'), []);
  const goToWelcomeBack = useCallback(() => setPhase('welcome_back'), []);

  const restartSession = useCallback(
    async (mode: 'delete' | 'archive' = 'delete') => {
      if (session && mode === 'delete') {
        await deleteExpertCaptureSession(session.meta.id);
      } else if (session && mode === 'archive') {
        await syncExpertCaptureDocument({
          document: {
            schemaVersion: 2,
            session,
            runtime: buildRuntime(),
            indexes: {
              completedQuestionIds: [],
              skippedQuestionIds: [],
              deletedQuestionIds: [],
              redoQuestionIds: [],
              approvedAnswerIds: [],
              unreviewedAnswerIds: [],
              pendingFollowUps: [],
              completedRecordingIds: [],
            },
            drafts: { currentDraftTranscript: '', currentDraftInterpretation: null, currentDraftKnowledgeObjects: [] },
            mediaRefs,
            deviceMetadata: { deviceId: 'unknown', userAgent: '', platform: '', language: 'en', lastSeenAt: new Date().toISOString() },
            exportStatus: 'none',
            sessionSummaryStatus: 'none',
            consentStatus: 'accepted',
            retentionStatus: 'active',
            recoveryStatus: 'archived',
            sessionVersion,
            lastMutationId: 'archive',
          },
          companyId: profile.companyId,
          profileId: profile.id,
          action: 'archive_and_restart',
        });
      }
      await clearAllMediaBlobs();
      clearSessionStorage(profile);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setSession(null);
      setCurrentAnswer(null);
      setInterruptedAnswer(null);
      setPhase('landing');
      setPendingFollowUp(null);
      setLiveTranscript('');
      setSessionVersion(1);
      setMediaRefs({});
    },
    [session, buildRuntime, mediaRefs, sessionVersion, profile]
  );

  const claimDeviceAndContinue = useCallback(async () => {
    await resumeInterview();
  }, [resumeInterview]);

  const progress = session ? countProgress(session) : { current: 0, total: 0 };
  const progressPercent = session ? computeProgressPercent(session) : 0;
  const currentQuestion = session ? getCurrentQuestion(session) : null;
  const lastCompletedSection = session ? getLastCompletedSection(session) : null;
  const currentQuestionLabel = session ? getCurrentQuestionLabel(session, pendingFollowUp) : null;

  return {
    profile,
    session,
    phase,
    setPhase,
    hydrated,
    currentAnswer,
    currentQuestion,
    interruptedAnswer,
    progress,
    progressPercent,
    lastCompletedSection,
    currentQuestionLabel,
    aiSpeaking,
    isRecording,
    isPaused,
    micLevel,
    liveTranscript,
    aiMessage,
    processing,
    error,
    clarifyMode,
    clarifyDraft,
    setClarifyDraft,
    saveStatus,
    saveMessage,
    lastSavedAt,
    lastServerConfirmedAt,
    resumeLink,
    videoRef,
    startSession,
    startSessionFromInvite,
    completeTrustWelcome,
    signTrustAgreements,
    completeVaultGate,
    acceptConsent,
    enableMedia,
    beginAnswer,
    pauseRecording,
    resumeRecording,
    finishAnswer,
    confirmUnderstanding,
    submitClarification,
    continueAfterReview,
    redoAnswer,
    deleteAnswer,
    skipQuestion,
    editTranscript,
    goToKnowledgeReview,
    goToExport,
    approveAnswer,
    rejectAnswer,
    needsClarificationAnswer,
    restartSession,
    saveAndExit,
    resumeInterview,
    goToSessionDashboard,
    goToWelcomeBack,
    resumeInterruptedAnswer,
    discardInterruptedAnswer,
    claimDeviceAndContinue,
    pendingFollowUp,
  };
}
