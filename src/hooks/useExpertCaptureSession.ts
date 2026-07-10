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
import type { ExpertCaptureProfile } from '../studio-os-core/expert-capture/profiles/profile-types';
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

export function useExpertCaptureSession(profile: ExpertCaptureProfile) {
  const [session, setSession] = useState<ExpertCaptureSession | null>(() => loadSession(profile));
  const [phase, setPhase] = useState<ExpertCapturePhase>(() => (loadSession(profile) ? 'interview' : 'landing'));
  const [currentAnswer, setCurrentAnswer] = useState<ExpertCaptureAnswer | null>(null);
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

  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const recorderRef = useRef(new SessionRecorder());
  const transcriberRef = useRef<ReturnType<typeof startSpeechTranscription> | null>(null);
  const stopMicRef = useRef<(() => void) | null>(null);
  const recordStartedRef = useRef<number | null>(null);

  const persist = useCallback(
    (next: ExpertCaptureSession) => {
      saveSession(next, profile);
      setSession(next);
    },
    [profile]
  );

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
      persist(next);
      setPhase('consent');
    },
    [persist, profile]
  );

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
    persist(next);
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
      persist(next);

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
        persist({
          ...next,
          meta: { ...next.meta, aiGreetingDelivered: true },
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Camera/microphone access failed');
    }
  }, [attachStream, session, persist, profile]);

  const beginAnswer = useCallback(() => {
    if (!session) return;
    const question = getCurrentQuestion(session);
    if (!question) return;
    const answer = createAnswerForQuestion(session, question, pendingFollowUp ? currentAnswer?.id ?? null : null);
    if (pendingFollowUp) {
      answer.questionText = pendingFollowUp;
    }
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
  }, [session, pendingFollowUp, currentAnswer?.id]);

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
    try {
      const { videoBlob } = await recorderRef.current.stop();
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
      analysis.followUpQuestion ??
      profile.buildLocalFollowUp?.(finalTranscript, draft.questionText) ??
      null;

    setCurrentAnswer(draft);
    setPendingFollowUp(followUp);
    setPhase('understanding_review');
    setProcessing(false);
  }, [session, currentAnswer, liveTranscript, profile]);

  const confirmUnderstanding = useCallback(
    (confirmation: 'correct' | 'partial' | 'misunderstood') => {
      if (!session || !currentAnswer) return;
      if (confirmation === 'misunderstood') {
        setClarifyMode(true);
        setPhase('clarify');
        setAiMessage("I'm sorry. Please explain what I misunderstood.");
        return;
      }
      const confirmed: ExpertCaptureAnswer = {
        ...currentAnswer,
        confirmation: confirmation,
        status: 'awaiting_approval',
      };
      setCurrentAnswer(confirmed);
    },
    [session, currentAnswer]
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
    setProcessing(false);
  }, [session, currentAnswer, clarifyDraft, profile]);

  const continueAfterReview = useCallback(() => {
    if (!session || !currentAnswer) return;
    const answers = [...session.answers.filter((a) => a.id !== currentAnswer.id), currentAnswer];
    let nextSession: ExpertCaptureSession = {
      ...session,
      answers,
      meta: {
        ...session.meta,
        currentQuestionIndex: session.meta.currentQuestionIndex + 1,
        estimatedMinutesRemaining: estimateRemainingMinutes(
          { ...session, answers },
          profile.minutesPerQuestion
        ),
      },
    };

    if (pendingFollowUp && currentAnswer.confirmation !== 'misunderstood') {
      setPendingFollowUp(null);
      setCurrentAnswer(null);
      setPhase('interview');
      setAiMessage(`Follow-up: ${pendingFollowUp}`);
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
      persist(nextSession);
      setPhase('session_complete');
      return;
    }
    persist(nextSession);
    setPhase('interview');
    setAiMessage(remaining.text);
    void speakText(remaining.text);
  }, [session, currentAnswer, pendingFollowUp, persist, profile]);

  const redoAnswer = useCallback(async () => {
    if (!currentAnswer) return;
    if (currentAnswer.media.videoBlobId) await deleteMediaBlob(currentAnswer.media.videoBlobId);
    setCurrentAnswer(null);
    setLiveTranscript('');
    setPhase('interview');
    beginAnswer();
  }, [currentAnswer, beginAnswer]);

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
      persist({ ...session, answers });
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
    persist({
      ...session,
      answers,
      meta: {
        ...session.meta,
        currentQuestionIndex: session.meta.currentQuestionIndex + 1,
        estimatedMinutesRemaining: estimateRemainingMinutes({ ...session, answers }, profile.minutesPerQuestion),
      },
    });
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
      setCurrentAnswer({
        ...currentAnswer,
        correctedTranscript: text,
        transcriptExpertCorrected: true,
        status: 'corrected',
      });
    },
    [currentAnswer]
  );

  const goToKnowledgeReview = useCallback(() => setPhase('knowledge_review'), []);
  const goToExport = useCallback(() => setPhase('export'), []);

  const approveAnswer = useCallback(
    (answerId: string) => {
      if (!session) return;
      const answers = session.answers.map((a) =>
        a.id === answerId ? approveAnswerKnowledge({ ...a, confirmation: 'correct' }) : a
      );
      persist({ ...session, answers });
    },
    [session, persist]
  );

  const rejectAnswer = useCallback(
    (answerId: string) => {
      if (!session) return;
      const answers = session.answers.map((a) => (a.id === answerId ? rejectAnswerKnowledge(a) : a));
      persist({ ...session, answers });
    },
    [session, persist]
  );

  const needsClarificationAnswer = useCallback(
    (answerId: string) => {
      if (!session) return;
      const answers = session.answers.map((a) => (a.id === answerId ? markNeedsClarification(a) : a));
      persist({ ...session, answers });
    },
    [session, persist]
  );

  const restartSession = useCallback(async () => {
    await clearAllMediaBlobs();
    clearSessionStorage(profile);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setSession(null);
    setCurrentAnswer(null);
    setPhase('landing');
    setPendingFollowUp(null);
    setLiveTranscript('');
  }, [profile]);

  const progress = session ? countProgress(session) : { current: 0, total: 0 };
  const currentQuestion = session ? getCurrentQuestion(session) : null;

  return {
    profile,
    session,
    phase,
    setPhase,
    currentAnswer,
    currentQuestion,
    progress,
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
    videoRef,
    startSession,
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
    pendingFollowUp,
  };
}
