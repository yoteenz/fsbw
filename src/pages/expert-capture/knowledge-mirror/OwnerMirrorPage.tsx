/**
 * Living Knowledge Mirror — Owner Training Mirror + Training Sandbox
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  competencyLabel,
  lifecycleLabel,
  packetStatusLabel,
  sandboxAnswerFromApprovedKnowledge,
} from '../../../studio-os-core/expert-capture/knowledge-mirror';
import { useKnowledgeMirror } from '../../../hooks/useKnowledgeMirror';
import { mirrorStyles, MirrorBtn, statusColor } from './mirror-styles';
import { loadSessionIdentity, mirrorNavLinks, resolveProfileFromSlug } from './resolve-profile';

const SANDBOX_PROMPTS = [
  'What have you learned so far?',
  'Walk me through the client intake workflow.',
  'What information is missing from this intake?',
  'When should you escalate to the human expert?',
  'What are you not authorized to do?',
  'Which expert instruction supports this answer?',
];

export default function OwnerMirrorPage({ profileSlug }: { profileSlug?: string }) {
  const profile = resolveProfileFromSlug(profileSlug);
  const identity = loadSessionIdentity(profile);
  const nav = mirrorNavLinks(profile);
  const km = useKnowledgeMirror(profile, identity);
  const [sandboxQuestion, setSandboxQuestion] = useState(SANDBOX_PROMPTS[0]);
  const [sandboxAnswer, setSandboxAnswer] = useState('');
  const [ownerNotes, setOwnerNotes] = useState('');

  if (!identity) {
    return (
      <div style={mirrorStyles.page}>
        <div style={mirrorStyles.container}>
          <h1 style={mirrorStyles.h1}>Owner Training Mirror</h1>
          <p style={mirrorStyles.sub}>An expert interview session is required to populate owner-visible knowledge.</p>
          <MirrorBtn primary onClick={() => (window.location.href = nav.interview)}>
            Go to Interview
          </MirrorBtn>
        </div>
      </div>
    );
  }

  if (km.loading || !km.snapshot) {
    return (
      <div style={mirrorStyles.page}>
        <div style={mirrorStyles.container}>Loading owner mirror…</div>
      </div>
    );
  }

  const snap = km.snapshot;

  const runSandbox = () => {
    if (!km.program) return;
    setSandboxAnswer(sandboxAnswerFromApprovedKnowledge(km.program, sandboxQuestion));
  };

  return (
    <div style={mirrorStyles.page}>
      <div style={mirrorStyles.container}>
        <nav style={mirrorStyles.nav}>
          <Link to={nav.stream} style={{ fontSize: 14, color: '#525252' }}>
            Expert Stream
          </Link>
          <Link to={nav.interview} style={{ fontSize: 14, color: '#525252' }}>
            Interview
          </Link>
        </nav>

        <h1 style={mirrorStyles.h1}>Owner Training Mirror</h1>
        <p style={mirrorStyles.sub}>
          Observe approved knowledge, review training packets, authorize worker capabilities — without waiting for the
          full interview to finish.
        </p>

        <div style={{ ...mirrorStyles.card, background: '#fff' }}>
          <p style={{ margin: 0, fontSize: 14 }}>
            <strong>Training progress:</strong> {snap.trainingProgressPercent}% of knowledge areas have owner-visible
            content
          </p>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: '#737373' }}>
            Expert: {identity.expertName} · {profile.branding.profession}
          </p>
        </div>

        {snap.unreadNotifications.length ? (
          <div style={mirrorStyles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ ...mirrorStyles.sectionTitle, margin: 0 }}>Notifications ({snap.unreadNotifications.length})</h2>
              <MirrorBtn onClick={() => km.dismissNotifications()}>Mark all read</MirrorBtn>
            </div>
            {snap.unreadNotifications.map((n) => (
              <div key={n.id} style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e5e5e5' }}>
                <strong>{n.title}</strong>
                <p style={{ margin: '4px 0 0', fontSize: 14, color: '#525252' }}>{n.summary}</p>
              </div>
            ))}
          </div>
        ) : null}

        <h2 style={mirrorStyles.sectionTitle}>Ready for Review</h2>
        {snap.readyForReview.length === 0 ? (
          <p style={mirrorStyles.sub}>No items awaiting owner review.</p>
        ) : (
          snap.readyForReview.map((e) => (
            <div key={e.id} style={{ ...mirrorStyles.card, background: '#fff' }}>
              <span style={mirrorStyles.badge(statusColor(e.lifecycleStatus))}>{lifecycleLabel(e.lifecycleStatus)}</span>
              <p style={{ fontWeight: 600, margin: '8px 0 4px' }}>{e.knowledgeArea}</p>
              <p style={{ margin: '0 0 8px' }}>{e.statement}</p>
              <details style={{ fontSize: 13, marginBottom: 12 }}>
                <summary style={{ cursor: 'pointer' }}>Source traceability</summary>
                <p style={{ margin: '8px 0' }}>Question: {e.source.questionText}</p>
                <p>Transcript: {e.source.correctedTranscript ?? e.source.transcript}</p>
                {e.source.expertApprovedAt ? <p>Expert approved: {e.source.expertApprovedAt}</p> : null}
              </details>
              <textarea
                style={{ ...mirrorStyles.textarea, minHeight: 60 }}
                placeholder="Owner notes (optional)"
                value={ownerNotes}
                onChange={(ev) => setOwnerNotes(ev.target.value)}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <MirrorBtn primary onClick={() => km.ownerReviewEntry(e.id, 'approve_for_training', ownerNotes)}>
                  Approve for Training
                </MirrorBtn>
                <MirrorBtn onClick={() => km.ownerReviewEntry(e.id, 'return_for_clarification', ownerNotes)}>
                  Return for Clarification
                </MirrorBtn>
                <MirrorBtn onClick={() => km.ownerReviewEntry(e.id, 'hold', ownerNotes)}>Hold</MirrorBtn>
                <MirrorBtn onClick={() => km.ownerReviewEntry(e.id, 'reject', ownerNotes)}>Reject</MirrorBtn>
                <MirrorBtn onClick={() => km.ownerReviewEntry(e.id, 'restrict_use', ownerNotes)}>Restrict</MirrorBtn>
              </div>
            </div>
          ))
        )}

        <h2 style={mirrorStyles.sectionTitle}>Active & Pending Training Packets</h2>
        {[...snap.activePackets, ...snap.pendingPackets].map((p) => (
          <div key={p.id} style={{ ...mirrorStyles.card, background: '#fff' }}>
            <strong>{p.title}</strong>
            <span style={{ ...mirrorStyles.badge(statusColor(p.status)), marginLeft: 8 }}>
              {packetStatusLabel(p.status)}
            </span>
            <ul style={{ fontSize: 13, margin: '12px 0', paddingLeft: 18 }}>
              {p.approvedStatements.slice(0, 4).map((s, i) => (
                <li key={i}>{s.slice(0, 120)}{s.length > 120 ? '…' : ''}</li>
              ))}
            </ul>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {p.status === 'expert_approved' || p.status === 'owner_approved' ? (
                <MirrorBtn primary onClick={() => km.approvePacketForTraining(p.id)}>
                  Approve Packet for Scenario Testing
                </MirrorBtn>
              ) : null}
              {p.status === 'ready_for_scenario_testing' ? (
                <MirrorBtn primary onClick={() => km.passScenarioTest(p.id)}>
                  Pass Scenario Test → Activate
                </MirrorBtn>
              ) : null}
              {p.status === 'active' ? (
                <MirrorBtn onClick={() => km.restrictWorkerCapability('cannot_submit_to_municipality', 'Owner restricted pending refresh')}>
                  Restrict Related Capability
                </MirrorBtn>
              ) : null}
            </div>
          </div>
        ))}

        <h2 style={mirrorStyles.sectionTitle}>Worker Competency</h2>
        {snap.competencySummary.map((c) => (
          <div key={c.id} style={{ ...mirrorStyles.card, padding: 14 }}>
            <strong>{c.area}</strong>
            <span style={{ ...mirrorStyles.badge(statusColor(c.level)), marginLeft: 8 }}>{competencyLabel(c.level)}</span>
            <p style={{ fontSize: 12, color: '#737373', margin: '6px 0 0' }}>{c.changeReason}</p>
          </div>
        ))}

        <h2 style={mirrorStyles.sectionTitle}>Authorizations</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {snap.authorizationSummary.map((a) => (
            <div
              key={a.id}
              style={{
                ...mirrorStyles.card,
                padding: 14,
                background: a.granted ? '#ecfdf5' : '#fef2f2',
                borderColor: a.granted ? '#86efac' : '#fecaca',
              }}
            >
              <p style={{ margin: 0, fontWeight: 600 }}>{a.capability.replace(/_/g, ' ')}</p>
              <p style={{ margin: '4px 0 0', fontSize: 13 }}>{a.granted ? 'Authorized' : 'Restricted'}</p>
              {a.restrictedReason ? (
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#737373' }}>{a.restrictedReason}</p>
              ) : null}
            </div>
          ))}
        </div>

        {snap.conflicts.length ? (
          <>
            <h2 style={mirrorStyles.sectionTitle}>Conflicts</h2>
            {snap.conflicts.map((c) => (
              <div key={c.id} style={{ ...mirrorStyles.card, borderColor: '#fca5a5' }}>
                <p style={{ margin: 0 }}>{c.summary}</p>
              </div>
            ))}
          </>
        ) : null}

        {snap.outdatedEntries.length ? (
          <>
            <h2 style={mirrorStyles.sectionTitle}>Outdated Knowledge</h2>
            {snap.outdatedEntries.map((e) => (
              <div key={e.id} style={mirrorStyles.card}>
                <p style={{ margin: 0 }}>{e.statement.slice(0, 160)}…</p>
              </div>
            ))}
          </>
        ) : null}

        <h2 style={mirrorStyles.sectionTitle}>Training Sandbox</h2>
        <p style={mirrorStyles.sub}>Test what the Studio professional can answer from approved knowledge only.</p>
        <div style={mirrorStyles.card}>
          <select
            style={mirrorStyles.input}
            value={sandboxQuestion}
            onChange={(e) => setSandboxQuestion(e.target.value)}
          >
            {SANDBOX_PROMPTS.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
          <MirrorBtn primary onClick={runSandbox}>
            Ask Worker
          </MirrorBtn>
          {sandboxAnswer ? (
            <div style={{ marginTop: 16, padding: 16, background: '#f5f5f5', borderRadius: 8, fontSize: 14, lineHeight: 1.6 }}>
              {sandboxAnswer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
