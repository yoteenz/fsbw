import { useState } from 'react';
import { AIO_AUTHORITY_BASELINE, AIO_ORGANIZATION_ID, SAMPLE_CLIENT } from '../../studio-os-core/guided-apprenticeship/aio/scenario';
import {
  createSession,
  expertConfirm,
  letMeTakeOver,
  ownerApprove,
  recordEvent,
  tryMyWay,
  type ApprenticeshipSession,
} from '../../studio-os-core/guided-apprenticeship';
import './proof.css';

function start(): ApprenticeshipSession {
  return createSession({
    id: 'aio-authority-proof',
    organizationId: AIO_ORGANIZATION_ID,
    workflowId: 'operating-authority-application',
    baseline: AIO_AUTHORITY_BASELINE,
  });
}

export default function GuidedApprenticeshipProofPage() {
  const [session, setSession] = useState(start);
  const [reason, setReason] = useState('I verify every name and address before I prepare the application.');
  const [queue, setQueue] = useState<string | null>(null);
  const replay = session.beat === 'replay' || session.beat === 'confirmation' || session.knowledgeStatus === 'owner_visible';
  const steps = replay ? session.proposed : session.baseline;

  return (
    <main className="ga">
      <div className="ga-wrap">
        <div className="ga-kicker">Studio Institute · scripted demonstration · not an autonomous guide</div>
        <h1>Show me how you think it works.</h1>
        <p>Practice record: {SAMPLE_CLIENT.name}. Nothing on this page files, pays, or edits a real account.</p>
        <div className="ga-card">
          <strong>{session.control === 'guide' ? 'Guide has the desk' : 'You have the desk'}</strong>
          <p>Mode {session.mode.replace(/_/g, ' ')} · {session.beat} · simulated</p>
          {steps.map((step) => (
            <div className="ga-step" key={step.id}>
              <span>{step.order}. {step.title}</span>
              <span>{step.surfaceId}</span>
            </div>
          ))}
          {session.clarificationRequired && <p>The guide will not replay this until you say why.</p>}
        </div>
        <div className="ga-actions">
          <button type="button" className="gold" onClick={() => { setSession(start()); setQueue(null); }}>Show me</button>
          <button type="button" onClick={() => setSession(letMeTakeOver(session))}>Let me take over</button>
          <button
            type="button"
            disabled={session.control !== 'expert'}
            onClick={() => setSession(recordEvent(session, {
              id: 'move-1',
              kind: 'reordered_step',
              stepId: 'verify',
              fromOrder: 3,
              toOrder: 2,
              simulated: true,
            }))}
          >
            I verify before I prepare
          </button>
        </div>
        <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={3} />
        <div className="ga-actions">
          <button
            type="button"
            disabled={session.control !== 'expert'}
            onClick={() => setSession(recordEvent(session, {
              id: 'why-1',
              kind: 'explained_why',
              aboutEventId: 'move-1',
              reason,
              simulated: true,
            }))}
          >
            Explain why
          </button>
          <button
            type="button"
            className="gold"
            onClick={() => {
              const next = tryMyWay(session);
              if (!('blocked' in next)) setSession(next);
            }}
          >
            Try it my way
          </button>
          <button type="button" disabled={session.beat !== 'replay'} onClick={() => setSession(expertConfirm(session, 'yes'))}>Yes, that’s how we do it</button>
          <button
            type="button"
            disabled={session.knowledgeStatus !== 'expert_reviewed'}
            onClick={() => {
              const approved = ownerApprove(session);
              setSession(approved);
              setQueue(approved.knowledgeStatus === 'owner_visible' ? 'Owner queue: visible to the owner. Not a worker. Not a filing.' : queue);
            }}
          >
            Owner approves
          </button>
        </div>
        {queue && <div className="ga-note">{queue}</div>}
      </div>
    </main>
  );
}
