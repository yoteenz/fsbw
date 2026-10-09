import { useState } from 'react';
import { trainingView } from '../../studio-os-core/guided-apprenticeship/access';
import { AIO_ORGANIZATION_ID, AIO_AUTHORITY_BASELINE, SAMPLE_CLIENT } from '../../studio-os-core/guided-apprenticeship/aio/scenario';
import {
  attemptLiveAction,
  createSession,
  expertConfirm,
  letMeTakeOver,
  ownerApprove,
  publishTraining,
  recordEvent,
  tryMyWay,
  type ApprenticeshipSession,
} from '../../studio-os-core/guided-apprenticeship';
import './proof.css';

const PRIVATE_NOTE = 'Sample private note. Staff training does not include it.';

type Scene = 'welcome' | 'show' | 'takeover' | 'explain' | 'replay' | 'confirm' | 'owner' | 'publish' | 'complete';

const SCENE_LABEL: Record<Scene, string> = {
  welcome: '1 / 10 · Welcome',
  show: '2 / 10 · Show me',
  takeover: '3 / 10 · Let me take over',
  explain: '4–5 / 10 · Correction and reason',
  replay: '6 / 10 · Try it my way',
  confirm: '7 / 10 · Expert confirmation',
  owner: '8 / 10 · Owner review',
  publish: '9 / 10 · Training publication',
  complete: '10 / 10 · Completion',
};

function start(): ApprenticeshipSession {
  return createSession({
    id: 'aio-authority-proof',
    organizationId: AIO_ORGANIZATION_ID,
    workflowId: 'operating-authority-application',
    baseline: AIO_AUTHORITY_BASELINE,
  });
}

function sceneOf(session: ApprenticeshipSession, welcomed: boolean): Scene {
  if (!welcomed) return 'welcome';
  if (session.trainingPublished) return 'complete';
  if (session.knowledgeStatus === 'owner_visible') return 'publish';
  if (session.knowledgeStatus === 'expert_reviewed') return 'owner';
  if (session.beat === 'replay') return 'confirm';
  if (session.knowledgeStatus === 'interpreted' && session.control === 'expert') return 'replay';
  if (session.control === 'expert' && session.clarificationRequired) return 'explain';
  if (session.control === 'expert') return 'takeover';
  return 'show';
}

function shortTitle(title: string): string {
  if (title.startsWith('Collect')) return 'Collect';
  if (title.startsWith('Prepare')) return 'Prepare';
  if (title.startsWith('Verify')) return 'Verify';
  if (title.startsWith('Review')) return 'Submit';
  return title;
}

export default function GuidedApprenticeshipProofPage() {
  const [session, setSession] = useState(start);
  const [welcomed, setWelcomed] = useState(false);
  const [reason, setReason] = useState('');
  const [blocked, setBlocked] = useState<string | null>(null);
  const [filing, setFiling] = useState<string | null>(null);
  const scene = sceneOf(session, welcomed);
  const moved = session.events.some((event) => event.kind === 'reordered_step');
  const steps = moved ? session.proposed : session.baseline;
  const attached = session.proposed.find((step) => step.id === 'verify')?.reason;

  function reset() {
    setSession(start());
    setWelcomed(false);
    setBlocked(null);
    setFiling(null);
  }

  function moveVerify() {
    if (session.events.some((event) => event.id === 'move-1')) return;
    setBlocked(null);
    setSession(recordEvent(session, {
      id: 'move-1',
      kind: 'reordered_step',
      stepId: 'verify',
      fromOrder: 3,
      toOrder: 2,
      simulated: true,
    }));
  }

  function explain() {
    const text = reason.trim();
    if (!text) return;
    setBlocked(null);
    setSession(recordEvent(session, {
      id: `why-${session.events.length + 1}`,
      kind: 'explained_why',
      aboutEventId: 'move-1',
      reason: text,
      simulated: true,
    }));
  }

  function replay() {
    const next = tryMyWay(session);
    if ('blocked' in next) {
      setBlocked('Say why this order is the one you use. A new sequence is not a reason.');
      return;
    }
    setBlocked(null);
    setSession(next);
  }

  const staff = trainingView({
    session,
    readerOrganizationId: AIO_ORGANIZATION_ID,
    role: 'staff',
    privateNote: PRIVATE_NOTE,
  });
  const ai = trainingView({
    session,
    readerOrganizationId: AIO_ORGANIZATION_ID,
    role: 'ai_team_member',
    privateNote: PRIVATE_NOTE,
  });
  const other = trainingView({
    session,
    readerOrganizationId: 'other-co',
    role: 'founder',
    privateNote: PRIVATE_NOTE,
  });
  return (
    <main className="ga" data-scene={scene}>
      <div className="ga-wrap">
        <header className="ga-top">
          <p className="ga-kicker">Practice session · All In One Enterprises Inc.</p>
          <p className="ga-script">Scripted demonstration. Not an autonomous guide.</p>
        </header>

        <p className="ga-progress" aria-live="polite">{SCENE_LABEL[scene]}</p>

        {scene !== 'welcome' && (
          <button type="button" className="ga-back ga-back-top" onClick={reset}>Start over</button>
        )}

        {scene === 'welcome' ? (
          <section className="ga-welcome">
            <h1>Show me how you think it works.</h1>
            <dl className="ga-facts">
              <div><dt>Organization</dt><dd>All In One Enterprises Inc.</dd></div>
              <div><dt>Practice client</dt><dd>{SAMPLE_CLIENT.name}</dd></div>
              <div><dt>Service</dt><dd>Permitting &amp; Authorities</dd></div>
              <div><dt>Workflow</dt><dd>Operating authority application</dd></div>
            </dl>
            <p className="ga-lead">A practice session with a fictional record. Nothing here files, pays, or edits a live account.</p>
            <button type="button" className="gold" onClick={() => setWelcomed(true)}>Begin practice</button>
          </section>
        ) : (
          <div className="ga-stage">
            {scene !== 'complete' && (
            <section className={`ga-desk ${session.control === 'expert' ? 'is-expert' : 'is-guide'}`} aria-label="Practice sequence">
              <div className={`ga-presence ${session.expression === 'aside' ? 'is-aside' : 'is-spotlight'}`}>
                {session.control === 'guide' ? 'Guide has the desk' : 'Guide stepped aside'}
              </div>
              <ol className="ga-steps">
                {steps.map((step) => {
                  const shifted = moved && session.baseline.find((item) => item.id === step.id)?.order !== step.order;
                  return (
                    <li key={step.id} className={shifted ? 'is-moved' : undefined}>
                      <span className="ga-num">{step.order}</span>
                      <span>{shortTitle(step.title)}</span>
                      {shifted && <em>Moved</em>}
                    </li>
                  );
                })}
              </ol>
              <p className="ga-baseline">
                {moved
                  ? 'Illustrative start: Collect, Prepare, Verify, Submit.'
                  : 'Illustrative baseline. Not an approved AIO procedure, and not a universal legal sequence.'}
              </p>
            </section>
            )}

            <section className="ga-panel" aria-live="polite">
              {scene === 'show' && (
                <>
                  <h1>Show me.</h1>
                  <p>The guide walks the sample record in this order. Interrupt when the order is not how you work.</p>
                  <button type="button" className="gold" onClick={() => { setBlocked(null); setSession(letMeTakeOver(session)); }}>Let me take over</button>
                </>
              )}

              {scene === 'takeover' && (
                <>
                  <h1>No. Let me show you.</h1>
                  <p>You have the desk. Move verify ahead of prepare.</p>
                  <button type="button" className="gold" onClick={moveVerify}>Move verify before prepare</button>
                </>
              )}

              {scene === 'explain' && (
                <>
                  <h1>Why that order?</h1>
                  <p>The sequence changed. Say why. The guide will not guess.</p>
                  <label className="ga-field">
                    <span>Your reason</span>
                    <textarea
                      value={reason}
                      placeholder="Say why verify happens before prepare."
                      onChange={(event) => setReason(event.target.value)}
                      rows={3}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setReason('I verify every name and address before I prepare the application.')}
                  >
                    Insert sample reason
                  </button>
                  <button type="button" className="gold" disabled={!reason.trim()} onClick={explain}>Explain why</button>
                </>
              )}

              {scene === 'replay' && (
                <>
                  <h1>Got it. Let me try your way.</h1>
                  <p>The guide can replay only after the reason is attached.</p>
                  <button type="button" className="gold" onClick={replay}>Try it my way</button>
                </>
              )}

              {scene === 'confirm' && (
                <>
                  <h1>Is this how you handle it?</h1>
                  <p>The guide has the desk again and is showing Collect, Verify, Prepare, Submit. {attached}</p>
                  <div className="ga-actions">
                    <button type="button" className="gold" onClick={() => setSession(expertConfirm(session, 'yes'))}>That’s right</button>
                    <button type="button" onClick={() => setSession(expertConfirm(session, 'almost'))}>Needs another change</button>
                    <button type="button" onClick={() => { setBlocked(null); setSession(expertConfirm(session, 'no')); }}>Reject</button>
                  </div>
                </>
              )}

              {scene === 'owner' && (
                <>
                  <h1>Owner review</h1>
                  <p className="ga-status">Expert confirmed. The owner has not approved it.</p>
                  <p>Approval lets the owner see the draft. It does not publish training.</p>
                  <button type="button" className="gold" onClick={() => setSession(ownerApprove(session))}>Owner approves</button>
                </>
              )}

              {scene === 'publish' && (
                <>
                  <h1>Training publication</h1>
                  <p className="ga-status">Owner can see this draft. Training is not published.</p>
                  <p>Publishing a lesson still does not let anyone file, pay, or give a worker a tool.</p>
                  <button type="button" className="gold" onClick={() => setSession(publishTraining(session))}>Publish training</button>
                </>
              )}

              {scene === 'complete' && (
                <>
                  <h1>Yes. That’s how we do it here.</h1>
                  <dl className="ga-summary">
                    <div><dt>Original</dt><dd>Collect, Prepare, Verify, Submit</dd></div>
                    <div><dt>Correction</dt><dd>Verify before Prepare</dd></div>
                    <div><dt>Reason</dt><dd>{attached}</dd></div>
                    <div><dt>Revised</dt><dd>Collect, Verify, Prepare, Submit</dd></div>
                    <div><dt>Review</dt><dd>Approved for training. Not a live procedure.</dd></div>
                    <div><dt>Saved</dt><dd>Nothing was written to production.</dd></div>
                  </dl>
                  <p className="ga-limits">
                    Staff {staff?.includesPrivate ? 'see' : 'do not see'} private notes.
                    Another company {other ? 'can open this' : 'cannot open this'}.
                    An AI teammate gets {ai?.titles.length ?? 0} steps and {ai?.toolsGranted ? 'tools' : 'no tools'}.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const result = attemptLiveAction('submit_filing');
                      setFiling(result.allowed ? 'Allowed' : result.reason);
                    }}
                  >
                    Attempt a live filing
                  </button>
                  {filing && <p className="ga-status">{filing}</p>}
                </>
              )}

              {blocked && <p className="ga-status">{blocked}</p>}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
