/**
 * Living Knowledge Mirror — Expert Knowledge Stream
 */
import { Link } from 'react-router-dom';
import { lifecycleLabel, packetStatusLabel, competencyLabel } from '../../../studio-os-core/expert-capture/knowledge-mirror';
import { useKnowledgeMirror } from '../../../hooks/useKnowledgeMirror';
import { mirrorStyles, MirrorBtn, statusColor } from './mirror-styles';
import { loadSessionIdentity, mirrorNavLinks, resolveProfileFromSlug } from './resolve-profile';

export default function KnowledgeStreamPage({ profileSlug }: { profileSlug?: string }) {
  const profile = resolveProfileFromSlug(profileSlug);
  const identity = loadSessionIdentity(profile);
  const nav = mirrorNavLinks(profile);
  const km = useKnowledgeMirror(profile, identity);

  if (!identity) {
    return (
      <div style={mirrorStyles.page}>
        <div style={mirrorStyles.container}>
          <h1 style={mirrorStyles.h1}>Knowledge Stream</h1>
          <p style={mirrorStyles.sub}>Start or resume an interview to view your evolving knowledge record.</p>
          <MirrorBtn primary onClick={() => (window.location.href = nav.interview)}>
            Go to Interview
          </MirrorBtn>
        </div>
      </div>
    );
  }

  if (km.loading) {
    return (
      <div style={mirrorStyles.page}>
        <div style={mirrorStyles.container}>Loading knowledge stream…</div>
      </div>
    );
  }

  const entries = [...(km.program?.entries ?? [])].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div style={mirrorStyles.page}>
      <div style={mirrorStyles.container}>
        <nav style={mirrorStyles.nav}>
          <Link to={nav.interview} style={{ fontSize: 14, color: '#525252' }}>
            ← Interview
          </Link>
          <Link to={nav.confessional} style={{ fontSize: 14, color: '#525252' }}>
            Knowledge Confessional
          </Link>
          <Link to={nav.ownerMirror} style={{ fontSize: 14, color: '#525252' }}>
            Owner Mirror
          </Link>
        </nav>

        <h1 style={mirrorStyles.h1}>Knowledge Stream</h1>
        <p style={mirrorStyles.sub}>
          {profile.branding.captureTitle} — chronological record of expert knowledge for {identity.expertName}.
          Only approved knowledge enters worker training.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          <MirrorBtn onClick={() => km.submitAllExpertApproved()}>Submit All Expert-Approved for Owner Review</MirrorBtn>
          <MirrorBtn onClick={() => (window.location.href = nav.confessional)} primary>
            Record Confessional Update
          </MirrorBtn>
        </div>

        <h2 style={mirrorStyles.sectionTitle}>Training Packets ({km.program?.packets.length ?? 0})</h2>
        {(km.program?.packets ?? []).map((p) => (
          <div key={p.id} style={{ ...mirrorStyles.card, background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div>
                <strong>{p.title}</strong>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#737373' }}>{p.knowledgeArea}</p>
              </div>
              <span style={mirrorStyles.badge(statusColor(p.status))}>{packetStatusLabel(p.status)}</span>
            </div>
            <p style={{ fontSize: 13, margin: '12px 0 0' }}>{p.approvedStatements.length} approved statement(s)</p>
          </div>
        ))}

        <h2 style={mirrorStyles.sectionTitle}>Stream Entries ({entries.length})</h2>
        {entries.length === 0 ? (
          <p style={mirrorStyles.sub}>No knowledge entries yet. Approve interview answers to populate the stream.</p>
        ) : (
          entries.map((e) => (
            <div key={e.id} style={{ ...mirrorStyles.card, background: '#fff' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                <span style={mirrorStyles.badge(statusColor(e.lifecycleStatus))}>{lifecycleLabel(e.lifecycleStatus)}</span>
                <span style={mirrorStyles.badge('#6366f1')}>{e.entryType.replace(/_/g, ' ')}</span>
                <span style={{ fontSize: 12, color: '#a3a3a3' }}>{new Date(e.updatedAt).toLocaleString()}</span>
              </div>
              <p style={{ fontWeight: 600, margin: '0 0 4px' }}>{e.knowledgeArea}</p>
              <p style={{ margin: '0 0 8px', lineHeight: 1.5 }}>{e.statement}</p>
              <p style={{ fontSize: 13, color: '#737373', margin: '0 0 8px' }}>
                Source: {e.source.questionText} (v{e.version})
              </p>
              {e.source.transcript ? (
                <details style={{ fontSize: 13, color: '#525252', marginBottom: 8 }}>
                  <summary style={{ cursor: 'pointer' }}>Transcript & interpretation</summary>
                  <p style={{ margin: '8px 0' }}>{e.source.correctedTranscript ?? e.source.transcript}</p>
                  {e.source.aiInterpretation ? <p>AI: {e.source.aiInterpretation}</p> : null}
                </details>
              ) : null}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {e.lifecycleStatus === 'expert_reviewed' ? (
                  <MirrorBtn onClick={() => km.submitEntryForReview(e.id)}>Submit for Owner Review</MirrorBtn>
                ) : null}
                {e.lifecycleStatus === 'active_knowledge' || e.lifecycleStatus === 'approved_for_training' ? (
                  <MirrorBtn onClick={() => km.markOutdated(e.id, 'Expert marked knowledge as outdated')}>
                    Mark Outdated
                  </MirrorBtn>
                ) : null}
              </div>
            </div>
          ))
        )}

        <h2 style={mirrorStyles.sectionTitle}>Worker Competencies</h2>
        {(km.program?.competencies ?? []).map((c) => (
          <div key={c.id} style={{ ...mirrorStyles.card, padding: 14 }}>
            <strong>{c.area}</strong>
            <span style={{ ...mirrorStyles.badge(statusColor(c.level)), marginLeft: 8 }}>{competencyLabel(c.level)}</span>
            <p style={{ fontSize: 12, color: '#737373', margin: '6px 0 0' }}>{c.changeReason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
