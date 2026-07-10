/**
 * Shared Expert Capture interview UI — profile drives branding only.
 */
import { useState } from 'react';
import { useExpertCaptureSession } from '../../hooks/useExpertCaptureSession';
import { CONSENT_RETENTION_DAYS, downloadExportBundle, loadMediaBlob } from '../../studio-os-core/expert-capture';
import type { ExpertCaptureProfile } from '../../studio-os-core/expert-capture/profiles/profile-types';
import { ExpertCaptureSaveExitButton, ExpertCaptureSaveStatusBar } from './ExpertCapturePersistenceUi';

const styles = {
  page: {
    minHeight: '100vh',
    background: '#ffffff',
    color: '#171717',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  } as const,
  container: {
    maxWidth: 720,
    margin: '0 auto',
    padding: '24px 20px 48px',
  } as const,
  h1: { fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 8px' } as const,
  sub: { fontSize: 15, color: '#737373', lineHeight: 1.5, margin: '0 0 24px' } as const,
  card: {
    border: '1px solid #e5e5e5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    background: '#fafafa',
  } as const,
  btn: {
    padding: '10px 16px',
    borderRadius: 8,
    border: '1px solid #d4d4d4',
    background: '#fff',
    fontSize: 14,
    cursor: 'pointer',
    fontWeight: 500,
  } as const,
  btnPrimary: {
    padding: '12px 20px',
    borderRadius: 8,
    border: 'none',
    background: '#171717',
    color: '#fff',
    fontSize: 15,
    cursor: 'pointer',
    fontWeight: 600,
  } as const,
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 8,
    border: '1px solid #d4d4d4',
    fontSize: 16,
    marginBottom: 12,
    boxSizing: 'border-box' as const,
  },
};

function Btn({
  children,
  onClick,
  primary,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        ...(primary ? styles.btnPrimary : styles.btn),
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function MicMeter({ level }: { level: number }) {
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 24 }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 4,
            height: 6 + i * 1.5,
            borderRadius: 2,
            background: level * 12 > i ? '#171717' : '#e5e5e5',
            transition: 'background 0.1s',
          }}
        />
      ))}
    </div>
  );
}

export function ExpertCaptureInterviewView({ profile }: { profile: ExpertCaptureProfile }) {
  const cap = useExpertCaptureSession(profile);
  const { branding } = profile;
  const [name, setName] = useState('');
  const [role, setRole] = useState(profile.defaultExpertRole);
  const [editDraft, setEditDraft] = useState('');
  const [showDeletePrompt, setShowDeletePrompt] = useState(false);
  const [showRestartPrompt, setShowRestartPrompt] = useState(false);

  const displayQuestion =
    cap.pendingFollowUp ?? cap.currentAnswer?.questionText ?? cap.currentQuestion?.text ?? cap.aiMessage;

  const saveBar = (
    <ExpertCaptureSaveStatusBar
      status={cap.saveStatus}
      message={cap.saveMessage}
      lastSavedAt={cap.lastSavedAt}
      lastServerConfirmedAt={cap.lastServerConfirmedAt}
    />
  );

  if (cap.phase === 'welcome_back' && cap.session) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          {saveBar}
          <h1 style={styles.h1}>Welcome Back</h1>
          <p style={styles.sub}>Your interview is saved.</p>
          <div style={styles.card}>
            <p style={{ margin: '0 0 8px' }}>
              <strong>Progress:</strong> {cap.progressPercent}%
            </p>
            {cap.lastCompletedSection ? (
              <p style={{ margin: '0 0 8px' }}>
                <strong>Last completed section:</strong> {cap.lastCompletedSection}
              </p>
            ) : null}
            {cap.currentQuestionLabel ? (
              <p style={{ margin: '0 0 8px' }}>
                <strong>Current question:</strong> {cap.currentQuestionLabel}
              </p>
            ) : null}
            {cap.lastSavedAt ? (
              <p style={{ margin: 0, fontSize: 13, color: '#737373' }}>
                <strong>Last saved:</strong> {new Date(cap.lastSavedAt).toLocaleString()}
              </p>
            ) : null}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <Btn primary onClick={() => void cap.resumeInterview()}>
              Resume Interview
            </Btn>
            <Btn onClick={cap.goToSessionDashboard}>Review Saved Answers</Btn>
            <Btn onClick={() => setShowRestartPrompt(true)}>Start Over</Btn>
            <Btn onClick={() => setShowDeletePrompt(true)}>Delete Session</Btn>
          </div>
          {showRestartPrompt ? (
            <div style={{ ...styles.card, marginTop: 16 }}>
              <p>Start over?</p>
              <Btn onClick={() => void cap.restartSession('archive')}>Restart & Archive Draft</Btn>
              <Btn primary onClick={() => void cap.restartSession('delete')}>
                Delete Everything & Restart
              </Btn>
              <Btn onClick={() => setShowRestartPrompt(false)}>Cancel</Btn>
            </div>
          ) : null}
          {showDeletePrompt ? (
            <div style={{ ...styles.card, marginTop: 16 }}>
              <p>Delete this saved session permanently?</p>
              <Btn primary onClick={() => void cap.restartSession('delete')}>
                Delete Session
              </Btn>
              <Btn onClick={() => setShowDeletePrompt(false)}>Cancel</Btn>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  if (cap.phase === 'save_exit') {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          {saveBar}
          <h1 style={styles.h1}>Progress Saved</h1>
          <p style={styles.sub}>Your progress has been saved. You can return anytime using this device or your secure resume link.</p>
          {cap.resumeLink ? (
            <div style={styles.card}>
              <p style={{ fontSize: 13, color: '#525252', wordBreak: 'break-all' }}>{cap.resumeLink}</p>
              <Btn
                onClick={() => {
                  void navigator.clipboard.writeText(cap.resumeLink ?? '');
                }}
              >
                Copy Resume Link
              </Btn>
            </div>
          ) : null}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <Btn primary onClick={() => void cap.resumeInterview()}>
              Continue Interview
            </Btn>
            <Btn onClick={cap.goToWelcomeBack}>Return to Studio Institute</Btn>
          </div>
        </div>
      </div>
    );
  }

  if (cap.phase === 'session_dashboard' && cap.session) {
    const answers = cap.session.answers.filter((a) => !a.deleted);
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          {saveBar}
          <h1 style={styles.h1}>Saved Interview</h1>
          <div style={styles.card}>
            <p style={{ margin: '0 0 8px' }}>
              <strong>{branding.captureTitle}</strong> — {branding.company}
            </p>
            <p style={{ margin: '0 0 8px' }}>Profession: {branding.profession}</p>
            <p style={{ margin: '0 0 8px' }}>Status: {cap.session.meta.status}</p>
            <p style={{ margin: '0 0 8px' }}>Progress: {cap.progressPercent}%</p>
            <p style={{ margin: '0 0 8px' }}>Approved answers: {answers.filter((a) => a.status === 'approved').length}</p>
            <p style={{ margin: '0 0 8px' }}>Pending reviews: {answers.filter((a) => a.status !== 'approved' && !a.skipped).length}</p>
            <p style={{ margin: '0 0 8px' }}>Skipped: {answers.filter((a) => a.skipped).length}</p>
            {cap.lastSavedAt ? <p style={{ margin: 0 }}>Last saved: {new Date(cap.lastSavedAt).toLocaleString()}</p> : null}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <Btn primary onClick={() => void cap.resumeInterview()}>
              Resume
            </Btn>
            <Btn onClick={cap.goToKnowledgeReview}>Review Answers</Btn>
            <Btn
              onClick={() => {
                if (cap.session) downloadExportBundle(cap.session);
              }}
            >
              Export Current Draft
            </Btn>
            <Btn onClick={() => setShowRestartPrompt(true)}>Start Over</Btn>
            <Btn onClick={() => setShowDeletePrompt(true)}>Delete Session</Btn>
          </div>
          {showRestartPrompt ? (
            <div style={{ ...styles.card, marginTop: 16 }}>
              <Btn onClick={() => void cap.restartSession('archive')}>Restart & Archive</Btn>
              <Btn primary onClick={() => void cap.restartSession('delete')}>
                Delete Everything & Restart
              </Btn>
            </div>
          ) : null}
          {showDeletePrompt ? (
            <div style={{ ...styles.card, marginTop: 16 }}>
              <Btn primary onClick={() => void cap.restartSession('delete')}>
                Confirm Delete
              </Btn>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  if (cap.phase === 'interrupted_recovery' && cap.interruptedAnswer) {
    const ia = cap.interruptedAnswer;
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          {saveBar}
          <h1 style={styles.h1}>Interrupted Answer</h1>
          <p style={styles.sub}>Your previous recording was interrupted. Partial recordings are never used for training until you approve them.</p>
          <div style={styles.card}>
            <p style={{ fontWeight: 600 }}>{ia.questionText}</p>
            {ia.partialTranscript ? <p style={{ fontSize: 14, color: '#525252' }}>{ia.partialTranscript}</p> : null}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <Btn primary onClick={cap.resumeInterruptedAnswer}>
              Resume Answer
            </Btn>
            <Btn onClick={() => void cap.redoAnswer()}>Redo Answer</Btn>
            <Btn onClick={cap.discardInterruptedAnswer}>Discard Partial Recording</Btn>
          </div>
        </div>
      </div>
    );
  }

  if (cap.phase === 'device_conflict') {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <h1 style={styles.h1}>Open on Another Device</h1>
          <p style={styles.sub}>This interview is open on another device. Continue here only if you intend to work from this device.</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Btn primary onClick={() => void cap.claimDeviceAndContinue()}>
              Continue Here
            </Btn>
            <Btn onClick={cap.goToWelcomeBack}>Return to Other Device</Btn>
          </div>
        </div>
      </div>
    );
  }

  if (cap.phase === 'landing') {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <p style={{ fontSize: 13, color: '#a3a3a3', margin: '0 0 8px' }}>{branding.instituteLabel}</p>
          <h1 style={styles.h1}>{branding.captureTitle}</h1>
          <p style={{ fontSize: 14, color: '#525252', margin: '0 0 4px' }}>
            Profession: {branding.profession}
          </p>
          <p style={{ fontSize: 14, color: '#525252', margin: '0 0 16px' }}>Company: {branding.company}</p>
          <p style={styles.sub}>{branding.landingDescription}</p>
          <div style={styles.card}>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: '#525252' }}>Your name</label>
            <input
              style={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Expert name"
            />
            {!profile.lockRole ? (
              <>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: '#525252' }}>
                  Your role / expertise
                </label>
                <input
                  style={styles.input}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Master Stylist"
                />
              </>
            ) : (
              <p style={{ fontSize: 14, color: '#737373', margin: '0 0 16px' }}>
                Role: <strong>{branding.profession}</strong> · Company: <strong>{branding.company}</strong>
              </p>
            )}
            <Btn primary disabled={!name.trim()} onClick={() => cap.startSession(name, role)}>
              Begin {branding.sessionLabel}
            </Btn>
          </div>
        </div>
      </div>
    );
  }

  if (cap.phase === 'consent') {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <h1 style={{ ...styles.h1, fontSize: 22 }}>Consent & Privacy</h1>
          <div style={styles.card}>
            <p style={{ margin: '0 0 12px', lineHeight: 1.6 }}>
              <strong>Purpose:</strong> {branding.consentPurpose}
            </p>
            <p style={{ margin: '0 0 12px', lineHeight: 1.6 }}>
              <strong>Recorded:</strong> Video, audio, and transcript of your answers.
            </p>
            <p style={{ margin: '0 0 12px', lineHeight: 1.6 }}>
              <strong>Storage:</strong> Stored locally in this browser session for up to {CONSENT_RETENTION_DAYS} days
              (MVP). Nothing becomes permanent training data until you approve it.
            </p>
            <p style={{ margin: '0 0 12px', lineHeight: 1.6 }}>
              <strong>Your rights:</strong> Delete any answer, redo responses, edit transcripts, pause, or withdraw and
              delete the entire session at any time.
            </p>
            <Btn primary onClick={cap.acceptConsent}>
              I Understand — Start Interview
            </Btn>
          </div>
        </div>
      </div>
    );
  }

  if (cap.phase === 'media_setup') {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <h1 style={{ ...styles.h1, fontSize: 22 }}>Enable Camera & Microphone</h1>
          <p style={styles.sub}>We need access to record your expert answers. Preview is mirrored; final recording is not.</p>
          {cap.error ? <p style={{ color: '#dc2626' }}>{cap.error}</p> : null}
          <Btn primary onClick={() => void cap.enableMedia()}>
            Enable Camera & Microphone
          </Btn>
        </div>
      </div>
    );
  }

  if (cap.phase === 'clarify') {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <h1 style={{ ...styles.h1, fontSize: 22 }}>Help me understand</h1>
          <p style={styles.sub}>{cap.aiMessage}</p>
          <textarea
            value={cap.clarifyDraft}
            onChange={(e) => cap.setClarifyDraft(e.target.value)}
            rows={6}
            style={{ ...styles.input, resize: 'vertical' }}
            placeholder="Explain what I misunderstood…"
          />
          <Btn primary disabled={!cap.clarifyDraft.trim() || cap.processing} onClick={() => void cap.submitClarification()}>
            Update Understanding
          </Btn>
        </div>
      </div>
    );
  }

  if (cap.phase === 'understanding_review' && cap.currentAnswer) {
    const a = cap.currentAnswer;
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <h1 style={{ ...styles.h1, fontSize: 22 }}>Here&apos;s what I understood</h1>
          <div style={styles.card}>
            <p style={{ margin: 0, lineHeight: 1.7, fontSize: 16 }}>{a.aiUnderstanding ?? '—'}</p>
          </div>
          {a.transcriptExpertCorrected ? (
            <p style={{ fontSize: 13, color: '#737373' }}>Transcript marked: Expert Corrected</p>
          ) : null}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            <Btn onClick={() => cap.confirmUnderstanding('correct')}>✓ Correct</Btn>
            <Btn onClick={() => cap.confirmUnderstanding('partial')}>△ Partially Correct</Btn>
            <Btn onClick={() => cap.confirmUnderstanding('misunderstood')}>✕ You Misunderstood Me</Btn>
          </div>
          {a.confirmation ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <Btn onClick={() => void cap.redoAnswer()}>Redo Answer</Btn>
              <Btn
                onClick={() => {
                  setEditDraft(a.correctedTranscript ?? a.transcript);
                }}
              >
                Edit Transcript
              </Btn>
              <Btn onClick={() => setShowDeletePrompt(true)}>Delete Answer</Btn>
              <Btn primary onClick={cap.continueAfterReview}>
                Continue
              </Btn>
            </div>
          ) : null}
          {editDraft ? (
            <div style={{ marginTop: 16 }}>
              <textarea value={editDraft} onChange={(e) => setEditDraft(e.target.value)} rows={5} style={styles.input} />
              <Btn
                onClick={() => {
                  cap.editTranscript(editDraft);
                  setEditDraft('');
                }}
              >
                Save Transcript
              </Btn>
            </div>
          ) : null}
          {showDeletePrompt ? (
            <div style={{ ...styles.card, marginTop: 16 }}>
              <p>Delete this answer?</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Btn onClick={() => void cap.deleteAnswer('ask_again')}>Delete & Ask Again</Btn>
                <Btn onClick={() => void cap.deleteAnswer('skip')}>Delete & Skip Question</Btn>
                <Btn onClick={() => setShowDeletePrompt(false)}>Cancel</Btn>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  if (cap.phase === 'session_complete') {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <h1 style={styles.h1}>Session Complete</h1>
          <p style={styles.sub}>Review extracted knowledge before approving for training use.</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Btn primary onClick={cap.goToKnowledgeReview}>
              Review Knowledge
            </Btn>
            <Btn onClick={() => setShowRestartPrompt(true)}>Restart Session</Btn>
          <ExpertCaptureSaveExitButton onClick={() => void cap.saveAndExit()} />
          </div>
          {showRestartPrompt ? (
            <div style={{ ...styles.card, marginTop: 16 }}>
              <p>Restart or delete entire session?</p>
              <Btn primary onClick={() => void cap.restartSession('delete')}>
                Delete Entire Session & Restart
              </Btn>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  if (cap.phase === 'knowledge_review') {
    const answers = cap.session?.answers.filter((a) => !a.deleted && !a.skipped) ?? [];
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <h1 style={styles.h1}>Knowledge Review</h1>
          <p style={styles.sub}>Review each answer like a pull request — approve before training use.</p>
          {answers.map((a) => (
            <div key={a.id} style={{ ...styles.card, background: '#fff' }}>
              <p style={{ fontWeight: 600, margin: '0 0 8px' }}>{a.questionText}</p>
              <p style={{ fontSize: 14, color: '#525252', margin: '0 0 8px' }}>
                {a.correctedTranscript ?? (a.transcript || '_(no transcript)_')}
              </p>
              <p style={{ fontSize: 14, margin: '0 0 12px' }}>
                <strong>AI:</strong> {a.aiUnderstanding ?? '—'}
              </p>
              <p style={{ fontSize: 12, color: '#737373' }}>Status: {a.status}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                {a.media.videoBlobId ? (
                  <Btn
                    onClick={() => {
                      void loadMediaBlob(a.media.videoBlobId!).then((blob) => {
                        if (!blob) return;
                        const url = URL.createObjectURL(blob);
                        window.open(url, '_blank');
                      });
                    }}
                  >
                    Replay Video
                  </Btn>
                ) : null}
                <Btn onClick={() => cap.approveAnswer(a.id)}>Approve</Btn>
                <Btn onClick={() => cap.rejectAnswer(a.id)}>Reject</Btn>
                <Btn onClick={() => cap.needsClarificationAnswer(a.id)}>Needs Clarification</Btn>
              </div>
            </div>
          ))}
          <Btn primary onClick={cap.goToExport}>
            Continue to Export
          </Btn>
        </div>
      </div>
    );
  }

  if (cap.phase === 'export') {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <h1 style={styles.h1}>Export Training Package</h1>
          <p style={styles.sub}>Download markdown assets for Studio Institute training.</p>
          <Btn
            primary
            onClick={() => {
              if (cap.session) downloadExportBundle(cap.session);
            }}
          >
            Export All Documents
          </Btn>
          <details style={{ marginTop: 24 }}>
            <summary style={{ cursor: 'pointer', color: '#737373' }}>Future capabilities (placeholders)</summary>
            <ul style={{ fontSize: 13, color: '#a3a3a3', paddingLeft: 18 }}>
              {profile.futurePlaceholders.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </details>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {saveBar}
        <header style={{ marginBottom: 20, borderBottom: '1px solid #e5e5e5', paddingBottom: 16 }}>
          <p style={{ margin: 0, fontSize: 13, color: '#a3a3a3' }}>{branding.sessionLabel}</p>
          <p style={{ margin: '4px 0', fontSize: 15 }}>
            Question {cap.progress.current} of {cap.progress.total}
          </p>
          <p style={{ margin: 0, fontSize: 13, color: '#737373' }}>
            ~{cap.session?.meta.estimatedMinutesRemaining ?? 0} min remaining
          </p>
        </header>

        <div
          style={{
            position: 'relative',
            borderRadius: 16,
            overflow: 'hidden',
            background: '#0a0a0a',
            aspectRatio: '4/3',
            marginBottom: 20,
          }}
        >
          <video ref={cap.videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} playsInline muted />
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              right: 12,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: '#fff',
              fontSize: 12,
            }}
          >
            <span>{cap.isRecording ? '● REC' : cap.isPaused ? '⏸ Paused' : 'Ready'}</span>
            <MicMeter level={cap.micLevel} />
            <span>{cap.aiSpeaking ? 'AI speaking…' : cap.isRecording ? 'Listening…' : ''}</span>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 13, color: '#737373', margin: '0 0 8px' }}>Current Question</p>
          <p style={{ fontSize: 20, lineHeight: 1.45, margin: 0, fontWeight: 500 }}>{displayQuestion || '…'}</p>
        </div>

        {cap.isRecording ? (
          <div style={{ ...styles.card, background: '#fff' }}>
            <p style={{ fontSize: 13, color: '#737373', margin: '0 0 8px' }}>Live transcript</p>
            <p style={{ margin: 0, lineHeight: 1.6, minHeight: 48 }}>{cap.liveTranscript || 'Speak your answer…'}</p>
          </div>
        ) : null}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {!cap.isRecording ? (
            <Btn primary onClick={cap.beginAnswer}>
              Answer Question
            </Btn>
          ) : (
            <>
              {cap.isPaused ? (
                <Btn onClick={cap.resumeRecording}>Resume</Btn>
              ) : (
                <Btn onClick={cap.pauseRecording}>Pause</Btn>
              )}
              <Btn primary disabled={cap.processing} onClick={() => void cap.finishAnswer()}>
                {cap.processing ? 'Processing…' : 'Finish Answer'}
              </Btn>
            </>
          )}
          <Btn onClick={() => void cap.redoAnswer()} disabled={!cap.currentAnswer && !cap.isRecording}>
            Redo Answer
          </Btn>
          <Btn onClick={cap.skipQuestion}>Skip Question</Btn>
          <ExpertCaptureSaveExitButton onClick={() => void cap.saveAndExit()} disabled={cap.processing} />
          <Btn onClick={() => setShowRestartPrompt(true)}>End Session</Btn>
        </div>

        {showRestartPrompt ? (
          <div style={{ ...styles.card, marginTop: 16 }}>
            <p>End session and delete all data?</p>
            <Btn primary onClick={() => void cap.restartSession('delete')}>
              Delete Entire Session
            </Btn>
            <Btn onClick={() => setShowRestartPrompt(false)}>Cancel</Btn>
          </div>
        ) : null}

        {cap.error ? <p style={{ color: '#dc2626', marginTop: 12 }}>{cap.error}</p> : null}
      </div>
    </div>
  );
}
